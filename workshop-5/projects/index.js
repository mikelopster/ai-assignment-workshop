// index.js
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const app = express();
const PORT = 3000;
const SECRET = 'your_jwt_secret'; // เปลี่ยนเป็นคีย์ลับของคุณ

app.use(bodyParser.json());

// สร้างหรือเชื่อมต่อฐานข้อมูล SQLite
const db = new sqlite3.Database('./blog.db', (err) => {
  if (err) return console.error(err.message);
  console.log('Connected to SQLite database.');
});

// สร้างตาราง users และ blogs ถ้ายังไม่มี
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS blogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT,
      author_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(author_id) REFERENCES users(id)
    )
  `);
  // สร้างผู้ใช้ตัวอย่าง (admin@example.com / password123) ถ้ายังไม่มี
  const pw = bcrypt.hashSync('password123', 10);
  db.run(
    `INSERT OR IGNORE INTO users (email, password) VALUES (?, ?)`,
    ['admin@example.com', pw]
  );
});

// middleware ตรวจสอบ token
function authenticate(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ error: 'No token provided' });
  const token = auth.split(' ')[1];
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.userId = decoded.id;
    next();
  });
}

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Blog API',
    version: '1.0.0',
    description: 'Simple Blog API with Express, SQLite, and JWT',
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Local server' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const options = {
  swaggerDefinition,
  apis: ['./index.js'], // You can add more files here for larger projects
};

const swaggerSpec = swaggerJSDoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve raw Swagger JSON
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// --- Auth routes ---

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: User not found or wrong password
 */
// POST /login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: 'User not found' });

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ error: 'Wrong password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, {
      expiresIn: '1h'
    });
    res.json({ token });
  });
});

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *       400:
 *         description: Email already exists or invalid input
 */
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (user) return res.status(400).json({ error: 'Email already exists' });
    const hashed = bcrypt.hashSync(password, 10);
    db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashed], function (err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ id: this.lastID, email });
    });
  });
});

// --- Blog CRUD routes ---

/**
 * @swagger
 * /blogs:
 *   get:
 *     summary: Get all blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: List of blogs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Blog'
 */
// GET /blogs       => list all blogs (ไม่ต้องล็อกอิน)
app.get('/blogs', (req, res) => {
  db.all(
    `SELECT b.id, b.title, b.content, b.created_at, u.email AS author
     FROM blogs b
     JOIN users u ON b.author_id = u.id
     ORDER BY b.created_at DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

/**
 * @swagger
 * /blogs/{id}:
 *   get:
 *     summary: Get a single blog by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Blog found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       404:
 *         description: Blog not found
 */
// GET /blogs/:id   => ดู blog เดี่ยว ๆ (ไม่ต้องล็อกอิน)
app.get('/blogs/:id', (req, res) => {
  db.get(
    `SELECT b.id, b.title, b.content, b.created_at, u.email AS author
     FROM blogs b
     JOIN users u ON b.author_id = u.id
     WHERE b.id = ?`,
    [req.params.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Blog not found' });
      res.json(row);
    }
  );
});

/**
 * @swagger
 * /blogs:
 *   post:
 *     summary: Create a new blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Blog created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       401:
 *         description: Unauthorized
 */
// POST /blogs      => สร้าง blog ใหม่ (ต้องล็อกอิน)
app.post('/blogs', authenticate, (req, res) => {
  const { title, content } = req.body;
  db.run(
    `INSERT INTO blogs (title, content, author_id) VALUES (?, ?, ?)`,
    [title, content, req.userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, title, content });
    }
  );
});

/**
 * @swagger
 * /blogs/{id}:
 *   put:
 *     summary: Update a blog (owner only)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Blog updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// PUT /blogs/:id   => แก้ไข blog (ต้องล็อกอิน และเป็นเจ้าของ)
app.put('/blogs/:id', authenticate, (req, res) => {
  const { title, content } = req.body;
  const blogId = req.params.id;
  // ตรวจสอบเจ้าของก่อน
  db.get(
    `SELECT * FROM blogs WHERE id = ? AND author_id = ?`,
    [blogId, req.userId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(403).json({ error: 'Forbidden' });

      db.run(
        `UPDATE blogs SET title = ?, content = ? WHERE id = ?`,
        [title, content, blogId],
        function (err2) {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ id: blogId, title, content });
        }
      );
    }
  );
});

/**
 * @swagger
 * /blogs/{id}:
 *   delete:
 *     summary: Delete a blog (owner only)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Blog deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deleted:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// DELETE /blogs/:id   => ลบ blog (ต้องล็อกอิน และเป็นเจ้าของ)
app.delete('/blogs/:id', authenticate, (req, res) => {
  const blogId = req.params.id;
  db.get(
    `SELECT * FROM blogs WHERE id = ? AND author_id = ?`,
    [blogId, req.userId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(403).json({ error: 'Forbidden' });

      db.run(`DELETE FROM blogs WHERE id = ?`, [blogId], function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ deleted: true });
      });
    }
  );
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Blog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         author:
 *           type: string
 */

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
