# Converte as capturas (shots/*.png) em JPEG recortado (img/*.jpg), usado pelo build.js.
import glob, os
import numpy as np
from PIL import Image

here = os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(here, 'img'), exist_ok=True)
for f in glob.glob(os.path.join(here, 'shots', '*.png')):
    n = os.path.basename(f)[:-4]
    im = Image.open(f).convert('RGB')
    if n.startswith('stage') or n.startswith('meet'):
        w, h = im.size
        im = im.crop((4, 4, w - 4, h - 4))
    if n.startswith('plan'):
        a = np.asarray(im).astype(int).sum(2)
        w, h = im.size
        ys, xs = np.where(a > 140)  # caixa dos pixels claros (a planta) com folga
        x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
        pad = 40
        im = im.crop((max(0, x0 - pad), max(0, y0 - pad), min(w, x1 + pad), min(h, y1 + pad)))
    im.save(os.path.join(here, 'img', f'{n}.jpg'), quality=88)
    print(n, im.size)
