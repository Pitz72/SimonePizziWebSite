# -*- coding: utf-8 -*-
"""
Carica `unisci_tag_doppioni.php` in /api/, lo esegue e lo cancella. In un comando.

Il pattern "script one-shot + token + rm" resta valido per i fix di dati, ma ha
due difetti noti: tre passaggi manuali dimenticabili, e uno script privilegiato
online nella finestra fra esecuzione e cancellazione. Questo runner li chiude
entrambi — la cancellazione sta in un `finally`, quindi avviene anche se
l'esecuzione fallisce, e la finestra dura i secondi della richiesta.

Altre due precauzioni: il nome del file remoto è casuale (non indovinabile) e il
token cambia a ogni giro, quindi non c'è nessun segreto durevole nel repo.

USO
    python scripts/server-tools/esegui_unione_tag.py              # anteprima
    python scripts/server-tools/esegui_unione_tag.py --applica    # esegue davvero

Serve `paramiko` (già usato da .secrets/deploy.py). Credenziali da
`.secrets/deploy.json`, mai stampate.
"""

import argparse
import io
import json
import os
import posixpath
import secrets
import sys
import urllib.error
import urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(os.path.dirname(QUI))
SORGENTE = os.path.join(QUI, "unisci_tag_doppioni.php")
SITO = "https://simonepizzi.runtimeradio.it"

# DreamShield risponde 418 ai client che non sembrano browser (è già successo col
# crawler di Facebook), quindi non ci presentiamo come Python-urllib.
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36"


def chiedi(url, timeout):
    return urllib.request.urlopen(
        urllib.request.Request(url, headers={"User-Agent": UA}), timeout=timeout
    )


def main():
    p = argparse.ArgumentParser(description="Unisce i tag doppioni in produzione.")
    p.add_argument("--applica", action="store_true",
                   help="esegue davvero (default: anteprima con rollback)")
    args = p.parse_args()

    import paramiko

    cfg = json.load(io.open(os.path.join(RADICE, ".secrets", "deploy.json"), encoding="utf-8"))
    docroot = cfg["remote_docroot"].rstrip("/")

    token = secrets.token_urlsafe(24)
    nome = f"unisci_tag_{secrets.token_hex(8)}.php"
    remoto = posixpath.join(docroot, "api", nome)

    php = io.open(SORGENTE, encoding="utf-8").read().replace("__TOKEN__", token)
    locale_tmp = os.path.join(QUI, nome)
    io.open(locale_tmp, "w", encoding="utf-8", newline="\n").write(php)

    trasporto = paramiko.Transport((cfg["host"], cfg["port"]))
    trasporto.connect(username=cfg["username"], password=cfg["password"])
    sftp = paramiko.SFTPClient.from_transport(trasporto)

    esito = ""
    try:
        sftp.put(locale_tmp, remoto)
        print(f"caricato   api/{nome}")

        url = f"{SITO}/api/{nome}?token={token}"
        if args.applica:
            url += "&applica=1"

        print("eseguo" + (" (ESECUZIONE REALE)" if args.applica else " (anteprima)") + "...\n")
        try:
            with chiedi(url, 120) as r:
                esito = r.read().decode("utf-8", "replace")
        except urllib.error.HTTPError as e:
            # Il PHP parla anche quando risponde 403 o 500: leggiamo il corpo
            # invece di mostrare un traceback che non dice niente.
            esito = e.read().decode("utf-8", "replace")
            print(f"[HTTP {e.code}]")
        print(esito)

    finally:
        # Sempre, anche se sopra è esploso qualcosa.
        try:
            sftp.remove(remoto)
            print(f"cancellato api/{nome}")
        except IOError as e:
            print(f"\n⚠ ATTENZIONE: non sono riuscito a cancellare api/{nome} ({e}).")
            print("  Cancellarlo A MANO via SFTP, subito.")
        sftp.close()
        trasporto.close()

    # Controprova indipendente: non fidarsi del fatto che remove() non abbia urlato.
    try:
        with chiedi(f"{SITO}/api/{nome}", 30) as r:
            print(f"\n⚠ ATTENZIONE: api/{nome} risponde ancora {r.status}. Cancellarlo a mano.")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print("verificato: lo script non è più raggiungibile (404)")
        else:
            print(f"verifica: risposta {e.code} (atteso 404)")

    if esito:
        percorso = os.path.join(
            RADICE, "scratch",
            "unione_tag_" + ("applicata" if args.applica else "anteprima") + ".txt",
        )
        os.makedirs(os.path.dirname(percorso), exist_ok=True)
        io.open(percorso, "w", encoding="utf-8", newline="\n").write(esito)
        print(f"log e backup salvati in {os.path.relpath(percorso, RADICE)}")

    os.remove(locale_tmp)

    if "ESITO: OK" not in esito:
        sys.exit("\nEsecuzione NON riuscita: leggere il log qui sopra.")


if __name__ == "__main__":
    main()
