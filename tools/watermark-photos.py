"""Estampa la marca de agua de la inmobiliaria en las fotos de public/properties.

Parte de los .jpg originales que están en git (commit 793123c, antes de pasar a WebP), así que se puede volver a correr sin apilar marcas.
Uso: python3 tools/watermark-photos.py   (desde la raíz del proyecto)
"""
import glob
import io
import subprocess

from PIL import Image, ImageDraw, ImageFont

FONT = '/System/Library/Fonts/Helvetica.ttc'

def build_logo(path: str = 'public/about/logo-watermark.png', height: int = 480) -> Image.Image:
    """Dibuja el logo en alta resolución (casita del SVG + nombre) para que no se vea blando al achicarlo."""
    ss = 3  # supersampling
    H = height * ss
    k = H / 100  # la casita del SVG está en un viewBox de 80x100
    mark_w = int(80 * k)

    def pt(x, y):
        return (x * k, y * k)

    mark = Image.new('RGBA', (mark_w, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(mark)
    d.polygon([pt(*p) for p in [(5, 38), (34, 5), (75, 50), (75, 95), (5, 95)]], fill=(224, 176, 64, 255))
    d.polygon([pt(*p) for p in [(19, 50), (34, 28), (61, 56), (61, 79), (19, 79)]], fill=(0, 0, 0, 0))
    d.polygon([pt(*p) for p in [(25, 54), (36, 36), (49, 52), (49, 75), (25, 75)]], fill=(208, 106, 40, 255))
    # el hueco del marco debe quedar transparente: se recorta con una máscara
    hole = Image.new('L', mark.size, 0)
    ImageDraw.Draw(hole).polygon([pt(*p) for p in [(19, 50), (34, 28), (61, 56), (61, 79), (19, 79)]], fill=255)
    core = Image.new('L', mark.size, 0)
    ImageDraw.Draw(core).polygon([pt(*p) for p in [(25, 54), (36, 36), (49, 52), (49, 75), (25, 75)]], fill=255)
    alpha = mark.getchannel('A')
    alpha = Image.composite(Image.new('L', mark.size, 0), alpha, hole)
    alpha = Image.composite(Image.new('L', mark.size, 255), alpha, core)
    mark.putalpha(alpha)

    f1 = ImageFont.truetype(FONT, int(H * 0.30), index=1)
    f2 = ImageFont.truetype(FONT, int(H * 0.27), index=0)
    t1, t2 = 'MARIANA ECHEVERRÍA', 'BIENES RAÍCES'
    w1 = int(f1.getlength(t1))
    gap = int(H * 0.12)
    out = Image.new('RGBA', (mark_w + gap + w1 + int(H * 0.04), H), (0, 0, 0, 0))
    out.alpha_composite(mark, (0, 0))
    d = ImageDraw.Draw(out)
    x0 = mark_w + gap
    d.text((x0, int(H * 0.19)), t1, font=f1, fill=(232, 135, 58, 255))
    # segunda línea con espaciado de letras para ocupar el mismo ancho
    letters = list(t2)
    natural = sum(f2.getlength(c) for c in letters)
    track = (w1 - natural) / (len(letters) - 1)
    x = x0
    for c in letters:
        d.text((x, int(H * 0.55)), c, font=f2, fill=(244, 214, 128, 255))
        x += f2.getlength(c) + track
    out = out.crop(out.getbbox())
    out = out.resize((round(out.width / ss), round(out.height / ss)), Image.LANCZOS)
    out.save(path)
    return out


LOGO = build_logo()


def logo_at(width: int, opacity: float = 1.0) -> Image.Image:
    h = round(LOGO.height * width / LOGO.width)
    out = LOGO.resize((width, h), Image.LANCZOS)
    if opacity < 1:
        a = out.getchannel('A').point(lambda v: int(v * opacity))
        out.putalpha(a)
    return out


def stamp(im: Image.Image, cover: bool = False) -> Image.Image:
    im = im.convert('RGBA')
    w, h = im.size

    # Logo repetido en diagonal, tenue: dificulta recortar la marca.
    tile_logo = logo_at(max(90, w // 6), 0.22)
    pad = tile_logo.width // 3
    tile = Image.new('RGBA', (tile_logo.width + pad, tile_logo.height + pad), (0, 0, 0, 0))
    tile.paste(tile_logo, (pad // 2, pad // 2), tile_logo)
    tile = tile.rotate(25, expand=True, resample=Image.BICUBIC)
    ox, oy = tile.width, tile.height
    canvas = Image.new('RGBA', (w + 2 * ox, h + 2 * oy), (0, 0, 0, 0))
    for y in range(0, canvas.height - tile.height + 1, int(tile.height * 1.7)):
        for x in range(0, canvas.width - tile.width + 1, int(tile.width * 1.5)):
            canvas.alpha_composite(tile, (x, y))
    layer = canvas.crop((ox, oy, ox + w, oy + h))
    im = Image.alpha_composite(im, layer)

    # Sello con el logo arriba a la izquierda, sobre una placa oscura para que se lea en cualquier foto.
    badge = logo_at(max(110, w // 7), 0.85)
    m = max(6, badge.height // 4)
    plate = Image.new('RGBA', (badge.width + m * 2, badge.height + m * 2), (0, 0, 0, 0))
    ImageDraw.Draw(plate).rounded_rectangle([0, 0, plate.width - 1, plate.height - 1], radius=m, fill=(20, 20, 20, 90))
    plate.paste(badge, (m, m), badge)
    # Las portadas se recortan en la tarjeta (zoom y 5:4): se aleja el sello del borde para que no se pierda.
    edge = round(w * 0.15) if cover else max(12, w // 60)
    im.alpha_composite(plate, (edge, round(edge * 0.7) if cover else edge))
    return im.convert('RGB')


count = 0
for webp in sorted(glob.glob('public/properties/*/*.webp')):
    jpg = webp[:-5] + '.jpg'
    data = subprocess.run(['git', 'show', f'793123c:{jpg}'], capture_output=True).stdout
    if not data:
        print('sin original:', webp)
        continue
    stamp(Image.open(io.BytesIO(data)), cover=webp.endswith('cover-card.webp')).save(webp, 'WEBP', quality=92, method=6)
    count += 1
print(count, 'fotos con marca de agua')
