const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket'] // 限制云托管仅允许长连接
});

io.on('connection', (socket) => {
  console.log('玩家已接入集群，分配ID:', socket.id);

  socket.on('playerAction', (data) => {
    // 收到数据包后，自动转发给除了发送者以外的所有在线玩家
    socket.broadcast.emit('playerAction', data);
  });

  socket.on('disconnect', () => {
    console.log('玩家下线，注销ID:', socket.id);
  });
});

const PORT = process.env.PORT || 80;
server.listen(PORT, () => {
  console.log(`TCP网络节点已启动，运行端口: ${PORT}`);
});
