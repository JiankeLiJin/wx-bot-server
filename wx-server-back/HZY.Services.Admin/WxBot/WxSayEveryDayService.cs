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
using HZY.Services.Admin.WxBot.Http;

namespace HZY.Services.Admin
{
    /// <summary>
    /// 情侣每日说 服务 WxSayEveryDayService
    /// </summary>
    public class WxSayEveryDayService : AdminBaseService<IAdminRepository<WxSayEveryDay>>
    {
        private readonly TianXingService _tianXingService;
        private readonly IAdminRepository<WxBotConfig> _wxBotConfigRepository;
        public WxSayEveryDayService(IAdminRepository<WxSayEveryDay> defaultRepository, TianXingService tianXingService, IAdminRepository<WxBotConfig> wxBotConfigRepository)
            : base(defaultRepository)
        {
            _tianXingService = tianXingService;
            _wxBotConfigRepository = wxBotConfigRepository;
        }

        /// <summary>
        /// 获取列表数据
        /// </summary>
        /// <param name="page">page</param>
        /// <param name="size">size</param>
        /// <param name="search">search</param>
        /// <returns></returns>
        public async Task<PagingView> FindListAsync(int page, int size, WxSayEveryDay search)
        {
            var query = this._defaultRepository.Select
                    .OrderByDescending(w => w.CreationTime)
                    .Select(w => new
                    {
                        w.Id,
                        w.ApplicationToken,
                        w.ReceivingObjectWxId,
                        w.ReceivingObjectName,
                        w.SendTime,
                        w.City,
                        w.ClosingRemarks,
                        AnniversaryDay = w.AnniversaryDay.ToString("yyyy-MM-dd"),
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

            res[nameof(id)] = id == Guid.Empty ? "" : id;
            res[nameof(form)] = form;
            return res;
        }

        /// <summary>
        /// 保存数据
        /// </summary>
        /// <param name="form">form</param>
        /// <returns></returns>
        public Task<WxSayEveryDay> SaveFormAsync(WxSayEveryDay form)
        {
            return this._defaultRepository.InsertOrUpdateAsync(form);
        }

        /// <summary>
        /// 导出Excel
        /// </summary>
        /// <param name="search"></param>
        /// <returns></returns>
        public async Task<byte[]> ExportExcelAsync(WxSayEveryDay search)
        {
            var tableViewModel = await this.FindListAsync(0, 0, search);
            return this.ExportExcelByPagingView(tableViewModel, null, "Id");
        }
        /// <summary>
        /// 获取每日说文本
        /// </summary>
        /// <param name="applicationToken">应用token</param>
        /// <param name="everyDayId">每日说id</param>
        /// <returns></returns>
        public async Task<string> GetSayEveryDayTextAsync(string applicationToken, Guid everyDayId)
        {
            //获取机器人
            WxBotConfig wxBotConfig = await _wxBotConfigRepository.FindAsync(w => w.ApplicationToken == applicationToken);
            WxSayEveryDay wxSayEveryDay = await this._defaultRepository.FindByIdAsync(everyDayId);
            if (wxSayEveryDay == null) return "";
            //获取天气
            string weather = await _tianXingService.GetWeatherAsync(wxBotConfig.TianXingApiKey, wxSayEveryDay.City);
            //获取每日一句
            string dayOne = await _tianXingService.GetDayOneAsync(wxBotConfig.TianXingApiKey);
            //获取情话
            string loveWords = await _tianXingService.GetLoveWordsAsync(wxBotConfig.TianXingApiKey);
            //计算在一起多少天
            int days = (DateTime.Now.Date - wxSayEveryDay.AnniversaryDay.Date).Days;
            string result = $"{DateTime.Now:yyyy-MM-dd HH:mm} {ToWeek(DateTime.Now.DayOfWeek)}\n\n宝贝,今天是我们在一起的第{days}天啦" +
                $"\n\n元气满满的一天开始啦,要开心噢^_^" +
                $"\n\n今日天气" +
                $"\n{weather}" +
                $"\n\n每日一句" +
                $"\n{dayOne}" +
                $"\n\n情话对你说" +
                $"\n{loveWords}" +
                $"\n\n————————{wxSayEveryDay.ClosingRemarks}";
            return result;
        }

        private string ToWeek(DayOfWeek weekName)
        {
            string week = "";
            switch (weekName)
            {
                case DayOfWeek.Sunday:
                    week = "星期日";
                    break;
                case DayOfWeek.Monday:
                    week = "星期一";
                    break;
                case DayOfWeek.Tuesday:
                    week = "星期二";
                    break;
                case DayOfWeek.Wednesday:
                    week = "星期三";
                    break;
                case DayOfWeek.Thursday:
                    week = "星期四";
                    break;
                case DayOfWeek.Friday:
                    week = "星期五";
                    break;
                case DayOfWeek.Saturday:
                    week = "星期五";
                    break;
            }
            return week;
        }

    }
}