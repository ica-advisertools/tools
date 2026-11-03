// Build retirement/index.html as a password-locked page.
// Usage (repo root): PVW_PW='<team password>' node _build/build_retirement.js
// Source: _work/retirement_src.html = the Retirement Calculator artifact's page content (without the viewer's wrapper).
const fs=require('fs'),crypto=require('crypto');
const PW=String(process.env.PVW_PW||'').trim().toLowerCase(); if(!PW) throw 'set PVW_PW';
const salt=JSON.parse(Buffer.from(fs.readFileSync('vantage/index.html','utf8').match(/const PAYLOAD = "([^"]+)"/)[1],'base64').toString()).salt;
const ITER=250000, key=crypto.pbkdf2Sync(PW,Buffer.from(salt,'base64'),ITER,32,'sha256');
function dec(file,k){ const P=JSON.parse(Buffer.from(fs.readFileSync(file,'utf8').match(/const PAYLOAD = "([^"]+)"/)[1],'base64').toString());
  const ct=Buffer.from(P.ct,'base64'); const d=crypto.createDecipheriv('aes-256-gcm',k,Buffer.from(P.iv,'base64')); d.setAuthTag(ct.subarray(ct.length-16));
  return Buffer.concat([d.update(ct.subarray(0,ct.length-16)),d.final()]).toString('utf8'); }
try { dec('retirement/index.html',key); } catch(e){ console.error('That password does not open the existing pages. Nothing written.'); process.exit(1); }
function enc(text){ const iv=crypto.randomBytes(12); const c=crypto.createCipheriv('aes-256-gcm',key,iv);
  const ct=Buffer.concat([c.update(text,'utf8'),c.final(),c.getAuthTag()]);
  return Buffer.from(JSON.stringify({salt,iv:iv.toString('base64'),ct:ct.toString('base64'),iter:ITER})).toString('base64'); }
const stamp=new Date().toISOString().slice(0,10);

// Team version: no firm name or personal adviser details; save buttons download directly; "All tools" link.
let s=fs.readFileSync('_work/retirement_src.html','utf8');
function rep(a,b){ const n=s.split(a).length-1; if(n!==1) throw 'expected one match ('+n+'): '+a.slice(0,70); s=s.replace(a,b); }
const BACK=fs.readFileSync('retirement/index.html','utf8').match(/<a href="\.\.\/"[^>]*>← All tools<\/a>/)[0];
rep('<head>\n', '<head>\n<meta name="robots" content="noindex,nofollow">\n<style>[hidden]:not([hidden=until-found i]){display:none!important}body{padding-top:22px}</style>\n'+fs.readFileSync('_build/shim.js','utf8').trim()+'\n');
rep('<body>\n', '<body>\n'+BACK+'\n');
rep('<p class="eyebrow">Isaac Chong &amp; Associates · Wealth Projection Statement</p>', '<p class="eyebrow">Wealth Projection Statement</p>');
rep('<input id="advisorName" type="text" value="Isaac Chong &amp; Associates" />', '<input id="advisorName" type="text" value="" placeholder="Adviser name" />');
s=s.replace(/>Isaac Chong &amp; Associates · (Retirement Calculator v[\d.]+ · Updated [^<]+)</, '>$1<');
rep("esc(adviser||'Isaac Chong & Associates')+' · Retirement projection</p>", "(adviser ? esc(adviser)+' · ' : '')+'Retirement projection</p>");
s=s.replace(/const CPF_ADV_DEFAULT = \{[^}]*\};/, "const CPF_ADV_DEFAULT = {name:'', cred:'', role:'', phone:'', email:''};");
rep("const firm = 'Isaac Chong & Associates';", "const firm = '';");
rep("<p class=\"eyebrow\">'+esc(firm)+' · CPF summary</p>", "<p class=\"eyebrow\">'+(firm ? esc(firm)+' · ' : '')+'CPF summary</p>");
rep("(adv.role ? '<div class=\"r\">'+esc(adv.role)+' · '+esc(firm)+'</div>' : '<div class=\"r\">'+esc(firm)+'</div>')",
    "(adv.role || firm ? '<div class=\"r\">'+esc([adv.role, firm].filter(Boolean).join(' · '))+'</div>' : '')");
if(/Isaac Chong|Laura|laurahoi|9799/.test(s)) throw 'personal or firm details left in the team version';

const out=fs.readFileSync('_build/lock_tpl.html','utf8').replaceAll('__TITLE__','Retirement Calculator').replace('__DESC__','Enter the team password to open the calculator.').replace('__STAMP__',stamp).replace('__PAYLOAD__',enc(s))
  .replace('</style></head><body>\n<div class="lock"','</style></head><body>\n'+BACK+'\n<div class="lock"');
fs.writeFileSync('retirement/index.html', out);
const k2=crypto.pbkdf2Sync('definitely-wrong',Buffer.from(salt,'base64'),ITER,32,'sha256');
if(dec('retirement/index.html',key)!==s) throw 'round trip failed';
let bad=false; try{ dec('retirement/index.html',k2); bad=true; }catch(e){} if(bad) throw 'wrong password opened the page';
fs.writeFileSync('_work/retirement_site.html', s);
console.log('checked retirement/index.html');
