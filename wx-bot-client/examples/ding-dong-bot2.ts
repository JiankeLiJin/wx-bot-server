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
// @ts-ignore
import schedule  from 'node-schedule'
// @ts-ignore
import rp from 'request-promise'


/**
 * 常量定义
 * @type {string}
 */
const WECHAT_URL = 'http://150.158.20.213/WECHAT/wechatXpController';// 服务器host
const TXHOST = 'http://api.tianapi.com';// 天行host

const WINDY_ID = "00cbab2533414be985afa31b2d2b0ffa";//平台KEY

/**
 * 变量定义
 * @type {string}
 */
let userInfo = "";
let privateChatWxIds: any[] = [];//开启私聊的微信id
// @ts-ignore
let nick = "";
let KEY = '';// 天行KEY

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

// @ts-ignore
async function onLogin (payload: PUPPET.payloads.EventLogin) {
  // console.info(`${payload.contactId} login`)
  handle_get_person();

  // await puppet.roomMemberList("20242225219@chatroom")
  // const roomRawPayload = await this.roomRawPayload("20242225219@chatroom")
  // const memberIdList = roomRawPayload.memberIdList

  // let contactStoreElement = this.contactStore["wxid_2rf2zei3jgtn22"];
  // const memberNickName = await this.sidecar.getChatroomMemberNickInfo("wxid_2rf2zei3jgtn22", "20242225219@chatroom")
  // console.log("111",memberNickName)

  // console.info(JSON.parse(await puppet.sidecar.getContact()));

  // setLocalSchedule(
  //   '00 03 15 * * *',
  //   async () => {
  //     console.log('每日说任务开始工作,发送内容：', 'dong')
  //     await puppet.sidecar.sendMsg("wxid_tjrse5oxa5ri22", 'dong')
  //   },
  //   "定时任务"
  // )
  // console.log("设置定时任务成功")

  // await puppet.sidecar.sendMsg("wxid_tjrse5oxa5ri22", 'dong')

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
 *Unknown = 0,

 Attachment  = 1,    // Attach(6),
 Audio       = 2,    // Audio(1), Voice(34)
 Contact     = 3,    // ShareCard(42)
 ChatHistory = 4,    // ChatHistory(19)
 Emoticon    = 5,    // Sticker: Emoticon(15), Emoticon(47)
 Image       = 6,    // Img(2), Image(3)
 Text        = 7,    // Text(1)
 Location    = 8,    // Location(48)
 MiniProgram = 9,    // MiniProgram(33)
 GroupNote   = 10,   // GroupNote(53)
 Transfer    = 11,   // Transfers(2000)
 RedEnvelope = 12,   // RedEnvelopes(2001)
 Recalled    = 13,   // Recalled(10002)
 Url         = 14,   // Url(5)
 Video       = 15,   // Video(4), Video(43)
 Post        = 16,   // Moment, Channel, Tweet, etc
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

  // if (/ding/i.test(text || '')) {
  //   await puppet.messageSendText(roomId! || talkerId!, 'dong')
  // }
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
 *
 * 7. Output the Welcome Message
 *
 */
const welcome = `
Puppet Version: ${puppet.version()}

Please wait... I'm trying to login in...

`
console.info(welcome)

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
  }
  const para = {
    windyId: WINDY_ID,
    json: JSON.stringify(userInfo)
  }
  let data = await PostRequest(WECHAT_URL + "/saveUser", encodeURIComponent(JSON.stringify(para)));
  if (data.code == 1) {
    console.log("更新用户信息成功");
  }else {
    console.log("更新用户信息失败");
    console.log(data.message);
    // @ts-ignore
    await puppet.logout();
    return;
  }
  let response = await GetRequest(WECHAT_URL + "/findUser?windyId="+WINDY_ID);
  if (response.code == 1) {
    userInfo = response.data;
    // @ts-ignore
    KEY = userInfo.txApiKey;
    console.log("获取用户信息成功");

    //获取好友列表
    // @ts-ignore
    const j_ary = JSON.parse(await puppet.sidecar.getContact())
    //保存更新好友列表 防止被转义  加密请求参数
    const para = {
      windyId: WINDY_ID,
      json: JSON.stringify(j_ary)
    }
    let data = await PostRequest(WECHAT_URL + "/saveFriend", encodeURIComponent(JSON.stringify(para)));
    if (data.code == 1) {
      console.log("更新好友列表成功");
    }else {
      console.log("更新好友列表失败");
    }
    //获取定时任务
    let res =  await GetRequest(WECHAT_URL + "/getTask?windyId="+WINDY_ID);
    if (res.code == 1){
      console.log("获取定时任务成功");
      let taskList = res.data;
      setTask(taskList);
    }else {
      console.log("获取定时任务失败");
    }

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
  //关键词配置

  //判断是群消息还是个人消息
  if(j.room != null && j.room != ''){
    // @ts-ignore
    let mentionSelf = content.includes(`@${userInfo.wxName}`);
    //判断是否是@我的消息
    if (mentionSelf) {
      content = content.replace(/@[^,，：:\s@]+/g, '').trim();
      console.log("消息内容：",content);

      //群机器人开关
      if(content.indexOf("关闭机器人")>-1){
        // @ts-ignore
        userInfo.autoReply = 0;
        console.log("机器人已关闭");
      }else if(content.indexOf("开启机器人")>-1){
        // @ts-ignore
        userInfo.autoReply = 1;
        console.log("机器人已开启");
      }

      //判断是否开启了机器人回复
      // @ts-ignore
      if(userInfo.autoReply == 1) {
        console.log("开启了机器人自动回复");

        //如果消息内容为空  回复功能菜单
        if(content == null || content == ''){
          content = "1.毒鸡汤(发送“毒鸡汤”，随机干了这碗鸡汤)\n"
            +"2.天气查询(发送“上海天气”，查询Ta的天气)\n"
            +"3.故事大全(发送“故事、讲个故事”，即可随机获得一个故事)\n"
            +"4.成语接龙(发送“成语接龙”，即可进入成语接龙模式)\n"
            +"5.歇后语(发送“歇后语”，返回短小风趣又像谜语的句子)\n"
            +"6.笑话大全(发送“笑话、讲个笑话”，让我陪你笑开心)\n"
            +"7.土味情话(发送“情话、讲个情话”，让我陪你撩心里的TA)\n"
            +"8.顺口溜(发送“顺口溜”，好听的民俗有趣的轶事)\n"
            +"9.舔狗日记(发送“舔狗”，随机返回一个舔狗日记)\n"
            +"10.彩虹屁(发送“彩虹屁”，随机返回一个彩虹屁句子)\n\n"
          +"发送“文字修仙”即可进入文字修仙游戏模式，发送“退出游戏”，即可退出文字修仙游戏";
          // @ts-ignore
          await puppet.sidecar.sendMsg(j.room, content);

        }else {
          //文字游戏
          // @ts-ignore
          if(content.indexOf("文字修仙")>-1 || userInfo.wgame == 1){
            // @ts-ignore
            userInfo.wgame = 1;
            if(content.indexOf("退出游戏")>-1){
              // @ts-ignore
              userInfo.wgame = 0;
              // @ts-ignore
              await puppet.sidecar.sendMsg(j.room, "已退出文字修仙游戏模式");
              return ;
            }

            if(content == "8"){
              let res = await GetRequest(WECHAT_URL + "/findEquipList");
              console.log(res);
              let list = res.data;
              content = "文字修仙武器录如下：\n";
              for(let i=0;i<list.length;i++){
                content += (i+1)+"."+list[i].name+"("+list[i].level+"星)\t\t攻击力："+list[i].attack+"\n";
              }
              // @ts-ignore
              await puppet.sidecar.sendMsg(j.room, content);
              return ;
            }

            if(content == "9"){
              let res = await GetRequest(WECHAT_URL + "/findStateList");
              console.log(res);
              let list = res.data;
              content = "文字修仙境界划分如下：\n";
              for(let i=0;i<list.length;i++){
                content += (i+1)+"."+list[i].name+"\n";
              }
              // @ts-ignore
              await puppet.sidecar.sendMsg(j.room, content);
              return ;
            }

            if(content == "10"){
              let res = await GetRequest(WECHAT_URL + "/findRankingList");
              console.log(res);
              let list = res.data;
              content = "文字修仙排行榜如下：\n";
              for(let i=0;i<list.length;i++){
                content += (i+1)+".昵称："+list[i].wxName+"\n" +
                  "\t\t修为："+list[i].cultivationName+"期"+list[i].level+"星\n" +
                  "\t\t经验："+list[i].exp+"/100\n";
              }
              // @ts-ignore
              await puppet.sidecar.sendMsg(j.room, content);
              return ;
            }

            // @ts-ignore
            if(content.indexOf("文字修仙")<0 && userInfo.wgame == 1){
              if(content == "0" || content == "1" || content == "2"){
                let res = await GetRequest(WECHAT_URL + "/game?wxId="+j.wxid+"&type="+content);
                // @ts-ignore
                await puppet.sidecar.sendMsg(j.room, res);
              }else {
                // @ts-ignore
                await puppet.sidecar.sendMsg(j.room, "请选择正确的命令");
              }
            }
            //获取当前群成员昵称
            handle_nick(j.wxid,j.room);
            return ;
          }else {
            //关键词回复
            let res = await GetRequest(WECHAT_URL + "/findByWord?word="+content+"&userId="+WINDY_ID);
            if(res.data != null){
              console.log("关键词回复："+JSON.stringify(res.data.reply));
              // @ts-ignore
              await puppet.sidecar.sendMsg(j.room, res.data.reply);
            }else {
              //调用天行机器人
              let reply = await getResByTX(content);
              // @ts-ignore
              await puppet.sidecar.sendMsg(j.room, reply);
            }
          }

        }

      }
    }
  }else {
    //私聊器人开关
    if(content.indexOf("关闭私聊")>-1){
      // @ts-ignore
      userInfo.privateChat = 0;
      if(privateChatWxIds.includes(j.wxid)){
        privateChatWxIds.splice(privateChatWxIds.indexOf(j.wxid),1);
        console.log(`${j.wxid}私聊已关闭`);
          // @ts-ignore
          await puppet.sidecar.sendMsg(j.wxid, "好的,不聊了!");
      }
    }else if(content.indexOf("开启私聊")>-1){
      // @ts-ignore
      userInfo.privateChat = 1;
      console.log(`当前开启的私聊对象：`+privateChatWxIds);
      if(!privateChatWxIds.includes(j.wxid)){
        privateChatWxIds.push(j.wxid);
        console.log(`${j.wxid}私聊已开启`);
      }
    }

    //判断发消息人是不是自己
    // @ts-ignore
    if(j.wxid == userInfo.wxId){
      // console.log("自己发给自己的消息");
    }else {
      //判断是否开启了私聊
      // @ts-ignore
      if(privateChatWxIds.includes(j.wxid)){
        console.log("开启了机器人自动回复");
        //关键词回复
        let res = await GetRequest(WECHAT_URL + "/findByWord?word="+content+"&userId="+WINDY_ID);
        if(res.data != null){
          console.log("关键词回复："+JSON.stringify(res.data.reply));
          // @ts-ignore
          await puppet.sidecar.sendMsg(j.wxid, res.data.reply);
        }else {
          //调用天行机器人
          let reply = await getResByTX(content);
          // @ts-ignore
          await puppet.sidecar.sendMsg(j.wxid, reply);
        }

      }
    }
  }
}


