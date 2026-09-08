#!/usr/bin/env python3
"""
Rifà la favicon del sito: SP nel verde e nel nero dell'«Officina Notturna».

    python scripts/sviluppo/crea-favicon.py

Scrive quattro file in public/, e li scrive TUTTI da una sorgente sola — i
contorni veri di «S» e «P» presi dal carattere del marchio:

    favicon.svg            i browser di oggi
    favicon.ico            16, 32 e 48 px, il ripiego che Windows vuole ancora
    apple-touch-icon.png   180 px, la schermata iniziale di iOS
    favicon.png            512 px, per quando serve una PNG grande

PERCHÉ UNO SCRIPT E NON UN DISEGNO A MANO.
Le lettere devono essere le stesse del marchio in cima alle pagine: Bricolage
Grotesque, peso 800, larghezza 76. Il carattere che il sito ha in casa è
variabile, quindi «peso 800, larghezza 76» non è un file, è un punto dentro un
file: va istanziato. Rifarlo a mano in un editor vettoriale significherebbe
rifare quel punto a occhio, e sbagliarlo.

Nell'SVG le lettere sono TRACCIATI, non testo: un SVG usato come icona non
carica i caratteri del sito, quindi un <text> uscirebbe con il ripiego di
sistema — un'altra faccia, non quella del marchio.

Le PNG non nascono dall'SVG (qui non c'è un rasterizzatore SVG affidabile) ma
dal carattere, disegnate a otto volte la misura e rimpicciolite: a 16 px la
differenza fra un contorno rimpicciolito bene e uno rimpicciolito male è tutta
la leggibilità che c'è.
"""

from __future__ import annotations

import io
import os
import sys
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from PIL import Image, ImageDraw, ImageFont

# ── Le costanti del disegno ─────────────────────────────────────────────────
# Il verde e il nero sono quelli di assets/css/base.css: --verde e --nero. Se
# cambiano lì, cambiano qui — non c'è modo di farli leggere dal CSS, ma sono
# due righe e stanno scritte da tutte e due le parti.
VERDE = '#22c55e'
NERO = '#04070a'

# Quanto respirano le lettere dentro il quadrato. Un ottavo per lato: sotto,
# a 16 px l'icona diventa un blocco; sopra, le lettere non si leggono più.
QUOTA_MARGINE = 1 / 8

# Il punto dentro il carattere variabile: lo stesso del marchio.
ASSI = {'opsz': 96, 'wght': 800, 'wdth': 76}

# Il file con le lettere latine, fra i tre pezzi in cui il carattere è tagliato.
CARATTERE = 'bricolagegrotesque-3y996as8bTXq_nANBjzKo3IeZx8z6up5L-iNGQ.woff2'

LETTERE = 'SP'
MISURE_ICO = [16, 32, 48]
MISURA_APPLE = 180
MISURA_PNG = 512

RADICE = Path(__file__).resolve().parents[2]
PUBBLICA = RADICE / 'public'
FONTS = PUBBLICA / 'assets' / 'fonts'


def carattere_statico(dove: Path) -> Path:
    """Il carattere variabile inchiodato al punto che ci serve."""
    sorgente = FONTS / CARATTERE
    if not sorgente.is_file():
        sys.exit(f'Manca il carattere: {sorgente}\n'
                 'Si riporta in casa con scripts/sviluppo/porta-in-casa-i-caratteri.sh')

    f = TTFont(sorgente)
    if 'fvar' not in f:
        sys.exit(f'{CARATTERE} non è un carattere variabile: gli assi non ci sono.')
    for lettera in LETTERE:
        if ord(lettera) not in f.getBestCmap():
            sys.exit(f'{CARATTERE} non contiene la lettera «{lettera}».')

    f = instantiateVariableFont(f, ASSI, inplace=True)
    f.flavor = None                       # da woff2 a ttf: PIL il woff2 non lo apre
    fuori = dove / 'bricolage-sp.ttf'
    f.save(fuori)
    return fuori


def contorni(ttf: Path):
    """I tracciati di «SP», e il rettangolo che li contiene tutti."""
    f = TTFont(ttf)
    glifi = f.getGlyphSet()
    cmap = f.getBestCmap()
    hmtx = f['hmtx']

    pezzi, avanzamento = [], 0
    limiti = BoundsPen(glifi)
    for lettera in LETTERE:
        nome = cmap[ord(lettera)]
        penna = SVGPathPen(glifi)
        glifi[nome].draw(penna)
        pezzi.append((penna.getCommands(), avanzamento))
        glifi[nome].draw(_Spostata(limiti, avanzamento))
        avanzamento += hmtx[nome][0]

    return pezzi, limiti.bounds


