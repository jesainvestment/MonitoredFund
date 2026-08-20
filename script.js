async function loadCSV() {

    try {

        const res = await fetch(
            "MonitoredFund.csv?v=" + Date.now()
        );

        if (!res.ok) {
            throw new Error(
                "Cannot load MonitoredFund.csv (" +
                res.status +
                ")"
            );
        }

        const txt = await res.text();

        if (!txt.trim()) {
            throw new Error(
                "MonitoredFund.csv is empty"
            );
        }

        const rows = txt
            .trim()
            .split(/\r?\n/)
            .map(r => r.split(','));

        if (rows.length < 2) {
            throw new Error(
                "CSV does not contain enough data"
            );
        }

        const head = rows[0];
        const data = rows.slice(1);

        let up = 0;
        let down = 0;
        let same = 0;
        let nodata = 0;

        const table =
            document.getElementById('fundTable');

        table.innerHTML = "";

        /* HEADER */

        const headerRow =
            table.createTHead().insertRow();

        head.forEach((h, i) => {

            const th =
                document.createElement('th');

            th.textContent = h;

            if (i === head.length - 1) {
                th.className = 'latest';
            }

            headerRow.appendChild(th);
        });

        /* TREND HEADER */

        const trendHeader =
            document.createElement('th');

        trendHeader.textContent = 'Trend';
        trendHeader.className = 'trend-column';

        headerRow.appendChild(trendHeader);

        /* BODY */

        const tbody =
            table.createTBody();

        data.forEach(row => {

            const tr =
                tbody.insertRow();

            let prev = null;
            let lastTrend = '➡';

            row.forEach((c, i) => {

                const td =
                    tr.insertCell();

                /* LOCK COLUMNS 1-3 */

                if (i < 3) {
                    td.textContent = c;
                    return;
                }

                /* NO DATA */

                if (c === '') {

                    td.textContent = '';

                    prev = null;

                    nodata++;

                    return;
                }

                /* NUMBER */

                const v =
                    parseFloat(c);

                if (isNaN(v)) {

                    td.textContent = c;

                    return;
                }

                /* FIRST VALUE */

                if (prev === null) {

                    td.textContent =
                        '■ ' + v.toFixed(4);

                    td.className = 'same';

                    same++;
                }

                /* UP */

                else if (v > prev) {

                    td.textContent =
                        '▲ ' + v.toFixed(4);

                    td.className = 'up';

                    up++;

                    lastTrend = '📈';
                }

                /* DOWN */

                else if (v < prev) {

                    td.textContent =
                        '▼ ' + v.toFixed(4);

                    td.className = 'down';

                    down++;

                    lastTrend = '📉';
                }

                /* SAME */

                else {

                    td.textContent =
                        '■ ' + v.toFixed(4);

                    td.className = 'same';

                    same++;
                }

                prev = v;
            });

            /* TREND */

            const trendCell =
                tr.insertCell();

            trendCell.textContent =
                lastTrend;

            trendCell.className =
                'trend-column';
        });

        /* STATISTICS */

        document.getElementById('stats').innerHTML =
            `Total Funds: ${data.length}
             &nbsp;&nbsp; 🟢 Up: ${up}
             &nbsp;&nbsp; 🔴 Down: ${down}
             &nbsp;&nbsp; ⚪ Same: ${same}
             &nbsp;&nbsp; ⚫ No Data: ${nodata}`;

    }

    catch (error) {

        console.error(error);

        const errorBox =
            document.getElementById('error');

        errorBox.style.display = 'block';

        errorBox.textContent =
            'Error: ' + error.message;

        document.getElementById('stats').textContent =
            'Unable to load fund data.';
    }
}

loadCSV();