using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace HZY.Models.Enums
{
    /// <summary>
    /// 机器人回复关键字匹配类型 枚举
    /// </summary>
    public enum EMatchType
    {
        [Description("模糊匹配")]
        MOHU = 1,
        [Description("精确匹配")]
        JINGQUE = 2
      
    }
}
