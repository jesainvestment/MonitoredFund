async function loadCSV(){

const res = await fetch("MonitoredFund.csv?v=" + Date.now());
const txt = await res.text();

const rows = txt.trim().split(/\r?\n/).map(r => r.split(','));
const head = rows[0];
const data = rows.slice(1);

let up = 0, down = 0, same = 0, nodata = 0;

const t = document.getElementById('fundTable');

const hr = t.createTHead().insertRow();

/* Find columns that need to be locked */
const fundIndex = head.findIndex(h => h.trim().toLowerCase() === 'fund');
const highIndex = head.findIndex(h => h.trim().toLowerCase() === 'high');
const lowIndex  = head.findIndex(h => h.trim().toLowerCase() === 'low');

head.forEach((h, i) => {

    let th = document.createElement('th');
    th.textContent = h;

    if(i === head.length - 1)
        th.className = 'latest';

    /* Lock Fund / High / Low columns */
    if(i === fundIndex)
        th.classList.add('locked-fund');

    if(i === highIndex)
        th.classList.add('locked-high');

    if(i === lowIndex)
        th.classList.add('locked-low');

    hr.appendChild(th);
});

const tb = t.createTBody();

data.forEach(r => {

    let tr = tb.insertRow();
    let prev = null;
    let lastTrend = '➡';

    r.forEach((c, i) => {

        let td = tr.insertCell();

        /* Lock Fund / High / Low cells */
        if(i === fundIndex)
            td.classList.add('locked-fund');

        if(i === highIndex)
            td.classList.add('locked-high');

        if(i === lowIndex)
            td.classList.add('locked-low');

        if(i < 2){
            td.textContent = c;
            return;
        }

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
            td.className += ' same';
            same++;

        }
        else if(v > prev){

            td.textContent = '▲ ' + v.toFixed(4);
            td.className += ' up';
            up++;
            lastTrend = '📈';

        }
        else if(v < prev){

            td.textContent = '▼ ' + v.toFixed(4);
            td.className += ' down';
            down++;
            lastTrend = '📉';

        }
        else{

            td.textContent = '■ ' + v.toFixed(4);
            td.className += ' same';
            same++;

        }

        prev = v;

    });

    let td = tr.insertCell();
    td.textContent = lastTrend;

});

let th = document.createElement('th');
th.textContent = 'Trend';
hr.appendChild(th);


/* Statistics */
document.getElementById('stats').innerHTML =
`Total Funds: ${data.length} &nbsp;&nbsp;
🟢 Up: ${up} &nbsp;&nbsp;
🔴 Down: ${down} &nbsp;&nbsp;
⚪ Same: ${same} &nbsp;&nbsp;
⚫ No Data: ${nodata}`;


/* --------------------------------------------------
   Calculate sticky positions for Fund / High / Low
   -------------------------------------------------- */

function updateStickyPositions(){

    const lockedColumns = [
        {index: fundIndex, className: 'locked-fund'},
        {index: highIndex, className: 'locked-high'},
        {index: lowIndex, className: 'locked-low'}
    ];

    /* Remove invalid columns */
    const validColumns = lockedColumns
        .filter(x => x.index >= 0)
        .sort((a,b) => a.index - b.index);

    let leftPosition = 0;

    validColumns.forEach(col => {

        const cells = t.querySelectorAll(
            `th:nth-child(${col.index + 1}),
             td:nth-child(${col.index + 1})`
        );

        cells.forEach(cell => {

            cell.style.left = leftPosition + 'px';

            /* Keep locked cells above scrolling cells */
            cell.style.zIndex = cell.tagName === 'TH' ? '10' : '6';

        });

        if(cells.length > 0){
            leftPosition += cells[0].getBoundingClientRect().width;
        }
    });
}


/* Run after table is displayed */
setTimeout(updateStickyPositions, 100);

/* Also update if browser window is resized */
window.addEventListener('resize', updateStickyPositions);

}

loadCSV();