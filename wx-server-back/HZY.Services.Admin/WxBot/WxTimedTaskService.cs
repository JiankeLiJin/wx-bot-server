using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using HzyEFCoreRepositories.Extensions;

using HZY.Domain.Services.Accounts;
using HZY.Domain.Services.Upload;
using HZY.EFCore.PagingViews;
using HZY.Infrastructure;
using HZY.Models.DTO;
using HZY.Models.Entities;
using HZY.Models.Entities.Framework;
using HZY.Services.Admin.Core;
using HZY.Services.Admin.Framework;
using HZY.EFCore.Repositories.Admin.Core;
using HZY.Models.Enums;
using HZY.Services.Admin.WxBot.Http;
using HZY.Infrastructure.ApiResultManage;
using Quartz;

namespace HZY.Services.Admin
{
    /// <summary>
    /// 微信机器人定时任务 服务 WxTimedTaskService
    /// </summary>
    public class WxTimedTaskService : AdminBaseService<IAdminRepository<WxTimedTask>>
    {
        private readonly WxContactService _wxContactService;
        private readonly IAdminRepository<WxBotConfig> _wxBotConfigRepository;
        private readonly TianXingService _tianXingService;
        public WxTimedTaskService(IAdminRepository<WxTimedTask> defaultRepository,
            WxContactService wxContactService,
            IAdminRepository<WxBotConfig> wxBotConfigRepository,
           TianXingService tianXingService)
            : base(defaultRepository)
        {
            this._wxContactService = wxContactService;
            _wxBotConfigRepository = wxBotConfigRepository;
            _tianXingService = tianXingService;
        }

        /// <summary>
        /// 获取列表数据
        /// </summary>
        /// <param name="page">page</param>
        /// <param name="size">size</param>
        /// <param name="search">search</param>
        /// <returns></returns>
        public async Task<PagingView> FindListAsync(int page, int size, WxTimedTask search)
        {
            //var query1 = (from task in this._defaultRepository.Select.OrderByDescending(w => w.CreationTime)
            //              from contact in this._wxContactService._defaultRepository.Select.Where(w => w.Id == task.).DefaultIfEmpty()
            //              select new { t1 = member, t2 = user }
            //    ).qu;

            var query = this._defaultRepository.Select
                    .OrderByDescending(w => w.CreationTime)
                    .Select(w => new
                    {
                        w.Id,
                        w.ApplicationToken,
                        w.ReceivingObjectWxId,
                        w.ReceivingObjectName,
                        w.SendType,
                        SendTypeText = w.SendType.ToDescriptionOrString(),
                        w.SendContent,
                        w.SendTime,
                        w.ClosingRemarks,
                        LastModificationTime = w.LastModificationTime.ToString("yyyy-MM-dd"),
                        CreationTime = w.CreationTime.ToString("yyyy-MM-dd")
                    })
                ;

            var result = await this._defaultRepository.AsPagingViewAsync(query, page, size);
            // result.Column(query, w => w.OrganizationName).Mapping<SysOrganization>(w => w.Name);
            // result.Column(query, w => w.OrganizationName).Mapping(title:"所属组织");
            return result;
        }

        /// <summary>
        /// 根据id数组删除
        /// </summary>
        /// <param name="ids">ids</param>
        /// <returns></returns>
        public async Task DeleteListAsync(List<Guid> ids)
        {
            await this._defaultRepository.DeleteByIdsAsync(ids);
        }

        /// <summary>
        /// 查询表单数据
        /// </summary>
        /// <param name="id">id</param>
        /// <returns></returns>
        public async Task<Dictionary<string, object>> FindFormAsync(Guid id)
        {
            var res = new Dictionary<string, object>();
            var form = await this._defaultRepository.FindByIdAsync(id);
            form = form.NullSafe();
            var receivingObjectWxIds = form.ReceivingObjectWxId?.Split(",");
            var receivingObjectNames = form.ReceivingObjectName?.Split(",");
            res[nameof(id)] = id == Guid.Empty ? "" : id;
            res[nameof(form)] = form;
            res["receivingObjects"] = receivingObjectWxIds?.Select((t, index) => new
            {
                value = t,
                label = receivingObjectNames?[index]
            });
            return res;
        }

        /// <summary>
        /// 保存数据
        /// </summary>
        /// <param name="form">form</param>
        /// <returns></returns>
        public Task<WxTimedTask> SaveFormAsync(WxTimedTask form)
        {
            if (!CronExpression.IsValidExpression(form.SendTime)) MessageBox.Show("cron表达式不合法,请重新生成");
            return this._defaultRepository.InsertOrUpdateAsync(form);
        }

        /// <summary>
        /// 获取定时任务发送内容
        /// </summary>
        /// <param name="applicationToken">应用token</param>
        /// <param name="taskId">定时任务id</param>
        /// <returns></returns>
        public async Task<string> GetTaskSendContentAsync(string applicationToken, Guid taskId)
        {
            WxTimedTask wxTimedTask = await this._defaultRepository.FindByIdAsync(taskId);
            WxBotConfig wxBotConfig = await _wxBotConfigRepository.FindAsync(w => w.ApplicationToken == applicationToken);
            string content = await _tianXingService.GetSendContentAsync(wxBotConfig.TianXingApiKey, (wxTimedTask.SendType, wxTimedTask.SendContent));
            return $"{content}\n\n————————{wxTimedTask.ClosingRemarks}";
        }



    }
}