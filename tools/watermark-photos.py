"""Estampa la marca de agua de la inmobiliaria en las fotos de public/properties.

Parte de los .jpg originales que están en git (commit 793123c, antes de pasar a WebP), así que se puede volver a correr sin apilar marcas.
Uso: python3 tools/watermark-photos.py   (desde la raíz del proyecto)
"""
import glob
import io
import subprocess

from PIL import Image, ImageDraw

LOGO = Image.open('public/about/logo-nav.png').convert('RGBA')
LOGO = LOGO.crop(LOGO.getbbox())


def logo_at(width: int, opacity: float = 1.0) -> Image.Image:
    h = round(LOGO.height * width / LOGO.width)
    out = LOGO.resize((width, h), Image.LANCZOS)
    if opacity < 1:
        a = out.getchannel('A').point(lambda v: int(v * opacity))
        out.putalpha(a)
    return out


def stamp(im: Image.Image) -> Image.Image:
    im = im.convert('RGBA')
    w, h = im.size

    # Logo repetido en diagonal, tenue: dificulta recortar la marca.
    tile_logo = logo_at(max(120, w // 5), 0.5)
    pad = tile_logo.width // 3
    tile = Image.new('RGBA', (tile_logo.width + pad, tile_logo.height + pad), (0, 0, 0, 0))
    tile.paste(tile_logo, (pad // 2, pad // 2), tile_logo)
    tile = tile.rotate(25, expand=True, resample=Image.BICUBIC)
    ox, oy = tile.width, tile.height
    canvas = Image.new('RGBA', (w + 2 * ox, h + 2 * oy), (0, 0, 0, 0))
    for y in range(0, canvas.height - tile.height + 1, int(tile.height * 0.9)):
        for x in range(0, canvas.width - tile.width + 1, int(tile.width * 0.9)):
            canvas.alpha_composite(tile, (x, y))
    layer = canvas.crop((ox, oy, ox + w, oy + h))
    im = Image.alpha_composite(im, layer)

    # Sello con el logo abajo a la derecha, sobre una placa oscura para que se lea en cualquier foto.
    badge = logo_at(max(160, w // 4))
    m = max(10, badge.height // 3)
    plate = Image.new('RGBA', (badge.width + m * 2, badge.height + m * 2), (0, 0, 0, 0))
    ImageDraw.Draw(plate).rounded_rectangle([0, 0, plate.width - 1, plate.height - 1], radius=m, fill=(20, 20, 20, 150))
    plate.paste(badge, (m, m), badge)
    edge = max(12, w // 60)
    im.alpha_composite(plate, (w - plate.width - edge, h - plate.height - edge))
    return im.convert('RGB')


count = 0
for webp in sorted(glob.glob('public/properties/*/*.webp')):
    jpg = webp[:-5] + '.jpg'
    data = subprocess.run(['git', 'show', f'793123c:{jpg}'], capture_output=True).stdout
    if not data:
        print('sin original:', webp)
        continue
    stamp(Image.open(io.BytesIO(data))).save(webp, 'WEBP', quality=82, method=6)
    count += 1
print(count, 'fotos con marca de agua')
