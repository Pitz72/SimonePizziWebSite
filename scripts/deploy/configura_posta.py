#!/usr/bin/env python3
"""
Aggiunge le impostazioni della posta al config.php di produzione.

    python scripts/deploy/configura_posta.py

Legge SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS e MAIL_INFO da
.secrets/smtp.txt (fuori da git) e le aggiunge in fondo al config.php che il
sito usa sul server. Non stampa mai la password.

Fa cinque cose, in quest'ordine, e si ferma alla prima che non torna:

1. Guarda che il sito risponda 200, PRIMA di toccare qualcosa.
2. Copia il config.php com'è in ~/backup-config/ sul server: FUORI dalla cartella
   del sito, perché dentro sarebbe scaricabile come testo, password del database
   comprese.
3. Aggiunge le costanti che mancano. Quelle già presenti non si toccano, e le
   credenziali del database restano quelle che sono.
4. Guarda di nuovo che il sito risponda 200. Se non risponde, RIMETTE la copia:
   un config.php rotto vuol dire il sito staccato dal database.
5. Dice che cosa ha fatto, con i nomi delle costanti e mai i valori.

Non carica il codice del sito: per quello c'è carica.py.
"""

from __future__ import annotations

import json
import posixpath
import sys
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path

try:
    import paramiko
except ImportError:
    sys.exit("Manca paramiko:  pip install paramiko")

RADICE = Path(__file__).resolve().parents[2]
DEPLOY = RADICE / ".secrets" / "deploy.json"
SMTP = RADICE / ".secrets" / "smtp.txt"

# I file di configurazione che il sito può leggere: lib/ vince su api/, ma finché
# non si sposta il file, in produzione può esserci l'uno o l'altro (lib/db.php).
CANDIDATI = ("lib/config.php", "api/config.php")
OBBLIGATORIE = ("SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "MAIL_INFO")


def leggi_smtp() -> dict[str, str]:
    if not SMTP.is_file():
        sys.exit(f"Manca {SMTP}")
    valori: dict[str, str] = {}
    for riga in SMTP.read_text(encoding="utf-8").splitlines():
        riga = riga.strip()
        if not riga or riga.startswith("#") or "=" not in riga:
            continue
        chiave, valore = riga.split("=", 1)
        valori[chiave.strip()] = valore.strip()
    vuote = [k for k in OBBLIGATORIE if not valori.get(k)]
    if vuote:
        sys.exit("Nel file smtp.txt mancano o sono vuote: " + ", ".join(vuote))
    return valori


def php_stringa(valore: str) -> str:
    """Un valore come stringa PHP tra apici singoli."""
    return "'" + valore.replace("\\", "\\\\").replace("'", "\\'") + "'"


def sito_risponde(indirizzo: str) -> int:
    try:
        richiesta = urllib.request.Request(indirizzo, headers={"User-Agent": "configura-posta/1"})
        with urllib.request.urlopen(richiesta, timeout=20) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception:
        return 0


def costanti_presenti(testo: str) -> set[str]:
    import re
    return set(re.findall(r"define\(\s*['\"]([A-Z_]+)['\"]", testo))


def main() -> None:
    d = json.loads(DEPLOY.read_text(encoding="utf-8"))
    smtp = leggi_smtp()
    url = "https://" + d["site"] + "/"

    stato = sito_risponde(url)
    print(f"1. Il sito risponde: {stato}")
    if stato != 200:
        sys.exit("   Il sito non risponde 200 nemmeno adesso: non tocco niente.")

    trasporto = paramiko.Transport((d["host"], d["port"]))
    trasporto.connect(username=d["username"], password=d["password"])
    sftp = paramiko.SFTPClient.from_transport(trasporto)
    base = d["remote_docroot"]

    try:
        presenti = []
        for rel in CANDIDATI:
            try:
                sftp.stat(posixpath.join(base, rel))
                presenti.append(rel)
            except IOError:
                pass
        if not presenti:
            sys.exit("   Sul server non trovo né lib/config.php né api/config.php: non tocco niente.")
        print("   File di configurazione sul server: " + ", ".join(presenti))

        marca = datetime.now().strftime("%Y%m%d-%H%M%S")
        try:
            sftp.mkdir("backup-config", 0o700)
        except IOError:
            pass  # c'è già

        modificati: list[tuple[str, str, str]] = []  # (percorso, copia, contenuto vecchio)
        for rel in presenti:
            percorso = posixpath.join(base, rel)
            with sftp.open(percorso, "rb") as f:
                vecchio = f.read().decode("utf-8")

            copia = f"backup-config/{rel.replace('/', '-')}.{marca}"
            with sftp.open(copia, "wb") as f:
                f.write(vecchio.encode("utf-8"))
            sftp.chmod(copia, 0o600)
            print(f"2. Copia di sicurezza di {rel}: ~/{copia}")

            gia = costanti_presenti(vecchio)
            mancanti = [k for k in OBBLIGATORIE if k not in gia]
            if not mancanti:
                print(f"3. {rel}: ha già tutte le costanti della posta, non lo tocco")
                continue

            a_capo = "\r\n" if "\r\n" in vecchio else "\n"
            blocco = a_capo.join(
                ["", "// Posta in uscita (lib/mailer.php) — aggiunta il " + datetime.now().strftime("%d/%m/%Y")]
                + [f"define('{k}', {php_stringa(smtp[k])});" for k in mancanti]
                + [""]
            )
            corpo = vecchio.rstrip()
            if corpo.endswith("?>"):
                corpo = corpo[:-2].rstrip() + a_capo + blocco + a_capo + "?>" + a_capo
            else:
                corpo = corpo + a_capo + blocco

            with sftp.open(percorso, "wb") as f:
                f.write(corpo.encode("utf-8"))
            modificati.append((percorso, copia, vecchio))
            print(f"3. {rel}: aggiunte " + ", ".join(mancanti))

        if not modificati:
            print("Niente da fare.")
            return

        dopo = sito_risponde(url)
        print(f"4. Il sito risponde: {dopo}")
        if dopo != 200:
            for percorso, _copia, vecchio in modificati:
                with sftp.open(percorso, "wb") as f:
                    f.write(vecchio.encode("utf-8"))
            sys.exit("   Il sito non rispondeva più: ho rimesso i file com'erano. Non è cambiato niente.")

        print("5. Fatto. Il codice nuovo del sito NON è stato caricato: quello è un passo a parte.")
    finally:
        sftp.close()
        trasporto.close()


if __name__ == "__main__":
    main()
