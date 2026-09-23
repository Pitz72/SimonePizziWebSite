#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Prepara un articolo scritto fuori dal pannello perché diventi una BOZZA in
produzione: carica le immagini via SFTP e genera lo script one-shot da passare
a `esegui.py`.

    python scripts/server-tools/prepara_bozza.py scratch/articolo-xyz
    python scripts/server-tools/esegui.py <percorso assoluto>/crea_bozza.php
    python scripts/server-tools/esegui.py <percorso assoluto>/crea_bozza.php --applica

La cartella dell'articolo contiene:
  corpo.html      il corpo, con le immagini scritte come  src="__IMG_chiave__"
  meta.json       title, slug, category, excerpt, seo_title, seo_description,
                  focus_keyword, tag (elenco di nomi)
  immagini.json   {chiave: nome del file .webp}
  img/            i .webp, già ridimensionati (al massimo 1920 px di larghezza)

Serve perché il pannello chiede la password di produzione e MySQL da fuori è
chiuso: resta lo script one-shot, e questo gli prepara i dati. Le immagini
vanno su prima, così lo script può controllare che ci siano.
"""

import base64
import io
import json
import os
import posixpath
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(os.path.dirname(QUI))


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    cartella = os.path.abspath(sys.argv[1])
    leggi = lambda n: io.open(os.path.join(cartella, n), encoding="utf-8").read()

    corpo = leggi("corpo.html")
    meta = json.loads(leggi("meta.json"))
    immagini = json.loads(leggi("immagini.json"))

    for chiave, nome in immagini.items():
        segnaposto = f"__IMG_{chiave}__"
        if corpo.count(segnaposto) != 1:
            sys.exit(f"{segnaposto}: atteso una volta nel corpo, trovato {corpo.count(segnaposto)}")
        corpo = corpo.replace(segnaposto, "/uploads/immagini/" + nome)
    avanzi = re.findall(r"__IMG_\w+__", corpo)
    if avanzi:
        sys.exit(f"segnaposto senza immagine: {avanzi}")

    # Titolo e riassunti finiscono in <title>, og: e JSON-LD: niente apostrofi dritti.
    for campo in ("title", "excerpt", "seo_title", "seo_description"):
        if "'" in meta[campo]:
            sys.exit(f"apostrofo dritto in {campo}")
    if len(meta["seo_title"]) > 70 or len(meta["seo_description"]) > 200:
        sys.exit("seo_title oltre 70 o seo_description oltre 200 caratteri: la colonna li taglierebbe")

    import paramiko
    cfg = json.load(io.open(os.path.join(RADICE, ".secrets", "deploy.json"), encoding="utf-8"))
    remota = posixpath.join(cfg["remote_docroot"].rstrip("/"), "uploads", "immagini")
    trasporto = paramiko.Transport((cfg["host"], cfg["port"]))
    trasporto.connect(username=cfg["username"], password=cfg["password"])
    sftp = paramiko.SFTPClient.from_transport(trasporto)
    try:
        for nome in immagini.values():
            locale = os.path.join(cartella, "img", nome)
            dest = posixpath.join(remota, nome)
            try:
                if sftp.stat(dest).st_size == os.path.getsize(locale):
                    print(f"già sul server  {nome}")
                    continue
            except IOError:
                pass
            sftp.put(locale, dest)
            print(f"caricata        {nome}")
    finally:
        sftp.close()
        trasporto.close()

    dati = {
        "articolo": {
            "title": meta["title"], "slug": meta["slug"], "category": meta["category"],
            "excerpt": meta["excerpt"], "content": corpo,
            "seo_title": meta["seo_title"], "seo_description": meta["seo_description"],
            "focus_keyword": meta["focus_keyword"],
        },
        "immagini": list(immagini.values()),
        "tag": meta["tag"],
    }
    b64 = base64.b64encode(json.dumps(dati, ensure_ascii=False).encode("utf-8")).decode("ascii")
    php = io.open(os.path.join(QUI, "crea_bozza_articolo.template.php"), encoding="utf-8").read()
    php = php.replace("__DATI__", b64)
    uscita = os.path.join(cartella, "crea_bozza.php")
    io.open(uscita, "w", encoding="utf-8", newline="\n").write(php)
    print(f"\nscritto {os.path.relpath(uscita, RADICE)}")
    # esegui.py risolve i percorsi relativi dentro server-tools/: gli si passa quello assoluto.
    print(f'adesso: python scripts/server-tools/esegui.py "{uscita}"')


if __name__ == "__main__":
    main()
