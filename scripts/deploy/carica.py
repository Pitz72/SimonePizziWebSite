#!/usr/bin/env python3
"""
Carica il sito in produzione via SFTP.

    python scripts/deploy/carica.py --prova     # dice che cosa farebbe, non tocca niente
    python scripts/deploy/carica.py             # carica davvero

Il sito nuovo non ha una build: si carica `public/` così com'è. Prima si
caricava `dist/`, che era il risultato di `npm run build`; da settembre 2026
quella cartella non esiste più e npm non serve.

TRE REGOLE, e ognuna viene da un modo di rompere il sito:

1. `lib/config.php` e `uploads/` NON SI CARICANO MAI. Il primo contiene le
   credenziali del database, che in produzione sono diverse da quelle locali;
   il secondo contiene le immagini vere, che sul server sono più di quelle che
   stanno qui. Sovrascriverli vuol dire, nell'ordine, staccare il sito dal
   database e cancellare le copertine.

2. Ogni file che viene sovrascritto si copia prima in una cartella di backup
   sul server, datata. Senza una build che controlla la sintassi, un errore di
   battitura in un .php è il sito offline: il ripristino dev'essere una
   copia-incolla, non un ricaricamento a memoria.

3. `.htaccess` si carica PER ULTIMO. Se il caricamento si interrompe a metà,
   il vecchio .htaccess continua a servire il sito vecchio, che è ancora tutto
   lì. Caricarlo per primo vorrebbe dire indirizzare le richieste a file che
   non sono ancora arrivati.

Le credenziali stanno in .secrets/deploy.json, fuori da git.
"""

from __future__ import annotations

import json
import posixpath
import sys
from datetime import datetime
from pathlib import Path

try:
    import paramiko
except ImportError:
    sys.exit("Manca paramiko:  pip install paramiko")

RADICE = Path(__file__).resolve().parents[2]
SORGENTE = RADICE / "public"
SEGRETI = RADICE / ".secrets" / "deploy.json"

# Quello che non parte mai da qui.
MAI = {
    "lib/config.php",        # credenziali di produzione
    "api/config.php",        # idem, finché non si sposta
    "dev-router.php",        # strumento da banco, non serve al server
}
CARTELLE_ESCLUSE = {"uploads"}          # le immagini vere stanno sul server
ESTENSIONI_ESCLUSE = {".map", ".log", ".sqlite"}

# Per ultimo, e da solo.
ULTIMO = ".htaccess"


def file_da_caricare() -> list[Path]:
    """Tutti i file di public/, meno quelli che non devono partire."""
    fuori = []
    for percorso in sorted(SORGENTE.rglob("*")):
        if not percorso.is_file():
            continue
        relativo = percorso.relative_to(SORGENTE).as_posix()

        if relativo in MAI:
            continue
        if relativo.split("/")[0] in CARTELLE_ESCLUSE:
            continue
        if percorso.suffix in ESTENSIONI_ESCLUSE:
            continue
        fuori.append(percorso)
    return fuori


def main() -> int:
    prova = "--prova" in sys.argv

    if not SEGRETI.is_file():
        return errore(f"Manca {SEGRETI}. Ci vanno host, port, username, password, remote_docroot.")

    cfg = json.loads(SEGRETI.read_text(encoding="utf-8"))
    remoto = cfg["remote_docroot"].rstrip("/")

    elenco = file_da_caricare()
    peso = sum(f.stat().st_size for f in elenco)
    print(f"{len(elenco)} file, {peso / 1024:.0f} KB, verso {remoto}")

    # L'.htaccess si toglie dalla fila e si rimette in fondo.
    htaccess = [f for f in elenco if f.name == ULTIMO]
    elenco = [f for f in elenco if f.name != ULTIMO] + htaccess

    if prova:
        print("\nPROVA: non carico niente. Questi sono i primi venti:\n")
        for f in elenco[:20]:
            print("   ", f.relative_to(SORGENTE).as_posix())
        if len(elenco) > 20:
            print(f"    … e altri {len(elenco) - 20}")
        print("\nEsclusi:", ", ".join(sorted(MAI)), "+ uploads/")
        return 0

    quando = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup = f"{remoto}/.backup-{quando}"

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(cfg["host"], port=int(cfg.get("port", 22)),
                username=cfg["username"], password=cfg["password"])
    sftp = ssh.open_sftp()

    cartelle_fatte: set[str] = set()

    def assicura(cartella: str) -> None:
        if cartella in ("", ".", remoto) or cartella in cartelle_fatte:
            return
        assicura(posixpath.dirname(cartella))
        try:
            sftp.stat(cartella)
        except FileNotFoundError:
            sftp.mkdir(cartella)
        cartelle_fatte.add(cartella)

    caricati = salvati = 0
    try:
        for f in elenco:
            relativo = f.relative_to(SORGENTE).as_posix()
            destinazione = f"{remoto}/{relativo}"
            assicura(posixpath.dirname(destinazione))

            # Regola 2: chi c'era prima si mette da parte.
            try:
                sftp.stat(destinazione)
                copia = f"{backup}/{relativo}"
                assicura(posixpath.dirname(copia))
                sftp.rename(destinazione, copia)
                salvati += 1
            except FileNotFoundError:
                pass

            sftp.put(str(f), destinazione)
            caricati += 1
            if caricati % 20 == 0:
                print(f"  … {caricati}/{len(elenco)}")

        print(f"\nCaricati {caricati} file.")
        if salvati:
            print(f"I {salvati} che c'erano prima stanno in {backup}")
        print("\nAdesso, in quest'ordine:")
        print("  1. apri il sito e guarda la home")
        print("  2. apri un articolo e una categoria")
        print("  3. entra nel pannello — la prima apertura applica le migrazioni")
        print("  4. controlla /sitemap.xml e /robots.txt")
        print("\nSe qualcosa non va, i file di prima sono nella cartella di backup.")
        return 0

    finally:
        sftp.close()
        ssh.close()


def errore(messaggio: str) -> int:
    print(messaggio, file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
