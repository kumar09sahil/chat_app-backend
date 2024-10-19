const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config({ path: './File/config.env' });
const authRouter = require('./Router/authRouter')
const chatroomRouter = require('./Router/chatroomRouter')

let app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//* to make connection to the database
mongoose
  .connect(process.env.CONN_STR, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connection successful..!");
  })
  .catch((err) => {
    console.log("Some error occurred: ", err.message);
  });

//* module routes for different routers i.e user, authorization
app.use('/chat_app/v1/auth', authRouter);
app.use('/chat_app/v1/chatroom', chatroomRouter);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });
  
  app.set('io',io)

  const onlineUsers = {}; 

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('user_connected', (userId) => {
    onlineUsers[socket.id] = userId; 
    console.log('Online Users:', onlineUsers);

    io.emit('update_online_users', Object.values(onlineUsers));
  });

  socket.on('user_typing', (username) => {
    console.log(`${username} is typing...`);
    io.emit('user_typing', username);
  });

  socket.on('user_stop_typing', (username) => {
    console.log(`${username} stopped typing.`);
    io.emit('user_stop_typing', username);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    delete onlineUsers[socket.id]; 
    console.log('Online Users:', onlineUsers);

    io.emit('update_online_users', Object.values(onlineUsers));
  });
});



app.get('/', (req, res) => {
    res.send('Server is running');
  });

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server started on http://localhost:${process.env.PORT || 5000}`);
});

module.exports = app ;
