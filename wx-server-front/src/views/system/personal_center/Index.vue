<template>
  <div>
    <a-row :gutter="[15, 15]">
      <a-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <a-card class="min-height">
          <a-descriptions title="基础信息" bordered>
            <a-descriptions-item label="真实姓名" :span="3">{{ userInfo.name }}</a-descriptions-item>
            <a-descriptions-item label="账号名称" :span="3">{{ userInfo.loginName }}</a-descriptions-item>
            <a-descriptions-item label="所属组织" :span="3">{{ userInfo.sysOrganization.name }}</a-descriptions-item>
            <a-descriptions-item label="所属岗位" :span="3">{{ state.sysPosts }}</a-descriptions-item>
            <a-descriptions-item label="所属角色" :span="3">{{ state.sysRoles }}</a-descriptions-item>
            <a-descriptions-item label="联系电话" :span="3">{{ userInfo.phone }}</a-descriptions-item>
            <a-descriptions-item label="邮箱地址" :span="3">{{ userInfo.email }} </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <a-card class="min-height">
          <!-- :tab-position="mode" -->
          <a-tabs v-model:activeKey="state.activeKey">
            <a-tab-pane :key="1" tab="编辑信息">
              <ChangeBaseInfo />
            </a-tab-pane>
            <a-tab-pane :key="2" tab="修改密码">
              <ChangePassword />
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
export default { name: "system_personal_center" };
</script>

<script setup>
import { defineComponent, reactive, toRefs, computed } from "vue";
import ChangePassword from "./ChangePassword.vue";
import ChangeBaseInfo from "./ChangeBaseInfo.vue";
import { useAppStore } from "@/store";

const appStore = useAppStore();
const userInfo = computed(() => appStore.state.userInfo);
const state = reactive({
  activeKey: 1,
  sysPosts: "",
  sysRoles: "",
});
//处理岗位
const posts = [];
for (let index = 0; index < userInfo.value.sysPosts.length; index++) {
  const element = userInfo.value.sysPosts[index];
  posts.push(element.name);
}
state.sysPosts = posts.join(" | ");
//处理角色
const roles = [];
for (let index = 0; index < userInfo.value.sysRoles.length; index++) {
  const element = userInfo.value.sysRoles[index];
  roles.push(element.name);
}
state.sysRoles = roles.join(" | ");
</script>
<style scoped lang="less">
.min-height {
  min-height: calc(100vh - 130px);
}
</style>
