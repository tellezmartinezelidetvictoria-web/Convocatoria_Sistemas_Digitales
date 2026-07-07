const db = require('./db');
const messages = db.prepare('SELECT * FROM messages').all();
console.log("Mensajes en la base de datos:", messages);