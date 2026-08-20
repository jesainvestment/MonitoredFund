async function loadCSV() {

    try {

        const res = await fetch("MonitoredFund.csv?v=" + Date.now());

        if (!res.ok) {
            throw new Error("Cannot load MonitoredFund.csv");
        }

        const txt = await res.text();

        const rows = txt.trim()
            .split(/\r?\n/)
            .map(r => r.split(','));

        if (rows.length === 0) {
            throw new Error("CSV file is empty");
        }

        const head = rows[0];
        const data = rows.slice(1);

        let up = 0;
        let down = 0;
        let same = 0;
        let nodata = 0;

        const t = document.getElementById('fundTable');

        if (!t) {
            throw new Error("Cannot find table with id='fundTable'");
        }

        // Clear old table
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

        // Trend header
        let th = document.createElement('th');
        th.textContent = 'Trend';
        th.className = 'trend-column';

        hr.appendChild(th);


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
                // LOCKED COLUMNS 1-3
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
                // NUMBER
                // =========================

                let v = parseFloat(c);

                if (isNaN(v)) {

                    td.textContent = c;

                    return;
                }


                // =========================
                // TREND
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

            let trend = tr.insertCell();

            trend.textContent = lastTrend;

            trend.className = 'trend-column';

        });


        // =========================
        // STATISTICS
        // =========================

        const stats = document.getElementById('stats');

        if (stats) {

            stats.innerHTML =
                `Total Funds: ${data.length}
                &nbsp;&nbsp; 🟢 Up: ${up}
                &nbsp;&nbsp; 🔴 Down: ${down}
                &nbsp;&nbsp; ⚪ Same: ${same}
                &nbsp;&nbsp; ⚫ No Data: ${nodata}`;

        }

    }
    catch (error) {

        console.error(error);

        document.body.innerHTML +=
            `<div style="color:red;padding:20px;font-size:18px;">
                Error: ${error.message}
            </div>`;
    }
}


loadCSV();