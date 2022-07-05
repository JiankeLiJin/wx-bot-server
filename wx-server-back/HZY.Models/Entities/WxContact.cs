using System;
using System.ComponentModel.DataAnnotations;
using HZY.Models.Entities.BaseEntitys;

namespace HZY.Models.Entities
{
    /// <summary>
    /// 微信联系人
    /// </summary>
    public class WxContact : DefaultBaseEntity<Guid>
    {
            
            /// <summary>
            ///  应用Token => 备注: 应用Token
            /// </summary>
            public String ApplicationToken { get; set; }
            
            
            /// <summary>
            ///  微信id => 备注: 微信id
            /// </summary>
            public String WxId { get; set; }
            
            
            /// <summary>
            ///  微信Code => 备注: 微信Code
            /// </summary>
            public String WxCode { get; set; }
            
            
            /// <summary>
            ///  微信昵称 => 备注: 微信昵称
            /// </summary>
            public String Name { get; set; }
            
            
            /// <summary>
            ///  昵称 => 备注: 昵称
            /// </summary>
            public String Alias { get; set; }
            
            
            /// <summary>
            ///  性别 => 备注: 性别
            /// </summary>
            public Int32 Gender { get; set; }
            
            
            /// <summary>
            ///  头像 => 备注: 头像
            /// </summary>
            public String AvatarUrl { get; set; }
            
    }
}