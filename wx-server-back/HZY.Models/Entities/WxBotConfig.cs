using System;
using System.ComponentModel.DataAnnotations;
using HZY.Models.Entities.BaseEntitys;

namespace HZY.Models.Entities
{
    /// <summary>
    /// 微信联系人
    /// </summary>
    public class WxBotConfig : DefaultBaseEntity<Guid>
    {
            
            /// <summary>
            ///  应用Token => 备注: 应用Token
            /// </summary>
            public String ApplicationToken { get; set; }
            
            
            /// <summary>
            ///  群聊自动回复是否开启 => 备注: 群聊自动回复是否开启
            /// </summary>
            public Int16? GroupAutoReplyFlag { get; set; }
            
            
            /// <summary>
            ///  私聊自动回复是否开启 => 备注: 私聊自动回复是否开启
            /// </summary>
            public Int16? TalkPrivateAutoReplyFlag { get; set; }
            
            
            /// <summary>
            ///  回复机器人类型 => 备注: 回复机器人类型
            /// </summary>
            public String ReplyBotType { get; set; }
            
            
            /// <summary>
            ///  天行机器人key => 备注: 天行机器人key
            /// </summary>
            public String TianXingApiKey { get; set; }
            
            
            /// <summary>
            ///  腾讯TencentSecretId => 备注: 腾讯TencentSecretId
            /// </summary>
            public String TencentSecretId { get; set; }
            
            
            /// <summary>
            ///  腾讯TencentSecretKey => 备注: 腾讯TencentSecretKey
            /// </summary>
            public String TencentSecretKey { get; set; }
            
            
            /// <summary>
            ///  所属用户id => 备注: 所属用户id
            /// </summary>
            public Guid UserId { get; set; }
            

    }
}