/**
 * 获取群成员回调
 * @param j
 */
// @ts-ignore
async function handle_nick(wxId,roomId) {
  // @ts-ignore
  const nick = await puppet.sidecar.getChatroomMemberNickInfo(wxId, roomId);
  console.log("群成员昵称：",nick);

  let content = "";
  //校验用户信息
  let res = await GetRequest(WECHAT_URL + "/checkUser?wxId="+wxId+"&wxName="+nick);
  console.log("游戏用户信息",res);
  res.equipmentName = res.equipmentName==undefined?"无":res.equipmentName;
  content = "文字修仙游戏模式中\n" +
    "您可以选择发送：\n" +
    "0-闭关，1-探索，2-闯荡，\n" +
    "7-输入挑战+@某人，即可挑战对方,8-查看武器，9-查看境界，10-查看排行榜\n" +
    "来增强自己的实力，切记：修仙的道路不是一帆风顺的\n" +
    "你当前的游戏资料为\n" +
    "昵称："+res.wxName+"\n" +
    "武器："+res.equipmentName+"\n" +
    "攻击力："+res.attack+"\n" +
    "修为："+res.cultivationName+"期"+res.level+"星\n" +
    "经验："+res.exp+"/100\n" +
    "金钱："+res.money;

  // @ts-ignore
  await puppet.sidecar.sendMsg(roomId, content);
  return ;
}


