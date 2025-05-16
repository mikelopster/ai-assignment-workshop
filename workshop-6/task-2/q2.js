// main_v2.js
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
    { CustomerID: "C001", Amount: 800.00, MCC: "5411", Timestamp: new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setDate(new Date().getDate() - 10)) },
    { CustomerID: "C002", Amount: 6000.00, MCC: "5812", Timestamp: new Date(new Date().setMonth(new Date().getMonth() - 2)) },
    { CustomerID: "C002", Amount: 2500.00, MCC: "5812", Timestamp: new Date(new Date().setDate(new Date().getDate() - 15)) },
    { CustomerID: "C003", Amount: 300.00, MCC: "5814", Timestamp: new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setDate(new Date().getDate() - 5)) },
    { CustomerID: "C004", Amount: 12000.00, MCC: "5812", Timestamp: new Date(new Date().setMonth(new Date().getMonth() - 3)) },
    { CustomerID: "C005", Amount: 4999.00, MCC: "5812", Timestamp: new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setDate(new Date().getDate() - 1)) },
];

const diningMCCs = { "5812": true, "5813": true, "5814": true };

/**
 * Filters customers based on criteria.
 * @param {string} category
 * @param {string} periodStr - Period in months as a string
 * @param {string} minSpendStr - Minimum spending as a string
 * @param {string} segmentsCSV - Comma-separated segments
 * @param {string} excludeCSV - Comma-separated cards to exclude
 * @returns {{ candidates: Customer[] | null, error: Error | null }}
 */
function filterCustomers(category, periodStr, minSpendStr, segmentsCSV, excludeCSV) {
    /** @type {Customer[]} */
    const results = [];
    let error = null;

    let months = parseInt(periodStr, 10);
    // Issue: Silent default if parsing fails
    if (isNaN(months) || months === 0) {
        months = 3;
    }

    const spend = parseFloat(minSpendStr);
    const convErr = isNaN(spend); // true if parsing failed

    /** @type {string[]} */
    let targetSegments = [];
    if (segmentsCSV && segmentsCSV !== "") {
        targetSegments = segmentsCSV.split(',').map(s => s.trim());
    }

    /** @type {string[]} */
    let excludeCards = [];
    if (excludeCSV && excludeCSV !== "") {
        excludeCards = excludeCSV.split(',').map(s => s.trim());
    }

    const nowForStartDate = new Date();
    const startDate = new Date(nowForStartDate.setMonth(nowForStartDate.getMonth() - months));
    startDate.setHours(0,0,0,0);

    for (const cust of customers) {
        // Issue: "All" segment logic
        let segmentOk = false;
        if (targetSegments.length === 0 || (targetSegments.length > 0 && targetSegments[0].toLowerCase() === "all")) {
            segmentOk = true;
        } else {
            for (const s of targetSegments) {
                if (cust.Segment === s) {
                    segmentOk = true;
                    break;
                }
            }
        }
        if (!segmentOk) {
            continue;
        }

        let isExcluded = false;
        // Issue: split on empty string yields ['']
        if (excludeCards.length > 0 && excludeCards[0] !== '') {
            for (const exCard of excludeCards) {
                for (const cCard of cust.CoBrandCards) {
                    if (cCard === exCard) {
                        isExcluded = true;
                        break;
                    }
                }
                if (isExcluded) {
                    break;
                }
            }
        }
        if (isExcluded) {
            continue;
        }

        let custSpend = 0.0;
        for (const t of transactions) {
            if (t.CustomerID === cust.ID && t.Timestamp >= startDate) {
                // Issue: Only "Dining" category works for spending
                if (diningMCCs[t.MCC] && category && category.toLowerCase() === "dining") {
                    custSpend += t.Amount;
                }
            }
        }

        // Issue: Major logic flaw - if minSpend parsing fails, all customers pass this check
        if (custSpend >= spend || convErr) {
            results.push(cust);
        }
    }

    // Issue: This error message might be misleading or never hit if convErr is true
    if (results.length === 0 && convErr) {
        error = new Error("Failed to parse minimum spend and no candidates found");
        return { candidates: null, error };
    }
    return { candidates: results, error: null };
}

/**
 * HTTP Handler
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function gourmetCandidatesHandler(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const queryParams = parsedUrl.query;

    // Issue: No direct check for presence of these params in handler
    const cat = queryParams.category || ""; // Default to empty if not present
    const period = queryParams.period_months || "";
    const minSpend = queryParams.min_spending || "";
    const segments = queryParams.segments || "";
    const exclude = queryParams.exclude_cards || "";

    const { candidates, error } = filterCustomers(cat, period, minSpend, segments, exclude);

    if (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end("Error finding candidates: " + error.message);
        return;
    }

    if (!candidates || candidates.length === 0) {
        // Check for candidates being null as well, though current filterCustomers doesn't return null for candidates if no error
        res.writeHead(200, { 'Content-Type': 'text/plain' }); // Usually 200 for no results, not an error
        res.end("No candidates found matching your criteria.");
        return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(candidates));
}

// --- Main Server Logic ---
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    if (parsedUrl.pathname === '/gourmet-candidates' && req.method === 'GET') {
        gourmetCandidatesHandler(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server starting on port ${PORT}...`);
    console.log(`Example: http://localhost:${PORT}/gourmet-candidates?category=Dining&period_months=3&min_spending=1000`);
    console.log(`Test spend parse error: http://localhost:${PORT}/gourmet-candidates?category=Dining&period_months=3&min_spending=ABC`);
});