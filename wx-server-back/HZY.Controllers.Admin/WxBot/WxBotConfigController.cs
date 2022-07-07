using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc;

using HZY.EFCore.PagingViews;
using HZY.Infrastructure;
using HZY.Infrastructure.Controllers;
using HZY.Infrastructure.Filters;
using HZY.Infrastructure.Permission;
using HZY.Infrastructure.Permission.Attributes;
using HZY.Models.BO;
using HZY.Models.Consts;
using HZY.Models.DTO;
using HZY.Models.DTO.Framework;
using HZY.Models.Entities.Framework;
using HZY.Services.Admin.Framework;
using HZY.Services.Admin;
using HZY.Models.Entities;
using HZY.Models.DTO.WxBot;

namespace HZY.Controllers.Admin
{
    /// <summary>
    /// 微信机器人配置 控制器
    /// </summary>
    [ControllerDescriptor(MenuId = "39", DisplayName = "微信联系人")]
    [ApiExplorerSettings(GroupName = nameof(ApiVersions.WxBot))]
    public class WxBotConfigController : AdminBaseController<WxBotConfigService>
    {
        public WxBotConfigController(WxBotConfigService defaultService) 
            : base(defaultService)
        {

        }
        

        /// <summary>
        /// 查询表单数据
        /// </summary>
        /// <returns></returns>
        [ActionDescriptor(DisplayName = "查看表单")]
        [HttpGet("FindForm")]
        public Task<Dictionary<string, object>> FindFormAsync()
        {
            return this._defaultService.FindFormAsync();
        }

        /// <summary>
        /// 保存
        /// </summary>
        /// <param name="form">form</param>
        /// <returns></returns>
        [ActionDescriptor(DisplayName = "保存/编辑数据")]
        [ApiCheckModel]
        [HttpPost("SaveForm")]
        public Task<WxBotConfig> SaveFormAsync([FromBody] WxBotConfig form)
        {
            return this._defaultService.SaveFormAsync(form);
        }
        /// <summary>
        /// 获取微信用户信息
        /// </summary>
        /// <returns></returns>
        [ActionDescriptor(DisplayName = "获取微信用户信息")]
        [ApiCheckModel]
        [HttpGet("WxUserInfo")]
        public WxUserInfoDTO GetWxUserInfo() => this._defaultService.GetWxUserInfo();



    }
}