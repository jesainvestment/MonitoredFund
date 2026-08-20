async function loadCSV() {

    try {

        const res = await fetch("MonitoredFund.csv?v=" + Date.now());

        if (!res.ok) {
            throw new Error(
                "MonitoredFund.csv could not be loaded. HTTP status: " + res.status
            );
        }

        const txt = await res.text();

        if (!txt.trim()) {
            throw new Error("MonitoredFund.csv is empty.");
        }

        /*
         * Simple CSV parser.
         * Handles quoted fields and commas inside quotes.
         */
        function parseCSVLine(line) {

            const result = [];
            let current = "";
            let insideQuotes = false;

            for (let i = 0; i < line.length; i++) {

                const ch = line[i];

                if (ch === '"') {

                    if (insideQuotes && line[i + 1] === '"') {
                        current += '"';
                        i++;
                    } else {
                        insideQuotes = !insideQuotes;
                    }

                } else if (ch === ',' && !insideQuotes) {

                    result.push(current);
                    current = "";

                } else {

                    current += ch;
                }
            }

            result.push(current);

            return result;
        }


        /*
         * Remove BOM if present
         */
        const cleanText = txt.replace(/^\uFEFF/, "").trim();

        const lines = cleanText.split(/\r?\n/);

        const rows = lines.map(line => parseCSVLine(line));

        const head = rows[0];
        const data = rows.slice(1);


        let up = 0;
        let down = 0;
        let same = 0;
        let nodata = 0;


        const table = document.getElementById("fundTable");

        table.innerHTML = "";


        /* ==========================================
           HEADER
           ========================================== */

        const thead = table.createTHead();
        const headerRow = thead.insertRow();


        head.forEach((h, i) => {

            const th = document.createElement("th");

            th.textContent = h.trim();

            if (i === head.length - 1) {
                th.classList.add("latest");
            }

            headerRow.appendChild(th);

        });


        /* ==========================================
           BODY
           ========================================== */

        const tbody = table.createTBody();


        data.forEach(row => {

            /*
             * Ignore completely empty rows
             */
            if (row.length === 1 && row[0].trim() === "") {
                return;
            }


            const tr = tbody.insertRow();

            let previousValue = null;
            let lastTrend = "➡";


            /*
             * Make row length equal to header length
             */
            while (row.length < head.length) {
                row.push("");
            }


            row.forEach((cell, i) => {

                const td = tr.insertCell();

                const value = cell.trim();


                /* ==================================
                   FIRST 4 COLUMNS
                   
                   Sequence
                   Fund
                   High
                   Low

                   KEEP AS TEXT
                   ================================== */

                if (i < 4) {

                    td.textContent = value;

                    return;
                }


                /* ==================================
                   DATE / PRICE COLUMNS
                   ================================== */

                if (value === "" || value === "-") {

                    td.textContent = "";

                    previousValue = null;

                    nodata++;

                    return;
                }


                const number = parseFloat(value);


                if (isNaN(number)) {

                    td.textContent = value;

                    return;
                }


                /*
                 * First numerical value
                 */
                if (previousValue === null) {

                    td.textContent =
                        "■ " + number.toFixed(4);

                    td.className = "same";

                    same++;

                }


                /*
                 * Price increased
                 */
                else if (number > previousValue) {

                    td.textContent =
                        "▲ " + number.toFixed(4);

                    td.className = "up";

                    up++;

                    lastTrend = "📈";

                }


                /*
                 * Price decreased
                 */
                else if (number < previousValue) {

                    td.textContent =
                        "▼ " + number.toFixed(4);

                    td.className = "down";

                    down++;

                    lastTrend = "📉";

                }


                /*
                 * Price unchanged
                 */
                else {

                    td.textContent =
                        "■ " + number.toFixed(4);

                    td.className = "same";

                    same++;
                }


                previousValue = number;

            });


            /* ==================================
               TREND
               ================================== */

            const trendCell = tr.insertCell();

            trendCell.textContent = lastTrend;

        });


        /*
         * Trend header
         */
        const trendHeader = document.createElement("th");

        trendHeader.textContent = "Trend";

        headerRow.appendChild(trendHeader);


        /* ==========================================
           STATISTICS
           ========================================== */

        document.getElementById("stats").innerHTML =
            `Total Funds: ${data.length}
             &nbsp;&nbsp; 🟢 Up: ${up}
             &nbsp;&nbsp; 🔴 Down: ${down}
             &nbsp;&nbsp; ⚪ Same: ${same}
             &nbsp;&nbsp; ⚫ No Data: ${nodata}`;


        /* ==========================================
           LOCK FIRST 4 COLUMNS
           
           Sequence
           Fund
           High
           Low
           ========================================== */

        /*
         * First get the actual width of each
         * column from the header.
         */

        const headerCells =
            headerRow.querySelectorAll("th");


        if (headerCells.length >= 4) {

            const width1 = headerCells[0].offsetWidth;
            const width2 = headerCells[1].offsetWidth;
            const width3 = headerCells[2].offsetWidth;


            const leftPositions = [
                0,
                width1,
                width1 + width2,
                width1 + width2 + width3
            ];


            /*
             * Apply sticky positioning
             * to first four columns.
             */

            for (let column = 0; column < 4; column++) {

                const cells = table.querySelectorAll(
                    `th:nth-child(${column + 1}),
                     td:nth-child(${column + 1})`
                );


                cells.forEach(cell => {

                    cell.style.position = "sticky";

                    cell.style.left =
                        leftPositions[column] + "px";


                    /*
                     * Header must be above body.
                     */

                    if (cell.tagName === "TH") {

                        cell.style.top = "0";

                        cell.style.zIndex = "20";

                        cell.style.background = "#e6e6e6";

                    } else {

                        cell.style.zIndex = "10";

                        /*
                         * Locked cells have white
                         * background so scrolling
                         * cells don't show through.
                         */

                        cell.style.background = "#fff";
                    }

                });
            }
        }

    }

    catch (error) {

        console.error("Fund Monitor Error:", error);

        document.getElementById("stats").innerHTML =
            "❌ ERROR: " + error.message;
    }
}


loadCSV();