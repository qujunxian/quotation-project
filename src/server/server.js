import express from 'express'
import sqlite3 from 'sqlite3'
const { Database } = sqlite3.verbose()
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Check if running from packaged executable
const isPackaged = !fs.existsSync(path.join(__dirname, 'server.js'))
const baseDir = isPackaged ? path.dirname(process.execPath) : process.cwd()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Serve static files from dist folder (production build)
const staticPaths = [
  path.join(baseDir, 'dist'),
  path.join(__dirname, '../../dist'),
  path.join(process.cwd(), 'dist')
]

let staticPath = null
for (const p of staticPaths) {
  if (fs.existsSync(p)) {
    staticPath = p
    break
  }
}

if (staticPath) {
  console.log('Serving static files from:', staticPath)
  app.use(express.static(staticPath))
} else {
  console.warn('Warning: dist folder not found')
}

// Initialize SQLite database (in executable directory)
const dbPath = path.join(baseDir, 'quotations.db')
console.log('Database location:', dbPath)
const db = new Database(dbPath)

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS quotations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT DEFAULT '',
      date TEXT DEFAULT '',
      quoter TEXT DEFAULT '',
      taxRate REAL DEFAULT 6,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS quotation_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quotationId INTEGER NOT NULL,
      sortOrder INTEGER DEFAULT 0,
      name TEXT DEFAULT '',
      model TEXT DEFAULT '',
      unit TEXT DEFAULT '',
      qty REAL DEFAULT 0,
      installPrice REAL DEFAULT 0,
      equipPrice REAL DEFAULT 0,
      remark TEXT DEFAULT '',
      FOREIGN KEY (quotationId) REFERENCES quotations(id) ON DELETE CASCADE
    )
  `)
})

// Get all quotations (list only)
app.get('/api/quotations', (req, res) => {
  db.all(
    `SELECT id, name, date, quoter, taxRate, createdAt, updatedAt
     FROM quotations
     ORDER BY updatedAt DESC`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      res.json(rows)
    }
  )
})

// Get single quotation with items
app.get('/api/quotations/:id', (req, res) => {
  const { id } = req.params

  db.get(
    `SELECT * FROM quotations WHERE id = ?`,
    [id],
    (err, quotation) => {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      if (!quotation) {
        res.status(404).json({ error: 'Quotation not found' })
        return
      }

      db.all(
        `SELECT * FROM quotation_items
         WHERE quotationId = ?
         ORDER BY sortOrder ASC, id ASC`,
        [id],
        (err, items) => {
          if (err) {
            res.status(500).json({ error: err.message })
            return
          }
          res.json({ ...quotation, items })
        }
      )
    }
  )
})

// Create new quotation
app.post('/api/quotations', (req, res) => {
  const { name, date, quoter, taxRate, items } = req.body
  const now = new Date().toISOString()

  db.run(
    `INSERT INTO quotations (name, date, quoter, taxRate, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name || '', date || '', quoter || '', taxRate || 6, now, now],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }

      const quotationId = this.lastID

      // Insert items if provided
      if (items && items.length > 0) {
        const stmt = db.prepare(
          `INSERT INTO quotation_items
           (quotationId, sortOrder, name, model, unit, qty, installPrice, equipPrice, remark)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )

        items.forEach((item, index) => {
          stmt.run([
            quotationId,
            item.sortOrder || index,
            item.name || '',
            item.model || '',
            item.unit || '',
            item.qty || 0,
            item.installPrice || 0,
            item.equipPrice || 0,
            item.remark || ''
          ])
        })

        stmt.finalize(() => {
          res.json({ id: quotationId, message: 'Quotation created' })
        })
      } else {
        res.json({ id: quotationId, message: 'Quotation created' })
      }
    }
  )
})

// Update quotation
app.put('/api/quotations/:id', (req, res) => {
  const { id } = req.params
  const { name, date, quoter, taxRate, items } = req.body
  const now = new Date().toISOString()

  db.run(
    `UPDATE quotations
     SET name = ?, date = ?, quoter = ?, taxRate = ?, updatedAt = ?
     WHERE id = ?`,
    [name || '', date || '', quoter || '', taxRate || 6, now, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }

      if (this.changes === 0) {
        res.status(404).json({ error: 'Quotation not found' })
        return
      }

      // Delete old items and insert new ones
      db.run(`DELETE FROM quotation_items WHERE quotationId = ?`, [id], function (err) {
        if (err) {
          res.status(500).json({ error: err.message })
          return
        }

        if (items && items.length > 0) {
          const stmt = db.prepare(
            `INSERT INTO quotation_items
             (quotationId, sortOrder, name, model, unit, qty, installPrice, equipPrice, remark)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )

          items.forEach((item, index) => {
            stmt.run([
              id,
              item.sortOrder || index,
              item.name || '',
              item.model || '',
              item.unit || '',
              item.qty || 0,
              item.installPrice || 0,
              item.equipPrice || 0,
              item.remark || ''
            ])
          })

          stmt.finalize(() => {
            res.json({ message: 'Quotation updated' })
          })
        } else {
          res.json({ message: 'Quotation updated' })
        }
      })
    }
  )
})

// Delete quotation
app.delete('/api/quotations/:id', (req, res) => {
  const { id } = req.params

  db.run(`DELETE FROM quotations WHERE id = ?`, [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }

    if (this.changes === 0) {
      res.status(404).json({ error: 'Quotation not found' })
      return
    }

    res.json({ message: 'Quotation deleted' })
  })
})

// Serve index.html for all non-API routes (SPA support)
app.get('*', (req, res) => {
  const indexPaths = [
    path.join(baseDir, 'dist/index.html'),
    path.join(__dirname, '../../dist/index.html'),
    path.join(process.cwd(), 'dist/index.html')
  ]

  for (const indexPath of indexPaths) {
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath)
      return
    }
  }

  res.status(404).send('index.html not found')
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
  console.log(`Open browser to access the application`)
})

// Graceful shutdown
process.on('SIGINT', () => {
  db.close(() => {
    console.log('Database connection closed')
    process.exit(0)
  })
})
