// constantes matemáticas para los discos
const TAU=Math.PI*2,MSD=86400000;

// estado de la app - habría que organizar esto mejor después
let tC=false,iN=false,iS=true,cU='ft',curScr='garden',selDay=new Date().getDate(),sortIdx=0,showFlowers=false,pickerType='veg';
let pW=183,pL=305,gC=6,gR=5; // pW/pL siempre en cm internamente (183cm≈6ft, 305cm≈10ft)
let notificationsEnabled=false,weatherEnabled=false,rotationEnabled=false;
let weatherData=null,rotationHistory={};

// traducciones español/inglés
const TX={en:{myGarden:'Mi Huerto',myPatch:'My Garden',planted:'Planted',active:'active',savedToGrow:'Saved to grow',navGarden:'Mi Huerto',navPatch:'Garden',navCal:'Calendar',navVeggies:'Veggies',patchDim:'Patch dimensions',width:'Width',length:'Length',unit:'Unit',pestGuardLbl:'Pest guard',commonPests:'Common pests',tapCellHint:'Tap plant to edit/remove.',addPlantTitle:'Add plant',choosePlant:'Choose a plant',fillDetails:'Fill details',datePlanted:'Date planted',quantity:'Quantity',waterFreq:'Watering',sunlight:'Sunlight',feedSched:'Fertilising',notesLbl:'Notes',nw:'Needs Watering',od:'⚠ Water Overdue',tw:'Tap 💧 to log',wn:'Watered just now',nm:'Night mode',dm:'Day mode',qty:'in patch',notifications:'Notifications',weather:'Weather',rotation:'Crop Rotation',enableNotif:'Enable watering reminders',enableWeather:'Show PR weather',enableRotation:'Track crop rotation'},es:{myGarden:'Mi Huerto',myPatch:'Mi Jardín',planted:'Plantados',active:'activos',savedToGrow:'Guardados',navGarden:'Mi Huerto',navPatch:'Jardín',navCal:'Calendario',navVeggies:'Vegetales',patchDim:'Dimensiones',width:'Ancho',length:'Largo',unit:'Unidad',pestGuardLbl:'Guardianas',commonPests:'Plagas comunes',tapCellHint:'Toca planta para editar/eliminar.',addPlantTitle:'Añadir planta',choosePlant:'Escoge planta',fillDetails:'Completa datos',datePlanted:'Fecha siembra',quantity:'Cantidad',waterFreq:'Riego',sunlight:'Luz solar',feedSched:'Fertilización',notesLbl:'Notas',nw:'Necesita agua',od:'⚠ Riego atrasado',tw:'Toca 💧',wn:'Regado ahora',nm:'Modo noche',dm:'Modo día',qty:'en jardín',notifications:'Notificaciones',weather:'Clima',rotation:'Rotación de Cultivos',enableNotif:'Activar recordatorios de riego',enableWeather:'Mostrar clima PR',enableRotation:'Rastrear rotación'}};
function tx(k){return(iS?TX.es:TX.en)[k]||k;}
function aTx(){document.querySelectorAll('[data-t]').forEach(e=>{e.textContent=tx(e.dataset.t);});}

const P={}; // plantas en el jardín
let SV={}; // plantas guardadas/favoritas
let pG=Array.from({length:gR},()=>Array(gC).fill(null)); // cuadrícula del jardín
let pQueue=[]; // cola de plantas pendientes por colocar

// recomendaciones de plantas compañeras
const PGR={tomato:['basil','marigold'],carrot:['marigold'],lettuce:['basil','marigold'],capsicum:['basil','marigold'],broccoli:['marigold'],cucumber:['marigold'],onion:['basil'],garlic:[],pumpkin:['marigold'],corn:['marigold'],bean:['marigold'],eggplant:['basil','marigold'],chilli:['basil'],potato:['marigold']};

// info detallada de cultivo para vegetales principales
const VG={
  tomato:{tip:'Switch to low-N once fruiting to focus on fruit.',pest:'Aphids, hornworms',harvest:'60-80 days',harvestDays:70,compat:'Basil, marigold',ph:'6.0–6.8',moist:'Moist, not wet',temp:'20–29°C',drain:'Well-drained',fung:'Moderate',heat:'Moderate',year:'Year-round ok',start:'Seed',dif:1,shade:[7,8,9,10,11,12,13,14,15,16],pwStart:5,pwEnd:8},
  carrot:{tip:'Thin seedlings to 2" apart. Keep soil loose.',pest:'Carrot flies, aphids',harvest:'70-80 days',harvestDays:75,compat:'Onions, marigold',ph:'6.0–6.8',moist:'Moderate',temp:'15–24°C',drain:'Well-drained',fung:'Low',heat:'Low',year:'Good',start:'Seed',dif:1,shade:[11,12,13,14,15],pwStart:10,pwEnd:2},
  lettuce:{tip:'Provide afternoon shade. Harvest outer leaves.',pest:'Aphids, slugs',harvest:'30-60 days',harvestDays:45,compat:'Carrots, radishes',ph:'6.0–7.0',moist:'High',temp:'10–20°C',drain:'Well-drained',fung:'Moderate',heat:'High',year:'Poor',start:'Seed',dif:1,shade:[11,12,13,14,15,16],pwStart:11,pwEnd:2}
};

// lista de vegetales - todas plantas nativas americanas
const VL=[
  {e:'🍅',n:'Tomato',ns:'Tomate',sci:'Solanum lycopersicum',dif:1,sd:'Semilla',mo:'Todo el año',tmp:'65–85°F',sun:'Completo',rg:'Ideal para PR',pop:10},
  {e:'🥔',n:'Potato',ns:'Papa',sci:'Solanum tuberosum',dif:2,sd:'Semilla',mo:'Nov–Feb',tmp:'60–70°F',sun:'Completo',rg:'Temporada fría',pop:9},
  {e:'🍠',n:'Sweet Potato',ns:'Batata',sci:'Ipomoea batatas',dif:2,sd:'Esqueje',mo:'Todo el año',tmp:'75–85°F',sun:'Completo',rg:'Ideal para PR',pop:8},
  {e:'🌽',n:'Corn',ns:'Maíz',sci:'Zea mays',dif:1,sd:'Semilla',mo:'Todo el año',tmp:'60–95°F',sun:'Completo',rg:'Ideal para PR',pop:9},
  {e:'🫘',n:'Bean',ns:'Frijol',sci:'Phaseolus vulgaris',dif:1,sd:'Semilla',mo:'Todo el año',tmp:'60–85°F',sun:'Completo',rg:'Ideal para PR',pop:10},
  {e:'🫑',n:'Squash',ns:'Calabaza',sci:'Cucurbita spp.',dif:2,sd:'Semilla',mo:'Todo el año',tmp:'70–85°F',sun:'Completo',rg:'Ideal para PR',pop:8},
  {e:'🎃',n:'Pumpkin',ns:'Calabaza',sci:'Cucurbita pepo',dif:2,sd:'Semilla',mo:'Mar–Jun',tmp:'70–90°F',sun:'Completo',rg:'Ideal para PR',pop:7},
  {e:'🌶️',n:'Pepper',ns:'Pimiento',sci:'Capsicum annuum',dif:2,sd:'Plántula',mo:'Todo el año',tmp:'70–85°F',sun:'Completo',rg:'Ideal para PR',pop:9},
  {e:'🔥',n:'Chili',ns:'Chile',sci:'Capsicum frutescens',dif:2,sd:'Semilla',mo:'Todo el año',tmp:'70–85°F',sun:'Completo',rg:'Ideal para PR',pop:8},
  {e:'🥑',n:'Avocado',ns:'Aguacate',sci:'Persea americana',dif:3,sd:'Árbol',mo:'Todo el año',tmp:'60–85°F',sun:'Completo',rg:'Ideal para PR',pop:7},
  {e:'🌾',n:'Cassava',ns:'Yuca',sci:'Manihot esculenta',dif:2,sd:'Esqueje',mo:'Todo el año',tmp:'75–85°F',sun:'Completo',rg:'Ideal para PR',pop:6},
  {e:'🫔',n:'Quinoa',ns:'Quinoa',sci:'Chenopodium quinoa',dif:2,sd:'Semilla',mo:'Oct–Feb',tmp:'55–75°F',sun:'Completo',rg:'Temporada fría',pop:5},
  {e:'🌿',n:'Amaranth',ns:'Amaranto',sci:'Amaranthus spp.',dif:1,sd:'Semilla',mo:'Todo el año',tmp:'65–85°F',sun:'Completo',rg:'Ideal para PR',pop:6},
  {e:'🟢',n:'Tomatillo',ns:'Tomatillo',sci:'Physalis philadelphica',dif:2,sd:'Semilla',mo:'Todo el año',tmp:'70–85°F',sun:'Completo',rg:'Ideal para PR',pop:7},
  {e:'🥜',n:'Jicama',ns:'Jícama',sci:'Pachyrhizus erosus',dif:2,sd:'Semilla',mo:'Todo el año',tmp:'75–85°F',sun:'Completo',rg:'Ideal para PR',pop:5},
  {e:'🍈',n:'Chayote',ns:'Chayote',sci:'Sechium edule',dif:2,sd:'Fruto',mo:'Todo el año',tmp:'65–80°F',sun:'Parcial',rg:'Ideal para PR',pop:6},
  {e:'🌵',n:'Nopales',ns:'Nopal',sci:'Opuntia ficus-indica',dif:1,sd:'Penca',mo:'Todo el año',tmp:'60–90°F',sun:'Completo',rg:'Tolerante al calor',pop:5},
  {e:'🥔',n:'Sunchoke',ns:'Aguaturma',sci:'Helianthus tuberosus',dif:1,sd:'Tubérculo',mo:'Oct–Feb',tmp:'55–70°F',sun:'Completo',rg:'',pop:4},
  {e:'🫘',n:'Tepary Bean',ns:'Frijol Tepary',sci:'Phaseolus acutifolius',dif:1,sd:'Semilla',mo:'Todo el año',tmp:'75–95°F',sun:'Completo',rg:'Tolerante al calor',pop:4},
  {e:'🫛',n:'Lima Bean',ns:'Haba Lima',sci:'Phaseolus lunatus',dif:1,sd:'Semilla',mo:'Todo el año',tmp:'70–85°F',sun:'Completo',rg:'Ideal para PR',pop:7},
  {e:'🥜',n:'Peanut',ns:'Maní',sci:'Arachis hypogaea',dif:2,sd:'Semilla',mo:'Todo el año',tmp:'70–85°F',sun:'Completo',rg:'Ideal para PR',pop:6},
  {e:'🍈',n:'Papaya',ns:'Papaya',sci:'Carica papaya',dif:2,sd:'Semilla',mo:'Todo el año',tmp:'70–90°F',sun:'Completo',rg:'Ideal para PR',pop:8},
  {e:'🫐',n:'Passion Fruit',ns:'Parcha',sci:'Passiflora edulis',dif:2,sd:'Semilla',mo:'Todo el año',tmp:'68–82°F',sun:'Completo',rg:'Ideal para PR',pop:7}
];

