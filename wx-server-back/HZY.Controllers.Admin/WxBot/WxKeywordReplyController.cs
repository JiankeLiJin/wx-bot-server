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
using HZY.Models.Entities;
using HZY.Services.Admin.Framework;
using HZY.Services.Admin;

namespace HZY.Controllers.Admin
{
    /// <summary>
    /// 关键词回复表 控制器
    /// </summary>
    [ControllerDescriptor(MenuId = "请设置菜单Id 系统菜单表中查找", DisplayName = "关键词回复表")]
    public class WxKeywordReplyController : AdminBaseController<WxKeywordReplyService>
    {
        public WxKeywordReplyController(WxKeywordReplyService defaultService) 
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
        public Task<PagingView> FindListAsync([FromRoute] int size, [FromRoute] int page, [FromBody] WxKeywordReply search)
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
        public Task<WxKeywordReply> SaveFormAsync([FromBody] WxKeywordReply form)
        {
            return this._defaultService.SaveFormAsync(form);
        }

        /// <summary>
        /// 导出Excel
        /// </summary>
        /// <param name="search"></param>
        /// <returns></returns>
        [ActionDescriptor(AdminFunctionConsts.Function_Export, DisplayName = "导出数据")]
        [ApiResourceCacheFilter(5)]
        [HttpPost("ExportExcel")]
        public async Task ExportExcelAsync([FromBody] WxKeywordReply search)
        {
            var data = await this._defaultService.ExportExcelAsync(search);
            var name = $"{PermissionUtil.GetControllerDisplayName(this.GetType())}列表数据 {DateTime.Now.ToString("yyyy-MM-dd")}.xls";
            base.HttpContext.DownLoadFile(data, Tools.GetFileContentType[".xls"].ToStr(), name);
        }




    }
}