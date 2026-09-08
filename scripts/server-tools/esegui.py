#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Carica uno script PHP one-shot in /api/, lo esegue e lo cancella. In un comando.

    python scripts/server-tools/esegui.py <script.php>              # anteprima
    python scripts/server-tools/esegui.py <script.php> --applica    # esegue davvero

È `esegui_unione_tag.py` senza il nome dello script incollato dentro: quello
serviva a un lavoro solo, e il lavoro è finito. Il pattern invece resta —
«script one-shot in /api/, eseguito via URL, cancellato subito» — perché da qui
MySQL non si raggiunge: DreamHost non accetta connessioni da fuori.

I due difetti storici del pattern li chiude il runner, non il metodo:

  · i tre passaggi manuali dimenticabili → un comando, e la `sftp.remove()` sta
    in un `finally`, quindi lo script sparisce anche se l'esecuzione esplode;
  · lo script privilegiato lasciato online → il nome del file remoto è casuale
    a ogni giro, il token pure, la finestra dura i secondi della richiesta, e
    alla fine si controlla per via indipendente che l'indirizzo dia 404.

CHE COSA DEVE FARE LO SCRIPT PHP
  · leggere `__TOKEN__` (il runner lo sostituisce) e confrontarlo con
    `$_GET['token']` usando `hash_equals()`;
  · essere in ANTEPRIMA per default — fare tutto il lavoro dentro una
    transazione e poi `ROLLBACK` — e scrivere solo con `?applica=1`;
  · stampare nella risposta HTTP il backup dei dati che tocca, così non resta
    niente sul server da recuperare dopo;
  · chiudere con la riga `ESITO: OK`, che è quello che il runner controlla.

Serve `paramiko`. Credenziali da `.secrets/deploy.json`, mai stampate.
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
SITO = "https://simonepizzi.runtimeradio.it"

# DreamShield risponde 418 ai client che non sembrano browser (è già successo
# col crawler di Facebook), quindi non ci presentiamo come Python-urllib.
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/128.0 Safari/537.36")


def chiedi(url, timeout):
    return urllib.request.urlopen(
        urllib.request.Request(url, headers={"User-Agent": UA}), timeout=timeout
    )


def main():
    p = argparse.ArgumentParser(
        description="Esegue uno script PHP one-shot in produzione e lo cancella.")
    p.add_argument("script", help="il .php da eseguire (in scripts/server-tools/)")
    p.add_argument("--applica", action="store_true",
                   help="esegue davvero (default: anteprima con rollback)")
    args = p.parse_args()

    sorgente = args.script if os.path.isabs(args.script) else os.path.join(QUI, args.script)
    if not os.path.isfile(sorgente):
        sys.exit(f"Non trovo {sorgente}")

    import paramiko

    cfg = json.load(io.open(os.path.join(RADICE, ".secrets", "deploy.json"), encoding="utf-8"))
    docroot = cfg["remote_docroot"].rstrip("/")

    token = secrets.token_urlsafe(24)
    base = os.path.splitext(os.path.basename(sorgente))[0][:20]
    nome = f"{base}_{secrets.token_hex(8)}.php"
    remoto = posixpath.join(docroot, "api", nome)

    grezzo = io.open(sorgente, encoding="utf-8").read()
    if "__TOKEN__" not in grezzo:
        # Senza token lo script è aperto a chiunque indovini il nome del file,
        # per tutta la durata della richiesta. Non è un dettaglio di stile.
        sys.exit(f"{os.path.basename(sorgente)} non contiene __TOKEN__: "
                 "manca la protezione, non lo carico.")

    php = grezzo.replace("__TOKEN__", token)
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
            with chiedi(url, 180) as r:
                esito = r.read().decode("utf-8", "replace")
        except urllib.error.HTTPError as e:
            # Il PHP parla anche quando risponde 403 o 500: si legge il corpo
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
            f"{base}_" + ("applicato" if args.applica else "anteprima") + ".txt")
        os.makedirs(os.path.dirname(percorso), exist_ok=True)
        io.open(percorso, "w", encoding="utf-8", newline="\n").write(esito)
        print(f"log e backup salvati in {os.path.relpath(percorso, RADICE)}")

    os.remove(locale_tmp)

    if "ESITO: OK" not in esito:
        sys.exit("\nEsecuzione NON riuscita: leggere il log qui sopra.")


if __name__ == "__main__":
    main()
