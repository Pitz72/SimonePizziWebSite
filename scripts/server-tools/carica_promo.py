#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Carica un promo animato in /promo/ sul server e controlla come viene servito.

    python scripts/server-tools/carica_promo.py "<file del promo>.html" l-albero-dei-racconti

Un promo è una pagina HTML chiusa in un file solo (script in linea, suoni,
caratteri e immagini in data:). Sta solo sul server, come relitto/: carica.py
salta la cartella promo/, residui.py la lascia stare, e .gitignore la tiene
fuori dal repo. L'.htaccess le manda una CSP sua, in sandbox.

Nell'articolo basta un paragrafo con il link e nient'altro:

    <p><a href="/promo/l-albero-dei-racconti.html">Il promo di L’Albero dei Racconti</a></p>

e lib/video.php (promo_al_clic) lo trasforma in un riquadro che carica il
promo solo al clic.

Dopo il caricamento controlla: risposta 200, stessa dimensione, CSP con
«sandbox allow-scripts» e senza «allow-same-origin», X-Robots-Tag noindex.
"""

import io
import json
import os
import posixpath
import re
import sys
import urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(os.path.dirname(QUI))
SITO = "https://simonepizzi.runtimeradio.it"


def main():
    if len(sys.argv) != 3 or not re.fullmatch(r"[a-z0-9-]+", sys.argv[2]):
        sys.exit(__doc__)
    locale, nome = os.path.abspath(sys.argv[1]), sys.argv[2]
    if not os.path.isfile(locale):
        sys.exit(f"non trovo {locale}")
    testa = io.open(locale, encoding="utf-8", errors="replace").read(400).lower()
    if "<!doctype html" not in testa:
        sys.exit("non sembra una pagina HTML")
    dimensione = os.path.getsize(locale)

    import paramiko
    cfg = json.load(io.open(os.path.join(RADICE, ".secrets", "deploy.json"), encoding="utf-8"))
    cartella = posixpath.join(cfg["remote_docroot"].rstrip("/"), "promo")
    dest = posixpath.join(cartella, nome + ".html")
    trasporto = paramiko.Transport((cfg["host"], cfg["port"]))
    trasporto.connect(username=cfg["username"], password=cfg["password"])
    sftp = paramiko.SFTPClient.from_transport(trasporto)
    try:
        try:
            sftp.stat(cartella)
        except IOError:
            sftp.mkdir(cartella)
            print("creata  promo/")
        sftp.put(locale, dest)
        sul_server = sftp.stat(dest).st_size
    finally:
        sftp.close()
        trasporto.close()
    print(f"caricato promo/{nome}.html, {dimensione:,} byte".replace(",", "."))
    if sul_server != dimensione:
        sys.exit(f"ERRORE: sul server sono {sul_server} byte")

    url = f"{SITO}/promo/{nome}.html"
    richiesta = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "carica_promo"})
    with urllib.request.urlopen(richiesta, timeout=30) as r:
        stato, csp, robot = r.status, r.headers.get("Content-Security-Policy", ""), r.headers.get("X-Robots-Tag", "")
    problemi = []
    if stato != 200:
        problemi.append(f"stato {stato}")
    if "sandbox allow-scripts" not in csp or "allow-same-origin" in csp:
        problemi.append(f"CSP inattesa: «{csp}»")
    if "noindex" not in robot:
        problemi.append("manca X-Robots-Tag noindex")
    if problemi:
        sys.exit("ERRORE: " + "; ".join(problemi))
    print(f"servito {url}: 200, in sandbox, noindex")


if __name__ == "__main__":
    main()
