async function loadCSV(){

const res=await fetch("MonitoredFund.csv?v="+Date.now());
const txt=await res.text();

const rows=txt.trim().split(/\r?\n/).map(r=>r.split(','));
const head=rows[0];
const data=rows.slice(1);

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

        /*
         * FIRST 3 COLUMNS:
         * Fund / High / Low
         *
         * Keep exactly as text.
         */
        if(i<3){

            td.textContent=c;

            return;
        }


        /*
         * ORIGINAL NUMERIC LOGIC
         */

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


    /*
     * TREND
     */

    let td=tr.insertCell();

    td.textContent=lastTrend;

});


/*
 * TREND HEADER
 */

let th=document.createElement('th');

th.textContent='Trend';

hr.appendChild(th);


/*
 * STATISTICS
 */

document.getElementById('stats').innerHTML=
`Total Funds: ${data.length}
&nbsp;&nbsp; 🟢 Up: ${up}
&nbsp;&nbsp; 🔴 Down: ${down}
&nbsp;&nbsp; ⚪ Same: ${same}
&nbsp;&nbsp; ⚫ No Data: ${nodata}`;


/* =================================================
   LOCK FIRST 3 COLUMNS
   Fund / High / Low
   ================================================= */

let leftPosition=0;

for(let index=0;index<3;index++){

    const cells=t.querySelectorAll(
        `th:nth-child(${index+1}),
         td:nth-child(${index+1})`
    );

    if(cells.length===0)
        continue;


    /*
     * Get actual column width
     */

    const width=cells[0].getBoundingClientRect().width;


    cells.forEach(cell=>{

        cell.style.position='sticky';

        cell.style.left=leftPosition+'px';


        /*
         * Header
         */

        if(cell.tagName==='TH'){

            cell.style.top='0';

            cell.style.zIndex='20';

            cell.style.background='#e6e6e6';

        }


        /*
         * Body
         */

        else{

            cell.style.zIndex='10';

            cell.style.background='#fff';

        }

    });


    leftPosition+=width;
}

}

loadCSV();