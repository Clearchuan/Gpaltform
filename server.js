const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// 允许所有前端跨域连接
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('新终端接入，分配连接ID:', socket.id);

  // 核心：处理玩家输入房间号加入
  socket.on('joinRoom', (data) => {
    const { room, id } = data;
    socket.join(room); // 服务器将该连接归入指定房间
    console.log(`玩家 ${id} 成功编入房间: ${room}`);

    // 获取当前房间的实时总人数
    const clients = io.sockets.adapter.rooms.get(room);
    const numClients = clients ? clients.size : 0;

    // 规则：第一个进房间的是房主(host)，第二个是客人(guest)
    const role = (numClients === 1) ? 'host' : 'guest';
    socket.emit('initRole', { role: role });

    // 当房间凑齐2个人，通知房间内的所有人游戏正式开始
    if (numClients === 2) {
      io.to(room).emit('gameStart', { msg: '联机玩家已齐备，比赛开始！' });
    }
  });

  // 核心：无差错路由转发
  // 接收某一个玩家的动作（位移、生成障碍、吃金币），精准转发给同房间的另一个人
  socket.on('syncAction', (data) => {
    socket.to(data.room).emit('syncAction', data);
  });

  socket.on('disconnect', () => {
    console.log('终端断开连接:', socket.id);
  });
});

// 腾讯云容器开放端口
const PORT = process.env.PORT || 80;
server.listen(PORT, () => {
  console.log(`高并发联机核心已启动，正在监听端口: ${PORT}`);
});
