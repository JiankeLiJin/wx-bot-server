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

let botConfig = {
  wxBotConfig: {},
  timedTasks: [],
  sayEveryDays: [],
};
/**本地开启私聊的微信id */
// let privateChatwxIds: any[] = [];

//正在运行的定时任务名称
let runScheduleNames: any[] = [];

/**
* 常量定义
* @type {string}
*/
const WECHAT_URL = 'http://47.102.105.169:9901/api/public/wx-client';// 服务器host
const APPLICTION_TOKEN = "xxxxx";//平台KEY 自行修改

const apologizeTextArr = [
  "有一天芋泥和啵啵吵架了，芋泥气得离家出走了，奶茶觉得啵啵很过分就跟他私奔了，只剩下一个啵啵，所以这个啵啵你是要还是不要呀。",
  "有一天，小熊在洗衣服\n可是有一个地方怎么也洗不干净\n熊妈妈说：你认真搓\n小熊红着眼睛说：我搓了我搓了",
  "从前有只小鸭子，到牧场果园玩儿，走着走着就口渴了，抬头看到头上的梨树，奈何够不着，就一直念叨，想梨鸭，想梨鸭，想梨鸭。",
  "我欠你五块，你还我十块，我倒欠。",
  "有一个菠萝去理发，它坐了很久理发师一直不给它理发，它就说:“你理理我叭！”",
  "不要冷战了好吗，你再不理我，我就变成狗不理了",
  "我是一个麻将，开心的时候吃，不开心的时候杠，你惹我生气的时候，我就大喊一声： “我胡（服）了你啦”",
  "有一天鸭鸭陪女朋友去逛街，街上很拥挤，鸭鸭慌乱中握住了一只手，结果不是她的女朋友。于是鸭鸭很慌乱的说：“握错了鸭，握错了鸭。”了",
  "有天兔兔种了一颗草莓和芒果，发现草莓长的好慢，兔兔就说：莓你不行啊，莓你不行啊，你听到了吗？没你不行啊！",
  "有一次我在看月亮，这个月亮又圆，又亮又圆又亮，圆亮啊圆亮，原谅。",
  "蔬菜们在举办比瘦大赛 茄子看到了黄瓜 发现黄瓜的腰很细 于是茄子一直在嘀嘀咕咕：没瓜细呀 没瓜细呀 没关系~",
  "首项加未项的和乘项数除以二\n干嘛?\求和呀",
  "有一天一颗芦荟看到泥地里有一颗莴苣\n芦荟就想，为啥莴苣不能养在花盆里\n然后芦荟恍然大悟\n因为莴爱泥呀（我爱你）",
  "♀️ ♂️好吧、坏吧、随便吧是三个好朋友 ☎️有一天随便吧打电话给坏吧.约他一起出去玩,坏吧说:还有有谁啊,随便吧说：我们和好吧",
  "有一天鸭鸭 去买生蚝,回家的路上生蚝全都跳下袋子钻到了泥土里,原来这就叫蚝喜欢泥~好喜欢你~",
  "你别跟我吵架了，我不跟这么好看的人吵架",
  "有一天m和n吵架了，最后m道歉了，因为m sorry",
  "我是一个糊涂虫一个小笨蛋，但是请你相信，我不是故意惹你生气的",
  "您好，我是快乐警察，请您配合我的工作，现在我要抓走你所有的不开心",
  "有一个菠萝去理发，它坐了很久理发师一直不给它理发，它就说:“你理理我叭！”",
  "一只小企鹅啪唧一下摔倒了，一只小小鸟叽叽喳喳的嘲笑它：“你是不是打算爬一辈子啊，还不起来”，小企鹅气呼呼的说：“对，不起！”。",
];

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

async function onLogin(payload: PUPPET.payloads.EventLogin) {
  console.info(`${payload.contactId} 已登录`)
  await reloadConfig();

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
  const {
    talkerId,
    roomId,
    text,
    type,
  } = await puppet.messagePayload(messageId)
  console.log({ talkerId, roomId, text, type });
  let wxId = talkerId;
  let room = roomId;
  let content = text;
  handleRecvMsg({ wxId, content, room });
}

/**
 * 消息处理函数
 * @param j { wxId, content, room }
 */
