async function loadCSV(){
const res=await fetch("MonitoredFund.csv?v="+Date.now());
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
`Total Funds: ${data.length} &nbsp;&nbsp;
🟢 Up: ${up} &nbsp;&nbsp;
🔴 Down: ${down} &nbsp;&nbsp;
⚪ Same: ${same} &nbsp;&nbsp;
⚫ No Data: ${nodata}`;


/* ==================================================
   LOCK FIRST 4 COLUMNS
   Sequence / Fund / High / Low
   ================================================== */

const col1Width=t.querySelector('th:nth-child(1)').offsetWidth;
const col2Width=t.querySelector('th:nth-child(2)').offsetWidth;
const col3Width=t.querySelector('th:nth-child(3)').offsetWidth;


/* Sequence */

t.querySelectorAll('th:nth-child(1),td:nth-child(1)').forEach(cell=>{
    cell.style.position='sticky';
    cell.style.left='0px';
    cell.style.zIndex='10';
    cell.style.background='#fff';
});


/* Fund */

t.querySelectorAll('th:nth-child(2),td:nth-child(2)').forEach(cell=>{
    cell.style.position='sticky';
    cell.style.left=col1Width+'px';
    cell.style.zIndex='10';
    cell.style.background='#fff';
});


/* High */

t.querySelectorAll('th:nth-child(3),td:nth-child(3)').forEach(cell=>{
    cell.style.position='sticky';
    cell.style.left=(col1Width+col2Width)+'px';
    cell.style.zIndex='10';
    cell.style.background='#fff';
});


/* Low */

t.querySelectorAll('th:nth-child(4),td:nth-child(4)').forEach(cell=>{
    cell.style.position='sticky';
    cell.style.left=(col1Width+col2Width+col3Width)+'px';
    cell.style.zIndex='10';
    cell.style.background='#fff';
});


/* Make locked headers stay above everything */

t.querySelectorAll('th:nth-child(1),th:nth-child(2),th:nth-child(3),th:nth-child(4)').forEach(cell=>{
    cell.style.zIndex='20';
    cell.style.background='#e6e6e6';
});

}

loadCSV();