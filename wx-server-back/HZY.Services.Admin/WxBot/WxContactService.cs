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
using HZY.EFCore.Aop;

namespace HZY.Services.Admin
{
    /// <summary>
    /// 微信联系人 服务 WxContactService
    /// </summary>
    public class WxContactService : AdminBaseService<IAdminRepository<WxContact>>
    {
        private readonly AccountInfo _accountInfo;
        public WxContactService(IAdminRepository<WxContact> defaultRepository,
            IAccountDomainService accountService)
            : base(defaultRepository)
        {
            this._accountInfo = accountService.GetAccountInfo();
        }
        /// <summary>
        /// 获取所有联系人
        /// </summary>
        /// <returns></returns>
        public async Task<List<WxContact>> FindAllAsync()
        {
            return await _defaultRepository.ToListAsync(wxContact => wxContact.ApplicationToken == _accountInfo.Id.ToStr());
        }

        /// <summary>
        /// 获取列表数据
        /// </summary>
        /// <param name="page">page</param>
        /// <param name="size">size</param>
        /// <param name="search">search</param>
        /// <returns></returns>
        public async Task<PagingView> FindListAsync(int page, int size, WxContact search)
        {
            var query = this._defaultRepository.Select
                    .WhereIf(!string.IsNullOrWhiteSpace(search?.Name), w => w.Name.Contains(search.Name) || w.Alias.Contains(search.Name))
                    .Where(w => w.ApplicationToken.Equals(_accountInfo.Id.ToStr()))
                    .OrderByDescending(w => w.CreationTime)
                    .Select(w => new
                    {
                        w.Id,
                        w.ApplicationToken,
                        w.WxId,
                        w.WxCode,
                        w.Name,
                        w.Alias,
                        w.Gender,
                        w.AvatarUrl,
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
        /// 保存更新联系人
        /// </summary>
        /// <param name="form">form</param>
        /// <returns></returns>
        public Task<WxContact> SaveFormAsync(WxContact form)
        {
            return this._defaultRepository.InsertOrUpdateAsync(form);
        }

        /// <summary>
        /// 保存更新联系人
        /// </summary>
        /// <param name="contacts">微信联系人</param>
        /// <param name="applicationToken">应用token</param>
        /// <returns></returns>
        [Transactional]
        public async virtual Task<int> SaveContactsAsync(List<WxContact> contacts, string applicationToken)
        {
            contacts.ForEach(c => c.ApplicationToken = applicationToken);
            //先删除
            await _defaultRepository.DeleteAsync(d => d.ApplicationToken == applicationToken);
            //插入
            return await this._defaultRepository.InsertRangeAsync(contacts);
        }


    }
}