#!/usr/bin/env bash
# Cloudflare Pages build: คัดเฉพาะไฟล์ที่เว็บใช้ลงโฟลเดอร์ dist/ (อัปขึ้นเร็วขึ้น ไม่ timeout)
#   ตั้งค่าใน Cloudflare: Build command = bash scripts/cf-build.sh · Build output directory = dist
#   ไม่อัป: รูปต้นฉบับ 5000px ใน images/*.png (เว็บใช้ images/web + images/icons แทน), โค้ด Apps Script, README, scripts
set -euo pipefail
rm -rf dist && mkdir dist
tar --exclude=./dist --exclude=./.git --exclude=./.github --exclude=./scripts \
    --exclude=./Code.gs --exclude='./*.md' --exclude=./.assetsignore -cf - . | tar -xf - -C dist
# เก็บไว้เฉพาะ png ที่หน้าเว็บเรียกตรง ๆ
KEEP='^(logo|favicon|apple-touch-icon|promptpay)\.png$'
find dist/images -maxdepth 1 -type f -iname '*.png' | while read -r f; do
  [[ "$(basename "$f")" =~ $KEEP ]] || rm -f "$f"
done
echo "dist: $(find dist -type f | wc -l) files, $(du -sh dist | cut -f1)"
