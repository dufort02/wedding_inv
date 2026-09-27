/**
 * Google Apps Script — รับ RSVP จากเว็บการ์ดแต่งงาน แล้วบันทึกลง Google Sheet
 * และส่งคำอวยพรกลับไปแสดงบน "สมุดอวยพร" หน้าเว็บ / หน้าสไลด์โชว์ (wishes.html)
 * วิธีติดตั้งและการจัดการดูใน README.md
 *
 * หลังวางโค้ดเวอร์ชันนี้: เลือกฟังก์ชัน setup แล้วกด ▶ เรียกใช้ 1 ครั้ง (อนุญาตสิทธิ์อีเมล)
 * แล้ว ทำให้ใช้งานได้ → จัดการ → แก้ไข → เวอร์ชันใหม่
 */
const SHEET_NAME       = 'RSVP';
const SUMMARY_NAME     = 'สรุป';
const SAVE_AVATAR      = true;             // true = เก็บรูปตัวละครของแขกลง Google Drive และโชว์ในชีต
const FOLDER_NAME      = 'Wedding Guest Avatars';
const WALL_LIMIT       = 300;              // จำนวนคำอวยพรล่าสุดที่ส่งไปหน้าเว็บ

// 1) โหมดอนุมัติ: true = คำอวยพรใหม่เป็น "รออนุมัติ" จนกว่าแอดมินเปลี่ยนเป็น "แสดง"
//    (ต้องตั้ง WISH_APPROVAL ใน index.html ให้ตรงกัน)
const REQUIRE_APPROVAL = true;
// 3) แจ้งเตือนทางอีเมล: 'me' = อีเมลเจ้าของสคริปต์ | '' = ปิด | หรือใส่อีเมล (หลายคนคั่นด้วย ,)
const NOTIFY_EMAIL     = 'me';

const S_SHOW = 'แสดง', S_HIDE = 'ไม่แสดง', S_PENDING = 'รออนุมัติ';
const HEADERS = ['เวลา', 'ชื่อ', 'รูปแบบ', 'มาร่วมงาน', 'จำนวนคน', 'อาหาร', 'แพ้อาหาร/หมายเหตุ',
                 'คำอวยพร', 'แสดงบนเว็บ', 'สีการ์ด', 'ตัวละคร', 'ลิงก์รูป', 'ค่าตัวละคร (JSON)', 'mode', 'ปักหมุด'];
const PAPERS  = ['blush', 'cream', 'sky', 'sage', 'lilac'];
const MODES   = ['attend', 'gift', 'wish'];
const FOODS   = ['ทานได้ทุกอย่าง', 'มังสวิรัติ/เจ', 'ฮาลาล'];

/* ============================ รับคำตอบจากเว็บ ============================ */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  let p, status, mode;
  try {
    p = (e && e.parameter) || {};
    const sh = getSheet_(), c = cols_(sh);

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

    mode   = MODES.indexOf(p.mode) >= 0 ? p.mode : 'attend';
    status = p.showOnWall === S_SHOW && String(p.message || '').trim() ? (REQUIRE_APPROVAL ? S_PENDING : S_SHOW) : S_HIDE;
    const v = {
      'เวลา': new Date(), 'ชื่อ': clean_(p.name), 'รูปแบบ': clean_(p.modeLabel), 'มาร่วมงาน': clean_(p.attending),
      'จำนวนคน': Number(p.guests) || 0, 'อาหาร': clean_(p.food), 'แพ้อาหาร/หมายเหตุ': clean_(p.allergy),
      'คำอวยพร': clean_(p.message), 'แสดงบนเว็บ': status, 'สีการ์ด': PAPERS.indexOf(p.paper) >= 0 ? p.paper : 'blush',
      'ตัวละคร': imgFormula, 'ลิงก์รูป': link, 'ค่าตัวละคร (JSON)': clean_(p.avatarConfig), 'mode': mode, 'ปักหมุด': false
    };
    const row = new Array(sh.getLastColumn()).fill('');
    Object.keys(v).forEach(k => { if (c[k]) row[c[k] - 1] = v[k]; });
    sh.appendRow(row);
    const r = sh.getLastRow();
    sh.getRange(r, c['ปักหมุด']).insertCheckboxes();
    sh.getRange(r, c['แสดงบนเว็บ']).setDataValidation(statusRule_());
    if (imgFormula) sh.setRowHeight(r, 110);
    clearCache_();
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
  notify_(p, mode, status);
  return json_({ ok: true, status: status });
}

