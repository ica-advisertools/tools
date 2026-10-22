// Build legacy/index.html (and optionally the landing page) as password-locked pages.
// Usage (repo root): PVW_PW='<team password>' node _build/build_legacy.js [--landing]
// Source: _work/legacy_src.html = the PRUApex Legacy Index II Simulator artifact's page content.
const fs=require('fs'),crypto=require('crypto');
const PW=String(process.env.PVW_PW||'').trim().toLowerCase(); if(!PW) throw 'set PVW_PW';
const salt=JSON.parse(Buffer.from(fs.readFileSync('vantage/index.html','utf8').match(/const PAYLOAD = "([^"]+)"/)[1],'base64').toString()).salt;
const ITER=250000, key=crypto.pbkdf2Sync(PW,Buffer.from(salt,'base64'),ITER,32,'sha256');
// Check the password against an existing page before writing anything.
function dec(file,k){ const P=JSON.parse(Buffer.from(fs.readFileSync(file,'utf8').match(/const PAYLOAD = "([^"]+)"/)[1],'base64').toString());
  const ct=Buffer.from(P.ct,'base64'); const d=crypto.createDecipheriv('aes-256-gcm',k,Buffer.from(P.iv,'base64')); d.setAuthTag(ct.subarray(ct.length-16));
  return Buffer.concat([d.update(ct.subarray(0,ct.length-16)),d.final()]).toString('utf8'); }
try { dec('retirement/index.html',key); } catch(e){ console.error('That password does not open the existing pages. Nothing written.'); process.exit(1); }
function enc(text){ const iv=crypto.randomBytes(12); const c=crypto.createCipheriv('aes-256-gcm',key,iv);
  const ct=Buffer.concat([c.update(text,'utf8'),c.final(),c.getAuthTag()]);
  return Buffer.from(JSON.stringify({salt,iv:iv.toString('base64'),ct:ct.toString('base64'),iter:ITER})).toString('base64'); }
const stamp=new Date().toISOString().slice(0,10);
function lock(html,title,desc){ return fs.readFileSync('_build/lock_tpl.html','utf8').replaceAll('__TITLE__',title).replace('__DESC__',desc).replace('__STAMP__',stamp).replace('__PAYLOAD__',enc(html)); }
function check(file){ const k2=crypto.pbkdf2Sync('definitely-wrong',Buffer.from(salt,'base64'),ITER,32,'sha256');
  dec(file,key); let bad=false; try{ dec(file,k2); bad=true; }catch(e){} if(bad) throw 'wrong password opened '+file; console.log('checked',file); }
if (process.argv.includes('--landing')) {
  fs.writeFileSync('index.html', lock(fs.readFileSync('_build/landing.html','utf8'),'Adviser Tools','Enter the team password to open the adviser tools.'));
  check('index.html');
}
const src=fs.readFileSync('_work/legacy_src.html','utf8');
const head='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><style>[hidden]:not([hidden=until-found i]){display:none!important}body{padding-top:22px}.alltools{position:absolute;top:8px;left:max(16px,env(safe-area-inset-left,0px));font:600 13px system-ui,sans-serif;color:#C9A968;text-decoration:none}.alltools:hover{text-decoration:underline}</style></head><body><a class="alltools" href="../">← All tools</a>';
const page=head+src+'</body></html>';
fs.mkdirSync('legacy',{recursive:true});
fs.writeFileSync('legacy/index.html', lock(page,'PRUApex Legacy Index II Simulator','Enter the team password to open the simulator.'));
check('legacy/index.html');