// flores nativas americanas
const FL=[
  {e:'🌻',n:'Sunflower',ns:'Girasol',sci:'Helianthus annuus',dif:1,sd:'Semilla',mo:'Todo el año',tmp:'70–85°F',sun:'Completo',rg:'Ideal para PR',pop:10},
  {e:'🌹',n:'Rose',ns:'Rosa',sci:'Rosa spp.',dif:3,sd:'Planta',mo:'Todo el año',tmp:'60–75°F',sun:'Completo',rg:'Algunas nativas',pop:8},
  {e:'🌸',n:'Marigold',ns:'Maravilla',sci:'Tagetes spp.',dif:1,sd:'Semilla',mo:'Todo el año',tmp:'65–80°F',sun:'Completo',rg:'Ideal para PR',pop:10},
  {e:'🌺',n:'Hibiscus',ns:'Hibisco',sci:'Hibiscus rosa-sinensis',dif:2,sd:'Planta',mo:'Todo el año',tmp:'60–90°F',sun:'Completo',rg:'Ideal para PR',pop:9},
  {e:'🌼',n:'Zinnia',ns:'Zinnia',sci:'Zinnia elegans',dif:1,sd:'Semilla',mo:'Todo el año',tmp:'70–85°F',sun:'Completo',rg:'Ideal para PR',pop:9},
  {e:'🌷',n:'Cosmos',ns:'Cosmos',sci:'Cosmos bipinnatus',dif:1,sd:'Semilla',mo:'Todo el año',tmp:'65–80°F',sun:'Completo',rg:'Ideal para PR',pop:8},
  {e:'🏵️',n:'Dahlia',ns:'Dalia',sci:'Dahlia spp.',dif:2,sd:'Tubérculo',mo:'Todo el año',tmp:'60–75°F',sun:'Completo',rg:'Mejor noches frescas',pop:9},
  {e:'🌼',n:'Black-eyed Susan',ns:'Susan',sci:'Rudbeckia hirta',dif:1,sd:'Semilla',mo:'Todo el año',tmp:'65–80°F',sun:'Completo',rg:'Ideal para PR',pop:7},
  {e:'🌸',n:'Coneflower',ns:'Equinácea',sci:'Echinacea purpurea',dif:2,sd:'Semilla',mo:'Oct–Mar',tmp:'60–75°F',sun:'Completo',rg:'',pop:8},
  {e:'🪻',n:'Lupine',ns:'Lupino',sci:'Lupinus spp.',dif:2,sd:'Semilla',mo:'Nov–Feb',tmp:'55–70°F',sun:'Completo',rg:'Temporada fría',pop:6},
  {e:'🌺',n:'Columbine',ns:'Colombina',sci:'Aquilegia spp.',dif:2,sd:'Semilla',mo:'Oct–Feb',tmp:'55–70°F',sun:'Parcial',rg:'Necesita sombra',pop:6},
  {e:'🌸',n:'Bee Balm',ns:'Bergamota',sci:'Monarda didyma',dif:2,sd:'Semilla',mo:'Todo el año',tmp:'65–80°F',sun:'Completo',rg:'',pop:7},
  {e:'🌼',n:'California Poppy',ns:'Amapola',sci:'Eschscholzia californica',dif:1,sd:'Semilla',mo:'Oct–Feb',tmp:'60–75°F',sun:'Completo',rg:'',pop:7},
  {e:'🌸',n:'Passionflower',ns:'Pasionaria',sci:'Passiflora incarnata',dif:2,sd:'Semilla',mo:'Todo el año',tmp:'65–85°F',sun:'Completo',rg:'Ideal para PR',pop:8},
  {e:'🌺',n:'Morning Glory',ns:'Campanilla',sci:'Ipomoea purpurea',dif:1,sd:'Semilla',mo:'Todo el año',tmp:'70–85°F',sun:'Completo',rg:'Ideal para PR',pop:8},
  {e:'🌸',n:'Petunia',ns:'Petunia',sci:'Petunia × atkinsiana',dif:2,sd:'Semilla',mo:'Todo el año',tmp:'60–75°F',sun:'Completo',rg:'',pop:9},
  {e:'🌼',n:'Nasturtium',ns:'Capuchina',sci:'Tropaeolum majus',dif:1,sd:'Semilla',mo:'Todo el año',tmp:'65–75°F',sun:'Completo',rg:'',pop:7},
  {e:'🌸',n:'Verbena',ns:'Verbena',sci:'Verbena spp.',dif:1,sd:'Semilla',mo:'Todo el año',tmp:'65–80°F',sun:'Completo',rg:'Ideal para PR',pop:8},
  {e:'🪻',n:'Salvia',ns:'Salvia',sci:'Salvia spp.',dif:2,sd:'Semilla',mo:'Todo el año',tmp:'65–80°F',sun:'Completo',rg:'',pop:8},
  {e:'🌼',n:'Aster',ns:'Aster',sci:'Symphyotrichum spp.',dif:2,sd:'Semilla',mo:'Todo el año',tmp:'60–75°F',sun:'Completo',rg:'',pop:7},
  {e:'🌻',n:'Blanket Flower',ns:'Gaillardia',sci:'Gaillardia pulchella',dif:1,sd:'Semilla',mo:'Todo el año',tmp:'70–85°F',sun:'Completo',rg:'Tolerante al calor',pop:7},
  {e:'🌸',n:'Coral Bells',ns:'Campanas',sci:'Heuchera sanguinea',dif:2,sd:'Planta',mo:'Todo el año',tmp:'60–75°F',sun:'Parcial',rg:'Necesita sombra',pop:6},
  {e:'🌺',n:'Trumpet Vine',ns:'Trompeta',sci:'Campsis radicans',dif:2,sd:'Esqueje',mo:'Todo el año',tmp:'65–85°F',sun:'Completo',rg:'',pop:6},
  {e:'🌹',n:'Cardinal Flower',ns:'Flor Cardinal',sci:'Lobelia cardinalis',dif:2,sd:'Semilla',mo:'Todo el año',tmp:'60–75°F',sun:'Parcial',rg:'Necesita humedad',pop:6}
];

// guardar y cargar datos locales
function saveData(){
  try{
    localStorage.setItem('huertoPlants',JSON.stringify(P));
    localStorage.setItem('huertoGrid',JSON.stringify(pG));
    localStorage.setItem('huertoSaved',JSON.stringify(SV));
    localStorage.setItem('huertoDim',JSON.stringify({pW,pL,gC,gR,cU}));
    localStorage.setItem('huertoSettings',JSON.stringify({iS,iN,tC,notificationsEnabled,weatherEnabled,rotationEnabled}));
    localStorage.setItem('huertoRotation',JSON.stringify(rotationHistory));
  }catch(e){console.error('Save failed:',e);}
}

function loadData(){
  try{
    // cargar dimensiones PRIMERO para que la cuadrícula tenga el tamaño correcto
    const dim=localStorage.getItem('huertoDim');
    if(dim){
      const d=JSON.parse(dim);
      pW=d.pW||200;pL=d.pL||300;gC=d.gC||6;gR=d.gR||5;cU=d.cU||'cm';
      // reconstruir la cuadrícula con las dimensiones correctas
      pG=Array.from({length:gR},()=>Array(gC).fill(null));
    }
    
    const plants=localStorage.getItem('huertoPlants');
    if(plants)Object.assign(P,JSON.parse(plants));
    
    const grid=localStorage.getItem('huertoGrid');
    if(grid)pG=JSON.parse(grid);
    
    const saved=localStorage.getItem('huertoSaved');
    if(saved)SV=JSON.parse(saved);
    
    const settings=localStorage.getItem('huertoSettings');
    if(settings){
      const s=JSON.parse(settings);
      iS=s.iS!==undefined?s.iS:true;
      iN=s.iN||false;
      tC=s.tC||false;
      notificationsEnabled=s.notificationsEnabled||false;
      weatherEnabled=s.weatherEnabled||false;
      rotationEnabled=s.rotationEnabled||false;
      if(iN)document.getElementById('app').classList.add('night');
    }
    
    const rotation=localStorage.getItem('huertoRotation');
    if(rotation)rotationHistory=JSON.parse(rotation);
    
    // iniciar funciones si están activadas
    if(notificationsEnabled)scheduleWateringNotifications();
    if(weatherEnabled)fetchWeather();
    
    // limpiar plantas huérfanas (en P pero no en la cuadrícula)
    const idsInGrid=new Set();
    for(let r=0;r<gR;r++){
      for(let c=0;c<gC;c++){
        if(pG[r]&&pG[r][c])idsInGrid.add(pG[r][c]);
      }
    }
    Object.keys(P).forEach(id=>{
      if(!idsInGrid.has(id))delete P[id];
    });
    
    // rellenar campos faltantes en plantas viejas
    Object.values(P).forEach(p=>{
      if(p.tp!=='pest'&&p.tp!=='flower'){
        if(!p.plantedAt){
          // usar el último riego como fecha aproximada de siembra
          p.plantedAt=p.lwt||Date.now();
        }
        if(!p.harvestDays){
          const vk=p.n.toLowerCase();
          const vinfo=VG[vk];
          p.harvestDays=vinfo?vinfo.harvestDays:70;
        }
      }
    });
    
  }catch(e){console.error('Load failed:',e);}
}

// calcular progreso de agua/sol/fertilizante
function arcs(p){
  if(p.tp==='pest'||p.tp==='flower')return{w:0,s:0,f:0};
  const now=Date.now(),wC=p.wE*MSD,fC=p.fE*MSD;
  return{w:Math.min((now-p.lwt)/wC,1),s:p.sF,f:Math.min(((now-p.lft)%fC)/fC,1)};
}

function isOD(p){return p.tp!=='pest'&&p.tp!=='flower'&&!p.w&&arcs(p).w>=1;}

// contar cuántas de esta planta hay en el jardín
function pCnt(nm){
  let n=0;
  for(let r=0;r<gR;r++)
    for(let c=0;c<gC;c++){
      const id=pG[r]&&pG[r][c];
      if(id&&P[id]&&P[id].n===nm)n++;
    }
  return n;
}

// activar/desactivar estrella de favorito
function toggleBookmark(vk){
  if(SV[vk]){
    delete SV[vk];
  }else{
    const v=VL.find(x=>x.n.toLowerCase()===vk)||FL.find(x=>x.n.toLowerCase()===vk);
    if(v){
      SV[vk]={e:v.e,n:v.n,ns:v.ns,fr:v.sd,frs:v.sd,b:v.mo,f:.5,a:false,s:v.sun,rg:v.rg};
    }
  }
  saveData();
  if(curScr==='garden')rSaved();
  if(curScr==='veg')rVL();
}

// dibujar el disco de cuidado en canvas
function dDial(cid,pid){
  const c=document.getElementById(cid);
  if(!c)return;
  const p=P[pid];
  if(!p||p.tp==='pest'||p.tp==='flower')return;
  
  const ctx=c.getContext('2d'),W=c.width,H=c.height,cx=W/2,cy=H/2;
  ctx.clearRect(0,0,W,H);
  
  const a=arcs(p),od=isOD(p);
  const wTh=Math.max(4,Math.round(12/p.wE)),fTh=Math.max(3,Math.round(50/p.fE)),sTh=5,segL=TAU/8;
  
  // dibujar los 3 anillos: agua, sol, fertilizante
  const rings=[
    {r:cx-5,th:wTh,trk:iN?'#081828':'#a0d0ff',fil:od?'#e03030':'#1e90ff',ic:'💧',fr:a.w},
    {r:cx-14,th:sTh,trk:iN?'#1c1004':'#ffe0a0',fil:'#f0a020',ic:'☀️',fr:a.s},
    {r:cx-23,th:fTh,trk:iN?'#061406':'#b0f0a0',fil:'#28b020',ic:'🍃',fr:a.f}
  ];
  
  rings.forEach(ring=>{
    ctx.beginPath();
    ctx.arc(cx,cy,ring.r,0,TAU);
    ctx.strokeStyle=ring.trk;
    ctx.lineWidth=ring.th;
    ctx.lineCap='butt';
    ctx.stroke();
    
    const stA=-Math.PI/2+ring.fr*TAU,endA=stA+segL;
    ctx.beginPath();
    ctx.arc(cx,cy,ring.r,stA,endA);
    ctx.strokeStyle=ring.fil;
    ctx.lineWidth=ring.th;
    ctx.lineCap='round';
    ctx.stroke();
    
    const mid=stA+segL/2;
    ctx.font='9px serif';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText(ring.ic,cx+ring.r*Math.cos(mid),cy+ring.r*Math.sin(mid));
  });
  
  // ícono de planta en el centro
  ctx.beginPath();
  ctx.arc(cx,cy,8,0,TAU);
  ctx.fillStyle=od?'rgba(220,50,50,.1)':iN?'#0e1a0a':'#efffee';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx,cy,8,0,TAU);
  ctx.strokeStyle=od?'#e03030':'#4caf50';
  ctx.lineWidth=1.5;
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(cx,cy-8);
  ctx.lineTo(cx-3.5,cy-2);
  ctx.lineTo(cx+3.5,cy-2);
  ctx.closePath();
  ctx.fillStyle=od?'#e03030':'#1a4a10';
  ctx.fill();
}

