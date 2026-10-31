/* ===== หน้า "กำลังจัดเตรียม" + รหัสลับ =====
   ปิดหน้านี้ตอนเปิดเว็บจริง: เปลี่ยน GATE_ON เป็น false
   เปลี่ยนรหัส: ใส่ค่า SHA-256 ของรหัสใหม่ใน GATE_HASH (ดูวิธีใน README หัวข้อ "หน้ากำลังจัดเตรียม")
   ส่งลิงก์ให้คนทดสอบเข้าได้เลย: ต่อท้ายลิงก์ด้วย ?gate=รหัส
   หมายเหตุ: เป็นการซ่อนหน้าเว็บแบบง่าย ไม่ใช่ระบบความปลอดภัยจริง (ไฟล์ยังเปิดตรงได้ถ้ารู้ที่อยู่) */
(function(){
  var GATE_ON = true;
  var GATE_HASH = '51f6064e2b5e1f014e71e9f7a0fb6b23cce41d490c89baa91c44bf70192f3612';
  var KEY = 'pp_gate_ok';
  if(!GATE_ON) return;

  function get(){ try{ return localStorage.getItem(KEY); }catch(e){ return null; } }
  function set(v){ try{ localStorage.setItem(KEY,v); }catch(e){} }
  if(get()===GATE_HASH) return;

  function sha(s){
    if(window.crypto && crypto.subtle && window.TextEncoder){
      return crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)).then(function(b){
        return Array.prototype.map.call(new Uint8Array(b),function(x){ return ('0'+x.toString(16)).slice(-2); }).join('');
      });
    }
    return Promise.resolve('');
  }

  var root=document.documentElement; root.classList.add('gated');
  var css=document.createElement('style');
  css.textContent=
    'html.gated,html.gated body{overflow:hidden!important;height:100%}'+
    'html.gated body>*:not(#gate){visibility:hidden!important}'+
    '#gate{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:24px 16px;'+
      'background:#F3ECE0 radial-gradient(circle at 50% 35%,#FFFDF8 0%,#F3ECE0 70%);color:#9F2C2E;font-family:Mali,Fredoka,system-ui,sans-serif;text-align:center}'+
    '#gate .g-card{width:100%;max-width:360px}'+
    '#gate img{width:200px;max-width:60vw;height:auto;display:block;margin:0 auto 6px}'+
    '#gate h1{font-family:"Dancing Script",Mali,cursive;font-weight:700;font-size:2.4rem;margin:0;color:#C23B3B;line-height:1.1}'+
    '#gate p{margin:8px 0 22px;font-size:.95rem;line-height:1.6;opacity:.85}'+
    '#gate form{display:flex;gap:8px}'+
    '#gate input{flex:1;min-width:0;font:inherit;font-size:16px;padding:12px 14px;border:1.5px solid #E2BDB3;border-radius:999px;background:#FFFDF8;color:#9F2C2E;text-align:center;letter-spacing:.15em;outline:none}'+
    '#gate input:focus{border-color:#C23B3B;box-shadow:0 0 0 3px rgba(194,59,59,.15)}'+
    '#gate button{font:inherit;font-weight:600;padding:12px 18px;border:0;border-radius:999px;background:#C23B3B;color:#FFFDF8;cursor:pointer;white-space:nowrap}'+
    '#gate .g-err{min-height:1.4em;margin-top:10px;font-size:.85rem;color:#C23B3B}'+
    '#gate .g-shake{animation:gshake .35s}'+
    '@keyframes gshake{25%{transform:translateX(-6px)}50%{transform:translateX(6px)}75%{transform:translateX(-3px)}}'+
    '#gate small{display:block;margin-top:26px;font-size:.75rem;opacity:.55;letter-spacing:.06em}';
  document.head.appendChild(css);

  function unlock(h){ set(h); var u=new URL(location.href); u.searchParams.delete('gate'); location.replace(u.toString()); }

  // ?gate=รหัส ในลิงก์ → เข้าได้เลย
  var q=new URLSearchParams(location.search).get('gate');
  if(q) sha(q).then(function(h){ if(h===GATE_HASH) unlock(h); });

  function build(){
    if(document.getElementById('gate')) return;
    var g=document.createElement('div'); g.id='gate'; g.setAttribute('role','dialog'); g.setAttribute('aria-modal','true'); g.setAttribute('aria-labelledby','gateT');
    g.innerHTML='<div class="g-card">'+
      '<img src="images/logo.png" alt="Palida &amp; Pachaya" width="900" height="652">'+
      '<h1 id="gateT">Coming soon</h1>'+
      '<p>เว็บไซต์งานแต่งกำลังจัดเตรียม<br>อีกไม่นานพบกันนะ ♡</p>'+
      '<form autocomplete="off"><input type="password" inputmode="text" placeholder="รหัสเข้าชม" aria-label="รหัสเข้าชม"><button type="submit">เข้า</button></form>'+
      '<div class="g-err" aria-live="polite"></div>'+
      '<small>19 · 12 · 2569</small></div>';
    document.body.appendChild(g);
    var f=g.querySelector('form'), inp=g.querySelector('input'), err=g.querySelector('.g-err');
    f.addEventListener('submit',function(e){
      e.preventDefault();
      sha(inp.value.trim()).then(function(h){
        if(h===GATE_HASH){ unlock(h); return; }
        err.textContent=h?'รหัสไม่ถูกต้อง':'เบราว์เซอร์นี้ตรวจรหัสไม่ได้ ลองเปิดด้วย Chrome / Safari';
        f.classList.remove('g-shake'); void f.offsetWidth; f.classList.add('g-shake'); inp.select();
      });
    });
  }
  if(document.body) build(); else document.addEventListener('DOMContentLoaded',build);
})();