/* ================= ส่งคำอวยพรให้หน้าเว็บ (?action=wishes) ================= */
// แสดงเฉพาะแถวที่ "แสดงบนเว็บ" = แสดง  เรียง: ปักหมุดก่อน แล้วใหม่ → เก่า
function doGet(e) {
  const action = e && e.parameter && e.parameter.action;
  if (action !== 'wishes') return json_({ ok: true, msg: 'RSVP endpoint is running' });

  const cache = CacheService.getScriptCache();
  const hit = cache.get('wishes');
  if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);

  const sh = getSheet_(), c = cols_(sh);
  const rows = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues() : [];
  const get = (r, k) => (c[k] ? r[c[k] - 1] : '');
  const wishes = rows
    .filter(r => String(get(r, 'คำอวยพร')).trim() && get(r, 'แสดงบนเว็บ') === S_SHOW)
    .map((r, i) => {
      const id = (String(get(r, 'ลิงก์รูป')).match(/\/d\/([\w-]+)/) || [])[1];
      const t = get(r, 'เวลา');
      return {
        name:    String(get(r, 'ชื่อ')),
        message: String(get(r, 'คำอวยพร')),
        mode:    get(r, 'mode') || 'wish',
        paper:   get(r, 'สีการ์ด') || 'blush',
        avatar:  id ? thumbUrl_(id) : '',
        pinned:  get(r, 'ปักหมุด') === true,
        ts:      t instanceof Date ? t.getTime() : i
      };
    })
    .sort((a, b) => (b.pinned - a.pinned) || (b.ts - a.ts))
    .slice(0, WALL_LIMIT);
  const out = JSON.stringify({ ok: true, wishes: wishes });
  if (out.length < 90000) cache.put('wishes', out, 60);
  return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
}

/* ============================ เมนูแอดมินในชีต ============================ */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('💌 งานแต่ง')
    .addItem('✅ แสดงแถวที่เลือกบนเว็บ (อนุมัติ)', 'approveSelected')
    .addItem('🚫 ซ่อนแถวที่เลือก', 'hideSelected')
    .addItem('📌 ปักหมุด / เลิกปักหมุด แถวที่เลือก', 'togglePinSelected')
    .addSeparator()
    .addItem('🔧 ตั้งค่าชีต + สร้างชีตสรุปใหม่', 'setup')
    .addItem('✉️ ทดสอบอีเมลแจ้งเตือน', 'testEmail')
    .addToUi();
}
// แก้อะไรในชีต → ล้าง cache ให้หน้าเว็บเห็นทันที
function onEdit() { clearCache_(); }

function approveSelected()   { setSelected_('แสดงบนเว็บ', () => S_SHOW); }
function hideSelected()      { setSelected_('แสดงบนเว็บ', () => S_HIDE); }
function togglePinSelected() { setSelected_('ปักหมุด', v => v !== true); }

function setSelected_(key, fn) {
  const ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getActiveSheet();
  if (sh.getName() !== SHEET_NAME) { ss.toast('เลือกแถวในชีต "' + SHEET_NAME + '" ก่อน'); return; }
  const col = cols_(sh)[key];
  let n = 0;
  (sh.getActiveRangeList() ? sh.getActiveRangeList().getRanges() : []).forEach(rg => {
    for (let r = Math.max(2, rg.getRow()); r <= rg.getLastRow(); r++) {
      const cell = sh.getRange(r, col); cell.setValue(fn(cell.getValue())); n++;
    }
  });
  clearCache_();
  ss.toast('อัปเดตแล้ว ' + n + ' แถว');
}