// anillo de crecimiento para favoritos
function dBook(id,fr,act){
  const c=document.getElementById(id);
  if(!c)return;
  const ctx=c.getContext('2d'),W=c.width,H=c.height,cx=W/2,cy=H/2,R=W/2-3;
  ctx.clearRect(0,0,W,H);
  
  ctx.beginPath();
  ctx.arc(cx,cy,R-2,0,TAU);
  ctx.strokeStyle=iN?'#1a3010':'#c0eeae';
  ctx.lineWidth=4;
  ctx.stroke();
  
  if(fr>0){
    const segL=TAU/8,stA=-Math.PI/2+fr*TAU;
    ctx.beginPath();
    ctx.arc(cx,cy,R-2,stA,stA+segL);
    ctx.strokeStyle=act?'#2d9020':'#60a050';
    ctx.lineWidth=4;
    ctx.lineCap='round';
    ctx.stroke();
  }
  
  const m=-Math.PI/2+fr*TAU+TAU/16;
  ctx.font='9px serif';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillText('🌱',cx+(R-2)*Math.cos(m),cy+(R-2)*Math.sin(m));
  
  ctx.beginPath();
  ctx.arc(cx,cy,6,0,TAU);
  ctx.fillStyle=iN?'#0e180a':'#efffee';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx,cy,6,0,TAU);
  ctx.strokeStyle=act?'#4caf50':'#888';
  ctx.lineWidth=1;
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(cx,cy-6);
  ctx.lineTo(cx-2.5,cy-2);
  ctx.lineTo(cx+2.5,cy-2);
  ctx.closePath();
  ctx.fillStyle=act?'#1a4a10':'#888';
  ctx.fill();
}

// indicador de día/noche
function dDay(id){
  const c=document.getElementById(id);
  if(!c)return;
  const ctx=c.getContext('2d'),W=c.width,H=c.height,cx=W/2,cy=H/2,R=W/2-2;
  ctx.clearRect(0,0,W,H);
  
  const now=new Date(),hr=now.getHours()+now.getMinutes()/60,dy=hr>=6&&hr<20;
  
  ctx.beginPath();
  ctx.arc(cx,cy,R,0,TAU);
  ctx.fillStyle=dy?'#fff8d0':'#1a2a4a';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx,cy,R,0,TAU);
  ctx.strokeStyle=dy?'#f5d080':'#3a5a9a';
  ctx.lineWidth=1.5;
  ctx.stroke();
  
  const a=(hr/24)*TAU-Math.PI/2,ir=R-4;
  ctx.font='10px serif';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillText(dy?'☀️':'🌙',cx+ir*Math.cos(a),cy+ir*Math.sin(a));
}

// ícono de gota de agua
function dWI(id,done){
  const c=document.getElementById(id);
  if(!c)return;
  const ctx=c.getContext('2d'),W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  
  if(done){
    ctx.fillStyle='rgba(0,0,0,.12)';
    ctx.beginPath();
    ctx.arc(W/2+1,H/2+1,8,0,TAU);
    ctx.fill();
  }
  
  ctx.font='14px serif';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillText(done?'✅':'💧',W/2,H/2);
}

const wT={}; // temporizadores de riego

// navegación
function goTo(s){
  curScr=s;
  document.querySelectorAll('.ni').forEach(n=>n.classList.remove('on'));
  document.getElementById('nav-'+s).classList.add('on');
  
  if(s==='garden'){
    rGS();
  }else if(s==='patch'){
    rPS();
  }else if(s==='cal'){
    rCS();
  }else if(s==='veg'){
    rVS();
  }
}

// renderizar pantalla de mi huerto
function rGS(){
  const hdr=document.getElementById('HDR');
  hdr.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between"><div style="flex:1"><div style="font-size:18px;font-weight:600;color:#fff">${tx('myGarden')}</div><div style="font-size:11px;color:rgba(255,255,255,.7)">Puerto Rico · Zone 12b</div><div style="font-size:10px;color:rgba(255,255,255,.45)">Tropical, sin heladas, mín 50–55°F</div></div><div style="display:flex;align-items:center;gap:10px"><canvas id="dd-g" width="36" height="36"></canvas><div id="TB" onclick="TT()" style="cursor:pointer;background:rgba(255,255,255,.2);border-radius:10px;padding:4px 10px;font-size:12px;color:#fff;font-weight:600;user-select:none">°F</div></div></div>`;
  
  const main=document.getElementById('MAIN');
  main.innerHTML=`<div class="sec"><span data-t="planted">Plantados</span> · <span id="pcnt">0</span> <span data-t="active">activos</span></div><div id="GC"></div><div class="sec" data-t="savedToGrow">Guardados</div><div id="SC"></div><div class="sec">Funciones</div><div style="padding:0 12px 16px;display:flex;flex-direction:column;gap:8px"><button id="notifBtn" onclick="toggleNotifications()" style="background:${notificationsEnabled?'#2d5a1b':'#3a3a50'};color:${notificationsEnabled?'#a8d47a':'#b0b0cc'};border:1px solid ${notificationsEnabled?'#4a8a30':'#505070'};border-radius:12px;padding:8px 14px;font-size:12px;font-weight:600;cursor:pointer;text-align:left"><span data-t="notifications">🔔 Notificaciones</span> · <span style="font-size:10px;opacity:0.8" data-t="enableNotif">${notificationsEnabled?'Activadas':'Desactivadas'}</span></button><button id="weatherBtn" onclick="toggleWeather()" style="background:${weatherEnabled?'#2d5a1b':'#3a3a50'};color:${weatherEnabled?'#a8d47a':'#b0b0cc'};border:1px solid ${weatherEnabled?'#4a8a30':'#505070'};border-radius:12px;padding:8px 14px;font-size:12px;font-weight:600;cursor:pointer;text-align:left"><span data-t="weather">🌤️ Clima PR</span> · <span style="font-size:10px;opacity:0.8" data-t="enableWeather">${weatherEnabled?'Activado':'Desactivado'}</span><span id="weather-display" style="margin-left:8px;font-size:10px"></span></button><button id="rotationBtn" onclick="toggleRotation()" style="background:${rotationEnabled?'#2d5a1b':'#3a3a50'};color:${rotationEnabled?'#a8d47a':'#b0b0cc'};border:1px solid ${rotationEnabled?'#4a8a30':'#505070'};border-radius:12px;padding:8px 14px;font-size:12px;font-weight:600;cursor:pointer;text-align:left"><span data-t="rotation">🔄 Rotación</span> · <span style="font-size:10px;opacity:0.8" data-t="enableRotation">${rotationEnabled?'Activada':'Desactivada'}</span></button></div><div style="display:flex;gap:8px;justify-content:center;padding:8px 12px 16px"><button id="LB" onclick="TL()" style="background:#183a10;color:#a8d47a;border:1px solid #3a7030;border-radius:16px;padding:6px 14px;font-size:11px;font-weight:600;cursor:pointer">🌐 English</button><button id="NB" onclick="TN()" style="background:#161628;color:#b0b0cc;border:1px solid #404060;border-radius:16px;padding:6px 14px;font-size:11px;font-weight:600;cursor:pointer">🌙 ${tx('nm')}</button></div>`;
  
  aTx();
  rG();
  rSaved();
  setTimeout(()=>dDay('dd-g'),50);
}

function rG(){
  const con=document.getElementById('GC');
  if(!con)return;
  con.innerHTML='';
  
  const seen=new Set(),list=[];
  Object.values(P).forEach(p=>{
    if(p.tp!=='pest'&&p.tp!=='flower'&&!seen.has(p.n)){
      seen.add(p.n);
      list.push(p);
    }
  });
  
  document.getElementById('pcnt').textContent=list.length;
  
  if(list.length===0){
    con.innerHTML='<div style="background:var(--card);border:1.5px solid var(--cb);border-radius:12px;margin:0 12px 10px;padding:16px;text-align:center;font-size:12px;color:var(--txt3);font-style:italic">No hay plantas todavía. Ve a Mi Jardín para añadir plantas!</div>';
  }
  
  list.forEach(p=>{
    const od=isOD(p),a=arcs(p),nd=!p.w&&a.w>=.75&&!od;
    const dn=iS?(p.ns||p.n):p.n,qty=pCnt(p.n);
    const wL=od?tx('od'):nd?tx('nw'):`${iS?'Regar cada':'Water every'} ${p.wE}d`;
    const wC=od?'#e03030':nd?'#b06000':'#1e70cc';
    const wBg=od?'rgba(220,50,50,.1)':nd?'rgba(200,140,0,.1)':iN?'#081828':'#d8f0ff';
    const wBd=od?'#e03030':nd?'#c09000':'#4090d0';
    
    const div=document.createElement('div');
    div.className='pc';
    div.id='gc-'+p.id;
    if(od)div.style.borderColor='#e03030';
    
    div.innerHTML=`
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div id="emoclick-${p.id}" style="cursor:pointer;width:36px;height:36px;background:${od?'rgba(220,50,50,.12)':'rgba(80,160,80,.12)'};border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${p.e}</div>
        <div style="flex:1"><div style="font-size:14px;font-weight:600;color:var(--txt)">${dn}</div><div style="font-size:11px;color:${od?'#e03030':'#4caf50'}">${iS?'Plantado':'Planted'}</div></div>
        ${qty>1?`<div style="background:rgba(80,160,80,.15);border:1px solid #4caf50;border-radius:10px;padding:3px 8px;font-size:11px;color:#4caf50;font-weight:700;flex-shrink:0">×${qty}</div>`:''}
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <div style="display:flex;flex-direction:column;gap:4px;flex:1">
          <div style="display:flex;align-items:center;gap:6px;background:${wBg};border-radius:8px;padding:4px 10px;border:1px solid ${wBd}"><span style="font-size:14px">${od||nd?'💧':'💦'}</span><span style="font-size:11px;color:${wC};font-weight:${od||nd?'600':'400'}">${wL}</span></div>
          <div style="display:flex;align-items:center;gap:6px;background:${iN?'#180e00':'#fff8dc'};border-radius:8px;padding:4px 10px;border:1px solid #c09000"><span style="font-size:14px">☀️</span><span style="font-size:11px;color:#a07010">${iS?'Sol':'Sun'}: ${Math.round(p.sF*8)}h</span></div>
          <div style="display:flex;align-items:center;gap:6px;background:${iN?'#060e06':'#e8f8e0'};border-radius:8px;padding:4px 10px;border:1px solid #409030"><span style="font-size:14px">🍃</span><span style="font-size:11px;color:#208020">${iS?'Fertilizar':'Feed'} ${p.fE}d</span></div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
          <div id="wb-${p.id}" style="cursor:pointer;width:36px;height:36px;background:${od?'rgba(220,50,50,.12)':'rgba(30,100,200,.1)'};border-radius:50%;border:1.5px solid ${od?'#e03030':'#4090d0'};display:${p.w?'none':'flex'};align-items:center;justify-content:center"><canvas id="wi-${p.id}" width="24" height="24"></canvas></div>
          <div id="ub-${p.id}" style="cursor:pointer;width:36px;height:36px;background:rgba(80,180,80,.12);border-radius:50%;border:1.5px solid #4caf50;display:${p.w?'flex':'none'};align-items:center;justify-content:center;font-size:14px">↩</div>
          <canvas id="dl-${p.id}" width="92" height="92"></canvas>
        </div>
      </div>
      <div id="wl-${p.id}" style="font-size:11px;color:${od?'#e03030':nd?'#b06000':'var(--txt3)'};margin-top:6px;min-height:14px;font-weight:500">${p.w?tx('wn'):od?tx('od'):nd?tx('nw'):tx('tw')}</div>`;
    
    con.appendChild(div);
    
    setTimeout(()=>{
      dWI('wi-'+p.id,p.w);
      document.getElementById('wb-'+p.id).onclick=()=>doW(p.id);
      document.getElementById('ub-'+p.id).onclick=()=>unW(p.id);
      document.getElementById('emoclick-'+p.id).onclick=(e)=>{e.stopPropagation();oPD(p.id);};
    },20);
  });
}