class _Spostata:
    """Ridisegna un glifo spostato in orizzontale, per misurare l'insieme."""

    def __init__(self, penna, dx):
        self.p, self.dx = penna, dx

    def _s(self, punti):
        return [(x + self.dx, y) if x is not None else None for x, y in punti]

    def moveTo(self, pt):      self.p.moveTo(*self._s([pt]))
    def lineTo(self, pt):      self.p.lineTo(*self._s([pt]))
    def curveTo(self, *pt):    self.p.curveTo(*self._s(pt))
    def qCurveTo(self, *pt):   self.p.qCurveTo(*self._s(pt))
    def closePath(self):       self.p.closePath()
    def endPath(self):         self.p.endPath()


def scrivi_svg(pezzi, limiti, lato: int = 64) -> str:
    x0, y0, x1, y1 = limiti
    margine = lato * QUOTA_MARGINE
    # La larghezza comanda: «SP» è più largo che alto, e a decidere quanto
    # respira l'icona dev'essere il lato che tocca per primo il bordo.
    scala = (lato - 2 * margine) / (x1 - x0)
    altezza = (y1 - y0) * scala
    tx = margine - scala * x0
    # La y del glifo va all'insù, quella dell'SVG all'ingiù: di qui la scala
    # negativa, e il fatto che si parta dal bordo ALTO delle lettere.
    ty = (lato - altezza) / 2 + scala * y1

    corpo = '\n'.join(
        f'    <path transform="translate({tx + scala * dx:.3f} {ty:.3f}) '
        f'scale({scala:.5f} -{scala:.5f})" d="{d}"/>'
        for d, dx in pezzi)

    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {lato} {lato}" width="{lato}" height="{lato}" role="img" aria-label="Simone Pizzi">
  <!-- NON SI MODIFICA A MANO: lo rifà scripts/sviluppo/crea-favicon.py, che da
       qui ricava anche favicon.ico, apple-touch-icon.png e favicon.png.
       Le lettere sono i contorni veri del carattere del marchio (Bricolage
       Grotesque, peso 800, larghezza 76), non un <text>: un SVG usato come
       icona non carica i caratteri del sito. -->
  <rect width="{lato}" height="{lato}" fill="{NERO}"/>
  <g fill="{VERDE}">
{corpo}
  </g>
</svg>
'''


def disegna(ttf: Path, lato: int, sovracampionamento: int = 8) -> Image.Image:
    """Il quadrato con «SP», disegnato in grande e poi rimpicciolito."""
    grande = lato * sovracampionamento
    margine = grande * QUOTA_MARGINE
    utile = grande - 2 * margine

    # La misura giusta si cerca: chiedere «alto tot» a un carattere non dà una
    # scatola di quell'altezza, perché dipende dai contorni delle lettere.
    misura = grande
    while misura > 1:
        f = ImageFont.truetype(str(ttf), misura)
        x0, y0, x1, y1 = f.getbbox(LETTERE)
        if (x1 - x0) <= utile and (y1 - y0) <= utile:
            break
        misura = int(misura * 0.92)

    tela = Image.new('RGBA', (grande, grande), NERO)
    penna = ImageDraw.Draw(tela)
    x0, y0, x1, y1 = f.getbbox(LETTERE)
    penna.text(((grande - (x1 - x0)) / 2 - x0, (grande - (y1 - y0)) / 2 - y0),
               LETTERE, font=f, fill=VERDE)

    return tela.resize((lato, lato), Image.LANCZOS)


def main() -> None:
    import tempfile

    with tempfile.TemporaryDirectory() as tmp:
        ttf = carattere_statico(Path(tmp))
        pezzi, limiti = contorni(ttf)

        svg = PUBBLICA / 'favicon.svg'
        io.open(svg, 'w', encoding='utf-8', newline='\n').write(scrivi_svg(pezzi, limiti))
        print(f'  {svg.relative_to(RADICE)}  ({svg.stat().st_size} byte)')

        # L'ICO porta dentro tutte e tre le misure: sceglie il sistema quale usare.
        ico = PUBBLICA / 'favicon.ico'
        piu_grande = disegna(ttf, max(MISURE_ICO))
        piu_grande.convert('RGB').save(
            ico, format='ICO', sizes=[(n, n) for n in MISURE_ICO])
        print(f'  {ico.relative_to(RADICE)}  ({", ".join(str(n) for n in MISURE_ICO)} px, '
              f'{ico.stat().st_size} byte)')

        for nome, lato in [('apple-touch-icon.png', MISURA_APPLE),
                           ('favicon.png', MISURA_PNG)]:
            f = PUBBLICA / nome
            # Niente trasparenza: la schermata iniziale di iOS mette il bianco
            # sotto, e le lettere verdi su bianco non si leggerebbero.
            disegna(ttf, lato).convert('RGB').save(f, format='PNG', optimize=True)
            print(f'  {f.relative_to(RADICE)}  ({lato} px, {f.stat().st_size} byte)')


if __name__ == '__main__':
    print('Rifaccio la favicon:')
    main()
    print('\nFatto. Vanno in produzione con il caricamento normale '
          '(python scripts/deploy/carica.py).')
