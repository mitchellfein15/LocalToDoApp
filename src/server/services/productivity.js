/**
 * Durable daily completion ledger helpers for productivity_days.
 */

function bumpDay(db, day, delta, callback) {
  if (!day || !delta) {
    if (callback) callback(null);
    return;
  }

  db.run(
    `INSERT INTO productivity_days (day, count)
     VALUES (?, MAX(0, ?))
     ON CONFLICT(day) DO UPDATE SET count = MAX(0, count + ?)`,
    [day, delta, delta],
    (err) => {
      if (callback) callback(err);
    }
  );
}

function bumpToday(db, delta, callback) {
  db.get(`SELECT DATE('now', 'localtime') AS day`, (err, row) => {
    if (err) {
      if (callback) callback(err);
      return;
    }
    bumpDay(db, row && row.day, delta, callback);
  });
}

function toDateKey(value) {
  if (!value) return null;
  const str = String(value);
  // Prefer YYYY-MM-DD prefix from SQLite timestamps
  const match = str.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  const date = new Date(str);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

module.exports = {
  bumpDay,
  bumpToday,
  toDateKey,
};
