const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(process.cwd(), 'db.sqlite');
const db = new sqlite3.Database(dbPath);

db.all('SELECT * FROM Estoque', [], (err, rows) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('JSON_START');
  console.log(JSON.stringify(rows));
  console.log('JSON_END');
  db.close();
});
