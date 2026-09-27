/**
 * Google Apps Script — รับ RSVP จากเว็บการ์ดแต่งงาน แล้วบันทึกลง Google Sheet
 * และส่งคำอวยพรกลับไปแสดงบน "สมุดอวยพร" หน้าเว็บ
 * วิธีติดตั้งดูใน README.md (หัวข้อ "เชื่อม RSVP กับ Google Sheet")
 */
const SHEET_NAME   = 'RSVP';
const SAVE_AVATAR  = true;                 // true = เก็บรูปตัวละครของแขกลง Google Drive และโชว์ในชีต
const FOLDER_NAME  = 'Wedding Guest Avatars';
const WALL_LIMIT   = 300;                  // จำนวนคำอวยพรล่าสุดที่ส่งไปหน้าเว็บ

const HEADERS = ['เวลา', 'ชื่อ', 'รูปแบบ', 'มาร่วมงาน', 'จำนวนคน', 'อาหาร', 'แพ้อาหาร/หมายเหตุ',
                 'คำอวยพร', 'แสดงบนเว็บ', 'สีการ์ด', 'ตัวละคร', 'ลิงก์รูป', 'ค่าตัวละคร (JSON)', 'mode'];
const PAPERS  = ['blush', 'cream', 'sky', 'sage', 'lilac'];
const MODES   = ['attend', 'gift', 'wish'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const p  = (e && e.parameter) || {};
    const sh = getSheet_();

    let imgFormula = '', link = '';
    if (SAVE_AVATAR && p.avatarPng) {
      try {
        const blob = Utilities.newBlob(Utilities.base64Decode(p.avatarPng), 'image/png',
                                       clean_(p.name || 'guest').slice(0, 40) + '_' + Date.now() + '.png');
        const file = getFolder_().createFile(blob);
        try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (err) {}
        link = file.getUrl();
        imgFormula = '=IMAGE("' + thumbUrl_(file.getId()) + '")';
      } catch (err) { link = 'save error: ' + err; }
    }

    const mode = MODES.indexOf(p.mode) >= 0 ? p.mode : 'attend';
    sh.appendRow([
      new Date(),
      clean_(p.name),
      clean_(p.modeLabel),
      clean_(p.attending),
      Number(p.guests) || 0,
      clean_(p.food),
      clean_(p.allergy),
      clean_(p.message),
      p.showOnWall === 'แสดง' ? 'แสดง' : 'ไม่แสดง',
      PAPERS.indexOf(p.paper) >= 0 ? p.paper : 'blush',
      imgFormula,
      link,
      clean_(p.avatarConfig),
      mode
    ]);
    if (imgFormula) sh.setRowHeight(sh.getLastRow(), 110);
    CacheService.getScriptCache().remove('wishes');

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// ?action=wishes → คำอวยพรที่ "แสดงบนเว็บ" (ซ่อนการ์ดไหน ให้แก้ช่องนั้นในชีตเป็น "ไม่แสดง")
// ไม่มี action → ใช้ทดสอบว่า deploy แล้ว
function doGet(e) {
  const action = e && e.parameter && e.parameter.action;
  if (action !== 'wishes') return json_({ ok: true, msg: 'RSVP endpoint is running' });

  const cache = CacheService.getScriptCache();
  const hit = cache.get('wishes');
  if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);

  const sh = getSheet_();
  const rows = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, HEADERS.length).getValues() : [];
  const col = name => HEADERS.indexOf(name);
  const wishes = rows
    .filter(r => String(r[col('คำอวยพร')]).trim() && r[col('แสดงบนเว็บ')] === 'แสดง')
    .reverse()
    .slice(0, WALL_LIMIT)
    .map(r => {
      const id = (String(r[col('ลิงก์รูป')]).match(/\/d\/([\w-]+)/) || [])[1];
      return {
        name:    unclean_(r[col('ชื่อ')]),
        message: unclean_(r[col('คำอวยพร')]),
        mode:    r[col('mode')] || 'wish',
        paper:   r[col('สีการ์ด')] || 'blush',
        avatar:  id ? thumbUrl_(id) : '',
        ts:      r[col('เวลา')] instanceof Date ? r[col('เวลา')].getTime() : 0
      };
    });
  const out = JSON.stringify({ ok: true, wishes: wishes });
  if (out.length < 90000) cache.put('wishes', out, 60);
  return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.setColumnWidth(HEADERS.indexOf('ตัวละคร') + 1, 120);
    sh.setColumnWidth(HEADERS.indexOf('คำอวยพร') + 1, 280);
    const show = sh.getRange(2, HEADERS.indexOf('แสดงบนเว็บ') + 1, sh.getMaxRows() - 1, 1);
    show.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['แสดง', 'ไม่แสดง'], true).build());
  }
  return sh;
}

function getFolder_() {
  const it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}

function thumbUrl_(id) { return 'https://drive.google.com/thumbnail?id=' + id + '&sz=w200'; }

// กันแขกพิมพ์ข้อความที่ขึ้นต้นด้วย = + - @ แล้วชีตตีความเป็นสูตร
function clean_(v) {
  v = String(v == null ? '' : v).slice(0, 2000);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}
function unclean_(v) { return String(v == null ? '' : v); }

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
