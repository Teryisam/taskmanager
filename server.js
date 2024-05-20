const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const User = require('./models/User');
const Task = require('./models/Task');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.set('io', io);

const createDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    console.log(`Database ${process.env.DB_NAME} created or already exists.`);
    await connection.end();
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1); // Exit the process with an error code
  }
};

const startServer = async () => {
  await createDatabase();

  sequelize.sync({ force: true }).then(() => {
    server.listen(3000, () => {
      console.log('Server started on port 3000');
    });
  }).catch(error => {
    console.error('Unable to sync database:', error);
    process.exit(1); // Exit the process with an error code
  });
};

startServer();