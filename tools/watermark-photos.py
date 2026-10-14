"""Estampa la marca de agua de la inmobiliaria en las fotos de public/properties.

Parte de los .jpg originales que están en git (HEAD), así que se puede volver a correr sin apilar marcas.
Uso: python3 tools/watermark-photos.py   (desde la raíz del proyecto)
"""
import glob
import io
import subprocess

from PIL import Image, ImageDraw, ImageFont

FONT = '/System/Library/Fonts/Helvetica.ttc'
TEXT = 'MARIANA ECHEVERRÍA · BIENES RAÍCES'


def stamp(im: Image.Image) -> Image.Image:
    im = im.convert('RGBA')
    w, h = im.size

    # Texto en diagonal repetido, tenue: dificulta recortar la marca.
    size = max(14, w // 42)
    font = ImageFont.truetype(FONT, size, index=1)
    tw = int(font.getlength(TEXT)) + size * 2
    tile = Image.new('RGBA', (tw, size * 3), (0, 0, 0, 0))
    ImageDraw.Draw(tile).text((size, size), TEXT, font=font, fill=(255, 255, 255, 120))
    tile = tile.rotate(28, expand=True, resample=Image.BICUBIC)
    layer = Image.new('RGBA', im.size, (0, 0, 0, 0))
    for y in range(-tile.height, h + tile.height, int(tile.height * 1.1)):
        for x in range(-tile.width, w + tile.width, tile.width):
            layer.paste(tile, (x, y), tile)
    im = Image.alpha_composite(im, layer)

    # Sello visible abajo a la derecha.
    big = ImageFont.truetype(FONT, max(18, w // 30), index=1)
    pad = big.size // 2
    bw = int(big.getlength(TEXT))
    x0, y0 = w - bw - pad * 3, h - big.size - pad * 3
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([x0, y0, w - pad, h - pad], radius=pad // 2, fill=(0, 0, 0, 115))
    d.text((x0 + pad, y0 + pad // 2 + 2), TEXT, font=big, fill=(255, 255, 255, 235))
    return im.convert('RGB')


count = 0
for webp in sorted(glob.glob('public/properties/*/*.webp')):
    jpg = webp[:-5] + '.jpg'
    data = subprocess.run(['git', 'show', f'HEAD:{jpg}'], capture_output=True).stdout
    if not data:
        print('sin original:', webp)
        continue
    stamp(Image.open(io.BytesIO(data))).save(webp, 'WEBP', quality=82, method=6)
    count += 1
print(count, 'fotos con marca de agua')
