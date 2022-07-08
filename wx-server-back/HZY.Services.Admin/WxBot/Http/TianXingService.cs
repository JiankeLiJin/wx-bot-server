using HZY.Models.Enums;
using HZY.Models.VO.TianXing;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;

namespace HZY.Services.Admin.WxBot.Http
{
    /// <summary>
    /// 天行接口服务
    /// </summary>
    public class TianXingService
    {
        private const string defaultLoveWords = "如果我会隐身就好了，那我一定藏在你的枕头里，藏在十二月的风里，藏在你的口袋里。";
        private const string defaultDayOne = "有时候，没有下一次，没有机会重来，没有暂停继续。有时候，错过了现在，就永远永远的没机会了。";
        private const string defaultNews = "暂时没有新闻哦";
        private const string defaultWeather = "暂时没有新闻哦";
        private const string defaultStory = "乌鸦站在高大的树枝上，整天无所事事，悠哉游哉好不快活。一只小兔子看见了，心中非常羡慕，就问乌鸦：“乌鸦大哥，你这么自在逍遥，真好呀，我能不能跟你一样，也整天呆着不做事？”乌鸦回答：“当然行，为什么不呢...";
        private const string defaultJokes = "校长在学期结束时的校务会议上，对人事行政效率之低，大发雷霆。他说：“负责董事业务的不懂事；负责人事管理的不省人事；身为干事的又不干事！”";
        private const string defaultBotReply = "你太厉害了，说的话把我难倒了，我要去学习了，不然没法回答你的问题";


        public HttpClient _client { get; }
        private readonly ILogger<TianXingService> _logger;

        public TianXingService(HttpClient client, ILogger<TianXingService> logger)
        {
            _logger = logger;
            client.BaseAddress = new Uri("http://api.tianapi.com");
            // GitHub API versioning
            client.DefaultRequestHeaders.Add("Accept",
                "application/json");
            // GitHub requires a user-agent
            client.DefaultRequestHeaders.Add("User-Agent",
                "Request-Promise");
            _client = client;
        }
        /// <summary>
        /// 根据发送类型获取发送内容
        /// </summary>
        /// <param name="key"></param>
        /// <param name="sendObj"></param>
        /// <returns></returns>
        public async Task<string> GetSendContentAsync(string key, (ETimedTaskSendType, string) sendObj)
        {
            return sendObj.Item1 switch
            {
                ETimedTaskSendType.WBNR => sendObj.Item2,
                ETimedTaskSendType.XWZX => await GetNewsAsync(key),
                ETimedTaskSendType.GSDQ => await GetStoryAsync(key),
                ETimedTaskSendType.TWQH => await GetLoveWordsAsync(key),
                ETimedTaskSendType.XHDQ => await GetJokesAsync(key),
                _ => "你太厉害了，说的话把我难倒了，我要去学习了，不然没法回答你的问题",
            };
        }
        /// <summary>
        /// 获取机器人回复
        /// </summary>
        /// <param name="key">天行key</param>
        /// <param name="question">提问（建议urlencode）</param>
        /// <param name="uniqueid">用户唯一身份ID，方便上下文关联</param>
        /// <returns></returns>
        public async Task<string> GetBotReplyAsync(string key, string question, string uniqueid)
        {
            try
            {
                var parmars = new Dictionary<string, string>(3);
                parmars.Add("key", key);
                parmars.Add("question", question);
                parmars.Add("uniqueid", uniqueid);
                var jObject = await GetAsync("/robot/index", parmars);
                if (jObject == null) return defaultBotReply;
                return jObject == null ? defaultBotReply : jObject["newslist"][0]["reply"].ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "获取机器人回复失败");
            }
            return defaultLoveWords;
        }

        /// <summary>
        /// 获取天气
        /// </summary>
        /// <param name="key">天行key</param>
        /// <param name="city">城市</param>
        /// <returns></returns>
        public async Task<string> GetWeatherAsync(string key, string city)
        {
            try
            {
                var parmars = new Dictionary<string, string>(1);
                parmars.Add("key", key);
                parmars.Add("city", city);
                var jObject = await GetAsync("/tianqi/index", parmars);
                if (jObject == null) return defaultWeather;
                var data = jObject["newslist"][0];
                return $"{data["tips"]}\n" +
                    $"今天：{data["weather"]}\n" +
                    $"温度：{data["lowest"]}/{data["highest"]}\n" +
                    $"风向：{data["wind"]}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "获取天气失败");
            }
            return defaultWeather;
        }


