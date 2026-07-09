async function loadCSV() {
    const response = await fetch('MonitoredFund.csv');
    const text = await response.text();

    const rows = text.trim().split(/\r?\n/).map(r => r.split(','));

    const headers = rows[0];
    const data = rows.slice(1);

    const thead = document.querySelector('#fundTable thead');
    const tbody = document.querySelector('#fundTable tbody');

    // Build header
    const headerRow = document.createElement('tr');
    headers.forEach((h, idx) => {
        const th = document.createElement('th');
        th.textContent = h;
        if (idx === 1) th.classList.add('fund-name');
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    let upCount = 0;
    let downCount = 0;
    let noDataCount = 0;

    // Build body
    data.forEach(row => {
        const tr = document.createElement('tr');

        let previousValue = null;

        row.forEach((cell, idx) => {
            const td = document.createElement('td');
            td.textContent = cell;

            if (idx === 1) td.classList.add('fund-name');

            // Price columns start from index 2
            if (idx >= 2) {
                const value = parseFloat(cell);

                if (cell === '' || isNaN(value)) {
                    td.classList.add('no-data');
                    noDataCount++;
                } else {
                    if (previousValue !== null) {
                        if (value > previousValue) {
                            td.classList.add('up');
                            upCount++;
                        } else if (value < previousValue) {
                            td.classList.add('down');
                            downCount++;
                        }
                    }
                    previousValue = value;
                }
            }

            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    document.getElementById('summary').innerHTML = `
        🟢 Funds Up: ${upCount} &nbsp;&nbsp;
        🔴 Funds Down: ${downCount} &nbsp;&nbsp;
        ⚫ No Data: ${noDataCount}
    `;

    // Search filter
    document.getElementById('searchBox').addEventListener('input', function() {
        const term = this.value.toLowerCase();

        [...tbody.rows].forEach(r => {
            const fundName = r.cells[1].textContent.toLowerCase();
            r.style.display = fundName.includes(term) ? '' : 'none';
        });
    });
}

loadCSV();
