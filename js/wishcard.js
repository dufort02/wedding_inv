/* การ์ดอวยพร — ใช้ร่วมกันใน index.html (สมุดอวยพร) และ wishes.html (บอร์ด/สไลด์โชว์)
   สุ่มแบบต่อการ์ด (คงที่ตามชื่อ+เวลา): โพลารอยด์ หรือ โปสการ์ดติดแสตมป์
   แขกที่ไม่มีรูปตัวละคร → โปสการ์ดเสมอ (แสตมป์เป็นตัวอักษรแรกของชื่อ)

   WishCard.build(wish, {big:true, kind:'pol'|'post'})  → <article>
   wish = {name, message, mode:'attend'|'gift'|'wish', paper, avatar, pinned, ts} */
(function(){
  var PAPERS = {blush:'#FBE3DD', cream:'#FFF3DA', sky:'#E1ECF6', sage:'#E4EEDC', lilac:'#ECE3F5'};
  var TAGS   = {attend:'Attending', gift:'Sent a Gift', wish:'Online Wish'};
  var TILTS  = [-4,-2.5,-1.2,0,0,0,1.2,2.5,4];      // เอียงบ้าง ตรงบ้าง
  var POSTMARK = 'P ♥ P<br>19.12.26';

  var css = `
.wc{position:relative;break-inside:avoid;display:inline-block;width:100%;vertical-align:top;text-align:left;
  font-size:var(--wfs,14px);color:#7a3b35;margin:0 0 2.2em;cursor:pointer;
  transform:translate(var(--x,0),0) rotate(var(--r,0deg));transition:transform .25s ease,box-shadow .25s ease;
  box-shadow:0 2px 0 rgba(0,0,0,.03),0 .6em 1.3em rgba(120,60,40,.14)}
.wc:hover{transform:translate(var(--x,0),-3px) rotate(0deg) scale(1.03);z-index:2}
.wc::before{content:"";position:absolute;top:-.7em;left:50%;width:4.6em;height:1.4em;transform:translateX(-50%) rotate(var(--t,-3deg));background:rgba(222,196,150,.78);z-index:1}
.wc.pinned::before{background:rgba(194,59,59,.5)}
.wc.pinned::after{content:"";position:absolute;top:.55em;left:.6em;width:1.05em;height:1em;background:#C23B3B;z-index:1;
  -webkit-mask:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 22'><path d='M12 21C5 15 1 11 1 6.5A5.5 5.5 0 0 1 12 4a5.5 5.5 0 0 1 11 2.5C23 11 19 15 12 21z'/></svg>") center/contain no-repeat;
          mask:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 22'><path d='M12 21C5 15 1 11 1 6.5A5.5 5.5 0 0 1 12 4a5.5 5.5 0 0 1 11 2.5C23 11 19 15 12 21z'/></svg>") center/contain no-repeat}
.wc-msg{white-space:pre-wrap;word-break:break-word;line-height:1.75em;display:-webkit-box;-webkit-line-clamp:var(--lines,8);-webkit-box-orient:vertical;overflow:hidden}
.wc.open .wc-msg{-webkit-line-clamp:unset;display:block}
.wc-name{font-family:'Dancing Script','Mali',cursive;color:#C23B3B;font-size:1.5em;line-height:1.2;word-break:break-word}
.wc-name .wc-tag{font-size:.42em;margin-top:.35em}
.wc-tag{display:block;font-family:'Fredoka','Mali',sans-serif;font-size:.68em;letter-spacing:.12em;text-transform:uppercase;color:#B5504C;opacity:.85}

/* โพลารอยด์ */
.wc--pol{background:#FFFDF8;padding:.6em .6em .9em;border-radius:2px;width:82%;margin-left:9%;margin-right:9%}
.wc--pol .wc-ph{background:radial-gradient(circle at 50% 40%,#FFFDF8 0%,var(--c,#FBE3DD) 95%);aspect-ratio:5/4;display:flex;align-items:flex-end;justify-content:center;overflow:hidden}
.wc--pol .wc-ph img{height:100%;width:auto;max-width:none}
.wc--pol .wc-name{text-align:center;margin:.35em 0 .15em}
.wc--pol .wc-msg{text-align:center;font-size:.95em;line-height:1.6em}
.wc--pol .wc-tag{text-align:center;margin-top:.5em}

/* โปสการ์ด */
.wc--post{background:var(--c,#FFF3DA);padding:1em 1em .8em;border-radius:3px}
.wc-stamp{float:right;width:4.2em;height:5em;margin:-.1em -.1em .4em .7em;padding:.35em;position:relative;
  background:radial-gradient(circle,transparent .2em,#fff .24em) -.3em -.3em/.6em .6em;filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.18))}
.wc-stamp>div{width:100%;height:100%;background:radial-gradient(circle at 50% 40%,#FFFDF8,#EFD3CB);display:flex;align-items:flex-end;justify-content:center;overflow:hidden;
  font-family:'Fredoka','Mali',sans-serif;font-weight:600;color:#C23B3B;font-size:1.6em}
.wc-stamp>div.ini{align-items:center}
.wc-stamp img{height:100%;width:auto;max-width:none}
.wc-pm{position:absolute;top:6.4em;right:5.56em;width:3.7em;height:3.7em;border:2px solid rgba(194,59,59,.5);border-radius:50%;
  display:flex;align-items:center;justify-content:center;text-align:center;font-family:'Fredoka','Mali',sans-serif;font-size:.62em;
  line-height:1.25;font-weight:600;letter-spacing:.06em;color:rgba(194,59,59,.7);transform:rotate(-14deg);pointer-events:none}
.wc--post .wc-msg{background:repeating-linear-gradient(transparent 0 calc(1.75em - 1px),rgba(194,59,59,.16) calc(1.75em - 1px) 1.75em)}
.wc-sig{clear:both;text-align:right;margin-top:.5em}

/* การ์ดใหญ่ (สไลด์โชว์) */
.wc--big{--wfs:clamp(15px,min(2.6vh,2.1vw),28px);margin:0;cursor:default;width:min(1000px,92vw);max-height:100%;--lines:99}
.wc--big:hover{transform:rotate(var(--r,0deg))}
.wc--big::before{width:7em;height:1.9em;top:-.9em}
.wc--big .wc-msg{font-size:var(--mfs,1.35em);overflow:auto;display:block}
.wc--big.wc--pol{width:min(1000px,92vw);margin:0;display:grid;grid-template-columns:minmax(0,40%) 1fr;gap:1.4em;padding:1em 1em 1.2em;align-items:center}
.wc--big.wc--pol .wc-ph{aspect-ratio:3/3.6}
.wc--big.wc--pol .wc-body{min-height:0;max-height:62vh;display:flex;flex-direction:column;justify-content:center;text-align:center}
.wc--big.wc--pol .wc-name{font-size:2.3em}
.wc--big.wc--post{padding:1.6em 2em 1.4em}
.wc--big .wc-stamp{width:6em;height:7.2em}
.wc--big .wc-pm{top:5.9em;right:6.4em;width:5.2em;height:5.2em;font-size:.8em}
.wc--big.wc--post .wc-msg{max-height:52vh}
.wc--big .wc-sig .wc-name{font-size:2.3em}
@media (max-width:640px){ .wc--big.wc--pol{grid-template-columns:1fr} .wc--big.wc--pol .wc-ph{aspect-ratio:4/3;max-height:34vh} }
@keyframes wcDrop{from{opacity:0;transform:translate(var(--x,0),-26px) rotate(calc(var(--r,0deg)*3)) scale(.94)}}
.wc.drop{animation:wcDrop .55s cubic-bezier(.2,.9,.3,1.2) both}
.wc.glow{animation:wcDrop .55s cubic-bezier(.2,.9,.3,1.2) both,wcGlow 2.4s 3 ease-in-out}
@keyframes wcGlow{50%{box-shadow:0 0 0 4px rgba(194,59,59,.35),0 .6em 1.3em rgba(120,60,40,.14)}}
@media (prefers-reduced-motion:reduce){ .wc.drop,.wc.glow{animation:none} }
`;
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  function hash(s){ var h=0; for(var i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))|0; return Math.abs(h); }
  function key(w){ return (w.ts||'')+'|'+w.name+'|'+String(w.message).slice(0,40); }
  function el(tag,cls,txt){ var e=document.createElement(tag); if(cls) e.className=cls; if(txt!=null) e.textContent=txt; return e; }
  function initial(w){ return (w.name||'?').trim().charAt(0).toUpperCase(); }
  function img(src,box,fallback){
    var im=new Image(); im.alt=''; im.decoding='async';
    im.onload=function(){ box.textContent=''; box.classList.remove('ini'); box.appendChild(im); };
    im.onerror=fallback||null; im.src=src;
  }
  function nameBlock(w,prefix){
    var n=el('div','wc-name',(prefix||'')+w.name); n.appendChild(el('span','wc-tag',TAGS[w.mode]||TAGS.wish)); return n;
  }

  function build(w,opt){
    opt=opt||{};
    var h=hash(key(w)), pol = opt.kind ? opt.kind==='pol' : (!!w.avatar && (h>>2)%2===0);   // opt.kind บังคับแบบได้ ('pol' | 'post')
    var a=el('article','wc '+(pol?'wc--pol':'wc--post')+(w.pinned?' pinned':'')+(opt.big?' wc--big':''));
    a.style.setProperty('--c',PAPERS[w.paper]||PAPERS.blush);
    a.style.setProperty('--r',(opt.big?TILTS[h%TILTS.length]*.4:TILTS[h%TILTS.length])+'deg');
    a.style.setProperty('--t',((h>>3)%9-4)+'deg');
    if(!opt.big) a.style.setProperty('--x',((h>>5)%11-5)+'px');
    var len=String(w.message).length;
    if(opt.big) a.style.setProperty('--mfs', len>320?'1em':len>160?'1.15em':'1.35em');

    if(pol){
      var ph=el('div','wc-ph'); img(w.avatar,ph); a.appendChild(ph);
      var body=el('div','wc-body');
      body.appendChild(el('div','wc-name',w.name));
      body.appendChild(el('p','wc-msg',w.message));
      body.appendChild(el('span','wc-tag',TAGS[w.mode]||TAGS.wish));
      a.appendChild(body);
    } else {
      var stamp=el('div','wc-stamp'), inner=el('div','ini',initial(w)); stamp.appendChild(inner);
      if(w.avatar) img(w.avatar,inner);
      var pm=el('div','wc-pm'); pm.innerHTML=POSTMARK;
      a.appendChild(stamp); a.appendChild(pm);
      a.appendChild(el('p','wc-msg',w.message));
      var sig=el('div','wc-sig'); sig.appendChild(nameBlock(w,'— ')); a.appendChild(sig);
    }
    return a;
  }

  window.WishCard = {build:build, key:key, hash:hash, PAPERS:PAPERS, TAGS:TAGS};
})();
