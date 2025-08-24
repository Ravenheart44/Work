const csvFolder = "data/";
const csvFileNames = [
  "Cuts.csv",
  "Grinds.csv",
  "Veal.csv",
  "beef.csv",
  "npchick.csv",
  "nppork.csv",
  "pork.csv",
  "poultry.csv",
  "smoked.csv"
];

const filterInput = document.getElementById('filter');
const tabsEl = document.getElementById('tabs');
const container = document.getElementById('listsContainer');
const showCodes = document.getElementById('showCodes');
const selectAllBtn = document.getElementById('selectAll');
const clearAllBtn = document.getElementById('clearAll');
const exportAllBtn = document.getElementById('exportAll');

let dataByFile = [];
let activeIndex = 0;

function parseCSV(text, delim=',') {
  const rows = [];
  let i=0, N=text.length;
  while(i<N) {
    const row=[];
    let field='', quotes=false;
    while(i<N) {
      const ch=text[i];
      if(quotes) {
        if(ch==='"') {
          if(text[i+1]==='"'){field+='"';i+=2;}
          else {quotes=false;i++;}
        } else {field+=ch;i++;}
      } else {
        if(ch==='"'){quotes=true;i++;}
        else if(ch===delim){row.push(field);field='';i++;}
        else if(ch==='\n'){row.push(field);i++;break;}
        else if(ch==='\r'){i++;if(text[i]==='\n')i++;row.push(field);break;}
        else {field+=ch;i++;}
      }
    }
    if(i>=N && (field!=='' || row.length>0)) row.push(field);
    if(row.length>0 && row.some(f=>f.trim()!=='')) rows.push(row);
  }
  return rows;
}

function guessCols(header){
  const map={}; header.forEach((h,i)=>map[h.trim().toLowerCase()]=i);
  return {
    code: map.code ?? 0,
    name: map.name ?? 1
  };
}

async function loadCSVFileFromURL(fileName){
  const response = await fetch(csvFolder + fileName);
  const text = await response.text();
  const rows=parseCSV(text, ',');
  let start=0, codeIdx=0, nameIdx=1;
  const guess=guessCols(rows[0]||[]);
  if(guess.code!==undefined && guess.name!==undefined && guess.code!==guess.name){
    codeIdx=guess.code; nameIdx=guess.name; start=1;
  }
  const items=[];
  for(let i=start;i<rows.length;i++){
    const code=(rows[i][codeIdx]||'').trim();
    const name=(rows[i][nameIdx]||'').trim();
    if(name) items.push({code,name});
  }
  const saved=JSON.parse(localStorage.getItem('checks_'+fileName) || '[]');
  return {name:fileName.replace(/\.[^/.]+$/,''), fileName, items, checks:new Set(saved)};
}

function saveChecks(){
  dataByFile.forEach(f=>{
    localStorage.setItem('checks_'+f.fileName, JSON.stringify([...f.checks]));
  });
}

function renderTabs(){
  tabsEl.innerHTML='';
  dataByFile.forEach((f,idx)=>{
    const tab=document.createElement('div');
    tab.className='tab'+(idx===activeIndex?' active':'');
    tab.textContent=f.name;
    tab.onclick=()=>{activeIndex=idx; renderTabs(); renderLists();};
    tabsEl.appendChild(tab);
  });
}

function renderLists(){
  container.innerHTML='';
  const filter=filterInput.value.trim().toLowerCase();
  dataByFile.forEach((f,idx)=>{
    const div=document.createElement('div');
    div.className='list';
    div.style.display=idx===activeIndex?'block':'none';
    f.items.forEach((it,i)=>{
      if(filter && !(it.name.toLowerCase().includes(filter) || it.code.toLowerCase().includes(filter))) return;
      const row=document.createElement('div');
      row.className='item';
      const cb=document.createElement('input');
      cb.type='checkbox';
      cb.checked=f.checks.has(i);
      cb.onchange=()=>{cb.checked?f.checks.add(i):f.checks.delete(i); saveChecks();};
      const lbl=document.createElement('label');
      lbl.innerHTML= showCodes.checked
        ? `<strong>${it.name}</strong> — <span class="small">${it.code}</span>`
        : it.name;
      row.append(cb,lbl);
      div.appendChild(row);
    });
    container.appendChild(div);
  });
}

showCodes.addEventListener('change', ()=>renderLists());
filterInput.addEventListener('input', ()=>renderLists());

selectAllBtn.onclick=()=>{
  const f=dataByFile[activeIndex];
  f.items.forEach((_,i)=>f.checks.add(i));
  saveChecks();
  renderLists();
};
clearAllBtn.onclick=()=>{
  const f=dataByFile[activeIndex];
  f.checks.clear();
  saveChecks();
  renderLists();
};

exportAllBtn.onclick=()=>{
  const lines=[];
  dataByFile.forEach(f=>{
    f.checks.forEach(i=>{
      const it=f.items[i];
      lines.push(`${it.code?it.code+'\t':''}${it.name}`);
    });
  });
  if(!lines.length){alert('No items checked');return;}
  const blob=new Blob([lines.join('\n')],{type:'text/plain'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='checked-items.txt';
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);
};

// Auto-load all CSVs on page load
(async ()=>{
  const all=await Promise.all(csvFileNames.map(loadCSVFileFromURL));
  dataByFile=all;
  activeIndex=0;
  renderTabs();
  renderLists();
})();