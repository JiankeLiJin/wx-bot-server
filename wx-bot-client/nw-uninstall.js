import path from 'path';
import nodeWindow from 'node-windows';

const Service = nodeWindow.Service;

let svc = new Service({
  name: 'WxBotClient', // 服务名称
  description: '微信机器人客户端', // 服务描述
  script: path.resolve("./examples/lizhou-bot.ts"),// 项目入口文件
  nodeOptions: [
    '--loader=ts-node/esm',
    '--harmony',
    '--max_old_space_size=4096'
  ]
});

svc.on('uninstall', function () {
  console.log('Uninstall complete.');
  console.log('The service exists: ', svc.exists);
});

svc.uninstall();