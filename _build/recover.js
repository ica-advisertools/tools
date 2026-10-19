// Recover the editable sources from the live (encrypted) site pages.
// Usage: PVW_PW='<team password>' node _build/recover.js   (run from the repo root)
// Writes into _work/ (never commit _work/: it is the unencrypted content).
const fs=require('fs'),crypto=require('crypto');
const PW=String(process.env.PVW_PW||'').trim().toLowerCase(); if(!PW) throw 'set PVW_PW';
function dec(file){
  const m=fs.readFileSync(file,'utf8').match(/const PAYLOAD = "([^"]+)"/); if(!m) throw 'no payload in '+file;
  const P=JSON.parse(Buffer.from(m[1],'base64').toString());
  const key=crypto.pbkdf2Sync(PW,Buffer.from(P.salt,'base64'),P.iter,32,'sha256');
  const ct=Buffer.from(P.ct,'base64'), tag=ct.subarray(ct.length-16);
  const d=crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(P.iv,'base64')); d.setAuthTag(tag);
  return {salt:P.salt, text:Buffer.concat([d.update(ct.subarray(0,ct.length-16)),d.final()]).toString('utf8')};
}
fs.mkdirSync('_work',{recursive:true});
const sim=dec('vantage/index.html'); const app=JSON.parse(sim.text);
fs.writeFileSync('_work/app_markup.html',app.html); fs.writeFileSync('_work/app_bundle.js',app.js);
fs.writeFileSync('_work/salt.txt',sim.salt);
fs.writeFileSync('_work/retirement_site.html',dec('retirement/index.html').text);
console.log('recovered into _work/');
