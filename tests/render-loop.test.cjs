const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const loop=html.slice(html.indexOf('/* ---------- loop ---------- */'),html.indexOf('/* ---------- input ---------- */'));
function sample(hz,touch){
  const ctx=vm.createContext({matchMedia:()=>({matches:touch}),requestAnimationFrame(){},updates:[],paints:[]});
  vm.runInContext(`let anim=0,mode='play';function update(dt){updates.push(dt)};function render(){paints.push(1)};${loop}`,ctx);
  for(let i=0;i<=hz*2;i++)ctx.frame(1000+i*1000/hz);
  return{updates:Array.from(ctx.updates),paints:ctx.paints.length};
}
for(const hz of [30,60,90,120,144]){
  test(`touch ${hz} Hz: update every callback, paint at most 60 fps`,()=>{
    const r=sample(hz,true);assert.equal(r.updates.length,hz*2+1);assert(r.paints<=121);assert(r.paints>=Math.min(hz*2,119));
    assert.deepEqual(r.updates,sample(hz,false).updates);
  });
  test(`desktop ${hz} Hz: preserve every paint`,()=>{const r=sample(hz,false);assert.equal(r.paints,hz*2+1);});
}
