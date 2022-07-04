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
    /// 微信联系人 控制器
    /// </summary>
    [ControllerDescriptor(MenuId = "请设置菜单Id 系统菜单表中查找", DisplayName = "微信联系人")]
    public class WxContactController : AdminBaseController<WxContactService>
    {
        public WxContactController(WxContactService defaultService) 
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
        public Task<PagingView> FindListAsync([FromRoute] int size, [FromRoute] int page, [FromBody] WxContact search)
        {
            return this._defaultService.FindListAsync(page, size, search);
        }


        /// <summary>
        /// 保存
        /// </summary>
        /// <param name="form">form</param>
        /// <returns></returns>
        [ActionDescriptor(DisplayName = "保存/编辑数据")]
        [ApiCheckModel]
        [HttpPost("SaveForm")]
        public Task<WxContact> SaveFormAsync([FromBody] WxContact form)
        {
            return this._defaultService.SaveFormAsync(form);
        }

    }
}