async function loadCSV(){
const res=await fetch("MonitoredFund.csv?v=" + Date.now());
const txt=await res.text();

const rows=txt.trim().split(/\r?\n/).map(r=>r.split(','));
const head=rows[0],data=rows.slice(1);

let up=0,down=0,same=0,nodata=0;

const t=document.getElementById('fundTable');

const hr=t.createTHead().insertRow();

head.forEach((h,i)=>{
    let th=document.createElement('th');
    th.textContent=h;

    if(i===head.length-1)
        th.className='latest';

    hr.appendChild(th);
});

const tb=t.createTBody();

data.forEach(r=>{

    let tr=tb.insertRow();
    let prev=null;
    let lastTrend='➡';

    r.forEach((c,i)=>{

        let td=tr.insertCell();

        /* FIRST 4 COLUMNS ARE TEXT */
        if(i<4){
            td.textContent=c;
            return;
        }

        /* ORIGINAL PRICE LOGIC */

        if(c===''){
            td.textContent='';
            prev=null;
            nodata++;
            return;
        }

        let v=parseFloat(c);

        if(isNaN(v)){
            td.textContent=c;
            return;
        }

        if(prev===null){
            td.textContent='■ '+v.toFixed(4);
            td.className='same';
            same++;
        }
        else if(v>prev){
            td.textContent='▲ '+v.toFixed(4);
            td.className='up';
            up++;
            lastTrend='📈';
        }
        else if(v<prev){
            td.textContent='▼ '+v.toFixed(4);
            td.className='down';
            down++;
            lastTrend='📉';
        }
        else{
            td.textContent='■ '+v.toFixed(4);
            td.className='same';
            same++;
        }

        prev=v;
    });

    let td=tr.insertCell();
    td.textContent=lastTrend;
});

let th=document.createElement('th');
th.textContent='Trend';
hr.appendChild(th);

document.getElementById('stats').innerHTML=
`Total Funds: ${data.length}
&nbsp;&nbsp; 🟢 Up: ${up}
&nbsp;&nbsp; 🔴 Down: ${down}
&nbsp;&nbsp; ⚪ Same: ${same}
&nbsp;&nbsp; ⚫ No Data: ${nodata}`;


/* LOCK FIRST 4 COLUMNS */

let left1=0;
let left2=0;
let left3=0;
let left4=0;


/* Get widths */

const col1=t.querySelector('th:nth-child(1)').offsetWidth;
const col2=t.querySelector('th:nth-child(2)').offsetWidth;
const col3=t.querySelector('th:nth-child(3)').offsetWidth;
const col4=t.querySelector('th:nth-child(4)').offsetWidth;

left1=0;
left2=col1;
left3=col1+col2;
left4=col1+col2+col3;


/* Apply sticky positions */

t.querySelectorAll('th:nth-child(1),td:nth-child(1)').forEach(x=>{
    x.style.position='sticky';
    x.style.left=left1+'px';
    x.style.zIndex='10';
});

t.querySelectorAll('th:nth-child(2),td:nth-child(2)').forEach(x=>{
    x.style.position='sticky';
    x.style.left=left2+'px';
    x.style.zIndex='10';
});

t.querySelectorAll('th:nth-child(3),td:nth-child(3)').forEach(x=>{
    x.style.position='sticky';
    x.style.left=left3+'px';
    x.style.zIndex='10';
});

t.querySelectorAll('th:nth-child(4),td:nth-child(4)').forEach(x=>{
    x.style.position='sticky';
    x.style.left=left4+'px';
    x.style.zIndex='10';
});

}
loadCSV();