/**
 * 获取新闻（col=7 社会新闻）
 * @returns {Promise<string>}
 */
// @ts-ignore
async function getNews() {
  try {
    let data = await GetRequest(TXHOST + '/allnews/?key=' + KEY + "&num=10&col=7");
    if (data.code === 200) {
      let newList = data.newslist
      let news = ''
      let shortUrl = 'https://www.tianapi.com/weixin/news/?col=' + 7
      for (let i in newList) {
        let num = parseInt(i) + 1
        news = `${news}\n${num}.${newList[i].title}`
      }
      news = `${news}\n新闻详情查看：${shortUrl}\n`
      let today = formatDate(new Date()) //获取今天的日期
      news = `${today}\n${news}`
      return news;
    }
  } catch (error) {
    console.log('获取天行新闻失败', error)
  }
}

/**
 * 获取天行天气
 * @returns {Promise<{}|{weatherTips: [], todayWeather: string}>}
 */
// @ts-ignore
async function getTXweather(city) {
  try {
    let content = await GetRequest(TXHOST + '/tianqi/?key=' + KEY + "&city=" + city);
    if (content.code === 200) {
      let todayInfo = content.newslist[0]
      let obj = {
        weatherTips: todayInfo.tips,
        todayWeather: `今天:${todayInfo.weather}\n温度:${todayInfo.lowest}/${todayInfo.highest}\n${todayInfo.wind} ${todayInfo.windspeed}\n\n`,
      }
      return obj
    } else {
      console.log('获取天气接口失败', content.msg)
      let obj = {}
      return obj
    }
  } catch (err) {
    console.log('获取天气接口失败', err)
    let obj = {}
    return obj
  }
}

