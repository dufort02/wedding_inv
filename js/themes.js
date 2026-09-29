/* ธีมของการ์ด — โหลดใน <head> ของ index.html และ wishes.html
   ธีม 1 = แบบเดิม (ฐาน)  |  ธีม 2 = Journey (ลายเส้นแผนที่/ป้ายทาง)  |  ธีม 3 = Premiere (โรงหนัง)
   ทุกธีมใช้ฟอนต์ การจัดวาง และพื้นหลังเดิม — เปลี่ยนแค่ของตกแต่ง + เส้นขอบแบบคอมิก (css/themes.css)

   ตั้งค่าที่แท็ก <html>:
     data-theme="1|2|3"     ธีมที่ใช้จริง
     data-theme-switch="on" แสดงปุ่มสลับธีม (ไว้ทดสอบ — ใช้จริงลบออก)
   ลิงก์ทดสอบ: index.html?theme=2  (จำค่าไว้ในเครื่องจนกว่าจะเปลี่ยน)                                  */
(function(){
  var root=document.documentElement, KEY='wedding_theme';
  var fromUrl=(location.search.match(/[?&]theme=([123])/)||[])[1];
  var saved=null; try{ saved=localStorage.getItem(KEY); }catch(e){}
  var switchOn = root.getAttribute('data-theme-switch')==='on' || !!fromUrl;
  var theme = fromUrl || (switchOn && saved) || root.getAttribute('data-theme') || '1';
  if(fromUrl){ try{ localStorage.setItem(KEY,fromUrl); }catch(e){} }
  root.setAttribute('data-theme',theme);

  var INK2='#3b2b25', INK3='#2B2A27', PINK='#B8312F', TEAL='#16968A', YEL='#F2C46D', PUR='#EE6B53', GOLDD='#B8862E';   // ธีม 3: ดำฟิล์ม / แดงป้ายไฟ / เขียวเครื่องฉาย / ทองตั๋ว / โคอรัล

  /* ---------------- ลายเส้น (SVG symbols) ---------------- */
  var SPRITE='<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true">'+
  // ===== ธีม 2: Journey (เส้นหมึก วาดมือ) =====
  '<symbol id="t2-pin" viewBox="0 0 40 54"><g stroke="'+INK2+'" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">'+
    '<path d="M20 50C20 50 5 32 5 20 5 11 11.5 4 20 4s15 7 15 16c0 12-15 30-15 30z" fill="#fff"/><circle cx="20" cy="20" r="5.5" fill="none"/></g></symbol>'+
  '<symbol id="t2-compass" viewBox="0 0 80 94"><g fill="none" stroke="'+INK2+'" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">'+
    '<circle cx="40" cy="9" r="5"/><path d="M36 14h8v5h-8z"/><circle cx="40" cy="54" r="35" fill="#fff"/><circle cx="40" cy="54" r="28"/>'+
    '<path d="M40 30 45.5 54 40 78 34.5 54z" fill="#fff"/><path d="M40 30 45.5 54H34.5z" fill="'+INK2+'"/><path d="M17 54 40 49.5 63 54 40 58.5z" stroke-width="1.8"/>'+
    '<path d="M40 22v4M40 82v4M8 54h4M68 54h4M17.5 31.5l2.5 2.5M60 74l2.5 2.5M62.5 31.5 60 34M20 74l-2.5 2.5" stroke-width="2"/><circle cx="40" cy="54" r="2.6" fill="'+INK2+'"/></g></symbol>'+
  '<symbol id="t2-sign" viewBox="0 0 124 132"><g stroke="'+INK2+'" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">'+
    '<path d="M55 12c0 40 1 80-1 118M63 12c1 40 0 80 1 118" fill="none"/><path d="M55 12c3-2 6-2 8 0" fill="none"/>'+
    '<path d="M12 22 97 18l15 12-14 14-86 2c2-8 1-16 0-24z" fill="#fff"/><path d="M22 30c18-3 34 3 54-1M26 37c14 2 30-2 50 1M84 27c4 1 6 4 4 7" fill="none" stroke-width="1.8"/>'+
    '<path d="M110 60 28 58 12 71l16 13 82-1c-2-8-1-15 0-23z" fill="#fff"/><path d="M36 67c18-2 36 3 62-1M32 75c20 2 40-2 64 1M92 64c-4 2-4 5 0 8" fill="none" stroke-width="1.8"/></g></symbol>'+
  '<symbol id="t2-map" viewBox="0 0 142 102"><g stroke="'+INK2+'" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">'+
    '<path d="M8 22 48 8 94 22 134 10v70L94 94 48 80 8 92z" fill="#fff"/><path d="M48 8v72M94 22v72" fill="none" stroke-width="2"/>'+
    '<path d="M20 70C36 52 56 64 68 46s32-12 48-6" fill="none" stroke-width="2" stroke-dasharray="4 5"/>'+
    '<path d="M60 22c6-4 14 2 10 8s-12 4-10-8zM104 56c8-2 14 6 8 10s-12-2-8-10z" fill="none" stroke-width="1.6"/>'+
    '<path d="M112 34l7 7M119 34l-7 7" fill="none"/><circle cx="20" cy="70" r="3.4" fill="'+INK2+'"/></g></symbol>'+
  '<symbol id="t2-phone" viewBox="0 0 64 104"><g stroke="'+INK2+'" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">'+
    '<rect x="6" y="4" width="52" height="96" rx="8" fill="#fff"/><rect x="12" y="16" width="40" height="70" rx="2" fill="none" stroke-width="1.8"/>'+
    '<path d="M26 9h12M28 93h8" fill="none"/><path d="M16 78c8-12 18-6 22-18s8-18 12-22" fill="none" stroke-width="1.8" stroke-dasharray="3 4"/>'+
    '<path d="M42 38c0 0-6-7-6-11 0-3.5 2.7-6 6-6s6 2.5 6 6c0 4-6 11-6 11z" fill="#fff" stroke-width="1.8"/></g></symbol>'+
  '<symbol id="t2-stump" viewBox="0 0 90 80"><g fill="none" stroke="'+INK2+'" stroke-width="2.4" stroke-linecap="round">'+
    '<path d="M10 38C8 18 30 6 50 8s34 14 30 34-26 32-46 30S12 58 10 38z" fill="#fff"/><path d="M60 12l-8 16 14-8"/>'+
    '<path d="M22 38c0-12 12-20 24-18s20 10 18 22-14 18-26 16-16-10-16-20z"/><path d="M33 39c0-6 6-10 12-9s10 5 9 11-7 9-13 8-8-5-8-10z"/><circle cx="44" cy="40" r="2.2"/></g></symbol>'+
  '<symbol id="t2-trail" viewBox="0 0 400 46"><g fill="none" stroke="'+INK2+'" stroke-linecap="round" stroke-linejoin="round">'+
    '<path d="M30 34C80 12 118 42 168 24S258 8 300 28s56 8 70-6" stroke-width="2.4" stroke-dasharray="7 8"/>'+
    '<path d="M18 40S7 28 7 20a11 11 0 0 1 22 0c0 8-11 20-11 20z" fill="#fff" stroke-width="2.4"/><circle cx="18" cy="20" r="3.6" stroke-width="2"/>'+
    '<path d="M378 30s-9-10-9-16a9 9 0 0 1 18 0c0 6-9 16-9 16z" fill="#fff" stroke-width="2.4"/><circle cx="378" cy="14" r="3" stroke-width="2"/></g></symbol>'+
  // ===== ธีม 3: Premiere (สีสด ขอบกรมท่า) =====
  '<symbol id="t3-star" viewBox="0 0 24 24"><path d="M12 1.5l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.6l-6.4 3.5L7 14 1.7 9l7.2-.9z" fill="currentColor"/></symbol>'+
  '<symbol id="t3-chev" viewBox="0 0 60 24"><path d="M2 2l16 10L2 22zM21 2l16 10-16 10zM40 2l16 10-16 10z" fill="currentColor"/></symbol>'+
  '<symbol id="t3-clapper" viewBox="0 0 100 92"><g stroke="'+INK3+'" stroke-width="2" stroke-linejoin="round">'+
    '<rect x="8" y="38" width="84" height="50" rx="5" fill="'+INK3+'"/><rect x="18" y="58" width="64" height="12" rx="3" fill="#fff" stroke="none"/>'+
    '<rect x="8" y="38" width="84" height="12" fill="'+INK3+'"/><path d="M16 38h10l-8 12H8zM36 38h10l-8 12H28zM56 38h10l-8 12H48zM76 38h10l-8 12H68z" fill="#fff" stroke="none"/>'+
    '<g transform="rotate(-14 8 36)"><rect x="8" y="22" width="84" height="13" rx="2" fill="'+INK3+'"/><path d="M20 22h10l-7 13H13zM40 22h10l-7 13H33zM60 22h10l-7 13H53zM80 22h10l-7 13H73z" fill="#fff" stroke="none"/></g></g></symbol>'+
  '<symbol id="t3-popcorn" viewBox="0 0 80 104"><g stroke="'+INK3+'" stroke-width="2.2" stroke-linejoin="round">'+
    '<circle cx="24" cy="30" r="10" fill="'+YEL+'"/><circle cx="40" cy="22" r="11" fill="'+YEL+'"/><circle cx="56" cy="30" r="10" fill="'+YEL+'"/><circle cx="33" cy="36" r="9" fill="'+YEL+'"/><circle cx="49" cy="37" r="9" fill="'+YEL+'"/>'+
    '<path d="M12 42h56l-9 58H21z" fill="#fff"/><path d="M22 42l6 58h7l-3-58zM44 42l1 58h7l3-58z" fill="'+PINK+'" stroke="none"/><path d="M12 42h56l-9 58H21z" fill="none"/></g></symbol>'+
  '<symbol id="t3-ticket" viewBox="0 0 124 70"><path d="M8 8h108v18a9 9 0 0 0 0 18v18H8V44a9 9 0 0 0 0-18z" fill="'+PINK+'" stroke="'+INK3+'" stroke-width="2.4" stroke-linejoin="round"/>'+
    '<rect x="17" y="16" width="90" height="38" rx="3" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="4 3"/>'+
    '<text x="62" y="42" text-anchor="middle" font-family="Fredoka,Mali,sans-serif" font-weight="700" font-size="19" fill="#fff" letter-spacing="1">TICKET</text></symbol>'+
  '<symbol id="t3-camera" viewBox="0 0 124 156"><g stroke="'+INK3+'" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">'+
    '<circle cx="38" cy="26" r="18" fill="#fff"/><circle cx="78" cy="26" r="18" fill="#fff"/>'+
    '<g fill="'+INK3+'" stroke="none"><circle cx="38" cy="26" r="4"/><circle cx="38" cy="15" r="4"/><circle cx="38" cy="37" r="4"/><circle cx="27" cy="26" r="4"/><circle cx="49" cy="26" r="4"/>'+
    '<circle cx="78" cy="26" r="4"/><circle cx="78" cy="15" r="4"/><circle cx="78" cy="37" r="4"/><circle cx="67" cy="26" r="4"/><circle cx="89" cy="26" r="4"/></g>'+
    '<rect x="16" y="46" width="80" height="46" rx="7" fill="'+INK3+'"/><path d="M96 58l20-10v42l-20-10z" fill="'+INK3+'"/><rect x="34" y="56" width="42" height="26" rx="5" fill="#fff" stroke="none"/>'+
    '<path d="M44 92h24v8H44z" fill="'+TEAL+'"/><path d="M56 100 28 152M56 100l28 52M56 100v52" fill="none" stroke-width="3.4"/></g></symbol>'+
  '<symbol id="t3-mega" viewBox="0 0 104 84"><g stroke="'+INK3+'" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">'+
    '<path d="M36 50l-4 24h12l6-20" fill="'+INK3+'"/><path d="M14 30l58-24 8 62-58-16z" fill="'+PINK+'"/><rect x="6" y="28" width="12" height="24" rx="4" fill="'+INK3+'"/>'+
    '<ellipse cx="76" cy="37" rx="9" ry="31" fill="#fff"/><path d="M88 22l10-6M90 38h11M88 53l10 6" fill="none" stroke="'+YEL+'" stroke-width="3"/></g></symbol>'+
  '<symbol id="t3-play" viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="'+INK3+'"/><circle cx="32" cy="32" r="22" fill="'+TEAL+'"/><path d="M26 20l18 12-18 12z" fill="#fff"/></symbol>'+
  '<symbol id="t3-glasses" viewBox="0 0 110 50"><g stroke="'+INK3+'" stroke-width="2.4" stroke-linejoin="round">'+
    '<path d="M4 12h102l-3 6H7z" fill="#fff"/><path d="M8 16h42l-4 28H14z" fill="#fff"/><path d="M60 16h42l-6 28H64z" fill="#fff"/>'+
    '<path d="M14 21h31l-3 17H18z" fill="'+PINK+'" stroke="none"/><path d="M65 21h31l-4 17H68z" fill="'+TEAL+'" stroke="none"/></g></symbol>'+
  '</svg>';

  /* ---------------- ของตกแต่งแต่ละธีม ----------------
     [ตัวเลือก CSS ที่จะวางไว้ข้างใน, สัญลักษณ์, ตำแหน่ง/ขนาด(class)] */
  var DECOR={
    '2':[
      ['#cover','t2-sign','d-cover-tl'],['#cover','t2-compass','d-cover-br'],['#cover','t2-pin','d-cover-tr'],
      ['.hero','t2-pin','d-tl'],['.hero','t2-map','d-tr d-wide'],
      ['#countdown','t2-compass','d-tr'],
      ['#savethedate','t2-phone','d-tl d-tall'],
      ['#location','t2-sign','d-ml d-big'],['#location','t2-pin','d-mr'],
      ['#program','t2-map','d-tr d-wide'],
      ['#attire','t2-stump','d-tl'],
      ['#story','t2-compass','d-tr'],
      ['#rsvp','t2-sign','d-tl d-big'],
      ['#wishes','t2-pin','d-tr'],
      ['.stage-top','t2-compass','d-sm'],
      ['.wishes-top .ttl','t2-compass','d-sm']
    ],
    '3':[
      ['#cover','t3-popcorn','d-cover-br'],
      ['.hero','t3-clapper','d-tl'],['.hero','t3-glasses','d-tr d-wide'],
      ['#countdown','t3-play','d-tr'],
      ['#savethedate','t3-ticket','d-tl d-wide'],
      ['#location','t3-camera','d-ml d-big'],['#location','t3-popcorn','d-mr'],
      ['#program','t3-clapper','d-tr'],
      ['#attire','t3-glasses','d-tl d-wide'],
      ['#story','t3-clapper','d-tr'],
      ['#rsvp','t3-ticket','d-tl d-wide'],
      ['#wishes','t3-popcorn','d-tr'],
      ['.stage-top','t3-clapper','d-sm'],
      ['.wishes-top .ttl','t3-popcorn','d-sm']
    ]
  };
  // ธีม 3: ดาว + ขดกระดาษสี โรยตามขอบแต่ละส่วน (ตำแหน่งคงที่ ไม่สุ่มใหม่ทุกครั้ง)
  var SPRINKLE_AT=['#cover','.hero','#countdown','#savethedate','#location','#program','#details','#attire','#story','#rsvp','#wishes'];
  var SPRINKLES=[['t3-star',YEL],['t3-chev',PUR],['t3-star',GOLDD],['t3-star',YEL],['t3-chev',PUR],['t3-star',PINK]];

  // วันที่ใน Save the Date: หัวใจ → หมุด (ธีม 2) / ดาวระเบิด (ธีม 3)
  var DATE_SHAPE={
    '2':'<path d="M37 63S9 38 9 22C9 10 21 3 37 3s28 7 28 19c0 16-28 41-28 41z" fill="#C23B3B" stroke="'+INK2+'" stroke-width="2.6" stroke-linejoin="round"/>',
    '3':'<path d="M37 2l7 12 13-5-1 14 14 3-9 11 9 11-14 3 1 14-13-5-7 12-7-12-13 5 1-14-14-3 9-11-9-11 14-3-1-14 13 5z" fill="#C23B3B" stroke="'+INK3+'" stroke-width="2.4" stroke-linejoin="round"/>'
  };
  var PASS_HEAD={'2':'✈ BOARDING PASS · P ♥ P · 19.12.26'};   // ธีม 3 ใช้ตั๋วทองแบบ mockup (buildT3)

  function el(tag,cls,html){ var e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }
  function icon(sym,cls,color){
    var s='<svg class="tdeco '+cls+'" aria-hidden="true"'+(color?' style="color:'+color+'"':'')+'><use href="#'+sym+'"/></svg>';
    var d=document.createElement('div'); d.innerHTML=s; return d.firstChild;
  }

  /* ---------- ธีม 3: ชิ้นจาก mockup (สร้างจากเนื้อหาในหน้า ลบทิ้งเมื่อเปลี่ยนธีม) ---------- */
  function buildT3(){
    // หน้าปก → ตั๋วในแถบฟิล์ม
    var cover=document.getElementById('cover'), logo=cover&&cover.querySelector('.cover-logo');
    if(cover && logo){
      var date=(cover.querySelector('.cover-date')||{}).textContent||'';
      var t=el('div','t3x t3-cover',
        '<div class="t3-film"><div class="t3-tix">'+
          '<div class="t3-stub"><span>NOW SHOWING</span></div>'+
          '<div class="t3-main"><div class="t3-ns">A LOVE STORY</div></div>'+
          '<div class="t3-bar"><b></b><span>19122569</span></div>'+
        '</div></div>');
      var main=t.querySelector('.t3-main'), im=logo.cloneNode(); im.className='t3-logo'; main.appendChild(im);
      main.appendChild(el('div','t3-date','SAT · 19 · DEC · 2026'));
      if(date) main.appendChild(el('div','t3-date-th',date));
      logo.before(t);
      var ob=document.getElementById('openBtn'); if(ob){ ob.dataset.t3orig=ob.textContent; ob.textContent='รับตั๋ว · เปิดคำเชิญ'; }
    }
    // กำหนดการ → บอร์ด NOW SHOWING (อ่านจากรายการเดิม — แก้กำหนดการที่ <ol class="timeline"> ที่เดียว)
    var ol=document.querySelector('ol.timeline');
    if(ol){
      var b=el('div','t3x t3-board','<div class="t3-board-h">NOW SHOWING</div><div class="t3-board-by">Palida &amp; Pachaya Film Co.</div><div class="t3-stars">★<b>★</b>★</div>');
      Array.prototype.forEach.call(ol.children,function(li,i){
        var q=function(c){ var n=li.querySelector(c); return n?n.textContent.trim():''; };
        var r=el('div','t3-row'+(i%2?'':' is-red'));
        r.appendChild(el('span','t3-sc','SC.'+String(i+1).padStart(2,'0')));
        r.appendChild(el('span','t3-ti')); r.lastChild.textContent=q('.tl-title');
        r.appendChild(el('span','t3-tm')); r.lastChild.textContent=q('.tl-time').replace(/\s*น\.?$/,'');
        var d=el('div','t3-desc'); d.textContent=q('.tl-desc');
        b.appendChild(r); b.appendChild(d);
      });
      b.appendChild(el('div','t3-stars','★<b>★</b>★'));
      ol.before(b);
    }
    // บัตรเชิญ → ต้นขั้วตั๋ว แถว/ที่นั่ง (ตกแต่งเฉย ๆ)
    Array.prototype.forEach.call(document.querySelectorAll('.pass'),function(p){
      var row=p.querySelector('.pass-row'), nm=p.querySelector('.pass-name'); if(!row||!nm) return;
      nm.before(el('div','t3x t3-admit','ADMIT ONE · PREMIERE'));
      nm.after(el('div','t3x t3-meta','19 DEC 2026 · THE BARNERY'));
      row.appendChild(el('div','t3x t3-seat','<small>ROW</small><b>A</b><small>SEAT</small><b>19</b>'));
    });
  }
  function clearT3(){
    Array.prototype.forEach.call(document.querySelectorAll('.t3x'),function(n){ n.remove(); });
    var ob=document.getElementById('openBtn'); if(ob && ob.dataset.t3orig){ ob.textContent=ob.dataset.t3orig; delete ob.dataset.t3orig; }
  }

  var stdOriginal=null;
  function apply(t){
    root.setAttribute('data-theme',t);
    Array.prototype.forEach.call(document.querySelectorAll('.tdeco,.tdeco-div,.tdeco-passhead'),function(n){ n.remove(); });
    clearT3(); if(t==='3') buildT3();
    // ตัวแบ่งส่วน
    Array.prototype.forEach.call(document.querySelectorAll('svg.wave'),function(w){
      if(t==='2'){ var d=el('div','tdeco-div tdeco-div--trail','<svg viewBox="0 0 400 46" preserveAspectRatio="xMidYMid meet"><use href="#t2-trail"/></svg>'); w.after(d); }
      if(t==='3'){ w.after(el('div','tdeco-div tdeco-div--film')); }
    });
    // ของตกแต่ง
    (DECOR[t]||[]).forEach(function(d){
      Array.prototype.forEach.call(document.querySelectorAll(d[0]),function(host){ host.classList.add('t-host'); host.appendChild(icon(d[1],d[2])); });
    });
    if(t==='3') SPRINKLE_AT.forEach(function(sel,si){
      Array.prototype.forEach.call(document.querySelectorAll(sel),function(host){
        host.classList.add('t-host');
        for(var k=0;k<2;k++){
          var sp=SPRINKLES[(si*2+k)%SPRINKLES.length], side=(si+k)%2?'l':'r';
          var n=icon(sp[0],'d-spr',sp[1]); var sz=sp[0]==='t3-star'?13+((si+k)%3)*4:34;
          n.style.width=sz+'px'; n.style.height=(sp[0]==='t3-chev'?sz*.4:sz)+'px';
          n.style[side==='l'?'left':'right']=(-18+((si*7+k*5)%8))+'px';   // อยู่ในขอบข้าง ไม่ทับข้อความ
          n.style.top=(18+((si*23+k*31)%64))+'%';
          n.style.transform='rotate('+(((si*37+k*53)%60)-30)+'deg)';
          host.appendChild(n);
        }
      });
    });
    // หัวบัตรเชิญ
    Array.prototype.forEach.call(document.querySelectorAll('.pass'),function(p){ if(PASS_HEAD[t]) p.prepend(el('div','tdeco-passhead',PASS_HEAD[t])); });
    // รูปทรงวันที่
    var std=document.querySelector('.std-heart svg');
    if(std){ if(stdOriginal==null) stdOriginal=std.innerHTML; std.innerHTML=DATE_SHAPE[t]||stdOriginal; }
    // ปุ่มสลับธีม
    Array.prototype.forEach.call(document.querySelectorAll('.tswitch button'),function(b){ b.setAttribute('aria-pressed',String(b.dataset.t===t)); });
  }

  function buildSwitch(){
    var w=el('div','tswitch'); w.setAttribute('role','group'); w.setAttribute('aria-label','สลับธีม (ทดสอบ)');
    w.appendChild(el('span','tswitch-l','ธีม'));
    ['1','2','3'].forEach(function(t){
      var b=el('button',null,t); b.type='button'; b.dataset.t=t; b.title=['','แบบเดิม','Journey','Premiere'][t];
      b.addEventListener('click',function(){ try{ localStorage.setItem(KEY,t); }catch(e){} apply(t); });
      w.appendChild(b);
    });
    document.body.appendChild(w);
  }

  function init(){
    document.body.insertAdjacentHTML('afterbegin',SPRITE);
    if(switchOn) buildSwitch();
    apply(theme);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
  window.WeddingTheme={apply:apply,get:function(){ return root.getAttribute('data-theme'); }};
})();
