# 使用官方 Node.js 18 稳定版的轻量镜像作为基础环境
FROM node:18-alpine

# 在容器内设置工作目录为 /app
WORKDIR /app

# 先复制 package.json，利用缓存机制加速后续的 npm install
COPY package*.json ./

# 安装依赖库 (Express 和 Socket.io)
RUN npm install

# 把当前目录下的所有文件 (server.js 等) 复制到容器的 /app 目录
COPY . .

# 暴露 80 端口，与你的 server.js 以及云端配置保持绝对一致
EXPOSE 80

# 启动服务器的命令
CMD ["npm", "start"]