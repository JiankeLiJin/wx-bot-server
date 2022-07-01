import { defineStore } from "pinia";
import { reactive } from "vue";
import router from "@/router";
import { useTabsStore } from "@/store";
import userService from "@/service/system/userService";

const appStore = defineStore("app-store", () => {

    const tabsStore = useTabsStore();
    const defaultUserInfo = {
        name: "超级管理员",
        menus: [],
        menuPowers: []
    };

    //定义状态
    let state = reactive({
        allRouters: [],
        userInfo: defaultUserInfo,
        //一级大菜单集合
        oneLevels: [],
        //一级一下菜单集合
        subMenus: []

    });

    /**
     * 创建一级菜单
     */
    function createOneLevelMenu() {
        state.oneLevels = state.userInfo.menus.filter((w) => (w.parentId == null || w.parentId == ""));
    }

    /**
     *  根据当前路由菜单id 查找 最上级 id
     * @returns 
     */
    function getTopMenuIdByCurrentRoute() {
        let route = router.currentRoute.value;
        let levelCode = route.meta.levelCode;
        if (!levelCode) return;
        return parseInt(levelCode.indexOf('.') == -1 ? levelCode : levelCode.split('.')[0]);
    }

    /**
     * 根据 id 设置子菜单
     * @param {*} parentId 
     */
    function setSubmenu(parentId) {
        var menus = state.userInfo.menus.filter((w) => w.id == parentId);
        if (menus.length > 0) {
            state.subMenus = menus[0].children;
        }
    }

    /**
     * 根据全路径信息获取 router 信息
     * @param {*} fullPath 
     * @returns 
     */
    function getRouterByFullPath(fullPath) {
        let result = state.allRouters.find(w => w.path == fullPath);
        if (!result) {
            result = tabsStore.state.tabs.find(w => w.path == fullPath);
        }
        return result;
    }

    /**
     * 设置用户信息
     * @param {*} userInfo 
     */
    function setUserInfo(userInfo) {
        state.userInfo = userInfo;
    }

    /**
     * 获取用户信息 与 菜单
     * 
     * @returns 
     */
    function getUserInfo() {
        return new Promise((resolve) => {
            if (state.userInfo.loadOver) {
                return resolve(state.userInfo);
            }
            refreshUserInfo().then((data) => {
                data.loadOver = true;
                resolve(data);
            });
        });
    }

    /**
     * 刷新用户信息
     * 
     * @returns 
     */
    function refreshUserInfo() {
        state.loading = true;
        return new Promise((resolve) => {
            userService
                .getUserInfo()
                .then((res) => {
                    let data = res.data;
                    setUserInfo(data);
                    state.loading = false;
                    resolve(data);
                })
                .catch(() => {
                    state.loading = false;
                });
        });
    }

    /**
     * 根据菜单id 获取权限信息
     * 
     * @param {*} menuId 
     * @returns 
     */
    function getPowerByMenuId(menuId) {
        const data = state.userInfo.menuPowers.find((w) => w.menuId == menuId);
        return data ? data : {};
    }

    /**
     * 重置信息
     */
    function resetInfo() {
        setUserInfo(defaultUserInfo);
        tabsStore.state.tabs = [];
        tabsStore.delCacheViewAll();
    }

    return {
        state,
        createOneLevelMenu,
        getTopMenuIdByCurrentRoute,
        setSubmenu,
        getRouterByFullPath,
        setUserInfo,
        getUserInfo,
        refreshUserInfo,
        getPowerByMenuId,
        resetInfo
    }

});

export default appStore;