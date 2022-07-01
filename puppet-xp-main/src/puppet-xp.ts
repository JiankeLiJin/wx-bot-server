/**
 *   Wechaty - https://github.com/chatie/wechaty
 *
 *   @copyright 2016-2018 Huan LI <zixia@zixia.net>
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
import cuid from 'cuid'
import path from 'path'
import fs from 'fs'
import fsPromise from 'fs/promises'
import xml2js from 'xml2js'

import os from 'os'

import * as PUPPET from 'wechaty-puppet'
import { log } from 'wechaty-puppet'
import type {
  FileBoxInterface,
} from 'file-box'
import {
  FileBox,
  FileBoxType,
} from 'file-box'
import {
  attach,
  detach,
} from 'sidecar'

import {
  CHATIE_OFFICIAL_ACCOUNT_QRCODE,
  qrCodeForChatie,
  VERSION,
} from './config.js'

import { WeChatSidecar } from './wechat-sidecar.js'
import { ImageDecrypt } from './pure-functions/image-decrypt.js'
// import type { Contact } from 'wechaty'

const userInfo = os.userInfo()
const rootPath = `${userInfo.homedir}\\Documents\\WeChat Files\\`

export type PuppetXpOptions = PUPPET.PuppetOptions

class PuppetXp extends PUPPET.Puppet {

   static override readonly VERSION = VERSION

   private messageStore: { [k: string]: PUPPET.payloads.Message }

   private roomStore: { [k: string]: PUPPET.payloads.Room }

   private contactStore: { [k: string]: PUPPET.payloads.Contact }

   private scanEventData?: PUPPET.payloads.EventScan

   private selfInfo: any

   #sidecar?: WeChatSidecar
   protected get sidecar (): WeChatSidecar {
     return this.#sidecar!
   }

   constructor (
     public override options: PuppetXpOptions = {},
   ) {
     super(options)
     log.verbose('PuppetXp', 'constructor(%s)', JSON.stringify(options))

     // FIXME: use LRU cache for message store so that we can reduce memory usage
     this.messageStore = {}
     this.roomStore = {}
     this.contactStore = {}
     this.selfInfo = {}
   }

   override version () {
     return VERSION
   }

   async onStart () {
     log.verbose('PuppetXp', 'onStart()')

     if (this.#sidecar) {
       // Huan(2021-09-13): need to call `detach` to make sure the sidecar will be closed?
       await detach(this.#sidecar)
       this.#sidecar = undefined
       log.warn('PuppetXp', 'onStart() this.#sidecar exists? will be replaced by a new one.')
     }

     this.#sidecar = new WeChatSidecar()

     await attach(this.sidecar)

     this.sidecar.on('hook', ({ method, args }) => {
       log.verbose('PuppetXp', 'onHook(%s, %s)', method, JSON.stringify(args))

       switch (method) {
         case 'recvMsg':
           this.onHookRecvMsg(args)
           break
         case 'checkQRLogin':
           this.onScan(args)
           break
         case 'loginEvent':
           void this.onLogin()
           break
         case 'agentReady':
           void this.onAgentReady()
           break
         case 'logoutEvent':
           void this.onLogout(args[0] as number)
           break

         default:
           log.warn('PuppetXp', 'onHook(%s,...) lack of handing', method, JSON.stringify(args))
           break
       }
     })

     this.sidecar.on('error', e => this.emit('error', { data: JSON.stringify(e as any) }))

   }

   private async onAgentReady () {
     log.verbose('PuppetXp', 'onAgentReady()')
     const isLoggedIn = await this.sidecar.isLoggedIn()
     if (!isLoggedIn) {
       await this.sidecar.callLoginQrcode(false)
     }
   }

   private async onLogin () {

     const selfInfoRaw = JSON.parse(await this.sidecar.getMyselfInfo())

     this.selfInfo =  {
       alias: '',
       avatar: selfInfoRaw.head_img_url,
       friend: false,
       gender: PUPPET.types.ContactGender.Unknown,
       id: selfInfoRaw.id,
       name: selfInfoRaw.name,
       phone: [],
       type: PUPPET.types.Contact.Individual,
     }
     await this.loadContactList()
     await this.loadRoomList()

     await super.login(this.selfInfo.id)

     // console.debug(this.roomStore)
     // console.debug(this.contactStore)
   }

   private async onLogout (reasonNum: number) {
     await super.logout(reasonNum ? 'Kicked by server' : 'logout')
   }

   private onScan (args: any) {
     const statusMap = [
       PUPPET.types.ScanStatus.Waiting,
       PUPPET.types.ScanStatus.Scanned,
       PUPPET.types.ScanStatus.Confirmed,
       PUPPET.types.ScanStatus.Timeout,
       PUPPET.types.ScanStatus.Cancel,
     ]

     const status: number = args[0]
     const qrcodeUrl: string = args[1]
     const wxid: string = args[2]
     const avatarUrl: string = args[3]
     const nickname: string = args[4]
     const phoneType: string = args[5]
     const phoneClientVer: number = args[6]
     const pairWaitTip: string = args[7]

     log.info(
       'PuppetXp',
       'onScan() data: %s',
       JSON.stringify(
         {
           avatarUrl,
           nickname,
           pairWaitTip,
           phoneClientVer: phoneClientVer.toString(16),
           phoneType,
           qrcodeUrl,
           status,
           wxid,
         }, null, 2))

     if (pairWaitTip) {
       log.warn('PuppetXp', 'onScan() pairWaitTip: "%s"', pairWaitTip)
     }

     this.scanEventData = {
       qrcode: qrcodeUrl,
       status: statusMap[args[0]] ?? PUPPET.types.ScanStatus.Unknown,
     }
     this.emit('scan', this.scanEventData)
   }

   private onHookRecvMsg (args: any) {
     // console.info(args)
     let type = PUPPET.types.Message.Unknown
     let roomId = ''
     let toId = ''
     let talkerId = ''
     const text = String(args[2])
     const code = args[0]

     switch (code) {
       case 1:
         try {
           xml2js.parseString(String(args[4]), { explicitArray: false, ignoreAttrs: true }, function (err: any, json:any) {
             // console.info(err)
             // console.info(JSON.stringify(json))
             log.verbose('PuppetXp', 'xml2json err:%s', err)
             log.verbose('PuppetXp', 'json content:%s', JSON.stringify(json))
             if (json.msgsource && json.msgsource.atuserlist === 'atuserlist') {
               type = PUPPET.types.Message.GroupNote
             } else {
               type = PUPPET.types.Message.Text
             }
           })
         } catch (err) {
           console.error(err)
         }
         break
       case 3:
         type = PUPPET.types.Message.Image
         break
       case 34:
         type = PUPPET.types.Message.Audio
         break
       case 37:
         break
       case 40:
         break
       case 42:
         type = PUPPET.types.Message.Contact
         break
       case 43:
         type = PUPPET.types.Message.Video
         break
       case 47:
         type = PUPPET.types.Message.Emoticon
         break
       case 48:
         type = PUPPET.types.Message.Location
         break
       case 49:
         try {
           xml2js.parseString(text, { explicitArray: false, ignoreAttrs: true }, function (err: any, json: { msg: { appmsg: { type: String } } }) {
             // console.info(err)
             // console.info(JSON.stringify(json))
             log.verbose('PuppetXp', 'xml2json err:%s', err)
             log.verbose('PuppetXp', 'json content:%s', JSON.stringify(json))
             switch (json.msg.appmsg.type) {
               case '5':
                 type = PUPPET.types.Message.Url
                 break
               case '4':
                 type = PUPPET.types.Message.Url
                 break
               case '1':
                 type = PUPPET.types.Message.Url
                 break
               case '6':
                 type = PUPPET.types.Message.Attachment
                 break
               case '19':
                 type = PUPPET.types.Message.ChatHistory
                 break
               case '33':
                 type = PUPPET.types.Message.MiniProgram
                 break
               case '2000':
                 type = PUPPET.types.Message.Transfer
                 break
               case '2001':
                 type = PUPPET.types.Message.RedEnvelope
                 break
               default:
             }
           })
         } catch (err) {
           console.error(err)
         }
         break
       case 50:
         break
       case 51:
         break
       case 52:
         break
       case 53:
         break
       case 62:
         break
       case 9999:
         break
       case 10000:
         // 群事件
         //  type = PUPPET.types.Message.Unknown
         break
       case 10002:
         break
       default:
     }

     if (String(args[1]).split('@').length !== 2) {
       talkerId = String(args[1])
       toId = this.currentUserId
     } else {
       talkerId = String(args[3])
       roomId = String(args[1])
     }

     // revert talkerId and toId according to isMyMsg
     if (args[5] === 1) {
       toId = talkerId
       talkerId = this.selfInfo.id
     }

     const payload: PUPPET.payloads.Message = {
       id: cuid(),
       listenerId: toId,
       roomId,
       talkerId,
       text,
       timestamp: Date.now(),
       toId,
       type,
     }
     //  console.info('payloadType----------', PUPPET.types.Message[type])
     // console.info('payload----------', payload)
     try {
       if (code === 10000) {
         // 你邀请"瓦力"加入了群聊
         // "超超超哥"邀请"瓦力"加入了群聊
         // "luyuchao"邀请"瓦力"加入了群聊
         // "超超超哥"邀请你加入了群聊，群聊参与人还有：瓦力

         // 你将"瓦力"移出了群聊
         // 你被"luyuchao"移出群聊

         // 你修改群名为“瓦力专属”
         // 你修改群名为“大师是群主”
         // "luyuchao"修改群名为“北辰香麓欣麓园抗疫”

         const room = this.roomStore[roomId]
         //  console.info('room=========================', room)
         let topic = ''
         const oldTopic = room ? room.topic : ''

         if (text.indexOf('修改群名为') !== -1) {
           const arrInfo = text.split('修改群名为')
           let changer = this.selfInfo
           if (arrInfo[0] && room) {
             topic = arrInfo[1]?.split(/“|”|"/)[1] || ''
             //  topic = arrInfo[1] || ''
             this.roomStore[roomId] = room
             room.topic = topic
             if (arrInfo[0] === '你') {
               //  changer = this.selfInfo
             } else {
               const name = arrInfo[0].split(/“|”|"/)[1] || ''
               for (const i in this.contactStore) {
                 if (this.contactStore[i] && this.contactStore[i]?.name === name) {
                   changer = this.contactStore[i]
                 }
               }

             }
           }
           //  console.info(room)
           //  console.info(changer)
           //  console.info(oldTopic)
           //  console.info(topic)
           const changerId = changer.id
           this.emit('room-topic', { changerId, newTopic:topic, oldTopic, roomId })

         }
         if (text.indexOf('加入了群聊') !== -1) {
           void this.loadRoomList()
           void this.loadContactList()
           const inviteeList = []
           let inviter = this.selfInfo
           const arrInfo = text.split(/邀请|加入了群聊/)

           if (arrInfo[0]) {
             topic = arrInfo[0]?.split(/“|”|"/)[1] || ''
             if (arrInfo[0] === '你') {
               //  changer = this.selfInfo
             } else {
               const name = arrInfo[0].split(/“|”|"/)[1] || ''
               for (const i in this.contactStore) {
                 if (this.contactStore[i] && this.contactStore[i]?.name === name) {
                   inviter = this.contactStore[i]
                 }
               }
             }
           }

           if (arrInfo[1]) {
             topic = arrInfo[1]?.split(/“|”|"/)[1] || ''
             if (arrInfo[1] === '你') {
               inviteeList.push(this.selfInfo.id)
             } else {
               const name = arrInfo[1].split(/“|”|"/)[1] || ''
               for (const i in this.contactStore) {
                 if (this.contactStore[i] && this.contactStore[i]?.name === name) {
                   if (this.contactStore[i]?.id && room?.memberIdList.includes(this.contactStore[i]?.id || '')) {
                     inviteeList.push(this.contactStore[i]?.id)
                   }
                 }
               }

             }
           }
           //  console.info(inviteeList)
           //  console.info(inviter)
           //  console.info(room)

           this.emit('room-join', { inviteeIdList:inviteeList, inviterId:inviter.id, roomId })
         }
       } else {
         this.messageStore[payload.id] = payload
         this.emit('message', { messageId: payload.id })
       }
     } catch (e) {
       console.error(e)
     }

   }

   async onStop () {
     log.verbose('PuppetXp', 'onStop()')

     this.sidecar.removeAllListeners()

     if (this.logonoff()) {
       await this.logout()
     }

     await detach(this.sidecar)
     this.#sidecar = undefined
   }

   override login (contactId: string): void {
     log.verbose('PuppetXp', 'login()')
     super.login(contactId)
   }

   override ding (data?: string): void {
     log.silly('PuppetXp', 'ding(%s)', data || '')
     setTimeout(() => this.emit('dong', { data: data || '' }), 1000)
   }

   notSupported (name: string): void {
     log.info(`${name} is not supported by PuppetXp yet.`)
   }

   private async loadContactList () {
     const contactList = JSON.parse(await this.sidecar.getContact())

     for (const contactKey in contactList) {
       const contactInfo = contactList[contactKey]

       let contactType = PUPPET.types.Contact.Individual
       if (contactInfo.id.indexOf('gh_') !== -1) {
         contactType = PUPPET.types.Contact.Official
       }
       if (contactInfo.id.indexOf('@openim') !== -1) {
         contactType = PUPPET.types.Contact.Corporation
       }
       const contact = {
         alias: contactInfo.alias,
         avatar: contactInfo.avatarUrl,
         friend: true,
         gender: contactInfo.gender,
         id: contactInfo.id,
         name: contactInfo.name || 'Unknow',
         phone: [],
         type: contactType,
       }
       this.contactStore[contactInfo.id] = contact

     }
   }

   private async loadRoomList () {
     const ChatroomMemberInfo = await this.sidecar.getChatroomMemberInfo()
     const roomList = JSON.parse(ChatroomMemberInfo)

     for (const roomKey in roomList) {
       const roomInfo = roomList[roomKey]

       // log.info(JSON.stringify(Object.keys(roomInfo)))

       const roomId = roomInfo.roomid
       if (roomId.indexOf('@chatroom') !== -1) {
         const roomMember = roomInfo.roomMember || []
         const topic = this.contactStore[roomId]?.name || ''
         const room = {
           adminIdList: [],
           avatar: '',
           external: false,
           id: roomId,
           memberIdList: roomMember,
           ownerId: '',
           topic: topic,
         }
         this.roomStore[roomId] = room
         delete this.contactStore[roomId]
         for (const memberKey in roomMember) {
           const memberId = roomMember[memberKey]
           if (!this.contactStore[memberId]) {
             try {
               const memberNickName = await this.sidecar.getChatroomMemberNickInfo(memberId, roomId)
               const contact = {
                 alias: '',
                 avatar: '',
                 friend: false,
                 gender: PUPPET.types.ContactGender.Unknown,
                 id: memberId,
                 name: memberNickName || 'Unknown',
                 phone: [],
                 type: PUPPET.types.Contact.Individual,
               }
               this.contactStore[memberId] = contact
             } catch (err) {
               console.error(err)
             }
           }
         }
       }

     }

   }

   /**
    *
    * ContactSelf
    *
    *
    */
   override async contactSelfQRCode (): Promise<string> {
     log.verbose('PuppetXp', 'contactSelfQRCode()')
     return CHATIE_OFFICIAL_ACCOUNT_QRCODE
   }

   override async contactSelfName (name: string): Promise<void> {
     log.verbose('PuppetXp', 'contactSelfName(%s)', name)
     if (!name) {
       return this.selfInfo.name
     }
   }

   override async contactSelfSignature (signature: string): Promise<void> {
     log.verbose('PuppetXp', 'contactSelfSignature(%s)', signature)
   }

   /**
  *
  * Contact
  *
  */
   override contactAlias(contactId: string): Promise<string>
   override contactAlias(contactId: string, alias: string | null): Promise<void>

   override async contactAlias (contactId: string, alias?: string | null): Promise<void | string> {
     log.verbose('PuppetXp', 'contactAlias(%s, %s)', contactId, alias)
     const contact = await this.contactRawPayload(contactId)
     // if (typeof alias === 'undefined') {
     //   throw new Error('to be implement')
     // }
     return contact.alias
   }

   override async contactPhone(contactId: string): Promise<string[]>
   override async contactPhone(contactId: string, phoneList: string[]): Promise<void>

   override async contactPhone (contactId: string, phoneList?: string[]): Promise<string[] | void> {
     log.verbose('PuppetXp', 'contactPhone(%s, %s)', contactId, phoneList)
     if (typeof phoneList === 'undefined') {
       return []
     }
   }

   override async contactCorporationRemark (contactId: string, corporationRemark: string) {
     log.verbose('PuppetXp', 'contactCorporationRemark(%s, %s)', contactId, corporationRemark)
   }

   override async contactDescription (contactId: string, description: string) {
     log.verbose('PuppetXp', 'contactDescription(%s, %s)', contactId, description)
   }

   override async contactList (): Promise<string[]> {
     log.verbose('PuppetXp', 'contactList()')
     const idList = Object.keys(this.contactStore)
     return idList
   }

   override async contactAvatar(contactId: string): Promise<FileBoxInterface>
   override async contactAvatar(contactId: string, file: FileBoxInterface): Promise<void>

   override async contactAvatar (contactId: string, file?: FileBoxInterface): Promise<void | FileBoxInterface> {
     log.verbose('PuppetXp', 'contactAvatar(%s)', contactId)

     /**
    * 1. set
    */
     if (file) {
       return
     }

     /**
    * 2. get
    */
     const WECHATY_ICON_PNG = path.resolve('../../docs/images/wechaty-icon.png')
     return FileBox.fromFile(WECHATY_ICON_PNG)
   }

   override async contactRawPayloadParser (payload: PUPPET.payloads.Contact) {
     // log.verbose('PuppetXp', 'contactRawPayloadParser(%s)', JSON.stringify(payload))
     return payload
   }

   override async contactRawPayload (id: string): Promise<PUPPET.payloads.Contact> {
     //  log.verbose('PuppetXp----------------------', 'contactRawPayload(%s,%s)', id, this.contactStore[id]?.name)
     return this.contactStore[id] || {} as any
   }

   /**
  *
  * Conversation
  *
  */
   override async conversationReadMark (conversationId: string, hasRead?: boolean): Promise<void> {
     log.verbose('PuppetService', 'conversationRead(%s, %s)', conversationId, hasRead)
   }

   /**
  *
  * Message
  *
  */
   override async messageContact (
     messageId: string,
   ): Promise<string> {
     log.verbose('PuppetXp', 'messageContact(%s)', messageId)
     const parser = new xml2js.Parser(/* options */)
     const messageJson = await parser.parseStringPromise(this.messageStore[messageId]?.text || '')

     // log.info(JSON.stringify(messageJson))

     return messageJson.msg['$'].username
   }

   override async messageImage (
     messageId: string,
     imageType: PUPPET.types.Image,
   ): Promise<FileBoxInterface> {
     log.verbose('PuppetXp', 'messageImage(%s, %s[%s])',
       messageId,
       imageType,
       PUPPET.types.Image[imageType],
     )

     const message = this.messageStore[messageId]
     let base64 = ''
     let fileName = ''
     try {
       if (message?.text) {
         const picData = JSON.parse(message.text)
         const filePath = picData[imageType]
         const dataPath = rootPath + filePath    // 要解密的文件路径
         await fsPromise.access(dataPath)

         const imageInfo = ImageDecrypt(dataPath, messageId)
         // const imageInfo = ImageDecrypt('C:\\Users\\choogoo\\Documents\\WeChat Files\\wxid_pnza7m7kf9tq12\\FileStorage\\Image\\Thumb\\2022-05\\e83b2aea275460cd50352559e040a2f8_t.dat','cl34vez850000gkmw2macd3dw')

         console.info(dataPath, imageInfo.fileName, imageInfo.extension)
         base64 = imageInfo.base64
         fileName = `message-${messageId}-url-${imageType}.${imageInfo.extension}`
       }
     } catch (err) {
       console.error(err)
     }

     return FileBox.fromBase64(
       base64,
       fileName,
     )
   }

   override async messageRecall (
     messageId: string,
   ): Promise<boolean> {
     log.verbose('PuppetXp', 'messageRecall(%s)', messageId)
     this.notSupported('messageRecall')
     return false
   }

   override async messageFile (id: string): Promise<FileBoxInterface> {
     const message = this.messageStore[id]
     let dataPath = ''
     let fileName = ''

     if (message?.type === PUPPET.types.Message.Image) {
       return this.messageImage(
         id,
         PUPPET.types.Image.Thumbnail,
       )
     }
     if (message?.type === PUPPET.types.Message.Attachment) {
       try {
         const parser = new xml2js.Parser(/* options */)
         const messageJson = await parser.parseStringPromise(message.text || '')
         // log.info(JSON.stringify(messageJson))

         const curDate = new Date()
         const year = curDate.getFullYear()
         let month: any = curDate.getMonth() + 1
         if (month < 10) {
           month = '0' + month
         }
         fileName = '\\' + messageJson.msg.appmsg[0].title[0]
         const filePath = `${this.selfInfo.id}\\FileStorage\\File\\${year}-${month}`
         dataPath = rootPath + filePath + fileName  // 要解密的文件路径
         // console.info(dataPath)
         return FileBox.fromFile(
           dataPath,
           fileName,
         )
       } catch (err) {
         console.error(err)
       }
     }

     if ([PUPPET.types.Message.Video, PUPPET.types.Message.Audio, PUPPET.types.Message.Emoticon].includes(message?.type || PUPPET.types.Message.Unknown)) {
       this.notSupported('Video/Audio/Emoticon')
     }
     return FileBox.fromFile(
       dataPath,
       fileName,
     )

   }

   override async messageUrl (messageId: string): Promise<PUPPET.payloads.UrlLink> {
     log.verbose('PuppetXp', 'messageUrl(%s)', messageId)
     // const attachment = this.mocker.MockMessage.loadAttachment(messageId)
     // if (attachment instanceof UrlLink) {
     //   return attachment.payload
     // }

     // log.info('PuppetXp', 'message(%s)',this.messageStore[messageId]?.text)

     const parser = new xml2js.Parser(/* options */)
     const messageJson = await parser.parseStringPromise(this.messageStore[messageId]?.text || '')

     // log.info(JSON.stringify(messageJson))
     const appmsg = messageJson.msg.appmsg[0]

     const UrlLinkPayload: PUPPET.payloads.UrlLink = {
       description: appmsg.des[0],
       thumbnailUrl: appmsg.appattach[0].cdnthumburl,
       title: appmsg.title[0],
       url: appmsg.url[0],
     }

     return UrlLinkPayload

   }

   override async messageMiniProgram (messageId: string): Promise<PUPPET.payloads.MiniProgram> {
     log.verbose('PuppetXp', 'messageMiniProgram(%s)', messageId)
     // const attachment = this.mocker.MockMessage.loadAttachment(messageId)
     // if (attachment instanceof MiniProgram) {
     //   return attachment.payload
     // }
     // log.verbose('PuppetXp', 'message(%s)', this.messageStore[messageId]?.text)

     const parser = new xml2js.Parser(/* options */)
     const messageJson = await parser.parseStringPromise(this.messageStore[messageId]?.text || '')

     // log.info(JSON.stringify(messageJson))

     const appmsg = messageJson.msg.appmsg[0]

     const MiniProgramPayload: PUPPET.payloads.MiniProgram = {
       appid: appmsg.weappinfo[0].appid[0],   // optional, appid, get from wechat (mp.weixin.qq.com)
       description: appmsg.des[0],   // optional, mini program title
       iconUrl: appmsg.weappinfo[0].weappiconurl[0],   // optional, mini program icon url
       pagePath: appmsg.weappinfo[0].pagepath[0],   // optional, mini program page path
       shareId: appmsg.weappinfo[0].shareId[0],   // optional, the unique userId for who share this mini program
       thumbKey: appmsg.appattach[0].cdnthumbaeskey[0],   // original, thumbnailurl and thumbkey will make the headphoto of mini-program better
       thumbUrl: appmsg.appattach[0].cdnthumburl[0],   // optional, default picture, convert to thumbnail
       title: appmsg.title[0],   // optional, mini program title
       username: appmsg.weappinfo[0].username[0],   // original ID, get from wechat (mp.weixin.qq.com)
     }
     return MiniProgramPayload
   }

   override async messageLocation (messageId: string): Promise<PUPPET.payloads.Location> {
     log.verbose('PuppetXp', 'messageLocation(%s)', messageId)
     const parser = new xml2js.Parser(/* options */)
     const messageJson = await parser.parseStringPromise(this.messageStore[messageId]?.text || '')

     log.info(JSON.stringify(messageJson))

     const location = messageJson.msg.location[0]['$']

     const LocationPayload: PUPPET.payloads.Location = {
       accuracy: location.scale, // Estimated horizontal accuracy of this location, radial, in meters. (same as Android & iOS API)
       address: location.label, // "北京市北京市海淀区45 Chengfu Rd"
       latitude: location.x, // 39.995120999999997
       longitude: location.y, // 116.334154
       name: location.poiname, // "东升乡人民政府(海淀区成府路45号)"
     }

     return LocationPayload
   }

   override async messageRawPayloadParser (payload: PUPPET.payloads.Message) {
     // console.info(payload)
     return payload
   }

   override async messageRawPayload (id: string): Promise<PUPPET.payloads.Message> {
     log.verbose('PuppetXp', 'messageRawPayload(%s)', id)

     const payload = this.messageStore[id]
     if (!payload) {
       throw new Error('no payload')
     }
     return payload
   }

   override async messageSendText (
     conversationId: string,
     text: string,
     mentionIdList?: string[],
   ): Promise<void> {
     if (conversationId.split('@').length === 2 && mentionIdList && mentionIdList[0]) {
       await this.sidecar.sendAtMsg(conversationId, text, mentionIdList[0])
     } else {
       await this.sidecar.sendMsg(conversationId, text)
     }
   }

   override async messageSendFile (
     conversationId: string,
     file: FileBoxInterface,
   ): Promise<void> {
     // PUPPET.throwUnsupportedError(conversationId, file)
     const filePath = path.resolve(file.name)
     log.verbose('filePath===============', filePath)
     await file.toFile(filePath, true)
     if (file.type === FileBoxType.Url) {
       try {
         await this.sidecar.sendPicMsg(conversationId, filePath)
         // fs.unlinkSync(filePath)
       } catch {
         fs.unlinkSync(filePath)
       }

     } else {
       // filePath = 'C:\\Users\\wechaty\\Documents\\GitHub\\wechat-openai-qa-bot\\data1652169999200.xls'
       try {
         await this.sidecar.sendPicMsg(conversationId, filePath)
         // fs.unlinkSync(filePath)
       } catch (err) {
         PUPPET.throwUnsupportedError(conversationId, file)
         fs.unlinkSync(filePath)
       }
     }
   }

   override async messageSendContact (
     conversationId: string,
     contactId: string,
   ): Promise<void> {
     log.verbose('PuppetXp', 'messageSendUrl(%s, %s)', conversationId, contactId)

     this.notSupported('SendContact')

     // const contact = this.mocker.MockContact.load(contactId)
     // return this.messageSend(conversationId, contact)
   }

   override async messageSendUrl (
     conversationId: string,
     urlLinkPayload: PUPPET.payloads.UrlLink,
   ): Promise<void> {
     log.verbose('PuppetXp', 'messageSendUrl(%s, %s)', conversationId, JSON.stringify(urlLinkPayload))
     this.notSupported('SendUrl')
     // const url = new UrlLink(urlLinkPayload)
     // return this.messageSend(conversationId, url)
   }

   override async messageSendMiniProgram (
     conversationId: string,
     miniProgramPayload: PUPPET.payloads.MiniProgram,
   ): Promise<void> {
     log.verbose('PuppetXp', 'messageSendMiniProgram(%s, %s)', conversationId, JSON.stringify(miniProgramPayload))

     const xmlstr = `<?xml version="1.0" encoding="UTF-8" ?>
     <msg>
       <fromusername>${this.selfInfo.id}</fromusername>
       <scene>0</scene>
       <appmsg appid="${miniProgramPayload.appid}">
         <title>${miniProgramPayload.title}</title>
         <action>view</action>
         <type>33</type>
         <showtype>0</showtype>
         <url>${miniProgramPayload.pagePath}</url>
         <thumburl>${miniProgramPayload.thumbUrl}</thumburl>
         <sourcedisplayname>${miniProgramPayload.description}</sourcedisplayname>
         <appattach>
           <totallen>0</totallen>
         </appattach>
         <weappinfo>
           <username>${miniProgramPayload.username}</username>
           <appid>${miniProgramPayload.appid}</appid>
           <type>1</type>
           <weappiconurl>${miniProgramPayload.iconUrl}</weappiconurl>
           <appservicetype>0</appservicetype>
           <shareId>2_wx65cc950f42e8fff1_875237370_${new Date().getTime()}_1</shareId>
         </weappinfo>
       </appmsg>
       <appinfo>
         <version>1</version>
         <appname>Window wechat</appname>
       </appinfo>
     </msg>
   `
     // const xmlstr=`<msg><fromusername>${this.selfInfo.id}</fromusername><scene>0</scene><commenturl></commenturl><appmsg appid="wx65cc950f42e8fff1" sdkver=""><title>腾讯出行服务｜加油代驾公交</title><des></des><action>view</action><type>33</type><showtype>0</showtype><content></content><url>https://mp.weixin.qq.com/mp/waerrpage?appid=wx65cc950f42e8fff1&amp;amp;type=upgrade&amp;amp;upgradetype=3#wechat_redirect</url><dataurl></dataurl><lowurl></lowurl><lowdataurl></lowdataurl><recorditem><![CDATA[]]></recorditem><thumburl>http://mmbiz.qpic.cn/mmbiz_png/NM1fK7leWGPaFnMAe95jbg4sZAI3fkEZWHq69CIk6zA00SGARbmsGTbgLnZUXFoRwjROelKicbSp9K34MaZBuuA/640?wx_fmt=png&amp;wxfrom=200</thumburl><messageaction></messageaction><extinfo></extinfo><sourceusername></sourceusername><sourcedisplayname>腾讯出行服务｜加油代驾公交</sourcedisplayname><commenturl></commenturl><appattach><totallen>0</totallen><attachid></attachid><emoticonmd5></emoticonmd5><fileext></fileext><aeskey></aeskey></appattach><weappinfo><pagepath></pagepath><username>gh_ad64296dc8bd@app</username><appid>wx65cc950f42e8fff1</appid><type>1</type><weappiconurl>http://mmbiz.qpic.cn/mmbiz_png/NM1fK7leWGPaFnMAe95jbg4sZAI3fkEZWHq69CIk6zA00SGARbmsGTbgLnZUXFoRwjROelKicbSp9K34MaZBuuA/640?wx_fmt=png&amp;wxfrom=200</weappiconurl><appservicetype>0</appservicetype><shareId>2_wx65cc950f42e8fff1_875237370_1644979747_1</shareId></weappinfo><websearch /></appmsg><appinfo><version>1</version><appname>Window wechat</appname></appinfo></msg>`
     log.info('SendMiniProgram is supported by xp, but only support send the MiniProgram-contact card.')
     await this.sidecar.SendMiniProgram('', conversationId, xmlstr)
   }

   override async messageSendLocation (
     conversationId: string,
     locationPayload: PUPPET.payloads.Location,
   ): Promise<void | string> {
     log.verbose('PuppetXp', 'messageSendLocation(%s, %s)', conversationId, JSON.stringify(locationPayload))
     this.notSupported('SendLocation')
   }

   override async messageForward (
     conversationId: string,
     messageId: string,
   ): Promise<void> {
     log.verbose('PuppetXp', 'messageForward(%s, %s)',
       conversationId,
       messageId,
     )
     const curMessage = this.messageStore[messageId]
     if (curMessage?.type === PUPPET.types.Message.Text) {
       await this.messageSendText(conversationId, curMessage.text || '')
     } else {
       log.info('only Text message forward is supported by xp.')
       PUPPET.throwUnsupportedError(conversationId, messageId)
     }
   }

   /**
  *
  * Room
  *
  */
   override async roomRawPayloadParser (payload: PUPPET.payloads.Room) { return payload }
   override async roomRawPayload (id: string): Promise<PUPPET.payloads.Room> {
     log.verbose('PuppetXp----------------------', 'roomRawPayload(%s%s)', id, this.roomStore[id]?.topic)
     if (this.roomStore[id]) {
       return this.roomStore[id] || {} as any
     } else {
       const room:PUPPET.payloads.Room = {
         adminIdList: [],
         id,
         memberIdList: [],
         topic: 'Unknown Room Topic',
       }
       return room
     }
   }

   override async roomList (): Promise<string[]> {
     log.verbose('PuppetXp', 'call roomList()')
     const idList = Object.keys(this.roomStore)
     return idList
   }

   override async roomDel (
     roomId: string,
     contactId: string,
   ): Promise<void> {
     log.verbose('PuppetXp', 'roomDel(%s, %s)', roomId, contactId)
   }

   override async roomAvatar (roomId: string): Promise<FileBoxInterface> {
     log.verbose('PuppetXp', 'roomAvatar(%s)', roomId)

     const payload = await this.roomPayload(roomId)

     if (payload.avatar) {
       return FileBox.fromUrl(payload.avatar)
     }
     log.warn('PuppetXp', 'roomAvatar() avatar not found, use the chatie default.')
     return qrCodeForChatie()
   }

   override async roomAdd (
     roomId: string,
     contactId: string,
   ): Promise<void> {
     log.verbose('PuppetXp', 'roomAdd(%s, %s)', roomId, contactId)
   }

   override async roomTopic(roomId: string): Promise<string>
   override async roomTopic(roomId: string, topic: string): Promise<void>

   override async roomTopic (
     roomId: string,
     topic?: string,
   ): Promise<void | string> {
     log.verbose('PuppetXp', 'roomTopic(%s, %s)', roomId, topic)
     const payload = await this.roomPayload(roomId)
     if (!topic) {
       return payload.topic
     } else {
       return payload.topic
     }
   }

   override async roomCreate (
     contactIdList: string[],
     topic: string,
   ): Promise<string> {
     log.verbose('PuppetXp', 'roomCreate(%s, %s)', contactIdList, topic)

     return 'mock_room_id'
   }

   override async roomQuit (roomId: string): Promise<void> {
     log.verbose('PuppetXp', 'roomQuit(%s)', roomId)
   }

   override async roomQRCode (roomId: string): Promise<string> {
     log.verbose('PuppetXp', 'roomQRCode(%s)', roomId)
     return roomId + ' mock qrcode'
   }

   override async roomMemberList (roomId: string): Promise<string[]> {
     log.verbose('PuppetXp', 'roomMemberList(%s)', roomId)
     try {
       const roomRawPayload = await this.roomRawPayload(roomId)
       const memberIdList = roomRawPayload.memberIdList
       return memberIdList
     } catch (e) {
       log.error('roomMemberList()', e)
       return []
     }

   }

   override async roomMemberRawPayload (roomId: string, contactId: string): Promise<PUPPET.payloads.RoomMember> {
     log.verbose('PuppetXp', 'roomMemberRawPayload(%s, %s)', roomId, contactId)
     try {
       const contact = this.contactStore[contactId]
       const MemberRawPayload = {
         avatar: '',
         id: contactId,
         inviterId: contactId,   // "wxid_7708837087612",
         name: contact?.name || 'Unknow',
         roomAlias: contact?.name || '',
       }
       // console.info(MemberRawPayload)
       return MemberRawPayload
     } catch (e) {
       log.error('roomMemberRawPayload()', e)
       const member: PUPPET.payloads.RoomMember = {
         avatar:'',
         id:contactId,
         name:'',
       }
       return member
     }

   }

   override async roomMemberRawPayloadParser (rawPayload: PUPPET.payloads.RoomMember): Promise<PUPPET.payloads.RoomMember> {
     //  log.verbose('PuppetXp---------------------', 'roomMemberRawPayloadParser(%s)', rawPayload)
     return rawPayload
   }

   override async roomAnnounce(roomId: string): Promise<string>
   override async roomAnnounce(roomId: string, text: string): Promise<void>

   override async roomAnnounce (roomId: string, text?: string): Promise<void | string> {
     if (text) {
       return
     }
     return 'mock announcement for ' + roomId
   }

   /**
  *
  * Room Invitation
  *
  */
   override async roomInvitationAccept (roomInvitationId: string): Promise<void> {
     log.verbose('PuppetXp', 'roomInvitationAccept(%s)', roomInvitationId)
   }

   override async roomInvitationRawPayload (roomInvitationId: string): Promise<any> {
     log.verbose('PuppetXp', 'roomInvitationRawPayload(%s)', roomInvitationId)
   }

   override async roomInvitationRawPayloadParser (rawPayload: any): Promise<PUPPET.payloads.RoomInvitation> {
     log.verbose('PuppetXp', 'roomInvitationRawPayloadParser(%s)', JSON.stringify(rawPayload))
     return rawPayload
   }

   /**
  *
  * Friendship
  *
  */
   override async friendshipRawPayload (id: string): Promise<any> {
     return { id } as any
   }

   override async friendshipRawPayloadParser (rawPayload: any): Promise<PUPPET.payloads.Friendship> {
     return rawPayload
   }

   override async friendshipSearchPhone (
     phone: string,
   ): Promise<null | string> {
     log.verbose('PuppetXp', 'friendshipSearchPhone(%s)', phone)
     return null
   }

   override async friendshipSearchWeixin (
     weixin: string,
   ): Promise<null | string> {
     log.verbose('PuppetXp', 'friendshipSearchWeixin(%s)', weixin)
     return null
   }

   override async friendshipAdd (
     contactId: string,
     hello: string,
   ): Promise<void> {
     log.verbose('PuppetXp', 'friendshipAdd(%s, %s)', contactId, hello)
   }

   override async friendshipAccept (
     friendshipId: string,
   ): Promise<void> {
     log.verbose('PuppetXp', 'friendshipAccept(%s)', friendshipId)
   }

   /**
  *
  * Tag
  *
  */
   override async tagContactAdd (
     tagId: string,
     contactId: string,
   ): Promise<void> {
     log.verbose('PuppetXp', 'tagContactAdd(%s)', tagId, contactId)
   }

   override async tagContactRemove (
     tagId: string,
     contactId: string,
   ): Promise<void> {
     log.verbose('PuppetXp', 'tagContactRemove(%s)', tagId, contactId)
   }

   override async tagContactDelete (
     tagId: string,
   ): Promise<void> {
     log.verbose('PuppetXp', 'tagContactDelete(%s)', tagId)
   }

   override async tagContactList (
     contactId?: string,
   ): Promise<string[]> {
     log.verbose('PuppetXp', 'tagContactList(%s)', contactId)
     return []
   }

}

export { PuppetXp }
export default PuppetXp