/**
 * 获取每日一句
 * @returns {Promise<string|*>}
 */
async function getOne() {
  try {
    let content = await GetRequest(TXHOST + '/one/?key=' + KEY);
    let word = content.newslist[0].word || '今日一句似乎已经消失'
    return word
  } catch (e) {
    console.log('获取每日一句失败', e)
    return '今日一句似乎已经消失'
  }
}

/**
 * 获取土味情话
 * @returns {Promise<void|string|*>}
 */
async function getSweetWord() {
  try {
    let content = await GetRequest(TXHOST + '/saylove/?key=' + KEY);
    if (content.code === 200) {
      let sweet = content.newslist[0].content
      let str = sweet.replace('\r\n', '\n')
      return str
    } else {
      console.log('获取土味情话接口失败', content.msg)
    }
  } catch (err) {
    console.log('获取土味情话接口失败', err)
  }
}

/**
 * 天行机器人
 * @param word
 * @returns {Promise<string|methods.add_regex_form.reply>}
 */
// @ts-ignore
async function getResByTX(word){
  try {
    let res = await GetRequest(TXHOST + '/robot/?key=' + KEY+"&question="+word);
    if (res.code === 200) {
      let response = ''
      let content = res.newslist[0]
      if (content.datatype === 'text') {
        response = content.reply
      } else if (content.datatype === 'view') {
        let reply = ''
        // @ts-ignore
        content.reply.forEach((item) => {
          reply = reply + `《${item.title}》:${item.url}\n`
        })
        // response = `虽然我不太懂你说的是什么，但是感觉很高级的样子，因此我也查找了类似的文章去学习，你觉得有用吗:\n${reply}`
      } else {
        response = '你太厉害了，说的话把我难倒了，我要去学习了，不然没法回答你的问题'
      }
      console.log('天行机器人回复：', response)
      return response
    } else {
      // return '我好像迷失在无边的网络中了，你能找回我么'
      return '${userInfo.wxName}今天已经累了，请呼叫其他机器人吧'
    }
  } catch (error) {
    console.log('天行聊天机器人请求失败：', error)
  }
}


/***************************************************************** 工具类函数***************************************/

/**
 * 获取时间戳
 * @returns {string}
 */
// @ts-ignore
function getid() {
  const id = Date.now();
  return id.toString();
}

/**
 * 格式化日期
 * @param {*} date
 * @returns 例：2019-9-10 13:13:04 星期一
 */
