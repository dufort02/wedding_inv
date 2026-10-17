#!/usr/bin/env python3
"""ย่อรูปชิ้นส่วนตัวละคร 5000px -> images/web/ (2048px) ให้เว็บโหลดเบาบนมือถือ
ใช้: python3 scripts/make_web_images.py   (ย่อเฉพาะไฟล์ที่ยังไม่มีสำเนา / ใหม่กว่าสำเนา)
ทุกครั้งที่อัปรูปชิ้นส่วนใหม่ใน images/ ต้องรันสคริปต์นี้ แล้ว commit images/web/ ด้วย"""
import glob, os
from PIL import Image
SIZE = 2048
os.makedirs('images/web', exist_ok=True)
n = 0
for f in sorted(glob.glob('images/*.png') + glob.glob('images/*.PNG')):
    out = 'images/web/' + os.path.splitext(os.path.basename(f))[0] + '.png'
    if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(f): continue
    im = Image.open(f)
    if im.size[0] < 3000: continue          # ไอคอน/โลโก้ ไม่ต้องย่อ
    im.convert('RGBA').resize((SIZE, SIZE), Image.LANCZOS).save(out, optimize=True); n += 1
print('resized', n, 'files')
