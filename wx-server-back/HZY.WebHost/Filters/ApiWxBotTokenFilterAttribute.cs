using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HZY.EFCore.Repositories.Admin.Core;
using HZY.Infrastructure;
using HZY.Infrastructure.ApiResultManage;
using HZY.Infrastructure.Permission;
using HZY.Infrastructure.Permission.Attributes;
using HZY.Models.Consts;
using HZY.Models.Entities.Framework;
using HZY.Services.Admin.Framework;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace HZY.WebHost.Filters
{
    /// <summary>
    /// 微信 AppToken验证合法验证过滤器
    /// </summary>
    public class ApiWxBotTokenFilterAttribute : ActionFilterAttribute
    {
        private readonly IAdminRepository<SysUser> _sysUserRepository;
        private readonly AppConfiguration _appConfiguration;

        public ApiWxBotTokenFilterAttribute(IAdminRepository<SysUser> sysUserRepository, AppConfiguration appConfiguration)
        {
            _sysUserRepository = sysUserRepository;
            _appConfiguration = appConfiguration;
        }

        /// <summary>
        /// action 执行之前
        /// </summary>
        /// <param name="context"></param>
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var httpContext = context.HttpContext;
            const string unAuthMessage = "不合法的applicationToken";
            var routeValues = context.ActionDescriptor.RouteValues;
            var controllerName = routeValues["controller"];
            var actionName = routeValues["action"];
            //获取applicationToken
            string applicationToken = httpContext.Request.RouteValues["applicationToken"].ToStr();
            if (string.IsNullOrEmpty(applicationToken))
            {
                var data = ApiResult.ResultMessage(ApiResultCodeEnum.Error, "applicationToken is not null");
                context.Result = new JsonResult(data);
            }
            if (Guid.TryParse(applicationToken, out Guid _applicationToken))
            {
                //查询applicationToken是否合法
                if (!_sysUserRepository.Any(s => s.Id == _applicationToken))
                {
                    var data = ApiResult.ResultMessage(ApiResultCodeEnum.Warn, unAuthMessage);
                    context.Result = new JsonResult(data);
                }
            }
            else
            {
                var data = ApiResult.ResultMessage(ApiResultCodeEnum.Warn, unAuthMessage);
                context.Result = new JsonResult(data);
            }
        }
    }
}