#!/usr/bin/env python3
"""
Porta fuori da DreamHost l'ultima copia del sito: il dump più recente del
database e l'archivio delle immagini, da ~/backup-db sul server a una cartella
di questo computer, controllando che ogni file arrivi con la sua dimensione.

    python scripts/server-tools/scarica_backup.py                      # in F:/Backup/SimonePizziWebSite/backup-sito
    python scripts/server-tools/scarica_backup.py "D:/altra/cartella"

Perché esiste (revisione del 16 ottobre 2026, G6): il backup automatico scrive
le copie nella stessa home DreamHost del sito. Se si perde l'account, o un
comando sbagliato via SFTP svuota la home, spariscono insieme il sito e le sue
copie. Questo script ne tiene una fuori, una cartella per data. Non cancella
niente, né sul server né qui.

Il dump contiene dati personali (iscritti alla newsletter, messaggi): la
cartella di destinazione va trattata come il server, cioè non condivisa.
"""
import json
import stat
import sys
from datetime import datetime
from pathlib import Path

import paramiko

RADICE = Path(__file__).resolve().parents[2]
cfg = json.loads((RADICE / ".secrets" / "deploy.json").read_text(encoding="utf-8"))
REMOTO = "backup-db"
DESTINAZIONE = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("F:/Backup/SimonePizziWebSite/backup-sito")

t = paramiko.Transport((cfg["host"], int(cfg.get("port", 22))))
t.connect(username=cfg["username"], password=cfg["password"])
s = paramiko.SFTPClient.from_transport(t)
try:
    voci = [v for v in s.listdir_attr(REMOTO) if stat.S_ISREG(v.st_mode)]
    dump = sorted([v for v in voci if v.filename.startswith("sito_") and v.filename.endswith(".sql.gz")],
                  key=lambda v: v.filename)
    scelti = ([dump[-1]] if dump else []) + [v for v in voci if v.filename == "immagini.zip"]
    if not scelti:
        sys.exit("Sul server, in ~/backup-db, non c'è niente da scaricare.")

    cartella = DESTINAZIONE / datetime.now().strftime("%Y-%m-%d")
    cartella.mkdir(parents=True, exist_ok=True)
    for v in scelti:
        locale = cartella / v.filename
        s.get(f"{REMOTO}/{v.filename}", str(locale))
        if locale.stat().st_size != v.st_size:
            sys.exit(f"DIMENSIONE DIVERSA: {v.filename} ({locale.stat().st_size} invece di {v.st_size})")
        print(f"OK: {v.filename}  {v.st_size / 1048576:.2f} MB")
    if not any(v.filename == "immagini.zip" for v in scelti):
        print("Attenzione: immagini.zip non c'è ancora. Nasce al prossimo backup (automatico o dal pannello).")
    print(f"\nTutto in {cartella}")
finally:
    s.close()
    t.close()
