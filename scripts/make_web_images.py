#!/usr/bin/env python3
"""ย่อรูปชิ้นส่วนตัวละคร 5000px -> images/web/ (2048px) ให้เว็บโหลดเบาบนมือถือ
ใช้:
  python3 scripts/make_web_images.py                 ย่อเฉพาะไฟล์ที่ยังไม่มีสำเนา + ลบสำเนาของไฟล์ที่ถูกลบแล้ว
  python3 scripts/make_web_images.py images/a.png    บังคับย่อไฟล์ที่ระบุใหม่ (ใช้ตอนอัปไฟล์ทับชื่อเดิม)
GitHub Actions (.github/workflows/web-images.yml) รันให้อัตโนมัติทุกครั้งที่อัปรูปใน images/ เข้า main"""
import glob, os, sys
from PIL import Image
SIZE = 2048
os.makedirs('images/web', exist_ok=True)
def web_path(f): return 'images/web/' + os.path.splitext(os.path.basename(f))[0] + '.png'
def lower_stem(f): return os.path.splitext(os.path.basename(f))[0].lower()
originals = sorted(glob.glob('images/*.png') + glob.glob('images/*.PNG'))
forced = {os.path.normpath(a) for a in sys.argv[1:]}
n = 0
for f in originals:
    out = web_path(f)
    if os.path.exists(out) and os.path.normpath(f) not in forced: continue
    im = Image.open(f)
    if im.size[0] < 3000: continue          # ไอคอน/โลโก้ ไม่ต้องย่อ
    im.convert('RGBA').resize((SIZE, SIZE), Image.LANCZOS).save(out, optimize=True); n += 1
keep = {lower_stem(f) for f in originals}
gone = 0
for w in glob.glob('images/web/*.png'):
    if lower_stem(w) not in keep: os.remove(w); gone += 1
print('resized', n, 'files, removed', gone, 'orphans')