        /// <summary>
        /// 获取笑话
        /// </summary>
        /// <param name="key">天行key</param>
        /// <param name="num">返回数量</param>
        /// <returns></returns>
        public async Task<string> GetJokesAsync(string key, string num = "1")
        {
            try
            {
                var parmars = new Dictionary<string, string>(2);
                parmars.Add("key", key);
                parmars.Add("num", num);
                var jObject = await GetAsync("/joke/index", parmars);
                if (jObject == null) return defaultJokes;
                var data = jObject["newslist"][0];
                return $"{data["title"]}\n{data["content"]}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "获取笑话失败");
            }
            return defaultJokes;
        }

        /// <summary>
        /// 获取故事
        /// </summary>
        /// <param name="key">天行key</param>
        /// <param name="type">故事类型，成语1、睡前2、童话3、寓言4</param>
        /// <param name="num">返回数量</param>
        /// <returns></returns>
        public async Task<string> GetStoryAsync(string key, string type = "4", string num = "1")
        {
            try
            {
                var parmars = new Dictionary<string, string>(3);
                parmars.Add("key", key);
                parmars.Add("type", type);
                parmars.Add("num", num);
                var jObject = await GetAsync("/story/index", parmars);
                return jObject == null ? defaultStory : jObject["newslist"][0]["content"].ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "获取故事失败");
            }
            return defaultStory;
        }

        /// <summary>
        /// 获取情话
        /// </summary>
        /// <param name="key">天行key</param>
        /// <returns></returns>
        public async Task<string> GetLoveWordsAsync(string key)
        {
            try
            {
                var parmars = new Dictionary<string, string>(1);
                parmars.Add("key", key);
                var jObject = await GetAsync("/saylove/index", parmars);
                return jObject == null ? defaultLoveWords : jObject["newslist"][0]["content"].ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "获取情话失败");
            }
            return defaultLoveWords;
        }

        /// <summary>
        /// 获取新闻咨询
        /// </summary>
        /// <param name="key">天行key</param>
        /// <param name="num">获取条数</param>
        /// <param name="col">新闻频道id</param>
        /// <returns></returns>
        public async Task<string> GetNewsAsync(string key, string num = "10", string col = "7")
        {
            try
            {
                var parmars = new Dictionary<string, string>(3);
                parmars.Add("key", key);
                parmars.Add("num", num);
                parmars.Add("col", col);
                var jObject = await GetAsync("/allnews/index", parmars);
                if (jObject == null) return defaultNews;
                StringBuilder newsText = new();
                for (int i = 0; i < jObject["newslist"].Count(); i++)
                {
                    newsText.AppendLine($"{i}、{jObject["newslist"][i]["word"].ToString()}");
                }
                return newsText.ToString();

                //拼装新闻
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "新闻获取失败");
            }
            return defaultNews;
        }
        /// <summary>
        /// 获取每日一句
        /// </summary>
        /// <param name="key">天行key</param>
        /// <returns></returns>
        public async Task<string> GetDayOneAsync(string key)
        {
            try
            {
                var parmars = new Dictionary<string, string>(1);
                parmars.Add("key", key);
                var jObject = await GetAsync("/one/index", parmars);
                return jObject == null ? defaultDayOne : jObject["newslist"][0]["word"].ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "每日一句获取失败");
            }
            return defaultDayOne;
        }

        private async Task<JObject> GetAsync(string url, Dictionary<string, string> parmars)
        {
            url += "?";
            foreach (var item in parmars)
                url += $"{item.Key}={System.Web.HttpUtility.UrlEncode(item.Value)}&";

            HttpResponseMessage response = await _client.GetAsync(url);
            var result = await response.Content.ReadAsStringAsync();
            _logger.LogInformation("天行接口返回:" + result);
            JObject jObject = JObject.Parse(result);
            return response.IsSuccessStatusCode ? jObject : null;
        }

    }
}
