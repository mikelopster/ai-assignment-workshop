// main_v3.js
const http = require('http');
const url = require('url');

// --- Data Structures ---
/**
 * @typedef {Object} Customer
 * @property {string} ID
 * @property {string} Name
 * @property {string} Segment
 * @property {string[]} CoBrandCards
 */

/**
 * @typedef {Object} Transaction
 * @property {string} CustomerID
 * @property {number} Amount
 * @property {string} MCC
 * @property {Date} Timestamp
 */

// --- Global Data ---
/** @type {Customer[]} */
const customers = [
    { ID: "C001", Name: "Alice Smith", Segment: "Gold Tier", CoBrandCards: ["SuperMart Rewards Card"] },
    { ID: "C002", Name: "Bob Johnson", Segment: "Platinum Tier", CoBrandCards: [] },
    { ID: "C003", Name: "Charlie Brown", Segment: "Gold Tier", CoBrandCards: ["Airline Miles Plus Card", "SuperMart Rewards Card"] },
    { ID: "C004", Name: "Diana Prince", Segment: "Affluent", CoBrandCards: [] },
    { ID: "C005", Name: "Edward Nigma", Segment: "Gold Tier", CoBrandCards: [] },
];

/** @type {Transaction[]} */
const transactions = [
    { CustomerID: "C001", Amount: 1500.00, MCC: "5812", Timestamp: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
    { CustomerID: "C001", Amount: 800.00, MCC: "5411", Timestamp: new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setDate(new Date().getDate() - 10)) }, // Not dining for C001, MCC 5411
    { CustomerID: "C002", Amount: 6000.00, MCC: "5812", Timestamp: new Date(new Date().setMonth(new Date().getMonth() - 2)) },
    { CustomerID: "C002", Amount: 2500.00, MCC: "5812", Timestamp: new Date(new Date().setDate(new Date().getDate() - 15)) }, // Within last 3 months
    { CustomerID: "C003", Amount: 300.00, MCC: "5814", Timestamp: new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setDate(new Date().getDate() - 5)) },
    { CustomerID: "C004", Amount: 12000.00, MCC: "5812", Timestamp: new Date(new Date().setMonth(new Date().getMonth() - 3)) }, // Potentially outside last 3 months depending on exact day
    { CustomerID: "C005", Amount: 4999.00, MCC: "5812", Timestamp: new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setDate(new Date().getDate() - 1)) },
];

const diningMCCs = { "5812": true, "5813": true, "5814": true };


/**
 * HTTP Handler for finding candidates in the last 3 months.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function findCandidatesLast3Months(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const queryParams = parsedUrl.query;

    const minSpendingStr = queryParams.min_spending || "0"; // Default to "0" if not provided
    const targetSegmentsStr = queryParams.segments || "";
    const excludeCardsStr = queryParams.exclude_cards || "";

    // Issue: parseFloat error is ignored. If minSpendingStr is "ABC", minSpending becomes NaN.
    // The comparison `totalSpendingInCategory >= minSpending` (e.g. `1500 >= NaN`) is always false.
    // If minSpendingStr is empty or "0", parseFloat results in 0.
    let minSpending = parseFloat(minSpendingStr);
    if (isNaN(minSpending)) {
        minSpending = 0; // Replicating Go's zero-value behavior for float64 if parsing fails and error ignored
    }


    let targetSegments = [];
    if (targetSegmentsStr !== "") {
        targetSegments = targetSegmentsStr.split(',').map(s => s.trim());
    }

    let excludeCards = [];
    if (excludeCardsStr !== "") {
        excludeCards = excludeCardsStr.split(',').map(s => s.trim());
    }

    /** @type {Customer[]} */
    const candidates = [];
    const nowForStartDate = new Date();
    const startDate = new Date(nowForStartDate.setMonth(nowForStartDate.getMonth() - 3));
    startDate.setHours(0,0,0,0); // Start of the day

    for (const cust of customers) {
        // Issue: "All Segments" logic
        let segmentOk = false;
        if (targetSegments.length === 0 || (targetSegments.length === 1 && targetSegments[0].toLowerCase() === "all segments")) {
            segmentOk = true;
        } else {
            for (const seg of targetSegments) {
                if (cust.Segment === seg) {
                    segmentOk = true;
                    break;
                }
            }
        }
        if (!segmentOk) {
            continue;
        }

        let excludedByCard = false;
        if (excludeCards.length > 0 && excludeCards[0] !== '') { // ensure not just an empty string from split
            for (const excludedCard of excludeCards) {
                if (cust.CoBrandCards.includes(excludedCard)) {
                    excludedByCard = true;
                    break;
                }
            }
        }
        if (excludedByCard) {
            continue;
        }

        // Issue: Hardcoded "Dining" category
        let totalSpendingInCategory = 0.0;
        for (const trans of transactions) {
            if (trans.CustomerID === cust.ID && trans.Timestamp >= startDate) {
                if (diningMCCs[trans.MCC]) { // Implicitly Dining
                    totalSpendingInCategory += trans.Amount;
                }
            }
        }

        if (totalSpendingInCategory >= minSpending) {
            candidates.push(cust);
        }
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write(`Found ${candidates.length} candidates (Last 3 Months):\n`);
    for (const c of candidates) {
        res.write(`- ID: ${c.ID}, Name: ${c.Name}\n`); // Only ID and Name
    }
    res.end();
}

