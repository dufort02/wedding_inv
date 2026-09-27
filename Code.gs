/**
 * Google Apps Script — รับ RSVP จากเว็บการ์ดแต่งงาน แล้วบันทึกลง Google Sheet
 * วิธีติดตั้งดูใน README.md (หัวข้อ "เชื่อม RSVP กับ Google Sheet")
 */
const SHEET_NAME   = 'RSVP';
const SAVE_AVATAR  = true;                 // true = เก็บรูปตัวละครของแขกลง Google Drive และโชว์ในชีต
const FOLDER_NAME  = 'Wedding Guest Avatars';

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
        imgFormula = '=IMAGE("https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w200")';
      } catch (err) { link = 'save error: ' + err; }
    }

    sh.appendRow([
      new Date(),
      clean_(p.name),
      clean_(p.attending),
      Number(p.guests) || 1,
      clean_(p.message),
      imgFormula,
      link,
      clean_(p.avatarConfig)
    ]);
    if (imgFormula) sh.setRowHeight(sh.getLastRow(), 110);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// เปิด URL /exec ในเบราว์เซอร์เพื่อทดสอบว่า deploy แล้ว
function doGet() { return json_({ ok: true, msg: 'RSVP endpoint is running' }); }

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['เวลา', 'ชื่อ', 'มาร่วมงาน', 'จำนวนคน', 'ข้อความ', 'ตัวละคร', 'ลิงก์รูป', 'ค่าตัวละคร (JSON)']);
    sh.setFrozenRows(1);
    sh.setColumnWidth(6, 120);
  }
  return sh;
}

function getFolder_() {
  const it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}

// กันแขกพิมพ์ข้อความที่ขึ้นต้นด้วย = + - @ แล้วชีตตีความเป็นสูตร
function clean_(v) {
  v = String(v == null ? '' : v).slice(0, 2000);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
