(()=>{const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],g=window.gsap,st=window.ScrollTrigger;
if(g&&st)g.registerPlugin(st);
const nav=$('#nav');const sc=()=>nav.classList.toggle('scrolled',scrollY>40);addEventListener('scroll',sc,{passive:true});sc();
if(g){g.from('.hero .ln>span',{yPercent:115,duration:1.3,ease:'power4.out',stagger:.15});
g.from('.hero .rv',{y:26,opacity:0,duration:1.1,ease:'power4.out',stagger:.12,delay:.45});
if(st)$$('.rvs').forEach(el=>g.from(el,{y:50,opacity:0,duration:1.1,ease:'power4.out',scrollTrigger:{trigger:el,start:'top 90%'}}));
const steps=$$('.step');if(st&&matchMedia('(min-width:761px)').matches)steps.forEach((s,i)=>{if(i<steps.length-1)g.to(s,{scale:.92,filter:'blur(10px)',opacity:.35,ease:'none',scrollTrigger:{trigger:steps[i+1],start:'top 82%',end:'top 24%',scrub:true}})})}
/* card shuffler */
const cards=$$('#shuf .shc');let order=cards.map((_,i)=>i);
function place(anim){order.forEach((ci,pos)=>{const p={y:pos*16,scale:1-pos*.05,opacity:1-pos*.28,zIndex:10-pos};if(g)g.to(cards[ci],{...p,duration:anim?.7:0,ease:'power4.out'});else Object.assign(cards[ci].style,{transform:`translateY(${p.y}px) scale(${p.scale})`,opacity:p.opacity,zIndex:p.zIndex})})}
function shuffle(){order.push(order.shift());place(true)}place(false);let tm=setInterval(shuffle,2800);
const sh=$('#shuf');if(sh){sh.parentElement.addEventListener('mouseenter',()=>{shuffle();clearInterval(tm)});sh.parentElement.addEventListener('mouseleave',()=>{tm=setInterval(shuffle,2800)})}
/* typewriter console */
const con=$('#con'),L=['> loading glucose model ... ok','> reading HbA1c .......... 5.9 %','> BMI ..................... 27.4','> blood pressure .......... 128/82','> family history .......... close','> activity ................ low','> weighting factors ....... done','> risk tier ............... MODERATE','> next step: book screening test'];
let li=0,ci=0,buf=[];function type(){if(!con)return;if(li>=L.length){setTimeout(()=>{li=0;ci=0;buf=[];con.textContent='';type()},2600);return}
const line=L[li];con.textContent=buf.join('\n')+(buf.length?'\n':'')+line.slice(0,ci)+'▌';if(ci<line.length){ci++;setTimeout(type,28)}else{buf.push(line);if(buf.length>7)buf.shift();li++;ci=0;setTimeout(type,420)}}type();
/* cursor glow */
const gl=$('#glow');if(gl)gl.addEventListener('pointermove',e=>{const r=gl.getBoundingClientRect();gl.style.setProperty('--mx',e.clientX-r.left+'px');gl.style.setProperty('--my',e.clientY-r.top+'px')});
})();