/**
 * HTTP Handler for finding candidates in the last 6 months.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function findCandidatesLast6Months(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const queryParams = parsedUrl.query;

    const minSpendingStr = queryParams.min_spending || "0";
    const targetSegmentsStr = queryParams.segments || "";
    const excludeCardsStr = queryParams.exclude_cards || "";

    let minSpending = parseFloat(minSpendingStr);
    if (isNaN(minSpending)) {
        minSpending = 0;
    }

    let targetSegments = [];
    if (targetSegmentsStr !== "") {
        targetSegments = targetSegmentsStr.split(',').map(s => s.trim());
    }

    let excludeCards = [];
    if (excludeCardsStr !== "") {
        excludeCards = excludeCardsStr.split(',').map(s => s.trim());
    }

    /** @type {Customer[]} */
    const candidates = [];
    const nowForStartDate = new Date();
    const startDate = new Date(nowForStartDate.setMonth(nowForStartDate.getMonth() - 6));
    startDate.setHours(0,0,0,0);

    for (const cust of customers) {
        let segmentOk = false;
        if (targetSegments.length === 0 || (targetSegments.length === 1 && targetSegments[0].toLowerCase() === "all segments")) {
            segmentOk = true;
        } else {
            for (const seg of targetSegments) {
                if (cust.Segment === seg) {
                    segmentOk = true;
                    break;
                }
            }
        }
        if (!segmentOk) {
            continue;
        }

        let excludedByCard = false;
        if (excludeCards.length > 0 && excludeCards[0] !== '') {
            for (const excludedCard of excludeCards) {
                if (cust.CoBrandCards.includes(excludedCard)) {
                    excludedByCard = true;
                    break;
                }
            }
        }
        if (excludedByCard) {
            continue;
        }

        let totalSpendingInCategory = 0.0;
        for (const trans of transactions) {
            if (trans.CustomerID === cust.ID && trans.Timestamp >= startDate) {
                if (diningMCCs[trans.MCC]) { // Implicitly Dining
                    totalSpendingInCategory += trans.Amount;
                }
            }
        }

        if (totalSpendingInCategory >= minSpending) {
            candidates.push(cust);
        }
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write(`Found ${candidates.length} candidates (Last 6 Months):\n`);
    for (const c of candidates) {
        res.write(`- ID: ${c.ID}, Name: ${c.Name}\n`);
    }
    res.end();
}


// --- Main Server Logic ---
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    if (parsedUrl.pathname === '/find-candidates-3m' && req.method === 'GET') {
        findCandidatesLast3Months(req, res);
    } else if (parsedUrl.pathname === '/find-candidates-6m' && req.method === 'GET') {
        findCandidatesLast6Months(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server starting on port ${PORT}...`);
    console.log(`3 Months Example: http://localhost:${PORT}/find-candidates-3m?min_spending=1000&segments=Gold%20Tier`);
    console.log(`6 Months Example: http://localhost:${PORT}/find-candidates-6m?min_spending=5000&segments=All%20Segments`);
    console.log(`Test min_spending error (NaN becomes 0): http://localhost:${PORT}/find-candidates-3m?min_spending=ABC`);
});