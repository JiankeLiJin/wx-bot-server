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

namespace HZY.Controllers.Admin
{
    /// <summary>
    /// 微信机器人定时任务 控制器
    /// </summary>
    [ControllerDescriptor(MenuId = "38", DisplayName = "微信机器人定时任务")]
    [ApiExplorerSettings(GroupName = nameof(ApiVersions.WxBot))]
    public class WxTimedTaskController : AdminBaseController<WxTimedTaskService>
    {
        public WxTimedTaskController(WxTimedTaskService defaultService) 
            : base(defaultService)
        {

        }
        
        /// <summary>
        /// 获取列表
        /// </summary>
        /// <param name="size">size</param>
        /// <param name="page">page</param>
        /// <param name="search">search</param>
        /// <returns></returns>
        [ActionDescriptor(AdminFunctionConsts.Function_Display, DisplayName = "查看数据")]
        [HttpPost("FindList/{size}/{page}")]
        public Task<PagingView> FindListAsync([FromRoute] int size, [FromRoute] int page, [FromBody] WxTimedTask search)
        {
            return this._defaultService.FindListAsync(page, size, search);
        }

        /// <summary>
        /// 根据id数组删除
        /// </summary>
        /// <param name="ids">ids</param>
        /// <returns></returns>
        [ActionDescriptor(AdminFunctionConsts.Function_Delete, DisplayName = "删除数据")]
        [HttpPost("DeleteList")]
        public async Task<bool> DeleteListAsync([FromBody] List<Guid> ids)
        {
            await this._defaultService.DeleteListAsync(ids);
            return true;
        }

        /// <summary>
        /// 查询表单数据
        /// </summary>
        /// <param name="id">id</param>
        /// <returns></returns>
        [ActionDescriptor(DisplayName = "查看表单")]
        [HttpGet("FindForm/{id?}")]
        public Task<Dictionary<string, object>> FindFormAsync([FromRoute] Guid id)
        {
            return this._defaultService.FindFormAsync(id);
        }

        /// <summary>
        /// 保存
        /// </summary>
        /// <param name="form">form</param>
        /// <returns></returns>
        [ActionDescriptor(DisplayName = "保存/编辑数据")]
        [ApiCheckModel]
        [HttpPost("SaveForm")]
        public Task<WxTimedTask> SaveFormAsync([FromBody] WxTimedTask form)
        {
            return this._defaultService.SaveFormAsync(form);
        }
    }
}