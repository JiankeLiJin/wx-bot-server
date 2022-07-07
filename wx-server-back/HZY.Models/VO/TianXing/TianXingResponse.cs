using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HZY.Models.VO.TianXing
{
    /// <summary>
    /// 天行接口响应 TianXingResponse
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class TianXingResponse<T>
    {
        public int Code { set; get; }
        public string Msg { set; get; }
        public T NewsList { set; get; }
    }
}
