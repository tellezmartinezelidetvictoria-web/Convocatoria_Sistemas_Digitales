require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const multer = require('multer');
const db = require('./db');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const connectedUsers = new Map();
const userSocketMap = new Map();

if (!fs.existsSync('uploads/')) {
    fs.mkdirSync('uploads/');
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage: storage, limits: { fileSize: 40 * 1024 * 1024 } });

app.use(express.json());
app.use(express.static('public'));

app.use('/uploads', express.static('uploads'));

app.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo' });
        }
        res.json({ path: req.file.filename });
    } catch (error) {
        res.status(500).json({ error: 'Error interno al procesar el archivo' });
    }
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hash);
        res.status(201).json({ message: 'Usuario creado' });
    } catch { res.status(400).json({ error: 'Usuario ya existe' }); }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (user && bcrypt.compareSync(password, user.password)) res.json({ username });
    else res.status(401).json({ error: 'Credenciales inválidas' });
});

app.get('/history/:user1/:user2', (req, res) => {
    const { user1, user2 } = req.params;
    let msgs;
    
    if (user2 === 'ALL') {
        msgs = db.prepare(`
            SELECT * FROM messages 
            WHERE receiver_id = 'ALL' 
            ORDER BY timestamp ASC
        `).all();
    } else {
        msgs = db.prepare(`
            SELECT * FROM messages 
            WHERE (sender_id = ? AND receiver_id = ?) 
               OR (sender_id = ? AND receiver_id = ?) 
            ORDER BY timestamp ASC
        `).all(user1, user2, user2, user1);
    }
    res.json(msgs);
});

// Sockets
io.on('connection', (socket) => {
    socket.on('user_connected', (username) => {
        connectedUsers.set(socket.id, username);
        userSocketMap.set(username, socket.id);
        db.prepare('UPDATE users SET status = ? WHERE username = ?').run('online', username);
        io.emit('user_list', db.prepare('SELECT username, status FROM users').all());
    });

    socket.on('typing', ({ to }) => {
        const sender = connectedUsers.get(socket.id);
        const targetSocketId = userSocketMap.get(to);
        if (targetSocketId) {
            io.to(targetSocketId).emit('typing', { from: sender });
        }
    });

    socket.on('broadcast_message', (message) => {
        const sender = connectedUsers.get(socket.id);
        const stmt = db.prepare('INSERT INTO messages (sender_id, receiver_id, content, type, status) VALUES (?, ?, ?, ?, ?)');
        const info = stmt.run(sender, 'ALL', message, 'text', 'sent');

        socket.broadcast.emit('receive_message', {
            id: info.lastInsertRowid,
            from: sender,
            message,
            type: 'text', 
            receiver_id: 'ALL',
            status: 'sent'
        });
    });

    socket.on('private_message', ({ to, message, type = 'text' }) => {
        const sender = connectedUsers.get(socket.id);
        if (!sender) return;

        const stmt = db.prepare('INSERT INTO messages (sender_id, receiver_id, content, type, status) VALUES (?, ?, ?, ?, ?)');
        const info = stmt.run(sender, to, message, type, 'sent');
        
        const targetId = userSocketMap.get(to);
        if (targetId) {
            io.to(targetId).emit('receive_message', { 
                id: info.lastInsertRowid, 
                from: sender, 
                message, 
                type, 
                receiver_id: to,
                status: 'sent' 
            });
        }
    });

    socket.on('message_read', ({ messageId, fromUser }) => {
        db.prepare('UPDATE messages SET status = ? WHERE id = ?').run('read', messageId);
        const senderSocketId = userSocketMap.get(fromUser);
        if (senderSocketId) {
            io.to(senderSocketId).emit('message_read_update', messageId);
        }
    });

    socket.on('disconnect', () => {
        const username = connectedUsers.get(socket.id);
        if (username) {
            db.prepare('UPDATE users SET status = ? WHERE username = ?').run('offline', username);
            connectedUsers.delete(socket.id);
            userSocketMap.delete(username);
            io.emit('user_list', db.prepare('SELECT username, status FROM users').all());
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => console.log(`Servidor activo en el puerto ${PORT}`));