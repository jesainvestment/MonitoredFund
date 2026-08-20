async function loadCSV() {
    const res = await fetch("MonitoredFund.csv?v=" + Date.now());
    const txt = await res.text();

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

    // Clear existing table
    t.innerHTML = "";

    // =========================
    // HEADER
    // =========================

    const hr = t.createTHead().insertRow();

    head.forEach((h, i) => {
        let th = document.createElement('th');
        th.textContent = h;

        if (i === head.length - 1) {
            th.className = 'latest';
        }

        hr.appendChild(th);
    });

    // Add Trend header
    let trendHeader = document.createElement('th');
    trendHeader.textContent = 'Trend';
    trendHeader.className = 'trend-column';
    hr.appendChild(trendHeader);

    // =========================
    // BODY
    // =========================

    const tb = t.createTBody();

    data.forEach(r => {

        let tr = tb.insertRow();

        let prev = null;
        let lastTrend = '➡';

        r.forEach((c, i) => {

            let td = tr.insertCell();

            // =========================
            // COLUMNS 1, 2 AND 3
            // =========================
            // These columns are locked/frozen
            // =========================

            if (i < 3) {
                td.textContent = c;
                return;
            }

            // =========================
            // NO DATA
            // =========================

            if (c === '') {
                td.textContent = '';
                prev = null;
                nodata++;
                return;
            }

            // =========================
            // NUMERIC VALUE
            // =========================

            let v = parseFloat(c);

            if (isNaN(v)) {
                td.textContent = c;
                return;
            }

            // =========================
            // COMPARE WITH PREVIOUS VALUE
            // =========================

            if (prev === null) {

                td.textContent = '■ ' + v.toFixed(4);
                td.className = 'same';

                same++;

            }
            else if (v > prev) {

                td.textContent = '▲ ' + v.toFixed(4);
                td.className = 'up';

                up++;
                lastTrend = '📈';

            }
            else if (v < prev) {

                td.textContent = '▼ ' + v.toFixed(4);
                td.className = 'down';

                down++;
                lastTrend = '📉';

            }
            else {

                td.textContent = '■ ' + v.toFixed(4);
                td.className = 'same';

                same++;
            }

            prev = v;
        });

        // =========================
        // TREND COLUMN
        // =========================

        let trendCell = tr.insertCell();

        trendCell.textContent = lastTrend;
        trendCell.className = 'trend-column';
    });

    // =========================
    // STATISTICS
    // =========================

    document.getElementById('stats').innerHTML =
        `Total Funds: ${data.length}
        &nbsp;&nbsp; 🟢 Up: ${up}
        &nbsp;&nbsp; 🔴 Down: ${down}
        &nbsp;&nbsp; ⚪ Same: ${same}
        &nbsp;&nbsp; ⚫ No Data: ${nodata}`;
}


// =========================
// LOAD CSV
// =========================

loadCSV();