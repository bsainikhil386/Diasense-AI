const $=id=>document.getElementById(id);let LAST=null;
const num=id=>{const v=$(id).value.trim();return v===''?null:Number(v)};
function bmiCalc(){const h=num('height'),w=num('weight');if(h>50&&w>10){const b=w/((h/100)**2);$('bmi').textContent=b.toFixed(1);$('bmiCat').textContent=b<18.5?'(Underweight)':b<25?'(Healthy)':b<30?'(Overweight)':'(Obese)';return b}$('bmi').textContent='–';$('bmiCat').textContent='';return null}
['height','weight'].forEach(i=>$(i).addEventListener('input',bmiCalc));
function togglePreg(){const show=$('sex').value==='Female'&&num('age')>=12&&num('age')<=55;$('pregWrap').hidden=!show;if(!show)$('preg').value='none'}
['sex','age'].forEach(i=>$(i).addEventListener('input',togglePreg));
const rules={age:[1,120,'Age must be 1–120'],height:[100,250,'Height must be 100–250 cm'],weight:[20,300,'Weight must be 20–300 kg'],glucose:[40,600,'Glucose must be 40–600 mg/dL'],a1c:[3,18,'HbA1c must be 3–18 %'],sys:[70,250,'Systolic must be 70–250'],dia:[40,150,'Diastolic must be 40–150']};
function validate(){let ok=true;const E={};
for(const k in rules){const v=num(k);if(v!==null&&(isNaN(v)||v<rules[k][0]||v>rules[k][1]))E[k]=rules[k][2]}
['age','height','weight'].forEach(k=>{if(num(k)===null)E[k]='Required'});
['sex','family','activity','previous'].forEach(k=>{if(!$(k).value)E[k]='Required'});
if(num('glucose')===null&&num('a1c')===null)E.glucose='Enter glucose or HbA1c';
if((num('sys')===null)!==(num('dia')===null)){E[num('sys')===null?'sys':'dia']='Enter both BP values'}
if(num('sys')!==null&&num('dia')!==null&&num('sys')<=num('dia'))E.sys='Systolic must exceed diastolic';
document.querySelectorAll('.err').forEach(e=>e.textContent='');document.querySelectorAll('.bad').forEach(e=>e.classList.remove('bad'));
for(const k in E){ok=false;$('e_'+k).textContent=E[k];$(k).classList.add('bad')}
$('formErr').textContent=ok?'':'Please correct the highlighted fields.';
if(!ok){const f=document.querySelector('.bad');f&&f.focus()}return ok}
function model(d){const F=[];const add=(n,v,note)=>F.push({n,v,note});
add('Age',Math.max(0,d.age-25)*.03,d.age+' yrs');
add('BMI',d.bmi<25?0:d.bmi<30?.5:d.bmi<35?.9:1.3,'BMI '+d.bmi.toFixed(1));
if(d.glucose!==null){const T={fasting:[100,126,'fasting'],random:[140,200,'random'],ogtt:[140,200,'2-hr OGTT']}[d.gtype];
add('Blood glucose',d.glucose>=T[1]?2.3:d.glucose>=T[0]?1.0:0,d.glucose+' mg/dL ('+T[2]+')')}
if(d.a1c!==null)add('HbA1c',d.a1c>=6.5?2.6:d.a1c>=5.7?1.3:0,d.a1c+' %');
add('Family history',{none:0,distant:.3,close:.8}[d.family],d.family);
add('Physical activity',{low:.5,moderate:0,high:-.3}[d.activity],d.activity);
if(d.sys!==null)add('Blood pressure',d.sys>=140||d.dia>=90?.5:d.sys>=130||d.dia>=80?.25:0,d.sys+'/'+d.dia);
add('Symptoms',d.symptoms.length*.3,d.symptoms.length+' reported');
add('Previous result',d.previous==='prediabetes'?.7:0,d.previous);
add('Pregnancy history',d.preg==='gdm'?.7:d.preg==='pregnant'?.2:0,d.preg);
const z=-4.5+F.reduce((s,f)=>s+f.v,0);let p=1/(1+Math.exp(-z));
const diag=(d.a1c!==null&&d.a1c>=6.5)||(d.glucose!==null&&((d.gtype==='fasting'&&d.glucose>=126)||(d.gtype!=='fasting'&&d.glucose>=200)));
if(diag)p=Math.max(p,.8);
let lvl=p<.15?'Low':p<.4?'Moderate':p<.7?'High':'Very high';
if(d.previous==='diabetes')lvl='Monitoring';
return{p,lvl,F,diag}}
function recs(r,d){const R=[],L=r.lvl;
if(L==='Monitoring'){R.push(['u','Review your care plan','Share these values with your doctor or diabetes team and ask about your personal HbA1c and glucose targets.'],['w','Medicines','Take prescribed medicines exactly as directed. Never change or stop doses without your doctor.'],['','Regular checks','Keep up HbA1c every 3–6 months, plus yearly eye, kidney and foot examinations.'])}
else if(L==='Very high'||r.diag){R.push(['u','See a doctor soon','Your values are in or near the diabetes range. Book an appointment within days for confirmatory tests (repeat fasting glucose / HbA1c).'],['w','About medicine','Only a doctor can decide if medicine (for example metformin) is appropriate. Do not self-medicate.'],['u','Urgent care if unwell','Seek emergency help for vomiting, confusion, deep rapid breathing or extreme thirst.'])}
else if(L==='High'){R.push(['w','Meet your doctor','Arrange a check-up within 2–4 weeks for fasting glucose / HbA1c and a prediabetes assessment.'],['w','Discuss prevention','Ask whether a structured lifestyle programme or medication is suitable for you – this is a medical decision.'])}
else if(L==='Moderate'){R.push(['w','Book a screening test','Have fasting glucose or HbA1c tested within the next few months and repeat yearly.'])}
else R.push(['','Keep it up','Your estimated risk is low. Re-screen every 1–3 years, or sooner if symptoms or weight change.']);
if(d.bmi>=25)R.push(['','Healthy weight','Losing 5–7% of body weight can substantially reduce risk. Aim for gradual, sustainable change.']);
if(d.activity!=='high')R.push(['','Move more','Work towards 150 minutes of brisk activity per week plus 2 strength sessions.']);
R.push(['','Eat well','Favour vegetables, whole grains, pulses and lean protein; limit sugary drinks and refined carbohydrates.']);
if(d.sys!==null&&(d.sys>=130||d.dia>=80))R.push(['w','Blood pressure','Your BP is above the ideal range – have it rechecked and discuss it with your doctor.']);
if(d.symptoms.length)R.push(['w','Symptoms','Symptoms such as '+d.symptoms.join(', ').toLowerCase()+' warrant a medical evaluation.']);
if(d.preg==='pregnant')R.push(['w','Pregnancy','Follow your obstetric team\u2019s glucose screening schedule (usually at 24–28 weeks).']);
if(d.preg==='gdm')R.push(['w','Past gestational diabetes','Get screened for type 2 diabetes every 1–3 years.']);
return R}
function collect(){return{age:num('age'),sex:$('sex').value,height:num('height'),weight:num('weight'),bmi:bmiCalc(),gtype:$('gtype').value,glucose:num('glucose'),a1c:num('a1c'),sys:num('sys'),dia:num('dia'),family:$('family').value,activity:$('activity').value,previous:$('previous').value,preg:$('preg').value,symptoms:[...document.querySelectorAll('[name=sym]:checked')].map(i=>i.value)}}
$('form').addEventListener('submit',e=>{e.preventDefault();if(!validate())return;
const d=collect(),r=model(d),R=recs(r,d);LAST={d,r,R};
const pct=Math.round(r.p*100);$('results').hidden=false;$('pct').textContent=pct+'%';$('lvl').textContent=r.lvl+(r.lvl==='Monitoring'?'':' risk');
const col={Low:'#8fb573',Moderate:'#d9a441',High:'#c47a5a','Very high':'#d9534f',Monitoring:'#9a968c'}[r.lvl];
$('garc').style.stroke=col;$('garc').style.strokeDashoffset=251;requestAnimationFrame(()=>setTimeout(()=>$('garc').style.strokeDashoffset=251*(1-r.p),50));
$('summary').textContent=r.lvl==='Monitoring'?'You reported an existing diabetes diagnosis, so this view focuses on monitoring. The percentage shows how strongly your current values resemble diabetes-range readings.':'Estimated chance that you have, or may develop, diabetes based on the information provided: about '+pct+'%.';
$('alert').hidden=!r.diag;$('alert').textContent='One of your readings is in the diabetes range. This is not a diagnosis – please get it confirmed by a doctor.';
const mx=Math.max(...r.F.map(f=>f.v),.5);
$('factors').innerHTML=r.F.map(f=>`<div class="frow"><span>${f.n}</span><div class="bar"><i style="width:${Math.max(0,f.v)/mx*100}%"></i></div><small>${f.v>0?'+':''}${f.v.toFixed(1)}</small></div>`).join('');
$('recs').innerHTML=R.map(x=>`<div class="rec ${x[0]}"><b>${x[1]}</b><span>${x[2]}</span></div>`).join('');
$('results').scrollIntoView({behavior:'smooth'})});
$('reset').addEventListener('click',()=>setTimeout(()=>{$('results').hidden=true;bmiCalc();togglePreg();validateClear()}));
function validateClear(){document.querySelectorAll('.err').forEach(e=>e.textContent='');document.querySelectorAll('.bad').forEach(e=>e.classList.remove('bad'))}
/* ---------- Download flow ---------- */
$('dlBtn').addEventListener('click',()=>{if(!LAST)return;$('rSex').value=LAST.d.sex==='Other'?'Other':LAST.d.sex;$('rAge').value=LAST.d.age;$('dErr').textContent='';$('dlg').showModal()});
$('dOk').addEventListener('click',e=>{e.preventDefault();const n=$('rName').value.trim(),a=Number($('rAge').value);
if(!n||!a||a<1||a>120){$('dErr').textContent='Please enter a valid name and age.';return}
makePDF({name:n,sex:$('rSex').value,age:a,id:$('rId').value.trim()});$('dlg').close()});
/* ---------- Minimal PDF writer (no dependencies) ---------- */
function makePDF(P){const{d,r,R}=LAST;const pages=[];let cur,y;
const clean=s=>String(s).replace(/[\u2013\u2014]/g,'-').replace(/\u2265/g,'>=').replace(/[\u2018\u2019]/g,"'").replace(/[^\x20-\x7E]/g,'').replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
const col=h=>[1,3,5].map(i=>(parseInt(h.substr(i,2),16)/255).toFixed(3)).join(' ');
const np=()=>{cur=[];pages.push(cur);y=790};
const T=(x,yy,s,z=10,b=0,c='#1a2b22')=>cur.push(`BT /F${b?2:1} ${z} Tf ${col(c)} rg ${x} ${yy} Td (${clean(s)}) Tj ET`);
const B=(x,yy,w,h,c)=>cur.push(`${col(c)} rg ${x} ${yy} ${w} ${h} re f`);
const wrap=(s,z,mw)=>{const o=[];let l='';for(const w of String(s).split(' ')){if((l+' '+w).length*z*.5>mw&&l){o.push(l);l=w}else l=l?l+' '+w:w}o.push(l);return o};
const need=h=>{if(y-h<60)np()};
const H=s=>{need(40);y-=12;T(40,y,s,13,1,'#12281d');y-=6;B(40,y,515,1.2,'#6f8b52');y-=16};
const para=(s,z=10,x=40,mw=515,c,b)=>wrap(s,z,mw).forEach(l=>{need(z+6);T(x,y,l,z,b,c);y-=z+4});
np();B(0,770,595,72,'#12281d');T(40,812,'DiaSense AI - Diabetes Risk Prediction Report',18,1,'#ffffff');T(40,788,'Generated '+new Date().toLocaleString()+'  |  Educational screening aid, not a diagnosis',9,0,'#b8e0c8');y=745;
H('Patient details');[['Name',P.name],['Sex',P.sex],['Age',P.age+' years'],['Patient ID / Phone',P.id||'-']].forEach((k,i)=>{T(40+(i%2)*260,y,k[0]+': ',10,1);T(40+(i%2)*260+(k[0].length*5.6+8),y,k[1],10);if(i%2)y-=16});
H('Result');const lc={Low:'#1f9d6b',Moderate:'#c99200',High:'#e67e22','Very high':'#c0392b',Monitoring:'#5b6b61'}[r.lvl];
B(40,y-34,515,44,'#eef6f0');B(40,y-34,5,44,lc);T(56,y-8,'Estimated risk: '+Math.round(r.p*100)+'%   -   '+r.lvl+(r.lvl==='Monitoring'?'':' risk'),14,1,lc);
B(56,y-26,300,7,'#dbe8de');B(56,y-26,300*r.p,7,lc);y-=54;
if(r.diag)para('NOTICE: One reading is in the diabetes range. Please confirm with a doctor.',10,40,515,'#c0392b',1);
H('Your inputs');const rows=[['BMI',d.bmi.toFixed(1)+' (height '+d.height+' cm, weight '+d.weight+' kg)'],['Blood glucose',d.glucose!==null?d.glucose+' mg/dL ('+d.gtype+')':'Not provided'],['HbA1c',d.a1c!==null?d.a1c+' %':'Not provided'],['Blood pressure',d.sys!==null?d.sys+'/'+d.dia+' mmHg':'Not provided'],['Family history',d.family],['Physical activity',d.activity],['Previous result',d.previous],['Pregnancy history',d.preg==='none'?'Not applicable':d.preg],['Symptoms',d.symptoms.join(', ')||'None reported']];
rows.forEach((k,i)=>{need(18);if(i%2==0)B(40,y-4,515,16,'#f5faf6');T(46,y,k[0],10,1);T(190,y,k[1],10);y-=16});
H('Factors contributing to the estimate');r.F.forEach(f=>{need(16);T(46,y,f.n,10);B(180,y-1,Math.max(1,Math.max(0,f.v)/2.6*200),8,'#6f8b52');T(490,y,(f.v>0?'+':'')+f.v.toFixed(1),10);y-=15});
H('Suggested next steps');R.forEach(x=>{need(34);T(46,y,'- '+x[1],10,1,'#12281d');y-=14;para(x[2],9.5,58,490,'#3d4f44');y-=3});
H('Disclaimer');para('This report is generated by an automated screening tool using self-reported information. It does not diagnose, treat or replace professional medical advice. Diabetes can only be diagnosed by a qualified clinician using laboratory tests. Do not start, stop or change any medicine without consulting your doctor.',9,40,515,'#5b6b61');
/* assemble */
const objs=[];const add=s=>objs.push(s)-1;add('<</Type/Catalog/Pages 2 0 R>>');add('');add('<</Type/Font/Subtype/Type1/BaseFont/Helvetica/Encoding/WinAnsiEncoding>>');add('<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold/Encoding/WinAnsiEncoding>>');
const kids=[];pages.forEach((p,i)=>{p.push(`BT /F1 8 Tf 0.4 0.45 0.43 rg 40 28 Td (DiaSense AI - Diabetes Risk Prediction - Page ${i+1} of ${pages.length}) Tj ET`);const s=p.join('\n');const ci=add(`<</Length ${s.length}>>\nstream\n${s}\nendstream`);const pi=add(`<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 3 0 R/F2 4 0 R>>>>/Contents ${ci+1} 0 R>>`);kids.push((pi+1)+' 0 R')});
objs[1]=`<</Type/Pages/Kids[${kids.join(' ')}]/Count ${pages.length}>>`;
let out='%PDF-1.4\n';const off=[];objs.forEach((o,i)=>{off.push(out.length);out+=`${i+1} 0 obj\n${o}\nendobj\n`});
const xr=out.length;out+=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`+off.map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<</Size ${objs.length+1}/Root 1 0 R>>\nstartxref\n${xr}\n%%EOF`;
const bytes=new Uint8Array(out.length);for(let i=0;i<out.length;i++)bytes[i]=out.charCodeAt(i)&255;
const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));a.download='Diabetes-Risk-Report-'+P.name.replace(/\W+/g,'_')+'.pdf';document.body.appendChild(a);a.click();a.remove()}

