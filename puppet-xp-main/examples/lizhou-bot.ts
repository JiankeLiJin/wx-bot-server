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
import type * as PUPPET from 'wechaty-puppet'

import {
  PuppetXp,
} from '../src/mod.js'

import qrcodeTerminal from 'qrcode-terminal'
// @ts-ignore
import schedule from 'node-schedule'
// @ts-ignore
import rp from 'request-promise'

/**
 * 变量定义
 * @type {string}
 */
let userInfo = "";

/**
* 常量定义
* @type {string}
*/
const WECHAT_URL = 'http://localhost:5600/api/public/wx-client';// 服务器host
const APPLICTION_TOKEN = "08da5d97-da10-498f-881f-4eb6f415f76a";//平台KEY

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
  .on('login', onLogin)
  .on('scan', onScan)
  .on('error', onError)
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
function onScan(payload: PUPPET.payloads.EventScan) {
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

function onLogin(payload: PUPPET.payloads.EventLogin) {
  console.info(`${payload.contactId} login`)
  handleGetPerson()
}

function onLogout(payload: PUPPET.payloads.EventLogout) {
  console.info(`${payload.contactId} logouted`)
}

function onError(payload: PUPPET.payloads.EventError) {
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
async function onMessage({
  messageId,
}: PUPPET.payloads.EventMessage) {
  return;
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
      console.log({ talkerId, roomId, text, type });
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
  handleRecvMsg({ wxid, content, room });
}

/**
 * 获取用户信息处理函数
 */
async function handleGetPerson() {
  //上传用户信息
  await updateWxUserInfo();
  //上传联系人
  await updateContacts();
  //获取平台配置 定时任务 每日说 等
  // @ts-ignore
  console.log("更新完成,")
}
/**
 * 消息处理函数
 * @param j
 */
// @ts-ignore
async function handleRecvMsg(j) {
  let content = j.content;

  //判断是群消息还是个人消息
  if (j.room != null && j.room != '') {
    // @ts-ignore
    let mentionSelf = content.includes(`@${userInfo.wxName}`);
    //判断是否是@我的消息
    if (mentionSelf) {
      content = content.replace(/@[^,，：:\s@]+/g, '').trim();
      console.log("消息内容：", content);
    }
  }
  else {
    //个人消息

  }
}


/**
 * 上传用户信息
 * @returns 
 */
async function updateWxUserInfo() {
  //设定定时每30秒更新上传一次用户信息
  setLocalSchedule(
    "*/30 * * * * *",
    async () => {
      // @ts-ignore
      userInfo = JSON.parse(await puppet.sidecar.getMyselfInfo());
      // @ts-ignore
      if (userInfo.id == null || userInfo.id == undefined) {
        console.log("获取账号信息失败");
        // @ts-ignore
        await puppet.logout();
        return;
      } else {
        console.log("获取用户信息成功");
        console.log("用户信息:", userInfo);
        let data = {
          // @ts-ignore
          wxId: userInfo.id,
          // @ts-ignore
          WxCode: userInfo.code,
          // @ts-ignore
          WxName: userInfo.name,
          // @ts-ignore
          AvatarUrl: userInfo.head_img_url,
        };
        let res = await PostRequest(WECHAT_URL + `/wx-user-info/${APPLICTION_TOKEN}`, data);
        if (res && res.code == 1) {
          console.log("上传用户信息成功!,响应结果:", res);
        }
        else {
          console.log("上传用户信息失败!,响应结果:", res);
        }
      }
    },
    "用户信息更新任务"
  )
}
/**
 * 上传联系人
 */
async function updateContacts() {
  // @ts-ignore
  const contacts = JSON.parse(await puppet.sidecar.getContact())
  console.log(`联系人有${contacts.length}个`);
  let res = await PostRequest(WECHAT_URL + `/save-contacts/${APPLICTION_TOKEN}`, contacts.map(c => ({
    wxId: c.id,
    wxCode: c.code,
    name: c.name,
    alias: c.alias,
    avatarUrl: c.avatarUrl,
    gender: c.gender

  })));
  if (res && res.code == 1) {
    console.log("上传联系人成功!,响应结果:", res);
  }
  else {
    console.log("上传联系人失败!,响应结果:", res);
  }
}



/**
 * post请求
 * @param url
 * @param paraStr
 * @constructor
 */
// @ts-ignore
async function PostRequest(url, paraStr) {
  try {
    var options = {
      method: 'POST',
      uri: url,
      body: paraStr,
      json: true // Automatically stringifies the body to JSON
    };
    let data = await rp(options);
    // console.log("post请求成功");
    return data;
  } catch (e) {
    console.log("post请求请求失败:", e);
    return;
  }
}

/**
 * get请求
 * @param url
 * @returns {Promise<void>}
 * @constructor
 */
// @ts-ignore
async function GetRequest(url) {
  try {
    var options = {
      uri: url,
      qs: {
        access_token: 'xxxxx xxxxx' // -> uri + '?access_token=xxxxx%20xxxxx'
      },
      headers: {
        'User-Agent': 'Request-Promise'
      },
      json: true // Automatically parses the JSON string in the response
    };
    let data = await rp(options);
    // console.log("get请求成功");
    return data;
  } catch (e) {
    // console.log("get请求失败");
    return;
  }

}

/**
 * 设置定时器
 * @param date
 * @param callback
 * @param name
 */
// @ts-ignore
function setLocalSchedule(date, callback, name) {
  if (name) {
    schedule.scheduleJob(name, { rule: date, tz: 'Asia/Shanghai' }, callback)
  } else {
    schedule.scheduleJob({ rule: date, tz: 'Asia/Shanghai' }, callback)
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
