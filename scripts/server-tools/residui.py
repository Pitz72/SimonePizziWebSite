#!/usr/bin/env python3
"""
Trova, mette da parte e toglie i file che stanno sul server ma non nel repo.

    python scripts/server-tools/residui.py elenco
    python scripts/server-tools/residui.py scarica  F:/Backup/.../CARTELLA  assets/css/x.css pages/y.php …
    python scripts/server-tools/residui.py cancella F:/Backup/.../CARTELLA  assets/css/x.css … --prova
    python scripts/server-tools/residui.py cancella F:/Backup/.../CARTELLA  assets/css/x.css …

`elenco` confronta il docroot con public/ e stampa i file in più sul server, e
quelli presenti in tutti e due ma con un MD5 diverso. Salta quello che sul
server sta per scelta e non nel repo (vedi FUORI_DAL_REPO).

`scarica` copia i file nella cartella indicata, con i percorsi relativi, e
controlla dimensione e MD5 contro `md5sum` eseguito sul server.

`cancella` toglie un file SOLO se la copia locale ha lo stesso MD5 del file sul
server, ricalcolato al momento. Le cartelle non si toccano. Dopo, chiede ogni
indirizzo via HTTPS per controllare che risponda 404.

Credenziali in .secrets/deploy.json, come carica.py.
"""
import hashlib, json, posixpath, shlex, stat, sys, urllib.error, urllib.request
from pathlib import Path
import paramiko

RADICE = Path(__file__).resolve().parents[2]
PUBLIC = RADICE / "public"
SITO = "https://simonepizzi.runtimeradio.it"

# Sul server per scelta, mai nel repo: immagini vere, siti a sé, credenziali,
# verifica di Search Console, diagnostica di DreamHost.
FUORI_DAL_REPO = {"uploads", "relitto", "temp", "images", ".dh-diag",
                  "lib/config.php", "api/config.php", "google5c10103e83dd9067.html"}


def collega(cfg):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(cfg["host"], port=int(cfg.get("port", 22)),
                username=cfg["username"], password=cfg["password"])
    return ssh


def md5_remoti(ssh, base, relativi):
    """{relativo: md5} calcolato sul server; i file assenti non compaiono."""
    if not relativi:
        return {}
    comando = "cd " + shlex.quote(base) + " && md5sum -- " + " ".join(shlex.quote(r) for r in relativi)
    _, out, _ = ssh.exec_command(comando)
    risultato = {}
    for riga in out.read().decode("utf-8", "replace").splitlines():
        somma, _, nome = riga.partition("  ")
        if nome:
            risultato[nome] = somma
    return risultato


def md5_locale(percorso):
    return hashlib.md5(percorso.read_bytes()).hexdigest()


def escluso(relativo):
    return any(relativo == f or relativo.startswith(f + "/") for f in FUORI_DAL_REPO)


def elenco(ssh, sftp, base):
    remoti = []

    def cammina(cartella, prefisso):
        for voce in sftp.listdir_attr(cartella):
            relativo = prefisso + voce.filename
            if escluso(relativo):
                continue
            if stat.S_ISDIR(voce.st_mode):
                cammina(cartella + "/" + voce.filename, relativo + "/")
            else:
                remoti.append(relativo)

    cammina(base, "")
    in_piu = sorted(r for r in remoti if not (PUBLIC / r).is_file())
    comuni = [r for r in remoti if (PUBLIC / r).is_file()]
    somme = md5_remoti(ssh, base, comuni)
    diversi = sorted(r for r in comuni if somme.get(r) != md5_locale(PUBLIC / r))

    print(f"{len(remoti)} file sul server (esclusi {', '.join(sorted(FUORI_DAL_REPO))})")
    print(f"{len(comuni) - len(diversi)} su {len(comuni)} identici al repo")
    for r in diversi:
        print("  DIVERSO ", r)
    print(f"{len(in_piu)} sul server e non nel repo:")
    for r in in_piu:
        a = sftp.stat(base + "/" + r)
        print(f"  {r}  ({a.st_size} byte)")


def scarica(ssh, sftp, base, dest, relativi):
    somme = md5_remoti(ssh, base, relativi)
    for r in relativi:
        if r not in somme:
            sys.exit(f"Assente sul server: {r}")
    for r in relativi:
        locale = dest / r
        locale.parent.mkdir(parents=True, exist_ok=True)
        sftp.get(base + "/" + r, str(locale))
        if md5_locale(locale) != somme[r]:
            sys.exit(f"MD5 DIVERSO dopo lo scarico: {r}")
        print(f"  OK {r}  {locale.stat().st_size} byte  {somme[r]}")
    print(f"OK: {len(relativi)} file in {dest}, MD5 identici a quelli del server")


def cancella(ssh, sftp, base, dest, relativi, prova):
    somme = md5_remoti(ssh, base, relativi)
    tolti, saltati = [], []
    for r in relativi:
        locale = dest / r
        if r not in somme:
            saltati.append((r, "assente sul server"))
        elif not locale.is_file():
            saltati.append((r, "nessuna copia locale"))
        elif md5_locale(locale) != somme[r]:
            saltati.append((r, "la copia locale ha un MD5 diverso"))
        else:
            if not prova:
                sftp.remove(base + "/" + r)
            tolti.append(r)
    print(("PROVA: cancellerei " if prova else "Cancellati ") + f"{len(tolti)} file; saltati {len(saltati)}")
    for r in tolti:
        print("  ", r)
    for r, perche in saltati:
        print(f"  saltato {r}: {perche}")
    if prova or not tolti:
        return
    print("Controprova via HTTPS:")
    for r in tolti:
        try:
            codice = urllib.request.urlopen(urllib.request.Request(SITO + "/" + r, method="HEAD"), timeout=20).status
        except urllib.error.HTTPError as e:
            codice = e.code
        print(f"  {codice}  /{r}" + ("" if codice == 404 else "   <-- ATTESO 404"))


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in ("elenco", "scarica", "cancella"):
        sys.exit(__doc__)
    azione = sys.argv[1]
    cfg = json.loads((RADICE / ".secrets" / "deploy.json").read_text(encoding="utf-8"))
    base = cfg["remote_docroot"].rstrip("/")
    ssh = collega(cfg)
    sftp = ssh.open_sftp()
    try:
        if azione == "elenco":
            elenco(ssh, sftp, base)
            return
        argomenti = [a for a in sys.argv[2:] if a != "--prova"]
        if len(argomenti) < 2:
            sys.exit("Servono la cartella locale e almeno un file.")
        dest = Path(argomenti[0])
        relativi = [posixpath.normpath(a.strip("/")) for a in argomenti[1:]]
        if any(r.startswith("..") for r in relativi):
            sys.exit("Percorsi fuori dal docroot.")
        if azione == "scarica":
            scarica(ssh, sftp, base, dest, relativi)
        else:
            cancella(ssh, sftp, base, dest, relativi, "--prova" in sys.argv)
    finally:
        sftp.close()
        ssh.close()


if __name__ == "__main__":
    main()