function rSaved(){
  const con=document.getElementById('SC');
  if(!con)return;
  con.innerHTML='';
  
  if(Object.keys(SV).length===0){
    con.innerHTML='<div style="background:var(--card);border:1.5px solid var(--cb);border-radius:12px;margin:0 12px 10px;padding:16px;text-align:center;font-size:12px;color:var(--txt3);font-style:italic">Toca el ícono de estrella en Vegetales para guardar plantas</div>';
  }
  
  Object.entries(SV).forEach(([k,s])=>{
    const dn=iS?(s.ns||s.n):s.n,df=iS?(s.frs||s.fr):s.fr;
    const div=document.createElement('div');
    div.className='pc';
    div.style.padding='10px 12px';
    div.innerHTML=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><div style="width:32px;height:32px;background:rgba(80,160,80,.12);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:18px">${s.e}</div><div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--txt)">${dn}</div><div style="font-size:11px;color:var(--txt3)">${df} · ${s.b}</div></div><span onclick="toggleBookmark('${k}')" style="cursor:pointer;font-size:20px;color:#4caf50">★</span></div><div style="display:flex;align-items:center;gap:10px"><div style="flex:1;display:flex;gap:4px;flex-wrap:wrap"><span style="background:rgba(30,100,200,.1);color:#4090d0;border-radius:6px;padding:2px 7px;font-size:10px;font-weight:500">${s.s}</span>${s.rg?`<span style="background:rgba(80,160,80,.1);color:#4caf50;border-radius:6px;padding:2px 7px;font-size:10px;font-weight:500">${s.rg}</span>`:''}<span style="background:rgba(80,160,80,.08);color:#4caf50;border-radius:6px;padding:2px 7px;font-size:10px">🌱 ${df}</span></div><canvas id="bd-${k}" width="56" height="56" style="flex-shrink:0"></canvas></div>`;
    con.appendChild(div);
    setTimeout(()=>dBook('bd-'+k,s.f,s.a),30);
  });
}

// TODO: añadir guías de cuidado más detalladas
function oPD(id){
  const p=P[id];
  if(!p)return;
  const vk=p.n.toLowerCase();
  const vinfo=VG[vk]||{tip:'Se necesita cuidado general.',pest:'Varios',harvest:'60-90 días',compat:'La mayoría de vegetales',ph:'6.0-7.0',moist:'Moderado',temp:'20-25°C',drain:'Bien drenado',fung:'Bajo',heat:'Bajo',year:'Bueno',start:'Semilla',dif:1,shade:[]};
  const dn=iS?(p.ns||p.n):p.n;
  const difText=vinfo.dif===1?'Fácil':vinfo.dif===2?'Moderado':'Difícil';
  const shadeHTML=vinfo.shade.length>0?`<div style="margin:10px 16px 0">${Array.from({length:24},(_,i)=>i+6).map(h=>`<span class="todpill ${vinfo.shade.includes(h)?'shd':'exp'}">${h}h</span>`).join('')}</div>`:'';
  
  const slide=document.getElementById('SLIDE');
  slide.innerHTML=`<div class="dhdr"><div style="display:flex;align-items:center;justify-content:space-between"><div onclick="CSD()" style="cursor:pointer;font-size:24px;color:#fff;padding:4px">←</div><div style="flex:1;text-align:center"><div style="font-size:18px;font-weight:700;color:#fff">${p.e} ${dn}</div><div style="font-size:11px;color:rgba(255,255,255,.7)">${p.sci||''}</div></div><div style="width:28px"></div></div><div style="margin-top:8px"><span class="badge">${difText}</span><span class="badge">${vinfo.start}</span></div></div><div style="padding-bottom:80px"><div class="sectt">Riego</div><div class="cgrid"><div class="citem"><div class="cimg"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23d0f0ff' width='200' height='200'/%3E%3Ctext x='100' y='100' font-size='60' text-anchor='middle' dy='.3em'%3E💧%3C/text%3E%3C/svg%3E" alt="Drip"></div><div class="clab">Riego por goteo</div><div class="csub">Agua directo a las raíces</div><div class="chk">✓</div></div><div class="citem"><div class="cimg"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23ffe0e0' width='200' height='200'/%3E%3Ctext x='100' y='100' font-size='60' text-anchor='middle' dy='.3em'%3E🚿%3C/text%3E%3C/svg%3E" alt="Overhead"></div><div class="clab">Riego aéreo</div><div class="csub">Promueve hongos</div><div class="xcr">✗</div></div></div><div class="sectt">Sombra ${vinfo.shade.length>0?'(calor tropical)':''}</div>${vinfo.shade.length>0?`<div class="cgrid"><div class="citem"><div class="cimg"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23f0f0f0' width='200' height='200'/%3E%3Ctext x='100' y='100' font-size='60' text-anchor='middle' dy='.3em'%3E☀️%3C/text%3E%3C/svg%3E" alt="Shade"></div><div class="clab">Malla sombra</div><div class="csub">30-50% cobertura</div></div><div class="citem"><div class="cimg"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23f0f0f0' width='200' height='200'/%3E%3Ctext x='100' y='100' font-size='60' text-anchor='middle' dy='.3em'%3E☂️%3C/text%3E%3C/svg%3E" alt="Umbrella"></div><div class="clab">Sombrilla jardín</div><div class="csub">Opción portátil</div></div></div>${shadeHTML}`:'<div style="margin:0 16px 10px;font-size:11px;color:var(--txt3);font-style:italic">Se recomienda exposición completa al sol</div>'}<div class="sectt">Poda</div><div class="cgrid"><div class="citem"><div class="cimg"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23f0f0e8' width='200' height='200'/%3E%3Ctext x='100' y='100' font-size='60' text-anchor='middle' dy='.3em'%3E🌱%3C/text%3E%3C/svg%3E" alt="Sucker"></div><div class="clab">Área de chupón</div><div class="csub">Pellizcar entre tallo y rama</div></div><div class="citem"><div class="cimg"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23f0f0e8' width='200' height='200'/%3E%3Ctext x='100' y='100' font-size='60' text-anchor='middle' dy='.3em'%3E✂️%3C/text%3E%3C/svg%3E" alt="Prune"></div><div class="clab">Hojas bajas</div><div class="csub">Remover para flujo de aire</div></div></div><div style="margin:10px 16px 0;font-size:11px;color:var(--txt);line-height:1.5">${vinfo.tip}</div><div class="sectt">Retos Zona 12B</div><div class="chgrid"><div class="chitem ${vinfo.fung==='High'?'warn':vinfo.fung==='Low'?'good':''}"><div class="chlab">Hongos</div><div class="chval">${vinfo.fung}</div></div><div class="chitem ${vinfo.heat==='High'?'warn':vinfo.heat==='Low'?'good':''}"><div class="chlab">Calor</div><div class="chval">${vinfo.heat}</div></div><div class="chitem ${vinfo.year.includes('Excellent')||vinfo.year.includes('Year-round')||vinfo.year.includes('Good')?'good':'warn'}"><div class="chlab">Todo el año</div><div class="chval">${vinfo.year}</div></div></div><div class="sectt">Condiciones de suelo</div><div class="soilgrid"><div class="soilitem"><div class="soillab">pH</div><div class="soilval">${vinfo.ph}</div></div><div class="soilitem"><div class="soillab">Humedad</div><div class="soilval">${vinfo.moist}</div></div><div class="soilitem"><div class="soillab">Temp suelo</div><div class="soilval">${vinfo.temp}</div></div><div class="soilitem"><div class="soillab">Drenaje</div><div class="soilval">${vinfo.drain}</div></div></div><div class="sectt">Contenedores</div><div class="contgrid"><div class="contitem"><div class="contimg"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23e8e0d0' width='200' height='200'/%3E%3Ctext x='100' y='100' font-size='50' text-anchor='middle' dy='.3em'%3E🌱%3C/text%3E%3C/svg%3E" alt="Tray"></div><div class="contlab">Bandeja</div><div class="contsub">Germinación</div></div><div class="contitem"><div class="contimg"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23e8d0c0' width='200' height='200'/%3E%3Ctext x='100' y='100' font-size='50' text-anchor='middle' dy='.3em'%3E🏺%3C/text%3E%3C/svg%3E" alt="Pot"></div><div class="contlab">Terracota 15cm</div><div class="contsub">Planta joven</div></div><div class="contitem"><div class="contimg"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23d8d0d8' width='200' height='200'/%3E%3Ctext x='100' y='100' font-size='50' text-anchor='middle' dy='.3em'%3E👜%3C/text%3E%3C/svg%3E" alt="Bag"></div><div class="contlab">Bolsa 30L</div><div class="contsub">Planta madura</div></div><div class="contitem ideal"><div class="contimg"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23d8e8d0' width='200' height='200'/%3E%3Ctext x='100' y='100' font-size='50' text-anchor='middle' dy='.3em'%3E🌿%3C/text%3E%3C/svg%3E" alt="Bed"></div><div class="contlab">Cama elevada</div><div class="contsub">Ideal</div></div></div><div class="sectt">Info adicional</div><div class="infobox"><div class="infott">🐛 Plagas comunes</div><div class="infotx">${vinfo.pest}</div></div><div class="infobox"><div class="infott">⏱️ Días a cosecha</div><div class="infotx">${vinfo.harvest}</div></div><div class="infobox"><div class="infott">🤝 Plantas compañeras</div><div class="infotx">${vinfo.compat}</div></div></div>`;
  
  setTimeout(()=>slide.classList.add('open'),10);
}

