// main.js
const http = require('http');
const url = require('url');

// --- Data Structures (similar to Go structs) ---
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
 * @property {string} MCC // Merchant Category Code
 * @property {Date} Timestamp
 */

// --- Global Data (similar to Go global vars) ---
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

const diningMCCs = { "5812": true, "5813": true, "5814": true }; // Using an object as a set

/**
 * Helper function like Go's `contains` for slices.
 * @param {string[]} array
 * @param {string} item
 * @returns {boolean}
 */
function contains(array, item) {
    return array.includes(item);
}

/**
 * HTTP Handler for finding candidates.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function findCandidatesHandler(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const queryParams = parsedUrl.query;

    const spendingCategory = queryParams.category;
    const timePeriodMonthsStr = queryParams.period_months;
    const minSpendingStr = queryParams.min_spending;
    const targetSegmentsStr = queryParams.segments; // Comma-separated string
    const excludeCardsStr = queryParams.exclude_cards; // Comma-separated string

    // --- Parameter Validation (Issue preserved: basic presence check) ---
    if (!spendingCategory || !timePeriodMonthsStr || !minSpendingStr) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end("Missing required parameters: category, period_months, min_spending");
        return;
    }

    const timePeriodMonths = parseInt(timePeriodMonthsStr, 10);
    if (isNaN(timePeriodMonths)) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end("Invalid period_months");
        return;
    }

    const minSpending = parseFloat(minSpendingStr);
    if (isNaN(minSpending)) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end("Invalid min_spending");
        return;
    }

    /** @type {string[]} */
    let targetSegments = [];
    if (targetSegmentsStr) {
        targetSegments = targetSegmentsStr.split(',');
    }

    /** @type {string[]} */
    let excludeCards = [];
    if (excludeCardsStr) {
        excludeCards = excludeCardsStr.split(',');
    }

    /** @type {Customer[]} */
    const candidates = [];
    const now = new Date();
    const startDate = new Date(now.setMonth(now.getMonth() - timePeriodMonths));
    startDate.setHours(0,0,0,0); // Start of the day for comparison

    for (const cust of customers) {
        // --- Segment Filtering (Issue preserved: "All Segments" logic) ---
        if (targetSegments.length > 0) {
            let matchSegment = false;
            for (const seg of targetSegments) {
                if (cust.Segment === seg.trim()) { // Added trim for robustness
                    matchSegment = true;
                    break;
                }
            }
            // If "All Segments" is meant to bypass, this logic is problematic.
            // The Go code had `!contains(targetSegments, "All Segments")`
            // If targetSegments is ["All Segments"], and cust.Segment is not "All Segments", it would continue.
            // If "All Segments" is passed as a string in the query, this will behave as if "All Segments" is a literal segment.
            // To truly bypass segment filtering if "All Segments" is intended as a wildcard,
            // a more explicit check for that specific string and then skipping this block would be needed.
            // Preserving the original Go logic as closely as possible:
            let isAllSegmentsIntent = false;
            if(targetSegments.length === 1 && targetSegments[0].trim().toLowerCase() === "all segments") {
                isAllSegmentsIntent = true;
            }

            if (!isAllSegmentsIntent && !matchSegment) {
                 continue;
            }
        }

        // --- Card Exclusion ---
        let excludedByCard = false;
        if (excludeCards.length > 0 && excludeCards[0] !== '') { // Check if excludeCards actually has non-empty values
            for (const excludedCard of excludeCards) {
                if (cust.CoBrandCards.includes(excludedCard.trim())) {
                    excludedByCard = true;
                    break;
                }
            }
        }
        if (excludedByCard) {
            continue;
        }

        // --- Spending Calculation (Issue preserved: only for "Dining") ---
        let totalSpendingInCategory = 0.0;
        for (const trans of transactions) {
            if (trans.CustomerID === cust.ID && trans.Timestamp >= startDate) {
                if (spendingCategory.toLowerCase() === "dining") { // Made case-insensitive for robustness
                    if (diningMCCs[trans.MCC]) {
                        totalSpendingInCategory += trans.Amount;
                    }
                }
                // If spendingCategory is anything else, totalSpendingInCategory remains 0
            }
        }

        if (totalSpendingInCategory >= minSpending) {
            candidates.push(cust);
        }
    }

    // --- Outputting Results ---
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write(`Found ${candidates.length} candidates:\n`);
    for (const c of candidates) {
        res.write(`- ID: ${c.ID}, Name: ${c.Name}, Segment: ${c.Segment}\n`);
    }
    res.end();
}

// --- Main Server Logic ---
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    if (parsedUrl.pathname === '/find-candidates' && req.method === 'GET') {
        findCandidatesHandler(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server starting on port ${PORT}...`);
    console.log(`Try: http://localhost:${PORT}/find-candidates?category=Dining&period_months=3&min_spending=1000&segments=Gold%20Tier,Affluent&exclude_cards=SuperMart%20Rewards%20Card`);
    console.log(`Or: http://localhost:${PORT}/find-candidates?category=Dining&period_months=3&min_spending=5000`);
});