// @ts-ignore
async function handleRecvMsg(j) {
  let content = j.content;
  //判断是群消息还是个人消息
  if (j.room != null && j.room != '') {
    // @ts-ignore
    let mentionSelf = content.includes(`@${userInfo.name}`);
    //判断是否是@我的消息
    if (mentionSelf) {
      content = content.replace(/@[^,，：:\s@]+/g, '').trim();
      console.log("消息内容：", content);
      //是否开启群聊自动回复
      // @ts-ignore
      if (botConfig.wxBotConfig.groupAutoReplyFlag == 1) {
        if (content.indexOf("启动道歉模式") > -1 && j.wxId == "wxid_tqwjgv8ux9ka22") {
          // @ts-ignore
          const babyNick = await puppet.sidecar.getChatroomMemberNickInfo("lnc98123456", j.room);
          //随机获取五个道歉语录
          let randomApologizeTextArr = apologizeTextArr.sort(() => Math.random() > 0.5 ? -1 : 1).slice(0, 5);
          randomApologizeTextArr.forEach((apologize, index) => {
            setTimeout(async () => {
              // @ts-ignore
              await puppet.sidecar.sendAtMsg(j.room, `@${babyNick} ${apologize}`, "lnc98123456");
            }, (index + 1) * 4000)
          })
          return;
        }
        // @ts-ignore
        const nick = await puppet.sidecar.getChatroomMemberNickInfo(j.wxId, j.room);
        if (content == null || content == '') {
          content = "1.毒鸡汤(发送“毒鸡汤”，随机干了这碗鸡汤)\n"
            + "2.天气查询(发送“上海天气”，查询Ta的天气)\n"
            + "3.故事大全(发送“故事、讲个故事”，即可随机获得一个故事)\n"
            + "4.成语接龙(发送“成语接龙”，即可进入成语接龙模式)\n"
            + "5.歇后语(发送“歇后语”，返回短小风趣又像谜语的句子)\n"
            + "6.笑话大全(发送“笑话、讲个笑话”，让我陪你笑开心)\n"
            + "7.土味情话(发送“情话、讲个情话”，让我陪你撩心里的TA)\n"
            + "8.顺口溜(发送“顺口溜”，好听的民俗有趣的轶事)\n"
            + "9.舔狗日记(发送“舔狗”，随机返回一个舔狗日记)\n"
            + "10.彩虹屁(发送“彩虹屁”，随机返回一个彩虹屁句子)\n\n";
          // @ts-ignore
          await puppet.sidecar.sendAtMsg(j.room, `@${nick} ${content}`, j.wxId);
        } else {
          //获取关键字回复
          let replyContent = await getKeywordReply(content);
          if (replyContent != null) {
            console.log(`群聊关键字回复：${replyContent}`);
            // @ts-ignore
            await puppet.sidecar.sendAtMsg(j.room, `@${nick} ${replyContent}`, j.wxId);
          }
          else {
            //调用机器人回复
            let replyContent = await getBotReply(content, j.wxId);
            console.log(`群聊机器人回复：${replyContent}`);
            // @ts-ignore
            await puppet.sidecar.sendAtMsg(j.room, `@${nick} ${replyContent}`, j.wxId);
          }
        }
      }
    }
  }
  else {
    //个人消息
    // @ts-ignore
    if (j.wxId == userInfo.wxId) return;//自己给自己发消息不处理
    //更新配置拦截
    if (content.indexOf("更新配置") > -1) {
      await reloadConfig();
      // @ts-ignore
      await puppet.sidecar.sendMsg(j.wxId, `配置更新成功`);
      return;
    }

    // if (content.indexOf("关闭私聊") > -1) {
    //   if (privateChatwxIds.includes(j.wxId)) {
    //     privateChatwxIds.splice(privateChatwxIds.indexOf(j.wxId), 1);
    //     console.log(`${j.wxId}私聊已关闭`);
    //     // @ts-ignore
    //     await puppet.sidecar.sendMsg(j.wxId, "好的,不聊了!");
    //     return;
    //   }
    // }
    // if (content.indexOf("开启私聊") > -1) {
    //   //判断平台是否开启了私聊
    //   // @ts-ignore
    //   if (botConfig.wxBotConfig.talkPrivateAutoReplyFlag == 0) {
    //     // @ts-ignore
    //     await puppet.sidecar.sendMsg(j.wxId, "主人设置不允许和你聊天了!");
    //     return;
    //   }
    //   if (!privateChatwxIds.includes(j.wxId)) {
    //     privateChatwxIds.push(j.wxId);
    //     console.log(`${j.wxId}私聊已开启`);
    //   }
    // }
    // @ts-ignore
    if (botConfig.wxBotConfig.talkPrivateAutoReplyFlag == 1) {
      //获取关键字回复
      let replyContent = await getKeywordReply(content);
      if (replyContent != null) {
        console.log(`关键字回复：${replyContent}`);
        // @ts-ignore
        await puppet.sidecar.sendMsg(j.wxId, replyContent);
      }
      else {
        //调用机器人回复
        let replyContent = await getBotReply(content, j.wxId);
        console.log(`机器人回复：${replyContent}`);
        // @ts-ignore
        await puppet.sidecar.sendMsg(j.wxId, replyContent);
      }

    }

  }
}
/**
 * 重新加载配置
 */
