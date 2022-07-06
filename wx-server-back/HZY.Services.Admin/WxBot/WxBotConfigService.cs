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
using HZY.Models.BO;
using Microsoft.Extensions.Caching.Memory;
using HZY.Models.DTO.WxBot;
using HZY.Models.Consts;

namespace HZY.Services.Admin
{
    /// <summary>
    /// 微信联系人 服务 WxBotConfigService
    /// </summary>
    public class WxBotConfigService : AdminBaseService<IAdminRepository<WxBotConfig>>
    {
        private readonly AccountInfo _accountInfo;
        private readonly IMemoryCache _cache;
        public WxBotConfigService(IAdminRepository<WxBotConfig> defaultRepository,
            IAccountDomainService accountService,
            IMemoryCache cache)
            : base(defaultRepository)
        {
            this._accountInfo = accountService.GetAccountInfo();
            _cache = cache;
        }

        /// <summary>
        /// 查询表单数据
        /// </summary>
        /// <returns></returns>
        public async Task<Dictionary<string, object>> FindFormAsync()
        {

            var res = new Dictionary<string, object>();
            var form = await this._defaultRepository.FindAsync(t => t.ApplicationToken == _accountInfo.Id.ToStr());
            form = form.NullSafe();
            form.ApplicationToken = _accountInfo.Id.ToStr();
            res[nameof(form)] = form;
            res["id"] = _accountInfo.Id.ToStr(); ;
            return res;
        }

        /// <summary>
        /// 保存数据
        /// </summary>
        /// <param name="form">form</param>
        /// <returns></returns>
        public Task<WxBotConfig> SaveFormAsync(WxBotConfig form)
        {
            return this._defaultRepository.InsertOrUpdateAsync(form);
        }
        /// <summary>
        /// 获取微信机器人配置
        /// </summary>
        /// <param name="applicationToken">应用token</param>
        /// <returns></returns>
        public async Task<string> GetWxBotConfigAsync(string applicationToken)
        {
            return await Task.FromResult("");
        }
        /// <summary>
        /// 获取微信用户信息
        /// </summary>
        /// <returns></returns>
        public WxUserInfoDTO GetWxUserInfo()
        {
            WxUserInfoDTO userInfo = _cache.Get<WxUserInfoDTO>(string.Format(CacheKeyConsts.WxUserInfoKey, _accountInfo.Id.ToStr()));

            return userInfo ?? default;
        }
    }
}