// รันครั้งแรกหลังอัปเดตโค้ด (หรือกดจากเมนู): เพิ่มคอลัมน์ที่ขาด, dropdown, สี, ช่องติ๊ก, ชีตสรุป
function setup() {
  const sh = getSheet_(), c = cols_(sh), n = Math.max(1, sh.getMaxRows() - 1);
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, sh.getLastColumn()).setFontWeight('bold');
  sh.setColumnWidth(c['คำอวยพร'], 280);
  sh.setColumnWidth(c['ตัวละคร'], 120);

  const status = sh.getRange(2, c['แสดงบนเว็บ'], n, 1);
  status.setDataValidation(statusRule_());
  // ช่องติ๊กใส่เฉพาะแถวที่มีข้อมูล (ค่า false นับเป็นข้อมูล — ถ้าใส่ทั้งคอลัมน์ แถวใหม่จะไปต่อท้ายแถว 1000)
  if (sh.getLastRow() > 1) {
    const pin = sh.getRange(2, c['ปักหมุด'], sh.getLastRow() - 1, 1);
    const pinVals = pin.getValues().map(r => [r[0] === true]);
    pin.insertCheckboxes(); pin.setValues(pinVals);
  }

  sh.setConditionalFormatRules(sh.getConditionalFormatRules()
    .filter(r => !r.getRanges().some(g => g.getColumn() === c['แสดงบนเว็บ']))
    .concat([
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(S_PENDING).setBackground('#FFF2CC').setFontColor('#9C6500').setRanges([status]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(S_SHOW).setBackground('#E2F0D9').setFontColor('#38761D').setRanges([status]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(S_HIDE).setFontColor('#999999').setRanges([status]).build()
    ]));

  buildSummary_(sh, c);
  clearCache_();
  // เรียก Session/MailApp เพื่อให้ขออนุญาตสิทธิ์อีเมลตอนกดรันครั้งแรก
  if (NOTIFY_EMAIL) MailApp.getRemainingDailyQuota();
  SpreadsheetApp.getActiveSpreadsheet().toast('ตั้งค่าเรียบร้อย');
}

function testEmail() {
  notify_({ name: 'ทดสอบ', guests: 2, food: 'ทานได้ทุกอย่าง', message: 'นี่คืออีเมลทดสอบการแจ้งเตือน', modeLabel: 'มาร่วมงาน' }, 'attend', S_PENDING);
  SpreadsheetApp.getActiveSpreadsheet().toast('ส่งอีเมลทดสอบไปที่ ' + (recipient_() || '(ปิดอยู่)'));
}

/* ============================ ชีตสรุป (สูตรอัปเดตเอง) ============================ */
function buildSummary_(sh, c) {
  const ss = sh.getParent();
  let s = ss.getSheetByName(SUMMARY_NAME);
  if (s) s.clear(); else s = ss.insertSheet(SUMMARY_NAME, 0);
  const R = k => "'" + SHEET_NAME + "'!" + colA1_(sh, c[k]) + '2:' + colA1_(sh, c[k]);
  const mode = R('mode'), guests = R('จำนวนคน'), food = R('อาหาร'), name = R('ชื่อ'),
        allergy = R('แพ้อาหาร/หมายเหตุ'), status = R('แสดงบนเว็บ');

  const rows = [
    ['สรุปงานแต่ง (อัปเดตอัตโนมัติ)', ''],
    ['', ''],
    ['แขกที่มาร่วมงานทั้งหมด (คน)', '=SUMIFS(' + guests + ',' + mode + ',"attend")'],
    ['จำนวนการตอบรับมาร่วมงาน (ครั้ง)', '=COUNTIF(' + mode + ',"attend")'],
    ['ร่วมอวยพรผ่านของขวัญ (คน)', '=COUNTIF(' + mode + ',"gift")'],
    ['อวยพรออนไลน์ (คน)', '=COUNTIF(' + mode + ',"wish")'],
    ['คำอวยพรรออนุมัติ', '=COUNTIF(' + status + ',"' + S_PENDING + '")'],
    ['คำอวยพรที่แสดงบนเว็บ', '=COUNTIF(' + status + ',"' + S_SHOW + '")'],
    ['', ''],
    ['อาหาร (จำนวนคน)', '']
  ].concat(FOODS.map(f => ['   ' + f, '=SUMIFS(' + guests + ',' + mode + ',"attend",' + food + ',"' + f + '")']));
  s.getRange(1, 1, rows.length, 2).setValues(rows);

  s.getRange('D1').setValue('แพ้อาหาร / หมายเหตุ');
  s.getRange('D2:F2').setValues([['ชื่อ', 'จำนวนคน', 'แพ้อาหาร/หมายเหตุ']]);
  s.getRange('D3').setFormula('=IFERROR(FILTER({' + name + ',' + guests + ',' + allergy + '},' + mode + '="attend",' + allergy + '<>""),"— ไม่มี —")');

  s.getRange('H1').setValue('ชื่อที่ตอบมาร่วมงานซ้ำ (อาจนับคนเกิน)');
  s.getRange('H3').setFormula('=IFERROR(UNIQUE(FILTER(' + name + ',' + mode + '="attend",COUNTIFS(' + name + ',' + name + ',' + mode + ',"attend")>1)),"— ไม่มี —")');

  s.getRange('A1').setFontSize(14).setFontWeight('bold');
  s.getRangeList(['A10', 'D1', 'H1', 'D2:F2']).setFontWeight('bold');
  s.getRange('B3:B13').setFontWeight('bold').setHorizontalAlignment('center');
  s.setColumnWidth(1, 240); s.setColumnWidth(4, 160); s.setColumnWidth(6, 220); s.setColumnWidth(8, 220);
  s.setFrozenRows(2);
}

/* ============================ แจ้งเตือนทางอีเมล ============================ */
function notify_(p, mode, status) {
  const to = recipient_();
  if (!to || !p) return;
  try {
    const name = String(p.name || '').slice(0, 60);
    const subject = {
      attend: '[RSVP] ' + name + ' มาร่วมงาน ' + (Number(p.guests) || 1) + ' คน',
      gift:   '[RSVP] ' + name + ' ร่วมอวยพรผ่านของขวัญ',
      wish:   '[คำอวยพร] ' + name
    }[mode] + (status === S_PENDING ? ' • รออนุมัติ' : '');
    const lines = ['ชื่อ: ' + name, 'รูปแบบ: ' + (p.modeLabel || mode)];
    if (mode === 'attend') lines.push('จำนวนคน: ' + (p.guests || 1), 'อาหาร: ' + (p.food || '-'), 'แพ้อาหาร/หมายเหตุ: ' + (p.allergy || '-'));
    if (p.message) lines.push('', 'คำอวยพร:', String(p.message).slice(0, 1000));
    if (status === S_PENDING) lines.push('', 'คำอวยพรนี้ "รออนุมัติ" — เปลี่ยนเป็น "แสดง" ในชีต หรือใช้เมนู 💌 งานแต่ง');
    lines.push('', 'เปิดชีต: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl());
    MailApp.sendEmail({ to: to, subject: subject, body: lines.join('\n'), name: 'Wedding RSVP' });
  } catch (err) { console.warn('notify failed: ' + err); }
}
function recipient_() {
  if (!NOTIFY_EMAIL) return '';
  return NOTIFY_EMAIL === 'me' ? Session.getEffectiveUser().getEmail() : NOTIFY_EMAIL;
}

/* ============================ helpers ============================ */
function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(2, HEADERS.indexOf('แสดงบนเว็บ') + 1, sh.getMaxRows() - 1, 1).setDataValidation(statusRule_());
  }
  return sh;
}

// ตำแหน่งคอลัมน์ตามหัวตารางจริง (ย้ายคอลัมน์ได้) — เพิ่มหัวที่ยังไม่มีต่อท้าย
function cols_(sh) {
  const head = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0].map(String);
  const missing = HEADERS.filter(h => head.indexOf(h) < 0);
  if (missing.length) {
    sh.getRange(1, head.length + 1, 1, missing.length).setValues([missing]);
    head.push.apply(head, missing);
  }
  const map = {};
  head.forEach((h, i) => { if (h) map[h] = i + 1; });
  return map;
}

function statusRule_() {
  return SpreadsheetApp.newDataValidation().requireValueInList([S_SHOW, S_PENDING, S_HIDE], true).build();
}
function colA1_(sh, col) { return sh.getRange(1, col).getA1Notation().replace(/\d+/, ''); }
function clearCache_() { CacheService.getScriptCache().remove('wishes'); }

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

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
