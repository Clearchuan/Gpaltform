const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// 跨域设置：允许你的 GitHub Pages 网页访问这个云服务器
const io = new Server(server, {
  cors: {
    origin: "*", // 课程作业方便调试，允许所有来源访问
    methods: ["GET", "POST"]
  }
});

// 当有玩家连接时
io.on('connection', (socket) => {
  console.log('玩家已连接，ID:', socket.id);

  // 通用事件广播：接收来自某个玩家的数据，并广播给所有人（除了自己）
  socket.on('playerAction', (data) => {
    socket.broadcast.emit('playerAction', data);
  });

  // 当玩家断开连接时
  socket.on('disconnect', () => {
    console.log('玩家已断开，ID:', socket.id);
  });
});

// 监听端口：优先使用腾讯云分配的端口，默认 80
const PORT = process.env.PORT || 80;
server.listen(PORT, () => {
  console.log(`联机服务器已启动，正在监听端口: ${PORT}`);
});