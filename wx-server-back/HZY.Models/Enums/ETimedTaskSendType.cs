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
    /// 定时任务发送类型 枚举
    /// </summary>
    public enum ETimedTaskSendType
    {
        [Description("文本内容")]
        WBNR = 1,
        [Description("新闻咨询")]
        XWZX = 2,
        [Description("最新疫情")]
        ZXYQ = 3,
        [Description("土味情话")]
        TWQH = 4,
        [Description("笑话大全")]
        XHDQ = 5
    }
    public static class ETimedTaskSendTypeEX
    {
        /// <summary>
        /// 获取枚举描述
        /// </summary>
        /// <param name="taskSendType"></param>
        /// <returns></returns>
        public static string GetDescription(this ETimedTaskSendType taskSendType)
        {
            Type type = taskSendType.GetType();
            FieldInfo fd = type.GetField(taskSendType.ToString());
            if (fd == null) return default;

            var attrs = fd.GetCustomAttributes(typeof(DescriptionAttribute), false).ToList();
            return (attrs?.FirstOrDefault() as DescriptionAttribute).Description;
        }
    }
}