async function reloadConfig() {
  //取消所有任务
  runScheduleNames.forEach(name => {
    console.log("取消任务：", name)
    schedule.cancelJob(name);
  });
  //上传用户信息
  await updateWxUserInfo();
  //上传联系人
  await updateContacts();
  //获取平台配置 定时任务 每日说 等
  // @ts-ignore
  console.log("3s后启动定时任务,每日说...");
  setTimeout(async () => await startTask(), 3000);
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
  let res = await PostRequest(WECHAT_URL + `/contacts/${APPLICTION_TOKEN}`, contacts.map((c: any) => ({
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
}/**
 * 启动 定时任务 每日说 等
 */
async function startTask() {
  //获取机器人配置
  let res = await GetRequest(WECHAT_URL + `/wx-confg/${APPLICTION_TOKEN}`);
  if (res && res.code == 1) {
    botConfig = res.data;
    //启动定时任务
    if (botConfig.timedTasks) {
      await startTimedTask(botConfig.timedTasks);
    }
    //启动每日说
    if (botConfig.sayEveryDays) {
      await startSayEveryDay(botConfig.sayEveryDays);
    }
  }
  else {
    console.log("获取机器人配置失败!,响应结果:", res);
  }
}
/**
 * 启动每日说任务
 * @param sayEveryDays 每日说任务信息
 */
// @ts-ignore
async function startSayEveryDay(sayEveryDays) {
  if (sayEveryDays) {
    // @ts-ignore
    sayEveryDays.forEach(sayEveryDay => {
      setLocalSchedule(sayEveryDay.sendTime, async () => {
        //获取定时任务发送内容
        let sendContent = await getSayEveryDayText(sayEveryDay.id);
        if (sendContent == null) {
          console.log(`获取每日说任务(${sayEveryDay.id})发送内容为空`);
          return;
        }
        //获取接收人
        let receivingwxIds = sayEveryDay.receivingObjectWxId.split(',');
        let receivingWxNames = sayEveryDay.receivingObjectName.split(',');
        //循环发送消息
        // @ts-ignore
        receivingwxIds.forEach(async (wxId, index) => {
          console.log(`每日说任务(${sayEveryDay.id})给 ${receivingWxNames[index]} 发送消息:${sendContent}`)
          // @ts-ignore
          await puppet.sidecar.sendMsg(wxId, sendContent);
        });
      }, `每日说任务-${sayEveryDay.id}`);
    })
    console.log("每日说任务设置完成");
  }
  else {
    console.log("没有配置每日说任务");
  }
}
/**
 * 启动定时任务
 * @param timedTasks 定时任务信息
 */
// @ts-ignore
async function startTimedTask(timedTasks) {
  if (timedTasks) {
    // @ts-ignore
    timedTasks.forEach(task => {
      setLocalSchedule(task.sendTime, async () => {
        //获取定时任务发送内容
        let sendContent = await getTimeTaskSendContent(task.id);
        if (sendContent == null) {
          console.log(`获取定时任务(${task.id})发送内容为空`);
          return;
        }
        //获取接收人
        let receivingwxIds = task.receivingObjectWxId.split(',');
        let receivingWxNames = task.receivingObjectName.split(',');
        //循环发送消息
        // @ts-ignore
        receivingwxIds.forEach(async (wxId, index) => {
          console.log(`定时任务(${task.id})给 ${receivingWxNames[index]} 发送消息:${sendContent}`)
          // @ts-ignore
          await puppet.sidecar.sendMsg(wxId, sendContent);
        });
      }, `定时任务-${task.id}`);
    })
    console.log("定时任务设置完成");
  }
  else {
    console.log("没有配置定时任务");
  }
}
/**
 * 获取定时任务发送内容
 * @param taskId 定时任务id
 * @returns 发送内容
 */
// @ts-ignore
async function getTimeTaskSendContent(taskId) {
  let res = await GetRequest(WECHAT_URL + `/timed/send-content/${APPLICTION_TOKEN}?taskId=${taskId}`);
  return res && res.code == 1 ? res.data : null;
}

/**
 * 获取每日说任务发送内容
 * @param everyDayId 每日说id
 * @returns 每日说内容
 */
// @ts-ignore
async function getSayEveryDayText(everyDayId) {
  let res = await GetRequest(WECHAT_URL + `/say-every-day/${APPLICTION_TOKEN}?everyDayId=${everyDayId}`);
  return res && res.code == 1 ? res.data : null;
}
/**
 * 获取关键字回复
 * @param keyword 关键字
 * @returns 回复内容
 */
// @ts-ignore
async function getKeywordReply(keyword) {
  let res = await GetRequest(WECHAT_URL + `/keyword-reply/${APPLICTION_TOKEN}?keyword=${keyword}`);
  return res && res.code == 1 ? res.data : null;
}
/**
 * 获取机器人回复
 * @param keyword 关键字
 * @param uniqueid 用户唯一身份ID，方便上下文关联
 * @returns 回复内容
 */
// @ts-ignore
async function getBotReply(keyword, uniqueid) {
  let res = await GetRequest(WECHAT_URL + `/bot-reply/${APPLICTION_TOKEN}?keyword=${keyword}&uniqueid=${uniqueid}`);
  return res && res.code == 1 ? res.data : "你太厉害了，说的话把我难倒了，我要去学习了，不然没法回答你的问题";
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
    console.log("post请求请求失败:", e);
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
    schedule.cancelJob(name);//先取消该任务再重新启动
    if (runScheduleNames.indexOf(name) > -1) {
      runScheduleNames.splice(runScheduleNames.indexOf(name), 1);
    }
    schedule.scheduleJob(name, { rule: date, tz: 'Asia/Shanghai' }, callback)
    runScheduleNames.push(name);
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
