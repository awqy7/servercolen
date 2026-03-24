const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(process.cwd(), 'db.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Checking database at:', dbPath);

db.all('SELECT * FROM Estoque', [], (err, rows) => {
  if (err) {
    console.error('Database error:', err);
    process.exit(1);
  }
  console.log('--- ITENS NO ESTOQUE ---');
  console.table(rows);
  console.log('Total:', rows.length);
  db.close();
});