// esta función es muy larga, hay que refactorizar después
function oVD(v){const vk=v.n.toLowerCase();const vinfo=VG[vk]||{tip:'Se necesita cuidado general.',pest:'Varios',harvest:'60-90 días',compat:'La mayoría de plantas',ph:'6.0-7.0',moist:'Moderado',temp:'20-25°C',drain:'Bien drenado',fung:'Bajo',heat:'Bajo',year:'Bueno',start:'Semilla',dif:1,shade:[]};const dn=iS?(v.ns||v.n):v.n;const difText=vinfo.dif===1?'Fácil':vinfo.dif===2?'Moderado':'Difícil';const shadeHTML=vinfo.shade.length>0?`<div style="margin:10px 16px 0">${Array.from({length:24},(_,i)=>i+6).map(h=>`<span class="todpill ${vinfo.shade.includes(h)?'shd':'exp'}">${h}h</span>`).join('')}</div>`:'';const slide=document.getElementById('SLIDE');slide.innerHTML=`<div class="dhdr"><div style="display:flex;align-items:center;justify-content:space-between"><div onclick="CSD()" style="cursor:pointer;font-size:24px;color:#fff;padding:4px">←</div><div style="flex:1;text-align:center"><div style="font-size:18px;font-weight:700;color:#fff">${v.e} ${dn}</div><div style="font-size:11px;color:rgba(255,255,255,.7)">${v.sci||''}</div></div><div style="width:28px"></div></div><div style="margin-top:8px"><span class="badge">${difText}</span><span class="badge">${vinfo.start||v.sd}</span><span class="badge">${v.mo}</span></div></div><div style="padding-bottom:80px"><div class="sectt">Riego</div><div class="cgrid"><div class="citem"><div class="cimg"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23d0f0ff' width='200' height='200'/%3E%3Ctext x='100' y='100' font-size='60' text-anchor='middle' dy='.3em'%3E💧%3C/text%3E%3C/svg%3E" alt="Drip"></div><div class="clab">Riego por goteo</div><div class="csub">Agua directo a las raíces</div><div class="chk">✓</div></div><div class="citem"><div class="cimg"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23ffe0e0' width='200' height='200'/%3E%3Ctext x='100' y='100' font-size='60' text-anchor='middle' dy='.3em'%3E🚿%3C/text%3E%3C/svg%3E" alt="Overhead"></div><div class="clab">Riego aéreo</div><div class="csub">Promueve hongos</div><div class="xcr">✗</div></div></div><div class="sectt">Sombra ${vinfo.shade.length>0?'(calor tropical)':''}</div>${vinfo.shade.length>0?`<div class="cgrid"><div class="citem"><div class="cimg"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23f0f0f0' width='200' height='200'/%3E%3Ctext x='100' y='100' font-size='60' text-anchor='middle' dy='.3em'%3E☀️%3C/text%3E%3C/svg%3E" alt="Shade"></div><div class="clab">Malla sombra</div><div class="csub">30-50% cobertura</div></div><div class="citem"><div class="cimg"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23f0f0f0' width='200' height='200'/%3E%3Ctext x='100' y='100' font-size='60' text-anchor='middle' dy='.3em'%3E☂️%3C/text%3E%3C/svg%3E" alt="Umbrella"></div><div class="clab">Sombrilla jardín</div><div class="csub">Opción portátil</div></div></div>${shadeHTML}`:'<div style="margin:0 16px 10px;font-size:11px;color:var(--txt3);font-style:italic">Se recomienda exposición completa al sol</div>'}<div class="sectt">Poda</div><div class="cgrid"><div class="citem"><div class="cimg"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23f0f0e8' width='200' height='200'/%3E%3Ctext x='100' y='100' font-size='60' text-anchor='middle' dy='.3em'%3E🌱%3C/text%3E%3C/svg%3E" alt="Sucker"></div><div class="clab">Área de chupón</div><div class="csub">Pellizcar entre tallo y rama</div></div><div class="citem"><div class="cimg"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23f0f0e8' width='200' height='200'/%3E%3Ctext x='100' y='100' font-size='60' text-anchor='middle' dy='.3em'%3E✂️%3C/text%3E%3C/svg%3E" alt="Prune"></div><div class="clab">Hojas bajas</div><div class="csub">Remover para flujo de aire</div></div></div><div style="margin:10px 16px 0;font-size:11px;color:var(--txt);line-height:1.5">${vinfo.tip}</div><div class="sectt">Retos Zona 12B</div><div class="chgrid"><div class="chitem ${vinfo.fung==='High'?'warn':vinfo.fung==='Low'?'good':''}"><div class="chlab">Hongos</div><div class="chval">${vinfo.fung}</div></div><div class="chitem ${vinfo.heat==='High'?'warn':vinfo.heat==='Low'?'good':''}"><div class="chlab">Calor</div><div class="chval">${vinfo.heat}</div></div><div class="chitem ${vinfo.year.includes('Excellent')||vinfo.year.includes('Year-round')||vinfo.year.includes('Good')?'good':'warn'}"><div class="chlab">Todo el año</div><div class="chval">${vinfo.year}</div></div></div><div class="sectt">Condiciones de suelo</div><div class="soilgrid"><div class="soilitem"><div class="soillab">pH</div><div class="soilval">${vinfo.ph}</div></div><div class="soilitem"><div class="soillab">Humedad</div><div class="soilval">${vinfo.moist}</div></div><div class="soilitem"><div class="soillab">Temp suelo</div><div class="soilval">${vinfo.temp}</div></div><div class="soilitem"><div class="soillab">Drenaje</div><div class="soilval">${vinfo.drain}</div></div></div><div class="sectt">Contenedores</div><div class="contgrid"><div class="contitem"><div class="contimg"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23e8e0d0' width='200' height='200'/%3E%3Ctext x='100' y='100' font-size='50' text-anchor='middle' dy='.3em'%3E🌱%3C/text%3E%3C/svg%3E" alt="Tray"></div><div class="contlab">Bandeja</div><div class="contsub">Germinación</div></div><div class="contitem"><div class="contimg"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23e8d0c0' width='200' height='200'/%3E%3Ctext x='100' y='100' font-size='50' text-anchor='middle' dy='.3em'%3E🏺%3C/text%3E%3C/svg%3E" alt="Pot"></div><div class="contlab">Terracota 15cm</div><div class="contsub">Planta joven</div></div><div class="contitem"><div class="contimg"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23d8d0d8' width='200' height='200'/%3E%3Ctext x='100' y='100' font-size='50' text-anchor='middle' dy='.3em'%3E👜%3C/text%3E%3C/svg%3E" alt="Bag"></div><div class="contlab">Bolsa 30L</div><div class="contsub">Planta madura</div></div><div class="contitem ideal"><div class="contimg"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23d8e8d0' width='200' height='200'/%3E%3Ctext x='100' y='100' font-size='50' text-anchor='middle' dy='.3em'%3E🌿%3C/text%3E%3C/svg%3E" alt="Bed"></div><div class="contlab">Cama elevada</div><div class="contsub">Ideal</div></div></div><div class="sectt">Info adicional</div><div class="infobox"><div class="infott">🐛 Plagas comunes</div><div class="infotx">${vinfo.pest}</div></div><div class="infobox"><div class="infott">⏱️ Días a cosecha</div><div class="infotx">${vinfo.harvest}</div></div><div class="infobox"><div class="infott">🤝 Plantas compañeras</div><div class="infotx">${vinfo.compat}</div></div><div style="margin:16px;"><button class="bg" onclick="CSD();setTimeout(()=>goTo('patch'),100);setTimeout(OAP,200)">+ Añadir a Mi Jardín</button></div></div>`;setTimeout(()=>slide.classList.add('open'),10);}

function CSD(){document.getElementById('SLIDE').classList.remove('open');}

// cosas de la pantalla del jardín
let pP=null;
function rPS(){const hdr=document.getElementById('HDR');hdr.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between"><div style="flex:1"><div style="font-size:18px;font-weight:600;color:#fff">${tx('myPatch')}</div><div style="font-size:11px;color:rgba(255,255,255,.7)">Puerto Rico · Zone 12b</div></div><div style="display:flex;align-items:center;gap:10px"><canvas id="dd-p" width="36" height="36"></canvas><div onclick="OAP()" style="cursor:pointer;background:#fff;color:#1a4a10;border-radius:10px;padding:6px 14px;font-size:13px;font-weight:700;border:2px solid #4caf50">+ Planta</div></div></div>`;const main=document.getElementById('MAIN');main.innerHTML=`<div style="background:var(--card);border:1.5px solid var(--cb);border-radius:14px;margin:10px 12px 8px;padding:10px 14px;overflow:visible"><div style="font-size:11px;color:#4caf50;font-weight:600;margin-bottom:6px">📐 <span data-t="patchDim">Dimensiones</span></div><div style="display:flex;gap:8px;align-items:flex-end"><div style="flex:1"><div style="font-size:10px;color:var(--txt2);margin-bottom:3px;font-weight:600" data-t="width">Ancho</div><input class="dim-inp" id="DW" type="number" value="${Math.round(pW*gUF()*10)/10}" min="0.1" max="9999" step="0.1" onchange="ODC()"></div><span style="font-size:14px;color:var(--txt3);margin-bottom:10px;font-weight:500">×</span><div style="flex:1"><div style="font-size:10px;color:var(--txt2);margin-bottom:3px;font-weight:600" data-t="length">Largo</div><input class="dim-inp" id="DL" type="number" value="${Math.round(pL*gUF()*10)/10}" min="0.1" max="9999" step="0.1" onchange="ODC()"></div><div style="flex:1" class="unit-wrap"><div style="font-size:10px;color:var(--txt2);margin-bottom:3px;font-weight:600" data-t="unit">Unidad</div><div class="unit-trigger" onclick="TU()"><span id="UL">${cU}</span><span style="font-size:12px">▼</span></div><div id="UD" class="unit-dd"><div onclick="SU('ft')">ft</div><div onclick="SU('in')">in</div><div onclick="SU('m')">m</div><div onclick="SU('cm')">cm</div></div></div></div><div style="margin-top:6px;font-size:10px;color:var(--txt3);font-weight:500" id="GI">Cuadrícula: ${gC} × ${gR}</div></div><div class="ph" id="PH"><span id="PHT"></span></div><div style="margin:4px 12px 6px;border-radius:14px;border:1.5px solid var(--cb);overflow:hidden"><div style="display:flex;background:#183a0e;border-bottom:1px solid var(--cb)"><div style="width:28px;flex-shrink:0;border-right:1px solid rgba(80,160,80,.3)"></div><div id="TopR" style="flex:1;display:grid"></div></div><div style="display:flex"><div id="LeftR" style="width:28px;flex-shrink:0;border-right:1px solid rgba(80,160,80,.3);background:#183a0e"></div><div style="flex:1;position:relative"><canvas id="GV"></canvas><div id="CG" style="position:absolute;top:0;left:0;width:100%;height:100%;display:grid"></div></div></div></div><div style="display:flex;gap:8px;padding:0 12px 6px;flex-wrap:wrap"><div style="display:flex;align-items:center;gap:3px;font-size:10px;color:var(--txt3)"><div style="width:10px;height:10px;background:rgba(80,160,80,.5);border-radius:3px"></div><span data-t="planted">Plantados</span></div><div style="display:flex;align-items:center;gap:3px;font-size:10px;color:var(--txt3)"><div style="width:10px;height:10px;background:rgba(200,80,200,.3);border-radius:3px"></div><span data-t="pestGuardLbl">Guardianas</span></div></div><div style="background:var(--hint);border:1.5px solid var(--hintb);border-radius:12px;padding:8px 12px;margin:0 12px 8px;font-size:11px;color:var(--hintt);font-weight:500" data-t="tapCellHint">Toca planta para editar/eliminar.</div><div class="sec">Cosecha esperada</div><div id="EHV"></div><div class="sec" data-t="commonPests">Plagas comunes</div><div style="padding:0 12px 14px"><div style="background:var(--card);border:1.5px solid #d06060;border-radius:12px;padding:10px 12px;display:flex;align-items:center;gap:10px"><div style="width:50px;height:50px;border-radius:10px;background:#ffeaea;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0">🐛</div><div style="flex:1"><div style="font-size:12px;font-weight:600;color:var(--txt)">Áfidos</div><div style="font-size:10px;color:var(--txt3)">Más común</div></div><div style="background:#300808;color:#f09090;border-radius:8px;padding:3px 8px;font-size:10px;font-weight:700">#1</div></div></div>`;aTx();bP();rEH();setTimeout(()=>dDay('dd-p'),50);}

function rEH(){
  const con=document.getElementById('EHV');
  if(!con)return;
  con.innerHTML='';
  
  const plants=Object.values(P).filter(p=>p.tp!=='pest'&&p.tp!=='flower'&&p.plantedAt&&p.harvestDays);
  if(plants.length===0){
    con.innerHTML='<div style="background:var(--card);border:1.5px solid var(--cb);border-radius:12px;margin:0 12px 10px;padding:16px;text-align:center;font-size:12px;color:var(--txt3);font-style:italic">No hay plantas en jardín todavía</div>';
    return;
  }
  
  plants.forEach(p=>{
    // usar los días de cosecha de la planta directamente
    const harvestDate=new Date(p.plantedAt+p.harvestDays*MSD);
    const mm=harvestDate.getMonth()+1,dd=harvestDate.getDate();
    const dateStr=`${['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][mm-1]} ${dd}`;
    const daysLeft=Math.max(0,Math.ceil((harvestDate-Date.now())/MSD));
    
    const div=document.createElement('div');
    div.className='trow';
    div.innerHTML=`<div style="font-size:22px;flex-shrink:0">${p.e}</div><div style="flex:1"><div style="font-size:12px;color:var(--txt);font-weight:600;margin-bottom:4px">${iS?(p.ns||p.n):p.n}</div><div class="pwbar"><div class="pwfill" style="width:${Math.min(100,(Date.now()-p.plantedAt)/(p.harvestDays*MSD)*100)}%"></div></div></div><div style="text-align:right;flex-shrink:0"><div style="font-size:11px;color:#4caf50;font-weight:700">${dateStr}</div><div style="font-size:9px;color:var(--txt3)">${daysLeft} días</div></div>`;
    con.appendChild(div);
  });
}

function ODC(){
  const w=parseFloat(document.getElementById('DW').value)||6;
  const l=parseFloat(document.getElementById('DL').value)||10;
  
  // convertir de la unidad actual a cm para guardar internamente
  pW=Math.round(toСm(w));
  pL=Math.round(toСm(l));
  
  const cs=Math.max(25,Math.round(Math.min(pW,pL)/6));
  const newGC=Math.max(2,Math.min(10,Math.round(pW/cs)));
  const newGR=Math.max(2,Math.min(8,Math.round(pL/cs)));
  
  // guardar plantas actuales con sus posiciones
  const currentPlants=[];
  for(let r=0;r<gR;r++){
    for(let c=0;c<gC;c++){
      if(pG[r]&&pG[r][c]){
        currentPlants.push({id:pG[r][c],r,c});
      }
    }
  }
  
  // actualizar dimensiones de la cuadrícula
  gC=newGC;
  gR=newGR;
  
  // crear cuadrícula vacía nueva
  pG=Array.from({length:gR},()=>Array(gC).fill(null));
  
  // restaurar plantas que caben en la cuadrícula nueva
  currentPlants.forEach(({id,r,c})=>{
    if(r<gR&&c<gC){
      pG[r][c]=id;
    }else{
      // la planta no cabe en la cuadrícula nueva, se elimina
      delete P[id];
    }
  });
  
  document.getElementById('GI').textContent=`Cuadrícula: ${gC} × ${gR}`;
  saveData();
  bP();
}

function bP(){
  rR();
  const gc=document.getElementById('GV'),cg=document.getElementById('CG');
  if(!gc||!cg)return;
  
  cg.style.gridTemplateColumns=`repeat(${gC},1fr)`;
  cg.style.gridTemplateRows=`repeat(${gR},1fr)`;
  document.getElementById('TopR').style.gridTemplateColumns=`repeat(${gC},1fr)`;
  
  const cH=Math.round(48*gR);
  gc.width=Math.min(360,window.innerWidth-60);
  gc.height=cH;
  gc.style.height=cH+'px';
  cg.style.height=cH+'px';
  
  const lr=document.getElementById('LeftR');
  lr.innerHTML='';
  gLL().forEach((t,i)=>{
    const d=document.createElement('div');
    d.style.cssText=`height:${cH/gR}px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#7caf60;font-weight:600;border-bottom:${i<gR-1?'1px solid rgba(80,160,80,.3)':'none'}`;
    d.textContent=t;
    lr.appendChild(d);
  });
  
  const ctx=gc.getContext('2d'),W=gc.width,H=gc.height,cw=W/gC,ch=H/gR;
  ctx.fillStyle=iN?'#0a1208':'#f4fff0';
  ctx.fillRect(0,0,W,H);
  
  ctx.strokeStyle=iN?'rgba(80,160,80,.12)':'rgba(60,160,60,.15)';
  ctx.lineWidth=.5;
  for(let x=cw/4;x<W;x+=cw/4){
    ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();
  }
  for(let y=ch/4;y<H;y+=ch/4){
    ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();
  }
  
  ctx.strokeStyle=iN?'rgba(80,160,80,.35)':'rgba(60,160,60,.3)';
  ctx.lineWidth=1;
  for(let i=0;i<=gC;i++){
    ctx.beginPath();ctx.moveTo(i*cw,0);ctx.lineTo(i*cw,H);ctx.stroke();
  }
  for(let i=0;i<=gR;i++){
    ctx.beginPath();ctx.moveTo(0,i*ch);ctx.lineTo(W,i*ch);ctx.stroke();
  }
  
  rCG();
}

function rCG(){
  const cg=document.getElementById('CG');
  if(!cg)return;
  cg.innerHTML='';
  
  for(let r=0;r<gR;r++)
    for(let c=0;c<gC;c++){
      const ci=pG[r]&&pG[r][c],pl=ci&&P[ci]?P[ci]:null,em=!ci;
      let bg=em?'transparent':pl&&(pl.tp==='pest'||pl.tp==='flower')?'rgba(200,80,200,.2)':'rgba(80,160,80,.2)';
      if(pP&&em)bg='rgba(40,100,220,.2)';
      
      const d=document.createElement('div');
      d.style.cssText=`display:flex;align-items:center;justify-content:center;font-size:16px;background:${bg};cursor:${(!em||pP)?'pointer':'default'};border:${pP&&em?'2px dashed #4080dd':'none'}`;
      d.textContent=pl?pl.e:'';
      if(em&&pP)d.onclick=()=>plc(r,c);
      else if(pl)d.onclick=()=>oEx(pl,r,c);
      cg.appendChild(d);
    }
}

// factores para convertir cm a la unidad actual
function gUF(){return cU==='m'?0.01:cU==='ft'?0.03281:cU==='in'?0.3937:1;}
// convertir unidad actual de vuelta a cm
function toСm(v){return cU==='m'?v*100:cU==='ft'?v*30.48:cU==='in'?v*2.54:v;}
function gRL(){return Array.from({length:gC},(_,i)=>Math.round(((i+1)*pW*gUF()/gC)*10)/10+cU);}
function gLL(){return Array.from({length:gR},(_,i)=>Math.round(((i+1)*pL*gUF()/gR)*10)/10);}

function rR(){
  const tr=document.getElementById('TopR');
  if(tr){
    tr.innerHTML='';
    gRL().forEach((t,i)=>{
      const d=document.createElement('div');
      d.style.cssText=`text-align:center;font-size:9px;color:#7caf60;padding:4px 0;border-right:${i<gC-1?'1px solid rgba(80,160,80,.3)':'none'};font-weight:600`;
      d.textContent=t;
      tr.appendChild(d);
    });
  }
}

// generador de tareas del calendario
function gCT(){
  const tasks=[];
  const today=new Date(),dd=today.getDate();
  
  Object.values(P).forEach(p=>{
    if(p.tp==='pest'||p.tp==='flower')return;
    
    for(let d=dd;d<=dd+7;d++){
      const targetDate=new Date(today.getFullYear(),today.getMonth(),d);
      const daysFromPlant=Math.floor((targetDate-p.lwt)/MSD);
      const wDue=daysFromPlant%p.wE===0;
      const fDue=daysFromPlant%p.fE===0;
      
      if(wDue)tasks.push({day:d,date:targetDate,type:'water',plant:p,col:'#e03030'});
      if(fDue)tasks.push({day:d,date:targetDate,type:'feed',plant:p,col:'#28b020'});
    }
  });
  
  return tasks.sort((a,b)=>a.date-b.date);
}

function rCS(){
  const hdr=document.getElementById('HDR');
  hdr.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between"><div style="flex:1"><div style="font-size:18px;font-weight:600;color:#fff">Calendario</div><div style="font-size:11px;color:rgba(255,255,255,.7)">Mayo 2026</div></div><canvas id="dd-c" width="36" height="36"></canvas></div>`;
  
  const main=document.getElementById('MAIN');
  main.innerHTML=`<div style="margin:12px"><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:10px">${['D','L','M','M','J','V','S'].map(d=>`<div style="text-align:center;font-size:10px;color:var(--txt3);font-weight:600;padding:6px 0">${d}</div>`).join('')}</div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px" id="CDG"></div></div><div style="background:var(--card);border:1.5px solid var(--cb);border-radius:12px;margin:0 12px 10px;padding:12px 14px"><div style="font-size:13px;font-weight:600;color:var(--txt);margin-bottom:8px">${selDay===new Date().getDate()?'Hoy':'Mayo '+selDay}</div><div id="TL"></div></div><div class="sec">Próxima semana</div><div id="UPW"></div>`;
  
  aTx();
  rCal();
  setTimeout(()=>dDay('dd-c'),50);
}

function rCal(){
  const cdg=document.getElementById('CDG');
  if(!cdg)return;
  const tasks=gCT(),today=new Date().getDate();
  
  for(let d=1;d<=31;d++){
    const isT=d===today,isSel=d===selDay;
    const dayTasks=tasks.filter(t=>t.day===d);
    
    const div=document.createElement('div');
    div.style.cssText=`background:${isSel?'#2d5a1b':iN?'#1a2614':'#fff'};border:1.5px solid ${isT&&!isSel?'#4caf50':'var(--cb)'};border-radius:10px;padding:8px 6px;text-align:center;cursor:pointer;transition:background .2s`;
    div.innerHTML=`<div style="font-size:12px;color:${isSel?'#fff':'var(--txt)'};font-weight:${isT||isSel?'600':'400'};margin-bottom:3px">${d}</div><div style="display:flex;gap:2px;justify-content:center;flex-wrap:wrap">${dayTasks.slice(0,3).map(t=>`<div style="width:4px;height:4px;background:${t.col};border-radius:50%"></div>`).join('')}</div>`;
    div.onclick=()=>{selDay=d;rCS();};
    cdg.appendChild(div);
  }
  
  const tl=document.getElementById('TL');
  if(!tl)return;
  
  const dayTasks=tasks.filter(t=>t.day===selDay);
  if(dayTasks.length===0){
    tl.innerHTML='<div style="font-size:11px;color:var(--txt3);font-style:italic">Sin tareas programadas</div>';
  }else{
    tl.innerHTML=`<div style="font-size:11px;color:var(--txt2);margin-bottom:8px">${dayTasks.length} tarea${dayTasks.length>1?'s':''}</div>`+dayTasks.map(t=>`<div style="border-left:3px solid ${t.col};padding-left:10px;margin-bottom:8px"><div style="font-size:12px;color:var(--txt);font-weight:600">${t.plant.e} ${t.type==='water'?'Regar':'Fertilizar'} ${t.plant.n}</div><div style="font-size:10px;color:var(--txt3)">${t.type==='water'?'Toca para registrar':'Aplicar fertilizante 10-10-10'}</div></div>`).join('');
  }
  
  const upw=document.getElementById('UPW');
  if(!upw)return;
  
  const upcoming=tasks.filter(t=>t.date>=new Date());
  if(upcoming.length===0){
    upw.innerHTML='<div style="background:var(--card);border:1.5px solid var(--cb);border-radius:12px;margin:0 12px 10px;padding:16px;text-align:center;font-size:12px;color:var(--txt3);font-style:italic">¡Todo al día!</div>';
  }else{
    upw.innerHTML=upcoming.slice(0,8).map(t=>{
      const mm=t.date.getMonth()+1,dd=t.date.getDate();
      const dateStr=dd===today?'Hoy':dd===today+1?'Mañana':`Mayo ${dd}`;
      const dateCol=dd===today?'#e03030':dd===today+1?'#4caf50':'#4080dd';
      return `<div class="trow"><div style="font-size:22px;flex-shrink:0">${t.plant.e}</div><div style="flex:1"><div style="font-size:12px;color:var(--txt);font-weight:600">${t.type==='water'?'Regar':'Fertilizar'} ${iS?(t.plant.ns||t.plant.n):t.plant.n}</div><div style="font-size:10px;color:var(--txt3)">${t.type==='water'?'Toca para registrar':'Aplicar fertilizante 10-10-10'}</div></div><div style="font-size:11px;color:${dateCol};font-weight:700">${dateStr}</div></div>`;
    }).join('');
  }
}

// pantalla de vegetales
function rVS(){
  const hdr=document.getElementById('HDR');
  hdr.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between"><div style="flex:1"><div style="font-size:18px;font-weight:600;color:#fff">${showFlowers?'Flores':'Vegetales'}</div><div style="font-size:11px;color:rgba(255,255,255,.7)">Zone 12b · ${VL.length} vegetales, ${FL.length} flores</div></div><div style="display:flex;align-items:center;gap:10px"><span style="font-size:20px">🔍</span><canvas id="dd-v" width="36" height="36"></canvas></div></div>`;
  
  const main=document.getElementById('MAIN');
  main.innerHTML=`<div style="margin:8px 12px 12px;display:flex;gap:8px"><select onchange="sortIdx=this.selectedIndex;rVL()" style="flex:1;background:var(--inp);border:1.5px solid var(--inpb);border-radius:10px;padding:10px 12px;font-size:12px;color:var(--txt);font-weight:600;outline:none;font-family:inherit"><option>⭐ Mejor para plantar ahora</option><option>📍 Mejor para la región</option><option>↑ A–Z</option><option>↓ Z–A</option><option>📈 Más populares</option><option>🔥 Más difíciles</option><option>👍 Fáciles primero</option></select><button onclick="showFlowers=!showFlowers;rVS()" style="background:${showFlowers?'#d05090':'#4caf50'};color:#fff;border:none;border-radius:10px;padding:10px 16px;font-size:13px;font-weight:700;cursor:pointer">${showFlowers?'🌻':'🥕'}</button></div><div id="VLC"></div>`;
  
  aTx();
  rVL();
  setTimeout(()=>dDay('dd-v'),50);
}

function rVL(){
  const con=document.getElementById('VLC');
  if(!con)return;
  con.innerHTML='';
  
  let list=showFlowers?[...FL]:[...VL];
  if(sortIdx===2)list.sort((a,b)=>a.n.localeCompare(b.n));
  else if(sortIdx===3)list.sort((a,b)=>b.n.localeCompare(a.n));
  else if(sortIdx===4)list.sort((a,b)=>(b.pop||0)-(a.pop||0));
  else if(sortIdx===5)list.sort((a,b)=>b.dif-a.dif);
  else if(sortIdx===6)list.sort((a,b)=>a.dif-b.dif);
  
  list.forEach(v=>{
    const dn=iS?v.ns:v.n;
    const vk=v.n.toLowerCase();
    const saved=!!SV[vk];
    
    const div=document.createElement('div');
    div.className='vr';
    div.onclick=()=>oVD(v);
    div.innerHTML=`<div style="font-size:24px;flex-shrink:0">${v.e}</div><div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--txt);margin-bottom:3px">${dn}</div><div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:3px"><span style="background:rgba(200,140,0,.1);color:#b06000;border-radius:6px;padding:2px 7px;font-size:10px">Dif: ${v.dif}/5</span><span style="background:rgba(80,160,80,.1);color:#4caf50;border-radius:6px;padding:2px 7px;font-size:10px">${v.sd}</span></div><div style="font-size:10px;color:var(--txt3)">${v.tmp} · ${v.mo} · ${v.sun} sol</div>${v.rg?`<div style="font-size:10px;color:${v.rg.includes('Ideal')?'#4caf50':v.rg.includes('hot')||v.rg.includes('Not')?'#e03030':'#c08010'};margin-top:3px">${v.rg}</div>`:''}</div><span onclick="event.stopPropagation();toggleBookmark('${vk}')" style="cursor:pointer;font-size:20px;color:${saved?'#4caf50':'var(--txt3)'};flex-shrink:0">★</span>`;
    con.appendChild(div);
  });
}

const vO=[...VL.map(v=>({e:v.e,n:v.n,s:v.ns,tp:'veg'})),...FL.map(f=>({e:f.e,n:f.n,s:f.ns,tp:'flower'})),{e:'🌿',n:'Basil',s:'Albahaca',tp:'pest'},{e:'🌸',n:'Marigold',s:'Maravilla',tp:'pest'}];

let pNP=null;
function OAP(){pickerType='veg';rPicker();document.getElementById('APM').style.display='flex';}
function rPicker(){
  const vp=document.getElementById('VP');
  vp.innerHTML='';
  const list=pickerType==='veg'?VL.map(v=>({e:v.e,n:v.n,s:v.ns,tp:'veg',sci:v.sci})):FL.map(f=>({e:f.e,n:f.n,s:f.ns,tp:'flower',sci:f.sci}));
  const extras=[{e:'🌿',n:'Basil',s:'Albahaca',tp:'pest'},{e:'🌸',n:'Marigold',s:'Maravilla',tp:'pest'}];
  [...list,...(pickerType==='veg'?extras:[])].forEach(v=>{
    const d=document.createElement('div');
    d.className='vo';
    d.innerHTML=`<div style="font-size:24px">${v.e}</div><div style="font-size:10px;margin-top:3px">${iS?v.s:v.n}</div>`;
    d.onclick=()=>{CAP();setTimeout(()=>oNw(v),60);};
    vp.appendChild(d);
  });
  document.getElementById('vegBtn').className=pickerType==='veg'?'on':'';
  document.getElementById('flwBtn').className=pickerType==='flower'?'on':'';
}
function CAP(){document.getElementById('APM').style.display='none';}

function oNw(v){
  pNP={e:v.e,n:v.n,ns:v.s,tp:v.tp,ex:false,sci:v.sci||''};
  document.getElementById('PIT').textContent=v.e+' '+(iS?v.s:v.n);
  const t=new Date(),p2=n=>String(n).padStart(2,'0');
  document.getElementById('FD').value=`${t.getFullYear()}-${p2(t.getMonth()+1)}-${p2(t.getDate())}`;
  document.getElementById('FQ').value='1'; // reiniciar cantidad a 1
  document.getElementById('FW').selectedIndex=1;
  document.getElementById('FS').selectedIndex=0;
  document.getElementById('FF').selectedIndex=2;
  document.getElementById('FN').value='';
  document.getElementById('RMB').style.display='none';
  const isPest=v.tp==='pest'||v.tp==='flower';
  // mostrar/ocultar campo de cantidad
  document.getElementById('QFR').style.display=isPest?'none':'block';
  document.getElementById('WFR').style.display=isPest?'none':'block';
  document.getElementById('SFR').style.display=isPest?'none':'block';
  document.getElementById('FFR').style.display=isPest?'none':'block';
  const pgs=document.getElementById('PGS'),pgl=document.getElementById('PGL');
  if(!isPest&&PGR[v.n.toLowerCase()]){
    const recs=PGR[v.n.toLowerCase()];
    if(recs.length>0){
      pgl.innerHTML='';
      recs.forEach(pg=>{
        const pgV=vO.find(x=>x.n.toLowerCase()===pg);
        if(pgV){
          const d=document.createElement('div');
          d.style.cssText='background:rgba(200,80,200,.15);border:1px solid #c060c0;border-radius:8px;padding:4px 8px;font-size:11px;color:#e090e0;font-weight:600';
          d.textContent=pgV.e+' '+(iS?pgV.s:pgV.n);
          pgl.appendChild(d);
        }
      });
      pgs.style.display='block';
    }else{
      pgs.style.display='none';
    }
  }else{
    pgs.style.display='none';
  }
  document.getElementById('PIM').style.display='flex';
}

function oEx(p,r,c){
  pNP={e:p.e,n:p.n,ns:p.ns,id:p.id,tp:p.tp,r,c,ex:true};
  document.getElementById('PIT').textContent=p.e+' '+(iS?(p.ns||p.n):p.n);
  const t=new Date(),p2=n=>String(n).padStart(2,'0');
  document.getElementById('FD').value=`${t.getFullYear()}-${p2(t.getMonth()+1)}-${p2(t.getDate())}`;
  
  if(p.tp!=='pest'&&p.tp!=='flower'){
    document.getElementById('FW').selectedIndex=Math.max(0,[1,2,3,4].indexOf(p.wE));
    document.getElementById('WFR').style.display='block';
    document.getElementById('SFR').style.display='block';
    document.getElementById('FFR').style.display='block';
  }else{
    document.getElementById('WFR').style.display='none';
    document.getElementById('SFR').style.display='none';
    document.getElementById('FFR').style.display='none';
  }
  
  // ocultar cantidad al editar
  document.getElementById('QFR').style.display='none';
  document.getElementById('PGS').style.display='none';
  document.getElementById('FN').value='';
  document.getElementById('RMB').style.display='block';
  document.getElementById('PIM').style.display='flex';
}

function CPI(){document.getElementById('PIM').style.display='none';pNP=null;}

function RP(){if(!pNP||!pNP.ex||!pNP.id)return;if(pG[pNP.r]&&pG[pNP.r][pNP.c]===pNP.id)pG[pNP.r][pNP.c]=null;delete P[pNP.id];CPI();saveData();rCG();if(curScr==='garden')rG();if(curScr==='patch')rEH();}

function SPI(){
  if(!pNP)return;
  const isPest=pNP.tp==='pest'||pNP.tp==='flower';
  let wE=2,fE=30,sF=.9;
  
  if(!isPest){
    const wM={0:1,1:2,2:3,3:4},fM={0:7,1:14,2:30,3:42},sM={0:.9,1:.55,2:.35,3:.15};
    wE=wM[document.getElementById('FW').selectedIndex]||2;
    fE=fM[document.getElementById('FF').selectedIndex]||30;
    sF=sM[document.getElementById('FS').selectedIndex]||.9;
  }
  
  const dV=document.getElementById('FD').value,today=new Date(),pl=new Date(dV);
  const dA=Math.max(0,Math.floor((today-pl)/86400000));
  
  // editar planta existente
  if(pNP.ex&&pNP.id){
    const p=P[pNP.id];
    if(p&&!isPest){
      p.wE=wE;
      p.fE=fE;
      p.sF=sF;
      p.lwt=Date.now()-dA*MSD;
      p.lft=Date.now()-dA*MSD;
      p.w=false;
      // conservar fecha de siembra y días de cosecha si existen
      if(!p.plantedAt)p.plantedAt=pl.getTime();
      if(!p.harvestDays){
        const vk=p.n.toLowerCase();
        const vinfo=VG[vk];
        p.harvestDays=vinfo?vinfo.harvestDays:70;
      }
    }
    CPI();
    saveData();
    if(curScr==='garden')rG();
    rCG();
    if(curScr==='patch')rEH();
    return;
  }
  
  // crear planta(s) nueva(s) - obtener cantidad
  const qty=parseInt(document.getElementById('FQ').value)||1;
  const vk=pNP.n.toLowerCase();
  const vinfo=VG[vk];
  
  // crear plantas y añadir a la cola
  pQueue=[];
  for(let i=0;i<qty;i++){
    const id=vk.replace(/[^a-z]/g,'')+Date.now()%10000+i;
    P[id]={
      id,
      tp:pNP.tp,
      e:pNP.e,
      n:pNP.n,
      ns:pNP.ns||pNP.n,
      wE,
      fE,
      sF,
      lwt:Date.now()-dA*MSD,
      lft:Date.now()-dA*MSD,
      w:false,
      plantedAt:pl.getTime(),
      harvestDays:vinfo?vinfo.harvestDays:70,
      sci:pNP.sci||''
    };
    pQueue.push({id,e:pNP.e,nm:iS?pNP.ns:pNP.n});
  }
  
  const svK=pNP.n.toLowerCase();
  if(SV[svK]){
    delete SV[svK];
    if(curScr==='garden')rSaved();
  }
  
  // empezar a colocar la primera planta
  pP=pQueue.shift();
  CPI();
  saveData();
  const remaining=pQueue.length;
  document.getElementById('PHT').textContent=`${pP.e} ${pP.nm} — ${iS?'toca celda':'tap cell'}${remaining>0?` (${remaining+1} ${iS?'restantes':'left'})`:``}`;
  document.getElementById('PH').style.display='block';
  rCG();
}

function plc(r,c){
  if(!pP)return;
  if(!pG[r])pG[r]=Array(gC).fill(null);
  
  // verificar advertencia de rotación
  const plant=P[pP.id];
  if(plant){
    const warning=checkRotationWarning(r,c,plant.n);
    if(warning){
      if(!confirm(warning+'\n\n'+(iS?'¿Plantar de todas formas?':'Plant anyway?'))){
        return; // no plantar si el usuario cancela
      }
    }
    // registrar rotación
    trackRotation(r,c,plant.n);
  }
  
  pG[r][c]=pP.id;
  
  // verificar si quedan plantas en la cola
  if(pQueue.length>0){
    pP=pQueue.shift();
    const remaining=pQueue.length;
    document.getElementById('PHT').textContent=`${pP.e} ${pP.nm} — ${iS?'toca celda':'tap cell'}${remaining>0?` (${remaining+1} ${iS?'restantes':'left'})`:``}`;
    saveData();
    rCG();
    if(curScr==='garden')rG();
    if(curScr==='patch')rEH();
  }else{
    // no quedan plantas, terminó la colocación
    pP=null;
    document.getElementById('PH').style.display='none';
    saveData();
    rCG();
    if(curScr==='garden')rG();
    if(curScr==='patch')rEH();
  }
}

// sistema de notificaciones
async function requestNotifications(){
  if(!('Notification' in window)){
    alert(iS?'Tu navegador no soporta notificaciones':'Browser does not support notifications');
    return false;
  }
  
  if(Notification.permission==='granted'){
    notificationsEnabled=true;
    scheduleWateringNotifications();
    return true;
  }
  
  if(Notification.permission!=='denied'){
    const permission=await Notification.requestPermission();
    if(permission==='granted'){
      notificationsEnabled=true;
      scheduleWateringNotifications();
      return true;
    }
  }
  return false;
}

function scheduleWateringNotifications(){
  if(!notificationsEnabled)return;
  
  // revisar cada hora qué plantas necesitan agua
  setInterval(()=>{
    Object.values(P).forEach(p=>{
      if(p.tp==='pest'||p.tp==='flower')return;
      if(isOD(p)){
        new Notification('🌱 Huerto',{
          body:`${p.e} ${iS?(p.ns||p.n):p.n} ${iS?'necesita agua!':'needs water!'}`,
          icon:'/favicon.ico',
          tag:p.id
        });
      }
    });
  },3600000); // revisar cada hora
}

// integración con API del clima de Puerto Rico
async function fetchWeather(){
  if(!weatherEnabled)return;
  
  try{
    // usando OpenWeatherMap para San Juan, PR
    const API_KEY='demo'; // reemplaza con tu propia key de openweathermap.org
    const response=await fetch(`https://api.openweathermap.org/data/2.5/weather?q=San Juan,PR&appid=${API_KEY}&units=metric&lang=${iS?'es':'en'}`);
    
    if(!response.ok)throw new Error('Weather fetch failed');
    
    weatherData=await response.json();
    updateWeatherDisplay();
  }catch(e){
    console.log('Weather unavailable:',e);
    weatherData=null;
  }
}

function updateWeatherDisplay(){
  if(!weatherData||!weatherEnabled)return;
  
  const temp=Math.round(weatherData.main.temp);
  const desc=weatherData.weather[0].description;
  const rain=weatherData.rain?weatherData.rain['1h']||0:0;
  
  // mostrar clima en el header si está disponible
  const weatherEl=document.getElementById('weather-display');
  if(weatherEl){
    weatherEl.textContent=`${temp}°C ${desc}${rain>0?' 🌧️':''}`;
  }
}

// rastreo de rotación de cultivos
function trackRotation(r,c,plantName){
  if(!rotationEnabled)return;
  
  const key=`${r}-${c}`;
  if(!rotationHistory[key])rotationHistory[key]=[];
  
  const plantFamily=getPlantFamily(plantName);
  rotationHistory[key].push({
    plant:plantName,
    family:plantFamily,
    date:Date.now()
  });
  
  // guardar solo las últimas 5 siembras
  if(rotationHistory[key].length>5){
    rotationHistory[key]=rotationHistory[key].slice(-5);
  }
  
  saveData();
}

function getPlantFamily(plantName){
  const families={
    tomato:'solanaceae',potato:'solanaceae',pepper:'solanaceae',eggplant:'solanaceae',chilli:'solanaceae',
    bean:'legume',pea:'legume',peanut:'legume',
    carrot:'apiaceae',
    lettuce:'asteraceae',
    corn:'poaceae',
    squash:'cucurbitaceae',pumpkin:'cucurbitaceae',cucumber:'cucurbitaceae',chayote:'cucurbitaceae'
  };
  return families[plantName.toLowerCase()]||'other';
}

function checkRotationWarning(r,c,plantName){
  if(!rotationEnabled)return null;
  
  const key=`${r}-${c}`;
  const history=rotationHistory[key]||[];
  const newFamily=getPlantFamily(plantName);
  
  // verificar las últimas 2 siembras
  const recent=history.slice(-2);
  for(let i=0;i<recent.length;i++){
    if(recent[i].family===newFamily&&newFamily!=='other'){
      return iS?`⚠️ Misma familia sembrada aquí recientemente (${recent[i].plant}). Considera rotar.`:`⚠️ Same family planted here recently (${recent[i].plant}). Consider rotating.`;
    }
  }
  return null;
}
function doW(id){const p=P[id];if(!p||p.w||p.tp==='pest'||p.tp==='flower')return;p.w=true;p.lwt=Date.now();const wb=document.getElementById('wb-'+id),ub=document.getElementById('ub-'+id),lbl=document.getElementById('wl-'+id),card=document.getElementById('gc-'+id);if(wb)wb.style.display='none';if(ub)ub.style.display='flex';if(card)card.style.borderColor='var(--cb)';dWI('wi-'+id,true);if(lbl){lbl.style.color='#4caf50';lbl.textContent=tx('wn');}saveData();clearInterval(wT[id]);let m=0;wT[id]=setInterval(()=>{m++;const l=document.getElementById('wl-'+id);if(l)l.textContent=`${iS?'Regado hace':'Watered'} ${m<60?m+'m':Math.floor(m/60)+'h'} ${iS?'':'ago'}`;},60000);const cyc=p.wE*MSD;setTimeout(()=>{if(p.w){p.w=false;clearInterval(wT[id]);saveData();const w2=document.getElementById('wb-'+id),u2=document.getElementById('ub-'+id);if(w2){w2.style.display='flex';w2.onclick=()=>doW(id);}if(u2)u2.style.display='none';dWI('wi-'+id,false);const l2=document.getElementById('wl-'+id);if(l2){l2.style.color='#b06000';l2.textContent=tx('nw');}}},cyc);}

function unW(id){const p=P[id];if(!p||!p.w||p.tp==='pest'||p.tp==='flower')return;clearInterval(wT[id]);p.w=false;p.lwt=Date.now()-p.wE*MSD*.95;const wb=document.getElementById('wb-'+id),ub=document.getElementById('ub-'+id),lbl=document.getElementById('wl-'+id);if(wb){wb.style.display='flex';wb.onclick=()=>doW(id);}if(ub)ub.style.display='none';dWI('wi-'+id,false);if(lbl){lbl.style.color='#b06000';lbl.textContent=tx('nw');}saveData();}

// toggles de configuración
async function toggleNotifications(){
  if(!notificationsEnabled){
    const granted=await requestNotifications();
    if(granted){
      notificationsEnabled=true;
      saveData();
      rGS();
    }
  }else{
    notificationsEnabled=false;
    saveData();
    rGS();
  }
}

async function toggleWeather(){
  weatherEnabled=!weatherEnabled;
  if(weatherEnabled){
    await fetchWeather();
    // actualizar clima cada 30 minutos
    setInterval(fetchWeather,1800000);
  }
  saveData();
  rGS();
}

function toggleRotation(){
  rotationEnabled=!rotationEnabled;
  saveData();
  rGS();
}

function TT(){tC=!tC;document.getElementById('TB').textContent=tC?'°C':'°F';saveData();}
function TU(){const dd=document.getElementById('UD');dd.style.display=dd.style.display==='none'?'block':'none';}
function SU(u){cU=u;document.getElementById('UL').textContent=u;document.getElementById('UD').style.display='none';const f=gUF();document.getElementById('DW').value=Math.round(pW*f*10)/10;document.getElementById('DL').value=Math.round(pL*f*10)/10;document.getElementById('GI').textContent=`Cuadrícula: ${gC} × ${gR}`;saveData();rR();bP();}
function TN(){iN=!iN;document.getElementById('app').classList.toggle('night',iN);const nb=document.getElementById('NB');nb.style.background=iN?'#c8a000':'#161628';nb.style.color=iN?'#1a1a00':'#b0b0cc';nb.textContent=iN?`☀️ ${tx('dm')}`:`🌙 ${tx('nm')}`;saveData();if(curScr==='patch')bP();if(curScr==='garden')rSaved();if(curScr==='cal')rCS();if(curScr==='veg')rVL();}
function TL(){iS=!iS;document.getElementById('LB').textContent=iS?'🌐 English':'🌐 Español';const nb=document.getElementById('NB');nb.textContent=iN?`☀️ ${tx('dm')}`:`🌙 ${tx('nm')}`;saveData();aTx();if(curScr==='garden'){rG();rSaved();}if(curScr==='veg')rVL();}

// cerrar dropdown de unidad al hacer clic afuera
document.addEventListener('click',e=>{if(!e.target.closest('.unit-wrap'))document.getElementById('UD').style.display='none';});

function updateTime(){const now=new Date();document.getElementById('statusTime').textContent=now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:false});}