// @ts-ignore
function formatDate(date) {
  var tempDate = new Date(date)
  var year = tempDate.getFullYear()
  var month = tempDate.getMonth() + 1
  var day = tempDate.getDate()
  var hour = tempDate.getHours()
  var min = tempDate.getMinutes()
  var second = tempDate.getSeconds()
  var week = tempDate.getDay()
  var str = ''
  if (week === 0) {
    str = '星期日'
  } else if (week === 1) {
    str = '星期一'
  } else if (week === 2) {
    str = '星期二'
  } else if (week === 3) {
    str = '星期三'
  } else if (week === 4) {
    str = '星期四'
  } else if (week === 5) {
    str = '星期五'
  } else if (week === 6) {
    str = '星期六'
  }
  if (hour < 10) {
    // @ts-ignore
    hour = '0' + hour
  }
  if (min < 10) {
    // @ts-ignore
    min = '0' + min
  }
  if (second < 10) {
    // @ts-ignore
    second = '0' + second
  }
  return year + '-' + month + '-' + day + ' ' + hour + ':' + min + ' ' + str
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
  }catch (e) {
    // console.log("post请求请求失败");
    return ;
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
  }catch (e) {
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
    schedule.scheduleJob(name, {rule: date, tz: 'Asia/Shanghai'}, callback)
  } else {
    schedule.scheduleJob({rule: date, tz: 'Asia/Shanghai'}, callback)
  }
}

/**
 * 获取每日说内容
 * @returns {Promise<string>}
 */
async function getEveryDayContent() {
  let one = await getOne() //获取每日一句
  let weather = await getTXweather("南昌市") //获取天气信息
  let today = formatDate(new Date()) //获取今天的日期
  let sweetWord = await getSweetWord() // 土味情话
  let str = "";
  // @ts-ignore
  if(weather.weatherTips == undefined){
    str = `${today}\n元气满满的一天开始啦,要开心噢^_^\n\n今日天气\n天有不测风云，算不到了呢\n每日一句:\n${one}\n\n情话对你说:\n${sweetWord}`
  }else {
    // @ts-ignore
    str = `${today}\n元气满满的一天开始啦,要开心噢^_^\n\n今日天气\n${weather.weatherTips}\n${weather.todayWeather}\n每日一句:\n${one}\n\n情话对你说:\n${sweetWord}`
  }
  // let str = `${today}\n我们在一起的第${memorialDay}天\n\n元气满满的一天开始啦,要开心噢^_^\n\n今日天气\n${weather.weatherTips}\n${weather.todayWeather}\n每日一句:\n${one}\n\n情话对你说:\n${sweetWord}\n\n————————${endWord}`
  return str
}

/**
 * 设置定时任务
 * @param taskList
 */
// @ts-ignore
function setTask(taskList){
  for (let i in taskList) {
    let type = taskList[i].wxId.indexOf("@chatroom")>-1?"群：":"用户：";
    if (taskList[i].taskType==1){
      setLocalSchedule(
        taskList[i].timer,
        async () => {
          let content = await getEveryDayContent();
          content += `\n————————${taskList[i].end}`
          console.log('每日说任务开始工作,发送内容：', content)
          // @ts-ignore
          await puppet.sidecar.sendMsg(taskList[i].wxId, content);
        },
        taskList[i].wxName+"每日说定时任务"
      )
      console.log(type + taskList[i].wxName+" 设置情侣日记成功")
    }else if(taskList[i].taskType==2){
      setLocalSchedule(
        taskList[i].timer,
        async () => {
          let content = await getNews();
          content += `\n————————${taskList[i].end}`
          console.log('群资讯任务开始工作,发送内容：', content)
          // @ts-ignore
          await puppet.sidecar.sendMsg(taskList[i].wxId, content);
        },
        taskList[i].wxName+"群资讯定时任务"
      )
      console.log(type + taskList[i].wxName+" 设置群资讯成功")
    }else if(taskList[i].taskType==3){
      setLocalSchedule(
        taskList[i].timer,
        async () => {
          let content = taskList[i].content;
          content += `\n————————${taskList[i].end}`
          console.log('定时任务开始工作,发送内容：', content)
          // @ts-ignore
          await puppet.sidecar.sendMsg(taskList[i].wxId, content);
        },
        taskList[i].wxName+"定时任务"
      )
      console.log(type + taskList[i].wxName+" 设置定时任务成功")
    }
  }
}
