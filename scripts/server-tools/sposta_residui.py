#!/usr/bin/env python3
"""
Sposta fuori dal docroot i residui del vecchio sito React, senza cancellare niente.

    python scripts/server-tools/sposta_residui.py --prova
    python scripts/server-tools/sposta_residui.py            # sposta davvero
    python scripts/server-tools/sposta_residui.py --newsletter   # solo la cartella newsletter/
    python scripts/server-tools/sposta_residui.py --ripristina   # rimette tutto com'era

Tutto finisce in ~/backup-sito/residui-DATA/, con lo stesso percorso di prima:
rimettere a posto è uno spostamento al contrario. I bundle di assets/ si
riconoscono dal suffisso con l'hash (nome-AbC12xYz.js); assets/css, js e fonts
sono quelli del sito nuovo e non si toccano.
"""
import json, re, stat, sys
from datetime import date
from pathlib import Path
import paramiko

RADICE = Path(__file__).resolve().parents[2]
cfg = json.loads((RADICE / ".secrets" / "deploy.json").read_text(encoding="utf-8"))
BASE = cfg["remote_docroot"].rstrip("/")
DEST = "/home/" + cfg["username"] + "/backup-sito/residui-20261010"
HASH = re.compile(r"-[A-Za-z0-9_-]{8}\.(js|css)$")

t = paramiko.Transport((cfg["host"], int(cfg.get("port", 22))))
t.connect(username=cfg["username"], password=cfg["password"])
s = paramiko.SFTPClient.from_transport(t)

def esiste(p):
    try: s.stat(p); return True
    except IOError: return False

def mkdirs(p):
    parti = p.strip("/").split("/"); cur = ""
    for x in parti:
        cur += "/" + x
        if not esiste(cur): s.mkdir(cur)

def elenco(solo_newsletter):
    if solo_newsletter:
        return ["newsletter"]
    voci = ["index-react.php", "api/newsletter_send.php", "index.html", "js", "favicon.gif"]
    voci += ["assets/" + a.filename for a in s.listdir_attr(BASE + "/assets")
             if not stat.S_ISDIR(a.st_mode) and HASH.search(a.filename)]
    return voci

def main():
    prova = "--prova" in sys.argv
    if "--ripristina" in sys.argv:
        for q in sorted(s.listdir(DEST)) if esiste(DEST) else []:
            pass
        def giu(p, rel=""):
            for a in s.listdir_attr(p):
                r = (rel + "/" + a.filename).lstrip("/")
                if r in ("assets", "api") or (stat.S_ISDIR(a.st_mode) and r in ("assets", "api")):
                    giu(p + "/" + a.filename, r); continue
                dst = BASE + "/" + r
                if not esiste(dst):
                    mkdirs(dst.rsplit("/", 1)[0]); s.rename(p + "/" + a.filename, dst); print("rimesso", r)
        giu(DEST)
        return
    voci = elenco("--newsletter" in sys.argv)
    mossi = 0
    for v in voci:
        src = BASE + "/" + v
        if not esiste(src):
            print("assente  ", v); continue
        dst = DEST + "/" + v
        print(("sposterei " if prova else "sposto    ") + v)
        if not prova:
            mkdirs(dst.rsplit("/", 1)[0]); s.rename(src, dst)
        mossi += 1
    print(f"{mossi} voci" + (" (prova, non ho toccato niente)" if prova else " spostate in " + DEST))

main()
