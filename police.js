// Haptika — police : des lettres faites de traits (comme les traits du pinceau), transformées en vraie police .ttf.
// Chaque lettre est un « squelette » : des lignes et des arcs, que l'on épaissit d'un rayon (la graisse).
// Le même module sert dans l'outil (bouton « Exporter la police ») et en ligne de commande (node).
(function(root){
"use strict";

// ---------------------------------------------------------------- métriques (unités de police, 1000 par em)
// Les coordonnées des squelettes sont celles du CENTRE du trait : baseline 0, hauteur d'x 500, capitales 700.
// La police finale est décalée de r vers le haut pour que le bas des lettres touche la ligne de base.
const UPM=1150, XH=500, CAP=700, ASC=740, DESC=-190;

// ---------------------------------------------------------------- squelettes
// Commandes : M x y (nouveau trait) · L x y · Q x1 y1 x y · C x1 y1 x2 y2 x y · Z (fermer)
//             O cx cy rx ry a0 a1 (arc d'ellipse, degrés, 0 = droite, sens inverse des aiguilles si a1 > a0)
//             D x y (point : i, ponctuation) — y peut valoir « i » (hauteur du point du i)
const G={
  // capitales
  'A':'M0 0 L280 700 L560 0 M100 220 L460 220',
  'B':'M0 360 L0 700 L215 700 O215 530 170 170 90 -90 L0 360 L240 360 O240 180 180 180 90 -90 L0 0 L0 360',
  'C':'O320 350 320 350 42 318',
  'D':'M0 0 L0 700 L200 700 O200 350 330 350 90 -90 L0 0',
  'E':'M440 700 L0 700 L0 0 L440 0 M0 355 L390 355',
  'F':'M440 700 L0 700 L0 0 M0 355 L390 355',
  'G':'O330 350 330 350 45 360 L380 350',
  'H':'M0 0 L0 700 M480 0 L480 700 M0 355 L480 355',
  'I':'M0 0 L0 700',
  'J':'M360 700 L360 210 O180 210 180 210 0 -165',
  'K':'M0 0 L0 700 M440 700 L0 260 M150 410 L460 0',
  'L':'M0 700 L0 0 L400 0',
  'M':'M0 0 L0 700 L300 120 L600 700 L600 0',
  'N':'M0 0 L0 700 L500 0 L500 700',
  'O':'O350 350 350 350 90 450',
  'P':'M0 0 L0 700 L235 700 O235 515 185 185 90 -90 L0 330',
  'Q':'O350 350 350 350 90 450 M420 170 L680 -60',
  'R':'M0 0 L0 700 L235 700 O235 520 180 180 90 -90 L0 340 M230 340 L450 0',
  'S':'O230 528 205 172 28 270 O235 177 225 177 90 -152',
  'T':'M0 700 L520 700 M260 700 L260 0',
  'U':'M0 700 L0 250 O240 250 240 250 180 360 L480 700',
  'V':'M0 700 L270 0 L540 700',
  'W':'M0 700 L180 0 L370 600 L560 0 L740 700',
  'X':'M0 700 L480 0 M0 0 L480 700',
  'Y':'M0 700 L250 340 L500 700 M250 340 L250 0',
  'Z':'M20 700 L470 700 L0 0 L470 0',
  'Œ':'M660 700 L340 700 O340 350 340 350 90 270 L660 0 M340 700 L340 0 M340 355 L620 355',
  'Æ':'M0 0 L380 700 L760 700 M380 700 L380 0 L760 0 M380 355 L710 355 M175 290 L380 290',
  // minuscules
  'a':'O230 250 230 250 0 360 M460 500 L460 0',
  'b':'M0 740 L0 0 O230 250 230 250 180 540',
  'c':'O240 250 240 250 45 315',
  'd':'O230 250 230 250 0 360 M460 740 L460 0',
  'e':'M15 250 L460 250 O240 250 220 250 0 318',
  'f':'M120 0 L120 590 O250 590 130 140 180 35 M0 480 L300 480',
  'g':'O230 250 230 250 0 360 M460 500 L460 0 O230 0 230 190 0 -158',
  'h':'M0 740 L0 0 M0 290 O210 290 210 210 180 0 L420 0',
  'i':'M0 0 L0 500 D0 i',
  'j':'M60 500 L60 -40 O-60 -40 120 140 0 -155 D60 i',
  'k':'M0 740 L0 0 M380 500 L0 200 M130 290 L410 0',
  'l':'M0 740 L0 0',
  'm':'M0 0 L0 500 M0 300 O170 320 170 180 180 0 L340 0 M340 320 O510 320 170 180 180 0 L680 0',
  'n':'M0 0 L0 500 M0 290 O210 290 210 210 180 0 L420 0',
  'o':'O240 250 240 250 90 450',
  'p':'M0 500 L0 -190 O230 250 230 250 180 540',
  'q':'O230 250 230 250 0 360 M460 500 L460 -190',
  'r':'M0 0 L0 500 M0 290 O220 290 220 210 180 72',
  's':'O200 377 180 123 32 270 O205 127 205 127 90 -150',
  't':'M120 690 L120 130 O250 130 130 130 180 290 M0 480 L300 480',
  'u':'M0 500 L0 210 O210 210 210 210 180 360 M420 500 L420 0',
  'v':'M0 500 L220 0 L440 500',
  'w':'M0 500 L160 0 L330 420 L500 0 L660 500',
  'x':'M0 500 L420 0 M0 0 L420 500',
  'y':'M0 500 L225 15 M440 500 L130 -190',
  'z':'M20 500 L400 500 L0 0 L410 0',
  'ı':'M0 0 L0 500',
  'œ':'O220 250 220 250 90 450 M440 250 L860 250 O650 250 210 250 0 318',
  'æ':'O205 250 205 250 0 360 M410 500 L410 0 M410 250 L830 250 O620 250 210 250 0 318',
  'ß':'M0 0 L0 540 O205 540 205 200 180 -12 L240 360 O235 180 200 180 70 -150',
  // chiffres
  '0':'O250 350 250 350 90 450',
  '1':'M40 560 L210 700 L210 0',
  '2':'O230 490 220 210 158 -38 L0 0 L470 0',
  '3':'O220 527 195 173 150 -90 O230 180 230 180 90 -152',
  '4':'M340 0 L340 700 L0 210 L490 210',
  '5':'M430 700 L70 700 L40 390 O245 225 225 225 145 -150',
  '6':'O240 225 240 225 0 360 M8 260 C20 540 170 700 410 700',
  '7':'M0 700 L470 700 L150 0',
  '8':'O230 530 190 170 90 450 O230 180 230 180 90 450',
  '9':'O230 475 230 225 0 360 M472 440 C460 160 310 0 60 0',
  // ponctuation et signes
  ' ':'', ' ':'', ' ':'', ' ':'',
  '.':'D0 0',
  ',':'M20 0 L-30 -140',
  ':':'D0 0 D0 420',
  ';':'D20 420 M20 0 L-30 -140',
  '!':'M0 700 L0 230 D0 0',
  '?':'O200 520 200 180 160 -50 L220 300 L220 220 D220 0',
  '¡':'D0 500 M0 270 L0 -200',
  '¿':'D200 500 M200 280 L200 200 O220 -20 200 180 130 340',
  '\'':'M0 700 L0 540',
  '’':'M30 700 L-10 550',
  '‘':'M-10 550 L30 700',
  '"':'M0 700 L0 540 M150 700 L150 540',
  '“':'M-10 550 L30 700 M140 550 L180 700',
  '”':'M30 700 L-10 550 M180 700 L140 550',
  '-':'M0 300 L260 300',
  '‐':'M0 300 L260 300',
  '–':'M0 300 L500 300',
  '—':'M0 300 L900 300',
  '_':'M0 -150 L520 -150',
  '(':'O400 270 380 510 117 243',
  ')':'O-200 270 380 510 63 -63',
  '[':'M200 740 L0 740 L0 -150 L200 -150',
  ']':'M0 740 L200 740 L200 -150 L0 -150',
  '/':'M0 -120 L380 740',
  '\\':'M380 -120 L0 740',
  '|':'M0 -150 L0 740',
  '«':'M190 430 L40 250 L190 70 M390 430 L240 250 L390 70',
  '»':'M0 430 L150 250 L0 70 M200 430 L350 250 L200 70',
  '‹':'M190 430 L40 250 L190 70',
  '›':'M0 430 L150 250 L0 70',
  '…':'D0 0 D230 0 D460 0',
  '·':'D0 300',
  '•':'D0 300 D0 301',
  '&':'M470 0 L140 430 C60 520 90 700 230 700 C360 700 390 560 300 480 L90 300 C-20 200 30 0 210 0 C320 0 400 80 450 230',
  '@':'O330 300 120 150 0 360 M450 420 L450 220 C450 110 600 100 690 170 O360 300 360 380 -20 290',
  '€':'O380 350 330 350 48 312 M0 420 L400 420 M0 280 L380 280',
  '$':'O230 528 205 172 28 270 O235 177 225 177 90 -152 M235 -90 L235 790',
  '£':'M470 0 L20 0 C120 80 140 200 120 360 C90 560 160 700 300 700 C380 700 430 660 460 610 M0 350 L330 350',
  '%':'M460 700 L40 0 O100 570 100 130 0 360 O400 130 100 130 0 360',
  '#':'M150 0 L210 700 M350 0 L410 700 M40 470 L520 470 M10 230 L490 230',
  '*':'M150 700 L150 460 M46 640 L254 520 M46 520 L254 640',
  '+':'M0 300 L420 300 M210 90 L210 510',
  '=':'M0 390 L420 390 M0 210 L420 210',
  '×':'M0 120 L340 460 M0 460 L340 120',
  '÷':'M0 300 L420 300 D210 480 D210 120',
  '<':'M420 520 L0 300 L420 80',
  '>':'M0 520 L420 300 L0 80',
  '°':'O100 600 100 100 90 450',
  '~':'M0 280 C60 380 130 380 210 300 C290 220 360 220 420 320',
  '^':'M0 420 L180 700 L360 420',
  '§':'O220 560 170 120 30 270 L260 320 O230 180 170 120 90 -150 M120 440 L340 300',
  '²':'O150 650 130 120 160 -40 L0 440 L290 440',
  '³':'O140 670 120 100 150 -90 O145 520 140 105 90 -152',
  '¹':'M30 750 L130 840 L130 440',
};
// lettres accentuées : base + accent (accent dessiné au-dessus de la hauteur d'x ou des capitales)
const ACC={
  aigu:'M-55 0 L65 120', grave:'M-65 120 L55 0', circ:'M-125 0 L0 115 L125 0',
  trema:'D-115 40 D115 40', tilde:'M-140 10 C-90 100 -40 100 0 55 C40 10 90 10 140 100',
  rond:'O0 60 70 70 90 450', caron:'M-125 115 L0 0 L125 115',
};
const COMP={
  'À':'A grave','Á':'A aigu','Â':'A circ','Ã':'A tilde','Ä':'A trema','Å':'A rond',
  'Ç':'C cedille','È':'E grave','É':'E aigu','Ê':'E circ','Ë':'E trema',
  'Ì':'I grave','Í':'I aigu','Î':'I circ','Ï':'I trema','Ñ':'N tilde',
  'Ò':'O grave','Ó':'O aigu','Ô':'O circ','Õ':'O tilde','Ö':'O trema',
  'Ù':'U grave','Ú':'U aigu','Û':'U circ','Ü':'U trema','Ý':'Y aigu','Ÿ':'Y trema','Š':'S caron','Ž':'Z caron',
  'à':'a grave','á':'a aigu','â':'a circ','ã':'a tilde','ä':'a trema','å':'a rond',
  'ç':'c cedille','è':'e grave','é':'e aigu','ê':'e circ','ë':'e trema',
  'ì':'ı grave','í':'ı aigu','î':'ı circ','ï':'ı trema','ñ':'n tilde',
  'ò':'o grave','ó':'o aigu','ô':'o circ','õ':'o tilde','ö':'o trema',
  'ù':'u grave','ú':'u aigu','û':'u circ','ü':'u trema','ý':'y aigu','ÿ':'y trema','š':'s caron','ž':'z caron',
};
const KERN={ 'AV':-80,'AW':-60,'AY':-80,'AT':-70,'Av':-40,'Aw':-30,'Ay':-40,'A’':-60,
  'LT':-90,'LV':-90,'LW':-70,'LY':-90,'Ly':-40,'L’':-90,'LO':-30,
  'TA':-70,'Ta':-100,'Tc':-100,'Te':-100,'To':-100,'Tu':-80,'Tr':-70,'Ty':-70,'Tw':-70,'T,':-90,'T.':-90,
  'VA':-80,'Va':-60,'Ve':-60,'Vo':-60,'V,':-80,'V.':-80,'WA':-60,'Wa':-40,'We':-40,'Wo':-40,
  'YA':-80,'Ya':-80,'Ye':-80,'Yo':-80,'Yu':-60,'Y,':-90,'Y.':-90,
  'FA':-50,'Fa':-40,'F,':-90,'F.':-90,'PA':-60,'Pa':-30,'Pe':-30,'Po':-30,'P,':-100,'P.':-100,
  'rv':0,'r,':-60,'r.':-60,'v,':-50,'v.':-50,'y,':-50,'y.':-50,'f’':40,'ff':-20,
  'L\'':-90,'l’':-20,'d’':-20,'n’':-20 };

// styles de lettre (le rendu chrome se fait ensuite au moment du titre)
const STYLES={
  tube:    {name:'Tube',     r:60, contrast:0,   pen:35, swell:0,   condense:1,    slant:0,  spacing:1},
  liquide: {name:'Liquide',  r:56, contrast:0,   pen:35, swell:1,   condense:1,    slant:0,  spacing:1.1},
  plume:   {name:'Plume',    r:64, contrast:0.9, pen:35, swell:0,   condense:0.92, slant:0,  spacing:1},
  etroite: {name:'Étroite',  r:66, contrast:0,   pen:35, swell:0,   condense:0.72, slant:0,  spacing:0.85},
  italique:{name:'Italique', r:60, contrast:0.3, pen:35, swell:0.4, condense:0.9,  slant:12, spacing:1},
};

// ---------------------------------------------------------------- lecture des squelettes
const STEP=7;   // longueur maximale d'un segment après découpage des courbes
function parse(d,consts){
  const tk=(d||'').match(/[MLQCOZD]|[a-z]+|-?\d*\.?\d+(?:e-?\d+)?/g)||[]; let i=0;
  const num=()=>{ const t=tk[i++]; return /^[a-z]/.test(t) ? consts[t] : +t; };
  const strokes=[]; let cur=null;
  const pt=()=>cur&&cur.p.length?cur.p[cur.p.length-1]:null;
  const add=(x,y)=>{ if(!cur){ cur={p:[],closed:false}; strokes.push(cur); } const q=pt(); if(!q||Math.hypot(q[0]-x,q[1]-y)>1e-6) cur.p.push([x,y]); };
  while(i<tk.length){ const c=tk[i++];
    if(c==='M'){ cur=null; add(num(),num()); }
    else if(c==='L'){ add(num(),num()); }
    else if(c==='D'){ cur=null; add(num(),num()); cur.dot=true; cur=null; }
    else if(c==='Q'){ const p0=pt(), x1=num(),y1=num(),x=num(),y=num(); const n=Math.max(2,Math.ceil((Math.hypot(x1-p0[0],y1-p0[1])+Math.hypot(x-x1,y-y1))/STEP));
      for(let k=1;k<=n;k++){ const t=k/n,u=1-t; add(u*u*p0[0]+2*u*t*x1+t*t*x, u*u*p0[1]+2*u*t*y1+t*t*y); } }
    else if(c==='C'){ const p0=pt(), x1=num(),y1=num(),x2=num(),y2=num(),x=num(),y=num();
      const L=Math.hypot(x1-p0[0],y1-p0[1])+Math.hypot(x2-x1,y2-y1)+Math.hypot(x-x2,y-y2), n=Math.max(2,Math.ceil(L/STEP));
      for(let k=1;k<=n;k++){ const t=k/n,u=1-t; add(u*u*u*p0[0]+3*u*u*t*x1+3*u*t*t*x2+t*t*t*x, u*u*u*p0[1]+3*u*u*t*y1+3*u*t*t*y2+t*t*t*y); } }
    else if(c==='O'){ const cx=num(),cy=num(),rx=num(),ry=num(),a0=num(),a1=num();
      if(Math.abs(a1-a0)>=359.9) cur=null;   // cercle complet : toujours un trait à part
      const n=Math.max(4,Math.ceil(Math.abs(a1-a0)/360*2*Math.PI*Math.max(rx,ry)/STEP));
      for(let k=0;k<=n;k++){ const a=(a0+(a1-a0)*k/n)*Math.PI/180; add(cx+rx*Math.cos(a), cy+ry*Math.sin(a)); }
      if(Math.abs(a1-a0)>=359.9 && cur){ cur.closed=true; cur.p.pop(); cur=null; } }
    else if(c==='Z'){ if(cur){ cur.closed=true; cur=null; } }
    else throw new Error('police : commande inconnue '+c+' dans « '+d+' »');
  }
  return strokes;
}

// ---------------------------------------------------------------- modèle : squelette d'un caractère, avec rayon en chaque point
// rend des traits {p:[[x,y,r],...], closed} déjà posés sur la ligne de base (bas des lettres à y = 0)
function templateBase(ch,style){
  const def=G[ch]; if(def==null) return null;
  const r=style.r, gap=Math.max(42,0.75*r), rdot=r*1.08;
  return transform(parse(def,{ i: XH + r + gap + rdot }).map(s=>withRadius(s,style)),style);
}
// accent du modèle, posé avec son point le plus bas en y = 0 et centré en x = 0 (la cédille, elle, part de y = 30)
function templateAccent(acc,style){
  if(acc==='cedille') return place(parse('M10 30 L10 -40 C80 -40 95 -110 45 -150 L-30 -165',{}).map(s=>withRadius({...s,acc:true},style)),0,style.r);
  const S=parse(ACC[acc],{}).map(s=>withRadius({...s,acc:true},style));
  return place(S,0,-bbox(S)[1]);
}
const ACCHAR={aigu:'\u00b4',grave:'`',circ:'\u02c6',trema:'\u00a8',tilde:'\u02dc',rond:'\u02da',caron:'\u02c7',cedille:'\u00b8'};
for(const c of Object.values(ACCHAR)) if(G[c]===undefined) G[c]=null;   // accents seuls : dessinables, sinon pris au modèle
function withRadius(s,style){
  const r0=style.r*(s.dot?1.08:s.acc?0.92:1), c=style.contrast||0, pen=(style.pen||35)*Math.PI/180, sw=style.swell||0;
  const P=s.p, n=P.length;
  if(n===1) return {p:[[P[0][0],P[0][1],r0*(1+0.15*sw)]],closed:false};
  const L=[0]; for(let i=1;i<n;i++) L.push(L[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
  const tot=L[n-1];
  const out=P.map((q,i)=>{
    let r=r0;
    if(c>0){ const a=P[Math.max(0,i-1)], b=P[Math.min(n-1,i+1)];
      let dx=b[0]-a[0], dy=b[1]-a[1]; if(s.closed&&(i===0||i===n-1)){ const a2=P[n-1],b2=P[1]; dx=b2[0]-a2[0]; dy=b2[1]-a2[1]; }
      const th=Math.atan2(dy,dx), k=Math.abs(Math.sin(th-pen));
      r*=1-c+c*(0.28+0.92*k); }
    if(sw>0 && !s.closed){ const e=Math.min(L[i],tot-L[i]), w=Math.exp(-Math.pow(e/(1.5*r0),2));
      r*=1+sw*(0.42*w-0.1*(1-w)); }
    return [q[0],q[1],r]; });
  return {p:out, closed:s.closed};
}
// étire, penche, et décale de r pour poser la lettre sur la ligne de base
function transform(S,style){
  const k=style.condense||1, sl=Math.tan((style.slant||0)*Math.PI/180), r=style.r;
  return S.map(s=>({closed:s.closed, p:s.p.map(q=>{ const y=q[1]+r; return [q[0]*k + (y-CAP/2)*sl, y, q[2]]; })}));
}
function bbox(S){ const b=[Infinity,Infinity,-Infinity,-Infinity];
  for(const s of S) if(!s.erase) for(const q of s.p){ const r=q[2]; b[0]=Math.min(b[0],q[0]-r); b[1]=Math.min(b[1],q[1]-r); b[2]=Math.max(b[2],q[0]+r); b[3]=Math.max(b[3],q[1]+r); }
  return b; }
function place(S,dx,dy){ return (dx||dy) ? S.map(s=>({...s,p:s.p.map(q=>[q[0]+dx,q[1]+dy,q[2]])})) : S; }
// lignes de guidage (bas, hauteur d'x, capitales, hampes, jambages) pour une graisse r
function guides(r=60){ return {base:0, xh:XH+2*r, cap:CAP+2*r, asc:ASC+2*r, desc:DESC}; }

// ---------------------------------------------------------------- assemblage d'un caractère
// ctx = { drawn:{ch: traits dessinés {p:[[x,y,r]],closed,erase}}, template:bool, style }
// rend la liste des pièces : {drawn:ch, S, dx, dy} (lettre dessinée) ou {S, dx, dy} (modèle) ; null si rien
function partsOf(ch,ctx){
  const D=ctx.drawn||{}, st=ctx.style;
  if(D[ch] && D[ch].length) return [{drawn:ch, S:D[ch], dx:0, dy:0}];
  if(ch==='\u0131' && D['i']){   // i sans point : le i dessiné, sans son point
    const lim=guides(st.r).xh*0.92, S=D['i'].filter(s=>bbox([s])[1]<lim);
    if(S.length) return [{S, dx:0, dy:0}]; }
  if(COMP[ch]){
    const [base,acc]=COMP[ch].split(' ');
    const B=partsOf(base,ctx); if(!B) return null;
    const bb=bbox([].concat(...B.map(p=>place(p.S,p.dx,p.dy))));
    let cx=(bb[0]+bb[2])/2; if(base==='C'||base==='G') cx-=10;
    const ac=ACCHAR[acc], gap=Math.max(42,0.75*st.r), upper=base!==base.toLowerCase();
    const isDrawn=!!(D[ac] && D[ac].length), A=isDrawn ? D[ac] : templateAccent(acc,st);
    const ab=bbox(A), acx=(ab[0]+ab[2])/2;
    let dy;
    if(acc==='cedille') dy = isDrawn ? 0 : 0;
    else if(isDrawn && !upper) dy=Math.max(0,bb[3]+gap-ab[1]);   // accent dessiné : à sa place, relevé s'il touche la lettre
    else dy=bb[3]+gap-ab[1];
    const part={S:A, dx:cx-acx, dy}; if(isDrawn) part.drawn=ac;
    return [...B, part];
  }
  if(ctx.template!==false && G[ch]!==undefined){
    if(G[ch]===null){ const acc=Object.keys(ACCHAR).find(k=>ACCHAR[k]===ch), A=templateAccent(acc,st), ab=bbox(A);
      return [{S:A, dx:-(ab[0]+ab[2])/2, dy:acc==='cedille'?0:guides(st.r).xh+Math.max(42,0.75*st.r)-ab[1]}]; }
    const S=templateBase(ch,st); return S&&S.length?[{S,dx:0,dy:0}]:null; }
  return null;
}
// ---------------------------------------------------------------- contour : champ de distance + marching squares
const RES=2;   // unités de police par cellule de calcul
function outline(S){
  let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
  for(const s of S) if(!s.erase) for(const q of s.p){ x0=Math.min(x0,q[0]-q[2]); y0=Math.min(y0,q[1]-q[2]); x1=Math.max(x1,q[0]+q[2]); y1=Math.max(y1,q[1]+q[2]); }
  if(x0===Infinity) return [];
  x0=Math.floor(x0/RES)*RES-3*RES; y0=Math.floor(y0/RES)*RES-3*RES;
  const W=Math.ceil((x1-x0)/RES)+4, H=Math.ceil((y1-y0)/RES)+4;
  const F=new Float32Array(W*H).fill(-1e9);
  let erase=false;
  const seg=(ax,ay,ar,bx,by,br)=>{
    const m=Math.max(ar,br)+2*RES;
    const i0=Math.max(0,Math.floor((Math.min(ax,bx)-m-x0)/RES)), i1=Math.min(W-1,Math.ceil((Math.max(ax,bx)+m-x0)/RES));
    const j0=Math.max(0,Math.floor((Math.min(ay,by)-m-y0)/RES)), j1=Math.min(H-1,Math.ceil((Math.max(ay,by)+m-y0)/RES));
    const dx=bx-ax, dy=by-ay, l2=dx*dx+dy*dy;
    for(let j=j0;j<=j1;j++){ const py=y0+j*RES; for(let i=i0;i<=i1;i++){ const px=x0+i*RES;
      let t=l2>0?((px-ax)*dx+(py-ay)*dy)/l2:0; t=t<0?0:t>1?1:t;
      const ex=px-ax-dx*t, ey=py-ay-dy*t, v=ar+(br-ar)*t-Math.sqrt(ex*ex+ey*ey), o=j*W+i;
      if(erase){ if(-v<F[o]) F[o]=-v; } else if(v>F[o]) F[o]=v; } } };
  for(const s of S){ const p=s.p; erase=!!s.erase;
    if(p.length===1) seg(p[0][0],p[0][1],p[0][2],p[0][0],p[0][1],p[0][2]);
    for(let i=1;i<p.length;i++) seg(p[i-1][0],p[i-1][1],p[i-1][2],p[i][0],p[i][1],p[i][2]);
    if(s.closed&&p.length>2){ const a=p[p.length-1],b=p[0]; seg(a[0],a[1],a[2],b[0],b[1],b[2]); } }
  // marching squares : chaque segment laisse l'intérieur à sa gauche ; il va d'une « sortie » à une « entrée »
  const V=(i,j)=>F[j*W+i];
  const next=new Map(), pos=new Map();
  // arêtes : 0 bas (i,j)-(i+1,j) · 1 droite (i+1,j)-(i+1,j+1) · 2 haut (i,j+1)-(i+1,j+1) · 3 gauche (i,j)-(i,j+1)
  const eid=(i,j,e)=> e===0?((j*W+i)*2) : e===1?((j*W+i+1)*2+1) : e===2?(((j+1)*W+i)*2) : ((j*W+i)*2+1);
  const ept=(i,j,e)=>{ let a,b,ax,ay,bx,by;
    if(e===0){ a=V(i,j); b=V(i+1,j); ax=i;ay=j;bx=i+1;by=j; } else if(e===1){ a=V(i+1,j); b=V(i+1,j+1); ax=i+1;ay=j;bx=i+1;by=j+1; }
    else if(e===2){ a=V(i,j+1); b=V(i+1,j+1); ax=i;ay=j+1;bx=i+1;by=j+1; } else { a=V(i,j); b=V(i,j+1); ax=i;ay=j;bx=i;by=j+1; }
    const t=a/(a-b); return [x0+(ax+(bx-ax)*t)*RES, y0+(ay+(by-ay)*t)*RES]; };
  for(let j=0;j<H-1;j++) for(let i=0;i<W-1;i++){
    const c=[V(i,j)>0,V(i+1,j)>0,V(i+1,j+1)>0,V(i,j+1)>0];
    if(c[0]===c[1]&&c[1]===c[2]&&c[2]===c[3]) continue;
    // tour du carré dans le sens inverse des aiguilles : c0 →e0→ c1 →e1→ c2 →e2(inversée)→ c3 →e3(inversée)→ c0
    const walk=[[0,0,1],[1,1,2],[2,2,3],[3,3,0]];   // [arête, coin avant, coin après]
    const ex=[], en=[];
    for(const [e,ca,cb] of walk){ if(c[ca]&&!c[cb]) ex.push(e); else if(!c[ca]&&c[cb]) en.push(e); }
    const order=[0,1,2,3];
    const after=(e,list)=>{ for(let s=1;s<=4;s++){ const f=order[(e+s)%4]; if(list.includes(f)) return f; } };
    const before=(e,list)=>{ for(let s=1;s<=4;s++){ const f=order[(e-s+8)%4]; if(list.includes(f)) return f; } };
    let pairs;
    if(ex.length===1) pairs=[[ex[0],en[0]]];
    else { const ctr=(V(i,j)+V(i+1,j)+V(i+1,j+1)+V(i,j+1))/4>0;
      pairs = ctr ? ex.map(e=>[e,after(e,en)]) : ex.map(e=>[e,before(e,en)]); }
    for(const [a,b] of pairs){ const ka=eid(i,j,a), kb=eid(i,j,b);
      next.set(ka,kb); if(!pos.has(ka)) pos.set(ka,ept(i,j,a)); if(!pos.has(kb)) pos.set(kb,ept(i,j,b)); }
  }
  const loops=[], seen=new Set();
  for(const k0 of next.keys()){ if(seen.has(k0)) continue;
    const L=[]; let k=k0;
    while(k!==undefined && !seen.has(k)){ seen.add(k); L.push(pos.get(k)); k=next.get(k); }
    if(L.length>=3) loops.push(L); }
  return loops;
}
// simplification (Ramer-Douglas-Peucker) d'un contour fermé
function rdp(P,tol){
  if(P.length<4) return P;
  const keep=new Uint8Array(P.length);
  const Q=P.concat([P[0]]);
  const rec=(a,b)=>{ const [ax,ay]=Q[a],[bx,by]=Q[b]; const dx=bx-ax,dy=by-ay,l=Math.hypot(dx,dy)||1e-9; let m=0,mi=-1;
    for(let i=a+1;i<b;i++){ const d=Math.abs((Q[i][0]-ax)*dy-(Q[i][1]-ay)*dx)/l; if(d>m){m=d;mi=i;} }
    if(m>tol){ keep[mi%P.length]=1; rec(a,mi); rec(mi,b); } };
  let far=0,fd=0; for(let i=1;i<P.length;i++){ const d=Math.hypot(P[i][0]-P[0][0],P[i][1]-P[0][1]); if(d>fd){fd=d;far=i;} }
  keep[0]=keep[far]=1; rec(0,far); rec(far,P.length);
  return P.filter((_,i)=>keep[i]);
}
const area=P=>{ let s=0; for(let i=0;i<P.length;i++){ const a=P[i],b=P[(i+1)%P.length]; s+=a[0]*b[1]-b[0]*a[1]; } return s/2; };
function inside(pt,P){ let c=false; for(let i=0,j=P.length-1;i<P.length;j=i++){ const a=P[i],b=P[j];
  if((a[1]>pt[1])!==(b[1]>pt[1]) && pt[0]<(b[0]-a[0])*(pt[1]-a[1])/(b[1]-a[1])+a[0]) c=!c; } return c; }
// contours finaux, en entiers, orientés pour TrueType (extérieurs dans le sens des aiguilles d'une montre)
function contours(S,tol=0.45){
  let loops=outline(S).map(L=>rdp(L,tol));
  loops=loops.map(L=>{ const o=[]; for(const q of L){ const p=[Math.round(q[0]),Math.round(q[1])]; const l=o[o.length-1]; if(!l||l[0]!==p[0]||l[1]!==p[1]) o.push(p); }
    while(o.length>1 && o[0][0]===o[o.length-1][0] && o[0][1]===o[o.length-1][1]) o.pop(); return o; })
    .filter(L=>L.length>=3 && Math.abs(area(L))>4);
  return loops.map((L,i)=>{ let depth=0; for(let j=0;j<loops.length;j++) if(j!==i && inside(L[0],loops[j])) depth++;
    const a=area(L), wantCW = depth%2===0; return (wantCW ? a>0 : a<0) ? L.slice().reverse() : L; });
}

// ---------------------------------------------------------------- toute la police
// graisse typique des lettres dessinées : les lettres prises au modèle s'y accordent
function drawnWeight(drawn){ const r=[]; for(const S of Object.values(drawn||{})) for(const s of S) if(!s.erase) for(const q of s.p) r.push(q[2]);
  if(!r.length) return null; r.sort((a,b)=>a-b); return r[Math.floor(r.length/2)]; }
function context(opt){
  const drawn=opt.drawn||{}, w=opt.weight||drawnWeight(drawn);
  const style={...STYLES.tube,...(opt.style||{})}; if(w && !(opt.style&&opt.style.r)) style.r=w;
  const sb = opt.spacing!=null ? opt.spacing : Math.round((0.42*style.r+26)*(style.spacing||1));
  return {drawn, template:opt.template!==false, style, sb, cache:{}};
}
function charList(drawn){
  const s=new Set([...Object.keys(G),...Object.keys(COMP),...Object.keys(drawn||{})]);
  return [...s].sort((a,b)=>a.codePointAt(0)-b.codePointAt(0));
}
const SPACES={' ':250,'\u00a0':250,'\u202f':130,'\u2009':130};
function glyphFor(ch,ctx){
  if(ctx.cache[ch]!==undefined) return ctx.cache[ch];
  let g=null;
  if(SPACES[ch]) g={ch, C:[], adv:Math.round(SPACES[ch]*(0.6+0.4*ctx.style.r/60)), parts:[], shift:0};
  else { const P=partsOf(ch,ctx);
    if(P){ const S=[].concat(...P.map(p=>place(p.S,p.dx,p.dy)));
      if(S.length){ const C=contours(S);
        if(C.length){ let x0=Infinity,x1=-Infinity; for(const L of C) for(const q of L){ x0=Math.min(x0,q[0]); x1=Math.max(x1,q[0]); }
          const shift=ctx.sb-x0;
          g={ch, C:C.map(L=>L.map(q=>[q[0]+shift,q[1]])), adv:Math.round(x1-x0+2*ctx.sb), parts:P, shift}; } } } }
  ctx.cache[ch]=g; return g;
}
const BASE=ch=>COMP[ch]?COMP[ch].split(' ')[0]:ch;
function kernValue(a,b){ const k=KERN[a+b]??KERN[BASE(a)+BASE(b)]; return k||0; }
// opt : { drawn, template, style, spacing, family, styleName }
function buildFont(opt={}){
  const ctx=context(opt);
  const glyphs=[]; for(const ch of charList(ctx.drawn)){ const g=glyphFor(ch,ctx); if(g) glyphs.push(g); }
  return {style:ctx.style, glyphs, family:opt.family||'KRFT Titre', styleName:opt.styleName||'Regular',
    drawnCount:glyphs.filter(g=>g.parts.length && g.parts.every(p=>p.drawn)).length};
}

// ---------------------------------------------------------------- mise en page (pour écrire dans la toile de Haptika)
// rend les pièces {drawn:ch | S, dx, dy} placées en unités de police (ligne de base en y = 0)
function layout(text,opt={}){
  const ctx=opt.ctx||context(opt); let x=0, y=0, prev=null; const out=[];
  const lh=guides(ctx.style.r).cap*1.45;
  for(const ch of text){
    if(ch==='\n'){ x=0; y-=lh; prev=null; continue; }
    const g=glyphFor(ch,ctx);
    if(!g){ x+=200; prev=null; continue; }
    if(prev) x+=kernValue(prev,ch);
    for(const p of g.parts) out.push({...p, dx:p.dx+x+g.shift, dy:p.dy+y});
    x+=g.adv; prev=ch; }
  return {parts:out, width:x, ctx};
}

// ---------------------------------------------------------------- écriture du fichier .ttf
function writeTTF(font){
  const {glyphs,family,styleName,style}=font;
  const notdef={ch:null,adv:500,C:[[[50,0],[50,700],[450,700],[450,0]],[[100,50],[400,50],[400,650],[100,650]]]};
  // contour intérieur du .notdef dans l'autre sens
  const all=[notdef,...glyphs];
  // --- glyf / loca
  const enc=[]; const loca=[0]; let total=0, maxPts=0, maxCtr=0;
  let gx0=Infinity,gy0=Infinity,gx1=-Infinity,gy1=-Infinity, minL=Infinity,minR=Infinity,maxExt=-Infinity, advMax=0;
  const bboxes=[];
  for(const g of all){
    // TrueType : extérieur dans le sens des aiguilles d'une montre. Le .notdef est déjà construit ainsi.
    const C=g.C; let b=null;
    if(C.length){
      let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
      for(const L of C) for(const q of L){ x0=Math.min(x0,q[0]); y0=Math.min(y0,q[1]); x1=Math.max(x1,q[0]); y1=Math.max(y1,q[1]); }
      b=[x0,y0,x1,y1]; gx0=Math.min(gx0,x0); gy0=Math.min(gy0,y0); gx1=Math.max(gx1,x1); gy1=Math.max(gy1,y1);
      minL=Math.min(minL,x0); minR=Math.min(minR,g.adv-x1); maxExt=Math.max(maxExt,x1);
      const flags=[], xs=[], ys=[], ends=[]; let px=0,py=0,n=0;
      for(const L of C){ for(const q of L){ const dx=q[0]-px, dy=q[1]-py; px=q[0]; py=q[1]; let f=1;
          if(dx===0) f|=0x10; else if(Math.abs(dx)<256){ f|=0x02|(dx>0?0x10:0); xs.push(['B',Math.abs(dx)]); } else xs.push(['W',dx]);
          if(dy===0) f|=0x20; else if(Math.abs(dy)<256){ f|=0x04|(dy>0?0x20:0); ys.push(['B',Math.abs(dy)]); } else ys.push(['W',dy]);
          flags.push(f); n++; }
        ends.push(n-1); }
      maxPts=Math.max(maxPts,n); maxCtr=Math.max(maxCtr,C.length);
      const len=10+2*ends.length+2+flags.length+xs.reduce((s,v)=>s+(v[0]==='B'?1:2),0)+ys.reduce((s,v)=>s+(v[0]==='B'?1:2),0);
      const buf=new DataView(new ArrayBuffer(len+((4-len%4)%4))); let o=0;
      buf.setInt16(o,C.length); o+=2; for(const v of b){ buf.setInt16(o,v); o+=2; }
      for(const e of ends){ buf.setUint16(o,e); o+=2; } buf.setUint16(o,0); o+=2;
      for(const f of flags) buf.setUint8(o++,f);
      for(const [t,v] of xs){ if(t==='B') buf.setUint8(o++,v); else { buf.setInt16(o,v); o+=2; } }
      for(const [t,v] of ys){ if(t==='B') buf.setUint8(o++,v); else { buf.setInt16(o,v); o+=2; } }
      enc.push(new Uint8Array(buf.buffer)); total+=buf.byteLength;
    } else enc.push(new Uint8Array(0));
    bboxes.push(b); advMax=Math.max(advMax,g.adv); loca.push(total);
  }
  const glyf=concat(enc);
  const locaT=new DataView(new ArrayBuffer(loca.length*4)); loca.forEach((v,i)=>locaT.setUint32(i*4,v));
  // --- métriques verticales
  const r=style.r, capH=CAP+2*r, xH=XH+2*r;
  const asc=Math.max(gy1, capH+40), desc=Math.min(gy0, DESC-r);
  // --- head
  const head=new DataView(new ArrayBuffer(54));
  head.setUint32(0,0x00010000); head.setUint32(4,0x00010000); head.setUint32(8,0); head.setUint32(12,0x5F0F3CF5);
  head.setUint16(16,0x000B); head.setUint16(18,UPM);
  const secs=Math.floor(Date.UTC(2026,10,25)/1000)+2082844800; head.setUint32(20,0); head.setUint32(24,secs); head.setUint32(28,0); head.setUint32(32,secs);
  head.setInt16(36,gx0); head.setInt16(38,gy0); head.setInt16(40,gx1); head.setInt16(42,gy1);
  head.setUint16(44,0); head.setUint16(46,8); head.setInt16(48,2); head.setInt16(50,1); head.setInt16(52,0);
  // --- hhea
  const hhea=new DataView(new ArrayBuffer(36));
  hhea.setUint32(0,0x00010000); hhea.setInt16(4,asc); hhea.setInt16(6,desc); hhea.setInt16(8,0);
  hhea.setUint16(10,advMax); hhea.setInt16(12,minL===Infinity?0:minL); hhea.setInt16(14,minR===Infinity?0:minR); hhea.setInt16(16,maxExt===-Infinity?0:maxExt);
  hhea.setInt16(18,1); hhea.setInt16(20,0); hhea.setInt16(22,0); hhea.setInt16(34,all.length);
  if(style.slant){ hhea.setInt16(18,1000); hhea.setInt16(20,Math.round(1000*Math.tan(style.slant*Math.PI/180))); }
  // --- hmtx
  const hmtx=new DataView(new ArrayBuffer(all.length*4));
  all.forEach((g,i)=>{ hmtx.setUint16(i*4,g.adv); hmtx.setInt16(i*4+2,bboxes[i]?bboxes[i][0]:0); });
  // --- maxp
  const maxp=new DataView(new ArrayBuffer(32));
  maxp.setUint32(0,0x00010000); maxp.setUint16(4,all.length); maxp.setUint16(6,maxPts); maxp.setUint16(8,maxCtr); maxp.setUint16(14,2);
  // --- cmap (format 4)
  const map=[]; all.forEach((g,i)=>{ if(g.ch!==null) map.push([g.ch.codePointAt(0),i]); }); map.sort((a,b)=>a[0]-b[0]);
  const segs=[]; for(const [c,gid] of map){ const s=segs[segs.length-1];
    if(s && c===s.end+1 && gid===s.gid0+(c-s.start)) s.end=c; else segs.push({start:c,end:c,gid0:gid}); }
  segs.push({start:0xFFFF,end:0xFFFF,gid0:0});   // dernier segment obligatoire → glyphe 0
  const sc=segs.length, f4len=16+sc*8;
  const cmap=new DataView(new ArrayBuffer(12+f4len));
  cmap.setUint16(0,0); cmap.setUint16(2,1); cmap.setUint16(4,3); cmap.setUint16(6,1); cmap.setUint32(8,12);
  let o=12; const sr=2*Math.pow(2,Math.floor(Math.log2(sc)));
  cmap.setUint16(o,4); cmap.setUint16(o+2,f4len); cmap.setUint16(o+4,0); cmap.setUint16(o+6,sc*2);
  cmap.setUint16(o+8,sr); cmap.setUint16(o+10,Math.log2(sr/2)); cmap.setUint16(o+12,sc*2-sr); o+=14;
  segs.forEach((s,i)=>cmap.setUint16(o+i*2,s.end)); o+=sc*2; cmap.setUint16(o,0); o+=2;
  segs.forEach((s,i)=>cmap.setUint16(o+i*2,s.start)); o+=sc*2;
  segs.forEach((s,i)=>cmap.setUint16(o+i*2,(s.gid0-s.start+65536)%65536)); o+=sc*2;
  segs.forEach((s,i)=>cmap.setUint16(o+i*2,0));
  // --- kern (format 0)
  const gidOf=new Map(map.map(([c,g])=>[c,g])); const pairs=[];
  const chars=glyphs.map(g=>g.ch);
  for(const a of chars) for(const b of chars){ const v=kernValue(a,b); if(v) pairs.push([gidOf.get(a.codePointAt(0)),gidOf.get(b.codePointAt(0)),v]); }
  pairs.sort((p,q)=>p[0]-q[0]||p[1]-q[1]);
  const np=pairs.length, kern=new DataView(new ArrayBuffer(4+14+np*6));
  kern.setUint16(0,0); kern.setUint16(2,1); kern.setUint16(4,0); kern.setUint16(6,14+np*6); kern.setUint16(8,0x0001);
  kern.setUint16(10,np); const ksr=np?6*Math.pow(2,Math.floor(Math.log2(np))):0;
  kern.setUint16(12,ksr); kern.setUint16(14,np?Math.floor(Math.log2(np)):0); kern.setUint16(16,np*6-ksr);
  pairs.forEach((p,i)=>{ kern.setUint16(18+i*6,p[0]); kern.setUint16(20+i*6,p[1]); kern.setInt16(22+i*6,p[2]); });
  // --- OS/2 v4
  const os2=new DataView(new ArrayBuffer(96));
  const avg=Math.round(glyphs.reduce((s,g)=>s+g.adv,0)/Math.max(1,glyphs.length));
  const weight=Math.max(100,Math.min(900,Math.round((r/60*700)/100)*100));
  os2.setUint16(0,4); os2.setInt16(2,avg); os2.setUint16(4,weight); os2.setUint16(6,style.condense<0.8?3:style.condense<0.95?4:5); os2.setUint16(8,0);
  [650,600,0,75,650,600,0,350].forEach((v,i)=>os2.setInt16(10+i*2,v)); os2.setInt16(26,Math.round(r*1.2)); os2.setInt16(28,Math.round(xH/2));
  os2.setInt16(30,0); // panose (32..41) laissé à 0
  os2.setUint32(42,0x80000003); os2.setUint32(46,0x00000002); os2.setUint32(50,0); os2.setUint32(54,0);
  'KRFT'.split('').forEach((c,i)=>os2.setUint8(58+i,c.charCodeAt(0)));
  os2.setUint16(62,(style.slant?0x01:0)|(weight>=700?0x20:0)|(!style.slant&&weight<700?0x40:0)|0x80);
  os2.setUint16(64,map[0][0]); os2.setUint16(66,Math.min(0xFFFF,map[map.length-1][0]));
  os2.setInt16(68,asc); os2.setInt16(70,desc); os2.setInt16(72,200);
  os2.setUint16(74,Math.max(asc,gy1)); os2.setUint16(76,Math.max(-desc,-gy0));
  os2.setUint32(78,0x00000001); os2.setUint32(82,0);
  os2.setInt16(86,xH); os2.setInt16(88,capH); os2.setUint16(90,0); os2.setUint16(92,32); os2.setUint16(94,2);
  // --- name
  const ps=(family+'-'+styleName).normalize('NFD').replace(/[^\x21-\x7e]/g,'').replace(/[\[\](){}<>\/%]/g,'');
  const names=[[1,family],[2,'Regular'],[3,'KRFT;'+ps+';1.0'],[4,family+' '+styleName],[5,'Version 1.000'],[6,ps],
    [9,'Antoine — Haptika'],[16,family],[17,styleName]];
  // nom 2 « Regular » + famille « famille style » pour que Windows l'installe comme une police à part
  names[0][1]=family+' '+styleName; names[7][1]=family; names[8][1]=styleName;
  const recs=names.map(([id,s])=>{ const b=new Uint8Array(s.length*2); for(let i=0;i<s.length;i++){ const c=s.charCodeAt(i); b[i*2]=c>>8; b[i*2+1]=c&255; } return [id,b]; });
  const nlen=6+recs.length*12+recs.reduce((s,[,b])=>s+b.length,0);
  const name=new DataView(new ArrayBuffer(nlen)); name.setUint16(0,0); name.setUint16(2,recs.length); name.setUint16(4,6+recs.length*12);
  let so=0; recs.forEach(([id,b],i)=>{ const q=6+i*12; name.setUint16(q,3); name.setUint16(q+2,1); name.setUint16(q+4,0x409); name.setUint16(q+6,id);
    name.setUint16(q+8,b.length); name.setUint16(q+10,so); new Uint8Array(name.buffer).set(b,6+recs.length*12+so); so+=b.length; });
  // --- post v3
  const post=new DataView(new ArrayBuffer(32)); post.setUint32(0,0x00030000);
  post.setInt32(4,Math.round(-(style.slant||0)*65536)); post.setInt16(8,-120); post.setInt16(10,Math.round(r*0.8));
  // --- assemblage
  const tables={'OS/2':os2,'cmap':cmap,'glyf':glyf,'head':head,'hhea':hhea,'hmtx':hmtx,'kern':kern,'loca':locaT,'maxp':maxp,'name':name,'post':post};
  const tags=Object.keys(tables).sort();
  const nt=tags.length, hdr=12+16*nt; let off=hdr;
  const parts=tags.map(t=>{ const d=tables[t]; const u=d instanceof Uint8Array?d:new Uint8Array(d.buffer); const pad=(4-u.length%4)%4;
    const p={t,u,off,len:u.length,pad}; off+=u.length+pad; return p; });
  const outB=new Uint8Array(off), dv=new DataView(outB.buffer);
  const esr=Math.pow(2,Math.floor(Math.log2(nt)));
  dv.setUint32(0,0x00010000); dv.setUint16(4,nt); dv.setUint16(6,esr*16); dv.setUint16(8,Math.log2(esr)); dv.setUint16(10,nt*16-esr*16);
  parts.forEach((p,i)=>{ outB.set(p.u,p.off); const q=12+i*16;
    for(let k=0;k<4;k++) dv.setUint8(q+k,p.t.charCodeAt(k));
    dv.setUint32(q+4,checksum(outB,p.off,p.len+p.pad)); dv.setUint32(q+8,p.off); dv.setUint32(q+12,p.len); });
  const headP=parts.find(p=>p.t==='head');
  dv.setUint32(headP.off+8,(0xB1B0AFBA-checksum(outB,0,outB.length))>>>0);
  return outB;
}
function concat(list){ const n=list.reduce((s,u)=>s+u.length,0), o=new Uint8Array(n); let k=0; for(const u of list){ o.set(u,k); k+=u.length; } return o; }
function checksum(u,off,len){ const dv=new DataView(u.buffer,u.byteOffset); let s=0;
  for(let i=0;i<len;i+=4){ let v=0; for(let k=0;k<4;k++) v=(v<<8)|(off+i+k<u.length?u[off+i+k]:0); s=(s+(v>>>0))>>>0; } return s>>>0; }

const API={UPM,XH,CAP,ASC,DESC,G,COMP,ACC,ACCHAR,STYLES,parse,templateBase,partsOf,guides,bbox,glyphFor,context,contours,buildFont,writeTTF,layout,charList,kernValue,drawnWeight};
if(typeof module!=='undefined' && module.exports) module.exports=API; else root.Police=API;
})(typeof self!=='undefined'?self:this);
