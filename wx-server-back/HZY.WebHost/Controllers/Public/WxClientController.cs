using HZY.Infrastructure;
using HZY.Infrastructure.Filters;
using HZY.Models.Consts;
using HZY.Models.DTO;
using HZY.Models.DTO.Framework;
using HZY.Models.DTO.WxBot;
using HZY.Models.Entities;
using HZY.Services.Admin;
using HZY.Services.Admin.Framework;
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


    public WxClientController(WxContactService wxContactService, WxBotConfigService wxBotConfigService, IMemoryCache memoryCache)
    {
        _wxContactService = wxContactService;
        _wxBotConfigService = wxBotConfigService;
        _cache = memoryCache;
    }

    /// <summary>
    /// 保存微信联系人
    /// </summary>
    /// <param name="contacts">微信联系人</param>
    /// <param name="applicationToken">应用token</param>
    /// <returns></returns>
    [ApiCheckModel]
    [HttpPost("save-contacts/{applicationToken}")]
    public async Task<int> SaveContactsAsync([FromBody] List<WxContact> contacts, [FromRoute] string applicationToken)
    {
        return await _wxContactService.SaveContactsAsync(contacts, applicationToken);
    }
    /// <summary>
    /// 获取微信机器人配置
    /// </summary>
    /// <param name="applicationToken">应用token</param>
    /// <returns></returns>
    [ApiCheckModel]
    [HttpGet("wx-confg/{applicationToken}")]
    public async Task<string> GetWxBotConfigAsync([FromRoute] string applicationToken)
    {
        return await this._wxBotConfigService.GetWxBotConfigAsync(applicationToken);
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
}