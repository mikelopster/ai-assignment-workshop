const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// --- Simulated Data ---
const users = {
    "admin": { name: "Administrator", role: "admin", passwordHash: "hashed_admin_password" }, // Password handling not part of this demo
    "alice": { name: "Alice Smith", role: "user" },
    "bob": { name: "Bob Johnson", role: "user" }
};

const userFiles = {
    "alice": "alice_report.txt",
    "bob": "bob_notes.txt",
    "admin": "admin_config.ini"
};

// Create dummy files for path traversal example
if (!fs.existsSync('./user_data')) fs.mkdirSync('./user_data');
if (!fs.existsSync('./user_data/alice_report.txt')) fs.writeFileSync('./user_data/alice_report.txt', 'Alice\'s confidential report data.');
if (!fs.existsSync('./user_data/bob_notes.txt')) fs.writeFileSync('./user_data/bob_notes.txt', 'Bob\'s personal notes.');
if (!fs.existsSync('./user_data/admin_config.ini')) fs.writeFileSync('./user_data/admin_config.ini', '[DB]\npassword=secret');
if (!fs.existsSync('./sensitive_system_file.txt')) fs.writeFileSync('./sensitive_system_file.txt', 'This is a very sensitive system file!');


/**
 * VULNERABLE: Simulates finding users by name with a SQL injection vulnerability.
 * In a real scenario, `nameQuery` would be part of a SQL query.
 * @param {string} nameQuery
 * @returns {object[]}
 */
function findUsersByName_vulnerable(nameQuery) {
    console.log(`[VULNERABLE SIMULATION] Executing "SQL-like" query: SELECT * FROM users WHERE name = '${nameQuery}';`);

    if (nameQuery.toLowerCase().includes("' or '1'='1")) {
        console.warn("[VULNERABLE SIMULATION] SQL Injection detected! Returning all users.");
        return Object.values(users);
    }

    const results = [];
    for (const username in users) {
        if (users[username].name.toLowerCase().includes(nameQuery.toLowerCase())) {
            results.push(users[username]);
        }
    }
    return results;
}

/**
 * HTTP Handler for searching users by name (VULNERABLE to SQLi-like behavior)
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function searchUsersHandler_vulnerable(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const nameQuery = parsedUrl.query.name || "";

    if (!nameQuery) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end("Missing 'name' query parameter.");
        return;
    }

    const foundUsers = findUsersByName_vulnerable(nameQuery);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(foundUsers));
}

/**
 * HTTP Handler for displaying a message (VULNERABLE to XSS)
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function displayMessageHandler_vulnerable(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const message = parsedUrl.query.text || "No message provided.";

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
        <html>
            <head><title>Display Message</title></head>
            <body>
                <h1>Your Message:</h1>
                <p>${message}</p> 
                <hr/>
                <p>Try appending ?text=<script>alert('XSS!')</script> to the URL.</p>
            </body>
        </html>
    `);
}

/**
 * HTTP Handler for getting a user's file (VULNERABLE to Path Traversal)
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function getFileHandler_vulnerable(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const username = parsedUrl.query.user;

    if (!username || !userFiles[username]) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end("User or user file not found.");
        return;
    }

    let requestedFilename = parsedUrl.query.filename || userFiles[username];
    console.log(`[VULNERABLE] Attempting to access file for user '${username}': ${requestedFilename}`);

    const basePath = path.join(__dirname, 'user_data'); // Base directory for user files
    const filePath = path.join(basePath, requestedFilename);

    if (!filePath.startsWith(basePath)) {
        console.error(`[SECURITY ATTEMPT] Path traversal detected! Attempted path: ${filePath}`);
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end("Forbidden: Access to this path is not allowed.");
        return;
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`[VULNERABLE] Error reading file ${filePath}:`, err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end(`Error reading file. It might not exist or you don't have permission. File: ${requestedFilename}`);
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(data);
    });
}


// --- Main Server Logic ---
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (parsedUrl.pathname === '/search-users-vulnerable' && req.method === 'GET') {
        searchUsersHandler_vulnerable(req, res);
    } else if (parsedUrl.pathname === '/display-message-vulnerable' && req.method === 'GET') {
        displayMessageHandler_vulnerable(req, res);
    } else if (parsedUrl.pathname === '/get-file-vulnerable' && req.method === 'GET') {
        getFileHandler_vulnerable(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
            <h1>Not Found</h1>
            <p>Try these vulnerable endpoints:</p>
            <ul>
                <li><a href="/search-users-vulnerable?name=Alice">/search-users-vulnerable?name=Alice</a> (Try SQLi: ?name=X'%20OR%20'1'='1)</li>
                <li><a href="/display-message-vulnerable?text=Hello">/display-message-vulnerable?text=Hello</a> (Try XSS: ?text=<script>alert('XSS!')</script>)</li>
                <li><a href="/get-file-vulnerable?user=alice">/get-file-vulnerable?user=alice</a> (Default file for Alice)</li>
                <li><a href="/get-file-vulnerable?user=admin&filename=admin_config.ini">/get-file-vulnerable?user=admin&filename=admin_config.ini</a> (Admin's file)</li>
                <li>Path Traversal Attempt (may need to adjust based on OS and where you run the script):
                    <ul>
                        <li><a href="/get-file-vulnerable?user=alice&filename=../sensitive_system_file.txt">/get-file-vulnerable?user=alice&filename=../sensitive_system_file.txt</a> (Attempt to go up one directory)</li>
                         <li><a href="/get-file-vulnerable?user=alice&filename=../../main_security_vulnerabilities.js">/get-file-vulnerable?user=alice&filename=../../main_security_vulnerabilities.js</a> (Attempt to access source code)</li>
                    </ul>
                </li>
            </ul>
        `);
    }
});

const PORT = 8081;
server.listen(PORT, () => {
    console.log(`Vulnerable server starting on port ${PORT}...`);
    console.log(`--- WARNING: THIS SERVER CONTAINS INTENTIONAL SECURITY VULNERABILITIES FOR DEMONSTRATION PURPOSES ---`);
    console.log(`SQLi example: http://localhost:${PORT}/search-users-vulnerable?name=Test%27%20OR%20%271%27=%271`);
    console.log(`XSS example: http://localhost:${PORT}/display-message-vulnerable?text=%3Cscript%3Ealert%28%27XSS!%27%29%3C/script%3E`);
    console.log(`Path Traversal (attempt): http://localhost:${PORT}/get-file-vulnerable?user=alice&filename=../sensitive_system_file.txt`);
});