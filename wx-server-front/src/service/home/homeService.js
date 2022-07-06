import { post, get } from '@/scripts/request';
export default {
    /**
     * 首页状态数据
     * 
     * @param {*} userName 
     * @param {*} userPassword 
     */
    getWxUserInfo() {
        return get('/admin/WxBotConfig/WxUserInfo');
    }
}