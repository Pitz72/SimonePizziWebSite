#!/usr/bin/env python3
"""
Scarica in locale i residui del vecchio sito (stessa lista di sposta_residui.py)
e la cartella newsletter/ già spostata, e controlla che ogni file abbia la stessa
dimensione dell'originale. Non cancella niente sul server.

    python scripts/server-tools/scarica_residui.py "F:/Backup/SimonePizziWebSite_residui_2026-10-10"
"""
import json, re, stat, sys
from pathlib import Path
import paramiko

RADICE = Path(__file__).resolve().parents[2]
cfg = json.loads((RADICE / ".secrets" / "deploy.json").read_text(encoding="utf-8"))
BASE = cfg["remote_docroot"].rstrip("/")
SPOSTATI = "/home/" + cfg["username"] + "/backup-sito/residui-20261010"
HASH = re.compile(r"-[A-Za-z0-9_-]{8}\.(js|css)$")
out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)

t = paramiko.Transport((cfg["host"], int(cfg.get("port", 22))))
t.connect(username=cfg["username"], password=cfg["password"])
s = paramiko.SFTPClient.from_transport(t)

def esiste(p):
    try: s.stat(p); return True
    except IOError: return False

def scarica(rem, loc, tot):
    a = s.stat(rem)
    if stat.S_ISDIR(a.st_mode):
        loc.mkdir(parents=True, exist_ok=True)
        for f in s.listdir_attr(rem): scarica(rem + "/" + f.filename, loc / f.filename, tot)
    else:
        if loc.exists() and loc.stat().st_size == a.st_size: tot[1] += a.st_size; tot[0] += 1; return
        loc.parent.mkdir(parents=True, exist_ok=True); s.get(rem, str(loc))
        if loc.stat().st_size != a.st_size: raise SystemExit(f"DIMENSIONE DIVERSA: {rem}")
        tot[0] += 1; tot[1] += a.st_size

tot = [0, 0]
voci = [(BASE + "/" + v, out / v) for v in ["index-react.php", "api/newsletter_send.php", "index.html", "js", "favicon.gif"]]
voci += [(BASE + "/assets/" + a.filename, out / "assets" / a.filename) for a in s.listdir_attr(BASE + "/assets")
         if not stat.S_ISDIR(a.st_mode) and HASH.search(a.filename)]
voci += [(SPOSTATI + "/newsletter", out / "newsletter")]
for rem, loc in voci:
    if esiste(rem): scarica(rem, loc, tot)
    else: print("assente", rem)
print(f"OK: {tot[0]} file, {tot[1]/1024/1024:.1f} MB in {out}")
