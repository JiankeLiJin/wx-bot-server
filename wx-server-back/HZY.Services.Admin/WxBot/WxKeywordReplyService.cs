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
using HZY.Models.Enums;

namespace HZY.Services.Admin
{
    /// <summary>
    /// 关键词回复表 服务 WxKeywordReplyService
    /// </summary>
    public class WxKeywordReplyService : AdminBaseService<IAdminRepository<WxKeywordReply>>
    {
        private readonly TianXingService _tianXingService;
        private readonly IAdminRepository<WxBotConfig> _wxBotConfigRepository;
        public WxKeywordReplyService(IAdminRepository<WxKeywordReply> defaultRepository,
            TianXingService tianXingService,
              IAdminRepository<WxBotConfig> wxBotConfigRepository)
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
        public async Task<PagingView> FindListAsync(int page, int size, WxKeywordReply search)
        {
            var query = this._defaultRepository.Select
                    .OrderByDescending(w => w.CreationTime)
                    .Select(w => new
                    {
                        w.Id,
                        w.ApplicationToken,
                        w.SendType,
                        SendTypeText = w.SendType.ToDescriptionOrString(),
                        w.SendContent,
                        w.TakeEffectType,
                        w.KeyWord,
                        w.MatchType,
                        MatchTypeText = w.MatchType.ToDescriptionOrString(),
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
        public Task<WxKeywordReply> SaveFormAsync(WxKeywordReply form)
        {
            return this._defaultRepository.InsertOrUpdateAsync(form);
        }

        /// <summary>
        /// 导出Excel
        /// </summary>
        /// <param name="search"></param>
        /// <returns></returns>
        public async Task<byte[]> ExportExcelAsync(WxKeywordReply search)
        {
            var tableViewModel = await this.FindListAsync(0, 0, search);
            return this.ExportExcelByPagingView(tableViewModel, null, "Id");
        }

        public async Task<string> KeywordReply(string applicationToken, string keyword)
        {
            WxBotConfig wxBotConfig = await _wxBotConfigRepository.FindAsync(w => w.ApplicationToken == applicationToken);
            List<WxKeywordReply> keywordReplys = this._defaultRepository.Select.Where(w => w.ApplicationToken == applicationToken)
                .Where(w => w.KeyWord.Contains(keyword)).ToList();
            if (keywordReplys != null && keywordReplys.Count > 0)
            {
                //精确匹配优先级高于模糊匹配
                WxKeywordReply jqReply = keywordReplys.FirstOrDefault(w => w.MatchType == EMatchType.JINGQUE);
                if (jqReply != null)
                {
                    return await _tianXingService.GetSendContentAsync(wxBotConfig.TianXingApiKey, (jqReply.SendType, jqReply.SendContent));
                }
                else
                {
                    WxKeywordReply mhReply = keywordReplys.FirstOrDefault(w => w.MatchType == EMatchType.MOHU);
                    return await _tianXingService.GetSendContentAsync(wxBotConfig.TianXingApiKey, (mhReply.SendType, mhReply.SendContent));
                }
            }
            return null;

        }
    }
}