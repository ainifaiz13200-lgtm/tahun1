'use strict';
// All graphics and audio are created locally. No network requests or dependencies.
const $ = id => document.getElementById(id);
const missions = [
 {name:'Bilik Tidur',tip:'Letakkan bantal dan selimut di katil. Simpan mainan di kotaknya.',targets:[['bed','Katil','bed'],['toy','Kotak mainan','chest']],items:[['Bantal','pillow','bed'],['Selimut','blanket','bed'],['Robot','robot','toy'],['Bola','ball','toy']]},
 {name:'Ruang Belajar',tip:'Susun buku di rak buku. Simpan pensel dan pemadam di bekas alat tulis.',targets:[['book','Rak buku','shelf'],['pencil','Bekas alat tulis','pot']],items:[['Buku biru','book','book'],['Buku merah','redbook','book'],['Pensel','pencil','pencil'],['Pemadam','eraser','pencil']]},
 {name:'Pintu Masuk Rumah',tip:'Susun kasut di rak kasut. Masukkan pakaian kotor ke dalam bakul.',targets:[['shoe','Rak kasut','shoerack'],['clothes','Bakul pakaian','basket']],items:[['Kasut biru','shoe','shoe'],['Kasut merah','redshoe','shoe'],['Baju','shirt','clothes'],['Stoking','sock','clothes']]}
];
const questions = [
 {q:'Mengapakah kita perlu mengemas rumah?',a:['Supaya rumah bersih dan selamat.','Supaya barang bertaburan.'],correct:0,feedback:'Betul! Rumah yang kemas lebih bersih, selesa dan selamat.'},
 {q:'Di manakah kita perlu menyimpan mainan selepas bermain?',a:['Di atas lantai.','Di dalam kotak mainan.'],correct:1,feedback:'Bagus! Simpan mainan di dalam kotak selepas bermain.'},
 {q:'Apakah yang perlu kita lakukan selepas menggunakan buku?',a:['Susun semula di rak buku.','Tinggalkan di atas lantai.'],correct:0,feedback:'Tepat! Susun buku di rak supaya mudah dicari dan dijaga.'},
 {q:'Bagaimanakah perasaan kamu apabila berjaya mengemas rumah?',a:['Gembira!','Bangga dengan usaha saya!','Penat, tetapi rumah sudah kemas.'],correct:null,feedback:'Terima kasih berkongsi! Semua perasaan itu boleh diterima. Kamu sudah berusaha menjaga rumah.'}
];
let level=0,score=0,total=0,cleaned=new Set(),selected=null,playing=false,finished=false,soundOn=true,drag=null,questionIndex=0,quizAnswered=false,audioContext;
const positions=[[20,58,-8],[51,69,8],[77,55,7],[78,82,-9]];
// Original pixel shapes are SVG rectangles on a 32 × 24 grid.
function art(type){
 let shapes=''; const r=(x,y,w,h,c)=>{shapes+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;};
 const wood='#a56e3e',dark='#5e422d',blue='#5999b1',red='#cc725c',cream='#fff4cc',green='#6e9d4f';
 switch(type){
 case 'bedempty':case 'bedpillow':case 'bedblanket':case 'bed':r(1,9,30,11,dark);r(2,7,28,11,wood);r(3,8,26,9,'#d8d0ae');if(type==='bed'||type==='bedpillow')r(3,8,10,6,cream);if(type==='bed'||type==='bedblanket'){r(13,8,16,9,green);r(14,9,14,2,'#8cb263');}r(3,18,3,6,dark);r(27,18,3,6,dark);r(1,4,3,13,wood);break;
 case 'chest':r(2,6,28,17,dark);r(3,7,26,14,wood);r(3,7,26,4,'#c49151');r(3,13,26,2,dark);r(14,11,4,7,'#efd568');r(5,17,5,2,'#ba8550');break;
 case 'shelf':case 'shoerack':r(2,1,28,23,dark);r(4,2,24,20,wood);r(4,11,24,2,dark);r(4,20,24,2,dark);if(type==='shelf'){r(6,3,4,8,blue);r(11,4,4,7,red);r(17,2,4,9,green);r(7,15,14,4,cream);}else{r(6,7,8,3,blue);r(18,7,7,3,cream);r(7,16,16,3,red);}break;
 case 'pot':r(7,9,20,15,blue);r(6,8,22,3,'#3b6f86');r(10,0,3,13,'#dfb34c');r(16,2,3,10,red);r(22,0,3,13,green);r(10,15,3,6,'#88b8c7');break;
 case 'basket':r(3,5,26,3,dark);r(5,8,22,15,'#c29462');for(let y=10;y<23;y+=5)for(let x=7;x<26;x+=6)r(x,y,3,2,'#94663f');r(9,1,14,2,dark);r(8,1,2,5,dark);r(22,1,2,5,dark);break;
 case 'pillow':r(2,5,28,15,'#bdbb9e');r(3,3,26,16,cream);r(5,5,21,11,'#fffce9');r(26,5,2,12,'#ded8b4');break;
 case 'blanket':r(4,2,24,21,'#426e48');r(4,2,21,18,'#80a65d');r(7,2,3,18,'#a1bf7a');r(4,12,21,3,'#a1bf7a');break;
 case 'robot':r(7,3,18,8,'#8a9e9a');r(9,5,4,3,'#31585b');r(19,5,4,3,'#31585b');r(10,12,13,8,blue);r(4,12,5,6,wood);r(24,12,5,6,wood);r(10,21,5,3,dark);r(19,21,5,3,dark);r(15,0,2,3,red);r(15,14,3,3,cream);break;
 case 'ball':r(8,1,16,23,'#d0a644');r(3,6,26,13,'#e8bc56');r(8,4,16,17,'#f1cf67');r(14,1,5,23,red);r(4,10,24,5,blue);break;
 case 'book':case 'redbook':r(5,2,23,21,dark);r(7,4,21,17,cream);r(4,1,22,19,type==='book'?blue:red);r(7,2,2,17,type==='book'?'#3b708d':'#a04f43');r(12,6,10,2,cream);r(12,10,7,2,cream);break;
 case 'pencil':r(4,11,20,5,'#e3b64a');r(4,11,20,2,'#f8d778');r(1,11,4,5,red);r(24,11,4,5,'#d3b28a');r(28,12,3,3,dark);break;
 case 'eraser':r(5,5,23,15,'#b85569');r(4,3,23,15,'#ef9aa3');r(17,3,10,15,blue);r(5,15,21,3,'#846e78');break;
 case 'shoe':case 'redshoe':r(4,3,10,15,type==='shoe'?blue:red);r(11,11,15,7,type==='shoe'?blue:red);r(4,18,24,4,cream);r(7,6,5,3,cream);r(14,11,3,6,cream);r(4,21,24,2,dark);break;
 case 'shirt':r(9,2,14,21,blue);r(3,4,6,9,blue);r(23,4,6,9,blue);r(13,2,6,4,cream);r(10,19,12,3,'#3c7087');break;
 case 'sock':r(13,2,12,16,cream);r(5,15,20,8,cream);r(13,2,12,4,red);r(5,17,5,6,red);r(18,16,7,7,red);break;
 }
 return `<svg viewBox="0 0 32 24" shape-rendering="crispEdges" aria-hidden="true">${shapes}</svg>`;
}
function scenery(){
 const canvas=$('scenery'),c=canvas.getContext('2d');
 const rect=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 c.clearRect(0,0,1000,570);rect(0,0,1000,570,'#d6dfb6');rect(0,0,1000,303,'#c6d5a5');
 for(let x=0;x<1000;x+=50){rect(x,0,2,302,'#b6c797');for(let y=20;y<290;y+=54){rect(x+22,y,5,5,'#b4c692');rect(x+18,y+4,13,3,'#b4c692');}}
 rect(0,294,1000,14,'#8a7550');rect(0,308,1000,262,'#c99e68');
 for(let y=310;y<570;y+=44){rect(0,y,1000,3,'#ae8458');for(let x=(y%88?0:85);x<1000;x+=170)rect(x,y,3,44,'#b58b5d');}
 // A window looks out onto a block landscape.
 rect(374,29,252,183,'#8c7149');rect(383,38,234,165,'#a6d8e0');rect(386,127,228,73,'#83b965');
 rect(387,153,228,47,'#64994d');rect(405,113,57,40,'#72a657');rect(466,138,47,40,'#72a657');rect(573,86,23,23,'#ffe9a0');
 rect(405,63,55,13,'#eaf7e7');rect(420,52,26,25,'#eaf7e7');rect(520,79,58,12,'#eaf7e7');
 rect(565,115,8,65,'#8e6d41');rect(543,103,51,32,'#4b8245');rect(550,90,37,20,'#5a914b');
 rect(496,38,8,166,'#8c7149');rect(383,116,234,7,'#8c7149');rect(366,207,268,11,'#a88c5b');
 // Rug, timber shadows and simple bedroom details.
 rect(157,359,686,157,'#947a4e55');rect(150,350,686,157,'#7f9c6d');rect(165,363,655,129,'#a7ba82');rect(179,376,626,102,'#b5c792');
 for(let x=180;x<810;x+=27){rect(x,353,10,5,'#ced9ad');rect(x,495,10,5,'#ced9ad');}
 rect(40,228,48,65,'#9d7950');rect(35,221,58,14,'#b4905e');rect(59,164,8,60,'#70854c');rect(37,175,58,22,'#5d914b');rect(44,156,44,28,'#73a350');
 rect(915,54,53,69,'#997348');rect(921,60,41,56,'#f6e6b1');rect(930,84,24,22,'#88a462');rect(936,73,12,14,'#e5bd62');
 if(level===2){rect(680,20,111,276,'#886440');rect(690,31,91,265,'#a78050');rect(698,45,73,106,'#bc965e');rect(698,165,73,107,'#bc965e');rect(758,159,7,7,'#f4d575');}
 // Original block character, standing beside the rug.
 const x=80,y=377;rect(x+4,y+109,66,13,'#795f3d55');rect(x+17,y,39,41,'#684d36');rect(x+18,y+13,38,29,'#d7a978');rect(x+18,y+8,38,9,'#684d36');rect(x+24,y+22,6,6,'#344b43');rect(x+44,y+22,6,6,'#344b43');rect(x+33,y+32,11,3,'#94673f');rect(x+11,y+42,53,38,'#5c9480');rect(x,y+44,12,40,'#d7a978');rect(x+64,y+44,12,40,'#d7a978');rect(x+14,y+80,20,30,'#49657b');rect(x+41,y+80,20,30,'#49657b');rect(x+10,y+106,24,8,'#4f493e');rect(x+41,y+106,25,8,'#4f493e');
 if(cleaned.size===4 || finished){for(const [x,y] of [[245,310],[850,275],[640,315]]){rect(x,y,5,25,'#fff7c3');rect(x-10,y+10,25,5,'#fff7c3');}}
}
function renderMission(preview=false){
 cleaned.clear();selected=null;cancelDrag();const m=missions[level];
 $('room').classList.toggle('preview',preview);$('preview-bubble').hidden=!preview;$('clean-banner').hidden=true;$('next').hidden=true;
 $('room-title').textContent=preview?'Misi Nilai Bertanggungjawab':m.name;
 $('room-tag').textContent=m.name.toUpperCase();$('mission-count').textContent=`Misi ${level+1} daripada 3`;
 $('targets').innerHTML=m.targets.map(([id,label,icon])=>`<button class="destination" data-target="${id}" aria-label="${label}, 0 daripada 2 barang" ${preview?'disabled':''}>${art(icon==='bed'?'bedempty':icon).replace('<svg','<svg class="art"')}<b>${label}</b><small>0 / 2 barang</small></button>`).join('');
 $('items').innerHTML=m.items.map(([label,icon,target],i)=>`<button class="item" data-item="${i}" data-home="${target}" aria-label="${label}. Pilih kemudian tekan tempat simpanan." aria-pressed="false" style="left:${positions[i][0]}%;top:${positions[i][1]}%;--tilt:${positions[i][2]}deg" ${preview?'disabled':''}>${art(icon)}<span>${label}</span></button>`).join('');
 document.querySelectorAll('#mission-list li').forEach((el,i)=>{el.className=i===level?'active':i<level?'done':'';el.querySelector('span').textContent=i<level?'✓':`0${i+1}`;});
 $('guide-title').textContent=preview?'Jom jadi wira rumah!':`Misi ${level+1}: ${m.name}`;
 $('guide-text').textContent=preview?'Cari barang yang bersepah dan letakkan di tempat yang betul!':m.tip;
 $('mission-heading').textContent=preview?'Tiga misi. Satu wira!':'Jom selesaikan misi!';
 feedback('✋ Seret barang, atau tekan barang kemudian tempat simpanan.');updateProgress();scenery();
}
function updateProgress(){ $('score').innerHTML=`${score} <span>mata</span>`;$('tidy-count').textContent=`${cleaned.size} / 4 barang dikemas`;$('total-count').textContent=`Jumlah: ${total} / 12`;$('progress').value=cleaned.size; }
function feedback(text,kind=''){ $('feedback').textContent=text;$('feedback').className=`feedback ${kind}`; }
function choose(el){if(!playing||cleaned.has(+el.dataset.item))return;selected=+el.dataset.item;document.querySelectorAll('.item').forEach(b=>{b.classList.toggle('selected',b===el);b.setAttribute('aria-pressed',String(b===el));});feedback(`${missions[level].items[selected][0]} dipilih. Tekan tempat simpanan yang betul.`);}
function chime(){if(!soundOn)return;try{audioContext??=new(window.AudioContext||window.webkitAudioContext)();audioContext.resume().catch(()=>{});[523.25,659.25,783.99].forEach((f,i)=>{const o=audioContext.createOscillator(),g=audioContext.createGain(),t=audioContext.currentTime+i*.09;o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.08,t);g.gain.exponentialRampToValueAtTime(.001,t+.23);o.connect(g);g.connect(audioContext.destination);o.start(t);o.stop(t+.24);});}catch(e){/* Sound is optional on devices without Web Audio. */}}
function stars(target){const a=target.getBoundingClientRect(),b=$('room').getBoundingClientRect();for(let i=0;i<6;i++){const star=document.createElement('span');star.className='particle';star.textContent=i%2?'✦':'★';star.style.cssText=`left:${a.left-b.left+a.width/2}px;top:${a.top-b.top+35}px;--dx:${(i-2.5)*25}px`;star.addEventListener('animationend',()=>star.remove(),{once:true});$('particles').append(star);setTimeout(()=>star.remove(),1100);}}
function place(itemIndex,target){
 if(!playing||cleaned.has(itemIndex)||!target)return;
 const item=missions[level].items[itemIndex];
 if(item[2]!==target.dataset.target){feedback('CUBA LAGI! DI MANAKAH TEMPAT YANG BETUL?','retry');const right=document.querySelector(`[data-target="${item[2]}"]`);right.classList.remove('hint');void right.offsetWidth;right.classList.add('hint');return;}
 cleaned.add(itemIndex);total++;score+=10;selected=null;
 const button=document.querySelector(`[data-item="${itemIndex}"]`);button.remove();
 document.querySelectorAll('.item').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-pressed','false');});
 const count=missions[level].items.filter((it,i)=>it[2]===target.dataset.target&&cleaned.has(i)).length;
 target.querySelector('small').textContent=`${count} / 2 barang`;target.setAttribute('aria-label',`${target.querySelector('b').textContent}, ${count} daripada 2 barang`);target.classList.toggle('complete',count===2);
 feedback('TAHNIAH! KAMU BERTANGGUNGJAWAB!','success');chime();stars(target);updateProgress();
 // Update bedding as each piece is placed on the bed.
 if(target.dataset.target==='bed'){const pillow=cleaned.has(0),blanket=cleaned.has(1);target.querySelector('svg').outerHTML=art(pillow&&blanket?'bed':pillow?'bedpillow':'bedblanket').replace('<svg','<svg class="art"');}
 if(count===2)target.querySelector('small').textContent='✓ Sudah dikemas!';
 if(cleaned.size===4){playing=false;$('clean-banner').hidden=false;$('next').hidden=false;$('next').textContent=level===2?'LIHAT KEJAYAAN KAMU ★':'MISI SETERUSNYA ➜';scenery();$('next').focus({preventScroll:true});}
 else {const nextItem=document.querySelector('.item');if(nextItem)nextItem.focus({preventScroll:true});}
}
// Pointer Events use one control path for mouse, pen and touch.
$('items').addEventListener('pointerdown',e=>{const el=e.target.closest('.item');if(!el||!playing||e.button!==0)return;choose(el);drag={el,id:+el.dataset.item,pointer:e.pointerId,x:e.clientX,y:e.clientY,moved:false,left:el.style.left,top:el.style.top};el.setPointerCapture(e.pointerId);});
$('items').addEventListener('pointermove',e=>{if(!drag||drag.pointer!==e.pointerId)return;if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7){drag.moved=true;drag.el.classList.add('dragging');}if(drag.moved){drag.el.style.left=e.clientX+'px';drag.el.style.top=e.clientY+'px';document.querySelectorAll('.destination').forEach(t=>{const r=t.getBoundingClientRect();t.classList.toggle('selected-target',e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom);});}});
function cancelDrag(){if(!drag)return;const d=drag;drag=null;d.el.classList.remove('dragging');d.el.style.left=d.left;d.el.style.top=d.top;try{if(d.el.hasPointerCapture(d.pointer))d.el.releasePointerCapture(d.pointer);}catch(e){}document.querySelectorAll('.selected-target').forEach(el=>el.classList.remove('selected-target'));}
$('items').addEventListener('pointerup',e=>{if(!drag||drag.pointer!==e.pointerId)return;const d=drag,moved=d.moved;const target=moved?document.elementFromPoint(e.clientX,e.clientY)?.closest('.destination'):null;cancelDrag();if(moved){if(target)place(d.id,target);else feedback('Letakkan barang di tempat simpanan. Cuba lagi!');}});
$('items').addEventListener('pointercancel',cancelDrag);$('items').addEventListener('lostpointercapture',cancelDrag);window.addEventListener('blur',cancelDrag);window.addEventListener('resize',cancelDrag);
$('items').addEventListener('click',e=>{const el=e.target.closest('.item');if(el&&playing)choose(el);});
$('targets').addEventListener('click',e=>{const el=e.target.closest('.destination');if(!el||!playing)return;if(selected===null){feedback('Pilih satu barang dahulu. Kemudian tekan tempat simpanan.');return;}place(selected,el);});
function begin(){cancelDrag();level=0;score=0;total=0;finished=false;playing=true;$('result').hidden=true;$('start').hidden=true;$('restart').hidden=false;renderMission();}
$('start').addEventListener('click',begin);$('again').addEventListener('click',()=>{begin();$('room-title').scrollIntoView({block:'center',behavior:'smooth'});});
$('restart').addEventListener('click',()=>{cancelDrag();$('reset-dialog').showModal();});$('cancel-reset').addEventListener('click',()=>$('reset-dialog').close());$('confirm-reset').addEventListener('click',()=>{$('reset-dialog').close();begin();});
$('next').addEventListener('click',()=>{if(cleaned.size!==4)return;if(level<2){level++;playing=true;renderMission();document.querySelector('.item')?.focus({preventScroll:true});}else{finished=true;$('next').hidden=true;$('result').hidden=false;$('final-score').textContent=`${score} mata`;$('mission-list').querySelectorAll('li').forEach(el=>{el.className='done';el.querySelector('span').textContent='✓';});$('guide-title').textContent='Kamu wira rumah!';$('guide-text').textContent='Tiga misi selesai! Jom fikirkan amalan bertanggungjawab setiap hari.';$('result').focus();$('result').scrollIntoView({behavior:'smooth',block:'start'});scenery();}});
$('sound').addEventListener('click',()=>{soundOn=!soundOn;$('sound').setAttribute('aria-pressed',String(soundOn));$('sound').setAttribute('aria-label',soundOn?'Matikan bunyi':'Hidupkan bunyi');$('sound').innerHTML=`${soundOn?'♫':'♪'} <span>Bunyi: ${soundOn?'hidup':'mati'}</span>`;if(soundOn)chime();});
function renderQuestion(){quizAnswered=false;const q=questions[questionIndex];$('quiz-count').textContent=`SOALAN ${questionIndex+1} / 4`;$('question').textContent=q.q;$('answers').innerHTML=q.a.map((a,i)=>`<button data-answer="${i}">${a}</button>`).join('');$('quiz-feedback').textContent='Pilih jawapan kamu.';$('quiz-next').hidden=true;$('quiz-next').textContent=questionIndex===3?'SELESAI ✓':'SETERUSNYA ➜';}
$('review').addEventListener('click',()=>{questionIndex=0;renderQuestion();$('quiz-dialog').showModal();});$('close-quiz').addEventListener('click',()=>$('quiz-dialog').close());
$('answers').addEventListener('click',e=>{const el=e.target.closest('[data-answer]');if(!el||quizAnswered)return;const q=questions[questionIndex];if(q.correct===null||+el.dataset.answer===q.correct){quizAnswered=true;el.classList.add('correct');$('quiz-feedback').textContent=q.feedback;$('quiz-next').hidden=false;chime();}else{$('quiz-feedback').textContent='Teruskan mencuba! Fikirkan cara menjaga barang dengan baik.';}});
$('quiz-next').addEventListener('click',()=>{if(!quizAnswered)return;if(questionIndex<3){questionIndex++;renderQuestion();$('question').setAttribute('tabindex','-1');$('question').focus();}else{$('quiz-dialog').close();document.querySelector('.pledge').scrollIntoView({behavior:'smooth',block:'center'});}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){cancelDrag();selected=null;document.querySelectorAll('.selected').forEach(el=>{el.classList.remove('selected');el.setAttribute('aria-pressed','false');});}});
renderMission(true);
