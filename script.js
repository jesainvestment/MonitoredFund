async function loadCSV(){

    try {

        const res = await fetch("MonitoredFund.csv?v=" + Date.now());

        if(!res.ok){
            throw new Error("Cannot load MonitoredFund.csv: " + res.status);
        }

        const txt = await res.text();

        if(!txt.trim()){
            throw new Error("MonitoredFund.csv is empty");
        }

        const rows = txt.trim()
            .split(/\r?\n/)
            .map(r => r.split(','));

        const head = rows[0];
        const data = rows.slice(1);

        let up = 0;
        let down = 0;
        let same = 0;
        let nodata = 0;

        const t = document.getElementById('fundTable');

        t.innerHTML = "";


        /* =========================
           HEADER
           ========================= */

        const hr = t.createTHead().insertRow();

        head.forEach((h,i)=>{

            let th = document.createElement('th');

            th.textContent = h.trim();

            if(i === head.length - 1){
                th.className = 'latest';
            }

            hr.appendChild(th);

        });


        /* =========================
           BODY
           ========================= */

        const tb = t.createTBody();

        data.forEach(r=>{

            let tr = tb.insertRow();

            let prev = null;
            let lastTrend = '➡';


            /* Make sure row has enough columns */

            while(r.length < head.length){
                r.push('');
            }


            r.forEach((c,i)=>{

                let td = tr.insertCell();

                c = c.trim();


                /*
                 * FIRST 4 COLUMNS
                 *
                 * Sequence
                 * Fund
                 * High
                 * Low
                 *
                 * Display exactly as text.
                 */

                if(i < 4){

                    td.textContent = c;

                    return;
                }


                /*
                 * COLUMN 5 ONWARD
                 *
                 * Original numeric logic
                 */

                if(c === ''){

                    td.textContent = '';

                    prev = null;

                    nodata++;

                    return;
                }


                let v = parseFloat(c);


                if(isNaN(v)){

                    td.textContent = c;

                    return;
                }


                if(prev === null){

                    td.textContent = '■ ' + v.toFixed(4);

                    td.className = 'same';

                    same++;

                }

                else if(v > prev){

                    td.textContent = '▲ ' + v.toFixed(4);

                    td.className = 'up';

                    up++;

                    lastTrend = '📈';

                }

                else if(v < prev){

                    td.textContent = '▼ ' + v.toFixed(4);

                    td.className = 'down';

                    down++;

                    lastTrend = '📉';

                }

                else{

                    td.textContent = '■ ' + v.toFixed(4);

                    td.className = 'same';

                    same++;

                }


                prev = v;

            });


            /* Trend column */

            let trend = tr.insertCell();

            trend.textContent = lastTrend;

        });


        /* =========================
           TREND HEADER
           ========================= */

        let th = document.createElement('th');

        th.textContent = 'Trend';

        hr.appendChild(th);


        /* =========================
           STATISTICS
           ========================= */

        document.getElementById('stats').innerHTML =
            `Total Funds: ${data.length}
            &nbsp;&nbsp; 🟢 Up: ${up}
            &nbsp;&nbsp; 🔴 Down: ${down}
            &nbsp;&nbsp; ⚪ Same: ${same}
            &nbsp;&nbsp; ⚫ No Data: ${nodata}`;


        /* =================================================
           LOCK FIRST 4 COLUMNS
           Sequence / Fund / High / Low
           ================================================= */

        let leftPosition = 0;


        for(let index = 0; index < 4; index++){

            const cells = t.querySelectorAll(
                `th:nth-child(${index + 1}),
                 td:nth-child(${index + 1})`
            );


            if(cells.length === 0){
                continue;
            }


            /*
             * Get actual width of this column
             */

            const width =
                cells[0].getBoundingClientRect().width;


            cells.forEach(cell=>{

                cell.style.position = 'sticky';

                cell.style.left =
                    leftPosition + 'px';


                /*
                 * Header
                 */

                if(cell.tagName === 'TH'){

                    cell.style.top = '0';

                    cell.style.zIndex = '20';

                    cell.style.background = '#e6e6e6';

                }


                /*
                 * Body
                 */

                else{

                    cell.style.zIndex = '10';

                    cell.style.background = '#fff';

                }

            });


            leftPosition += width;

        }

    }


    catch(error){

        console.error(error);

        document.getElementById('stats').innerHTML =
            '❌ ERROR: ' + error.message;

    }

}


loadCSV();