// loop de animación para discos e indicadores
function loop(){
  ['dd-g','dd-p','dd-c','dd-v'].forEach(id=>{if(document.getElementById(id))dDay(id);});
  Object.keys(P).forEach(id=>{
    const p=P[id];
    if(p.tp!=='pest'&&p.tp!=='flower'&&document.getElementById('dl-'+id))dDial('dl-'+id,id);
    const lbl=document.getElementById('wl-'+id);
    if(lbl&&p&&p.tp!=='pest'&&p.tp!=='flower'&&!p.w){
      const od=isOD(p),a=arcs(p),nd=a.w>=.75&&!od;
      lbl.textContent=od?tx('od'):nd?tx('nw'):tx('tw');
      lbl.style.color=od?'#e03030':nd?'#b06000':'var(--txt3)';
      const card=document.getElementById('gc-'+id);
      if(card)card.style.borderColor=od?'#e03030':'var(--cb)';
    }
  });
  Object.keys(SV).forEach(k=>{if(document.getElementById('bd-'+k))dBook('bd-'+k,SV[k].f,SV[k].a);});
  requestAnimationFrame(loop);
}

function init(){
  loadData();
  goTo('garden');
  loop();
  updateTime();
  setInterval(updateTime,60000);
  // inicializar íconos de Lucide
  if(typeof lucide!=='undefined')lucide.createIcons();
}

init();
