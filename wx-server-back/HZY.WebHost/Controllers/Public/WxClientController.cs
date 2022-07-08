using HZY.Infrastructure;
using HZY.Infrastructure.Filters;
using HZY.Models.Consts;
using HZY.Models.DTO;
using HZY.Models.DTO.Framework;
using HZY.Models.DTO.WxBot;
using HZY.Models.Entities;
using HZY.Services.Admin;
using HZY.Services.Admin.Framework;
using HZY.Services.Admin.WxBot.Http;
using HZY.WebHost.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HZY.WebHost.Controllers.Public;

/// <summary>
/// 微信机器人客户端接口控制器
/// </summary>
[ApiResultFilter]
[Route("api/public/wx-client")]
[ApiExplorerSettings(GroupName = nameof(ApiVersions.Public))]
[ServiceFilter(typeof(ApiWxBotTokenFilterAttribute))]
public class WxClientController : ControllerBase
{
    private readonly IMemoryCache _cache;
    private readonly WxContactService _wxContactService;
    private readonly WxBotConfigService _wxBotConfigService;
    private readonly WxSayEveryDayService _wxSayEveryDayService;
    private readonly WxKeywordReplyService _wxKeywordReplyService;
    private readonly TianXingService _tianXingService;
    private readonly WxTimedTaskService _wxTimedTaskService;
    public WxClientController(WxContactService wxContactService,
        WxBotConfigService wxBotConfigService,
        IMemoryCache memoryCache,
        WxSayEveryDayService wxSayEveryDayService,
        WxKeywordReplyService wxKeywordReplyService,
        TianXingService tianXingService,
        WxTimedTaskService wxTimedTaskService)
    {
        _wxContactService = wxContactService;
        _wxBotConfigService = wxBotConfigService;
        _cache = memoryCache;
        _wxSayEveryDayService = wxSayEveryDayService;
        _wxKeywordReplyService = wxKeywordReplyService;
        _tianXingService = tianXingService;
        _wxTimedTaskService = wxTimedTaskService;
    }

    /// <summary>
    /// 保存微信联系人
    /// </summary>
    /// <param name="contacts">微信联系人</param>
    /// <param name="applicationToken">应用token</param>
    /// <returns></returns>
    [ApiCheckModel]
    [HttpPost("contacts/{applicationToken}")]
    public async Task<int> SaveContactsAsync([FromBody] List<WxContact> contacts, [FromRoute] string applicationToken)
    {
        return await _wxContactService.SaveContactsAsync(contacts, applicationToken);
    }
    /// <summary>
    /// 获取微信机器人配置
    /// </summary>
    /// <param name="applicationToken">应用token</param>
    /// <returns></returns>
    [HttpGet("wx-confg/{applicationToken}")]
    public async Task<dynamic> GetWxBotConfigAsync([FromRoute] string applicationToken)
    {
        return await this._wxBotConfigService.GetClientWxBotConfigAsync(applicationToken);
    }


    /// <summary>
    /// 更新微信用户信息
    /// </summary>
    /// <param name="applicationToken">应用token</param>
    /// <param name="wxUserInfo">微信用户信息</param>
    /// <returns></returns>
    [ApiCheckModel]
    [HttpPost("wx-user-info/{applicationToken}")]
    public bool UpDateWxUserInfo([FromRoute] string applicationToken, [FromBody] WxUserInfoDTO wxUserInfo)
    {
        //缓存30S
        _cache.Set(string.Format(CacheKeyConsts.WxUserInfoKey, applicationToken), wxUserInfo, TimeSpan.FromSeconds(30));
        return true;

    }

    /// <summary>
    /// 获取每日说文本
    /// </summary>
    /// <param name="applicationToken">应用token</param>
    /// <param name="everyDayId">每日说id</param>
    /// <returns></returns>
    [HttpGet("say-every-day/{applicationToken}")]
    public async Task<string> GetSayEveryDayTextAsync([FromRoute] string applicationToken, [FromQuery] Guid everyDayId)
    {
        return await this._wxSayEveryDayService.GetSayEveryDayTextAsync(applicationToken, everyDayId);
    }
    /// <summary>
    /// 关键词回复
    /// </summary>
    /// <param name="applicationToken">应用token</param>
    /// <param name="keyword">关键词</param>
    /// <returns></returns>
    [HttpGet("keyword-reply/{applicationToken}")]
    public async Task<string> KeywordReplyAsync([FromRoute] string applicationToken, [FromQuery] string keyword)
    {
        return await this._wxKeywordReplyService.KeywordReply(applicationToken, keyword);
    }

    /// <summary>
    /// 机器人回复
    /// </summary>
    /// <param name="applicationToken">应用token</param>
    /// <param name="keyword">关键词</param>
    /// <param name="uniqueid">用户唯一身份ID，方便上下文关联</param>
    /// <returns></returns>
    [HttpGet("bot-reply/{applicationToken}")]
    public async Task<string> GetBotReplyAsync([FromRoute] string applicationToken, [FromQuery] string keyword, [FromQuery] string uniqueid)
    {
        WxBotConfig wxBotConfig = await _wxBotConfigService.GetWxBotConfigAsync(applicationToken);
        return await this._tianXingService.GetBotReplyAsync(wxBotConfig.TianXingApiKey, keyword, uniqueid);
    }

    /// <summary>
    /// 获取定时任务发送内容
    /// </summary>
    /// <param name="applicationToken">应用token</param>
    /// <param name="taskId">定时任务id</param>
    /// <returns></returns>
    [HttpGet("timed/send-content/{applicationToken}")]
    public async Task<string> GetTaskSendContentAsync([FromRoute] string applicationToken, [FromQuery] Guid taskId)
    {
        return await this._wxTimedTaskService.GetTaskSendContentAsync(applicationToken, taskId);
    }
}