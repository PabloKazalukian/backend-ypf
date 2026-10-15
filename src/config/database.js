const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'oilfield';

let client = null;
let db = null;

async function connectDatabase() {
  client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(DB_NAME);
  return db;
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return db;
}

async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = { connectDatabase, getDb, closeDatabase };
