let path = require('path');

let Service = require('node-windows').Service;

let svc = new Service({
  name: 'WxBotClient', // 服务名称
  description: '微信机器人客户端', // 服务描述
  script: path.join(__dirname, 'examples/lizhou-bot.ts'),// 项目入口文件
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ]
});

svc.on('install', function () {
  svc.start();
});

svc.install();