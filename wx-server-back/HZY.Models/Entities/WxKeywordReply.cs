using System;
using System.ComponentModel.DataAnnotations;
using HZY.Models.Entities.BaseEntitys;

namespace HZY.Models.Entities
{
    /// <summary>
    /// 关键词回复表
    /// </summary>
    public class WxKeywordReply : DefaultBaseEntity<Guid>
    {

        /// <summary>
        ///  应用Token => 备注: 应用Token
        /// </summary>
        public String ApplicationToken { get; set; }


        /// <summary>
        ///  发送类型 => 备注: 发送类型
        /// </summary>
        public String SendType { get; set; }


        /// <summary>
        ///  发送内容(发送类型为文本时生效) => 备注: 发送内容(发送类型为文本时生效)
        /// </summary>
        public String SendContent { get; set; }


        /// <summary>
        ///  生效类型 => 备注: 生效类型
        /// </summary>
        public String TakeEffectType { get; set; }


        /// <summary>
        ///  关键词 => 备注: 关键词
        /// </summary>
        public String KeyWord { get; set; }


        /// <summary>
        ///  匹配类型(模糊匹配,精确匹配) => 备注: 匹配类型(模糊匹配,精确匹配)
        /// </summary>
        public String MatchType { get; set; }


    }
}