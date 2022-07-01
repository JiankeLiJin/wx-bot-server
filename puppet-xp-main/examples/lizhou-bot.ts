/**
 *   Wechaty - https://github.com/wechaty/wechaty
 *
 *   @copyright 2021 Wechaty Contributors <https://github.com/wechaty>
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
import type * as PUPPET   from 'wechaty-puppet'

import {
  PuppetXp,
}               from '../src/mod.js'

import qrcodeTerminal from 'qrcode-terminal'

/**
 * 变量定义
 * @type {string}
 */
 let userInfo = "";

/**
 *
 * 1. Declare your Bot!
 *
 */
const puppet = new PuppetXp()

/**
 *
 * 2. Register event handlers for Bot
 *
 */

puppet
  .on('logout', onLogout)
  .on('login',  onLogin)
  .on('scan',   onScan)
  .on('error',  onError)
  .on('message', onMessage)

/**
 *
 * 3. Start the bot!
 *
 */
puppet.start()
  .catch(async e => {
    console.error('Bot start() fail:', e)
    await puppet.stop()
    process.exit(-1)
  })

/**
 *
 * 4. You are all set. ;-]
 *
 */

/**
 *
 * 5. Define Event Handler Functions for:
 *  `scan`, `login`, `logout`, `error`, and `message`
 *
 */
function onScan (payload: PUPPET.payloads.EventScan) {
  if (payload.qrcode) {
    const qrcodeImageUrl = [
      'https://wechaty.js.org/qrcode/',
      encodeURIComponent(payload.qrcode),
    ].join('')
    console.info('StarterBot', 'onScan: %s(%s) - %s', payload.status, qrcodeImageUrl)

    qrcodeTerminal.generate(payload.qrcode, { small: true })  // show qrcode on console
    console.info(`[${payload.status}] ${payload.qrcode}\nScan QR Code above to log in: `)
  } else {
    console.info(`[${payload.status}]`)
  }
}

function onLogin (payload: PUPPET.payloads.EventLogin) {
  console.info(`${payload.contactId} login`)
  handle_get_person()
}

function onLogout (payload: PUPPET.payloads.EventLogout) {
  console.info(`${payload.contactId} logouted`)
}

function onError (payload: PUPPET.payloads.EventError) {
  console.error('Bot error:', payload.data)
  /*
  if (bot.logonoff()) {
    bot.say('Wechaty error: ' + e.message).catch(console.error)
  }
  */
}

/**
 *
 * 6. The most important handler is for:
 *    dealing with Messages.
 *
 */
async function onMessage ({
  messageId,
}: PUPPET.payloads.EventMessage) {
  const {
    talkerId,
    roomId,
    text,
    type,
  } = await puppet.messagePayload(messageId)
  switch (type) {
    case 1:
      console.log("收到一条附件消息");
      break;
    case 2:
      console.log("收到一条语音消息");
      break;
    case 6:
      console.log("收到一条图片消息");
      break;
    case 7:
      console.log({talkerId, roomId,text,type});
      break;
    case 15:
      console.log("收到一条视频消息");
      break;
    default:
      console.log("收到一条其他类型消息");
      break;
  }
  let wxid = talkerId;
  let room = roomId;
  let content = text;
  handle_recv_msg({wxid, content,room});
}

/**
 * 获取用户信息处理函数
 */
 async function handle_get_person(){
  // @ts-ignore
  userInfo = JSON.parse(await puppet.sidecar.getMyselfInfo());
  // @ts-ignore
  if(userInfo.id ==null || userInfo.id == undefined){
    console.log("获取账号信息失败");
    // @ts-ignore
    await puppet.logout();
    return;
  }else {
    console.log("获取用户信息失败");
  }
  // @ts-ignore
  console.info(`小助手<${userInfo.name}>登录了`);
}
/**
 * 消息处理函数
 * @param j
 */
// @ts-ignore
async function handle_recv_msg(j){
  let content = j.content;

  //判断是群消息还是个人消息
  if(j.room != null && j.room != ''){
    // @ts-ignore
    let mentionSelf = content.includes(`@${userInfo.wxName}`);
    //判断是否是@我的消息
    if (mentionSelf) {
      content = content.replace(/@[^,，：:\s@]+/g, '').trim();
      console.log("消息内容：",content);
    }
  }
  else{
    //个人消息

  }

  
}


/**
 *
 * 7. Output the Welcome Message
 *
 */
const welcome = `
Puppet Version: ${puppet.version()}

Please wait... I'm trying to login in...

`
console.info(welcome)
