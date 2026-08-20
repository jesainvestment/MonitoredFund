async function loadCSV(){
const res=await fetch("MonitoredFund.csv?v=" + Date.now());
const txt=await res.text();
const rows=txt.trim().split(/\r?\n/).map(r=>r.split(','));
const head=rows[0],data=rows.slice(1);
let up=0,down=0,same=0,nodata=0;
const t=document.getElementById('fundTable');
const hr=t.createTHead().insertRow();
head.forEach((h,i)=>{let th=document.createElement('th');th.textContent=h;if(i===head.length-1)th.className='latest';hr.appendChild(th);});
const tb=t.createTBody();
data.forEach(r=>{
 let tr=tb.insertRow();let prev=null;let lastTrend='➡';
 r.forEach((c,i)=>{
   let td=tr.insertCell();
   if(i<2){td.textContent=c;return;}
   if(c===''){td.textContent='';prev=null;nodata++;return;}
   let v=parseFloat(c);
   if(isNaN(v)){td.textContent=c;return;}
   if(prev===null){td.textContent='■ '+v.toFixed(4);td.className='same';same++;}
   else if(v>prev){td.textContent='▲ '+v.toFixed(4);td.className='up';up++;lastTrend='📈';}
   else if(v<prev){td.textContent='▼ '+v.toFixed(4);td.className='down';down++;lastTrend='📉';}
   else{td.textContent='■ '+v.toFixed(4);td.className='same';same++;}
   prev=v;
 });
 let td=tr.insertCell();td.textContent=lastTrend;
});
let th=document.createElement('th');th.textContent='Trend';hr.appendChild(th);
document.getElementById('stats').innerHTML=
`Total Funds: ${data.length} &nbsp;&nbsp; 🟢 Up: ${up} &nbsp;&nbsp; 🔴 Down: ${down} &nbsp;&nbsp; ⚪ Same: ${same} &nbsp;&nbsp; ⚫ No Data: ${nodata}`;
}
loadCSV();
