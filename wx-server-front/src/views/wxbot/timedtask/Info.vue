<template>
  <a-modal
    v-model:visible="state.visible"
    :title="state.vm.id ? '编辑' : '新建'"
    centered
    @ok="state.visible = false"
    :width="600"
  >
    <template #footer>
      <a-button
        type="primary"
        @click="methods.saveForm()"
        :loading="state.saveLoading"
        >提交</a-button
      >
      <a-button type="danger" ghost @click="state.visible = false" class="ml-15"
        >关闭</a-button
      >
    </template>
    <a-spin :spinning="state.saveLoading">
      <a-form layout="vertical" :model="state.vm.form">
        <a-row :gutter="[15, 15]">
          <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <a-form-item label="接受对象(联系人Id)">
              <a-input
                v-model:value="state.vm.form.receivingObjectId"
                placeholder="请输入 接受对象(联系人Id)"
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <a-form-item label="发送类型">
              <a-select
                 placeholder="请选择 发送类型"
                ref="select"
                v-model:value="state.vm.form.sendType"
                style="width: 200px"
              >
                <a-select-option value="WBNR">文本内容</a-select-option>
                <a-select-option value="XWZX">新闻咨询</a-select-option>
                <a-select-option value="ZXYQ">最新疫情</a-select-option>
                <a-select-option value="TWQH">土味情话</a-select-option>
                <a-select-option value="XHDQ">笑话大全</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <a-form-item label="发送内容(发送类型为文本时生效)">
              <a-textarea
                v-model:value="state.vm.form.sendContent"
                placeholder="请输入 发送内容(发送类型为文本时生效)"
                :rows="8"
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <a-form-item label="发送时间(cron表达式)">
              <a-input
                v-model:value="state.vm.form.sendTime"
                placeholder="请输入 发送时间(cron表达式)"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { reactive } from "vue";
import tools from "@/scripts/tools";
import service from "@/service/wxbot/wxTimedTaskService";
import { useAppStore } from "@/store";

//定义组件事件
const emits = defineEmits(["onSuccess"]);
const appStore = useAppStore();
const state = reactive({
  vm: {
    id: "",
    form: {},
  },
  visible: false,
  saveLoading: false,
});

const methods = {
  findForm() {
    state.saveLoading = true;
    service.findForm(state.vm.id).then((res) => {
      state.saveLoading = false;
      if (res.code != 1) return;
      state.vm = res.data;
    });
  },
  saveForm() {
    state.saveLoading = true;
    state.vm.form.applicationToken = appStore.getApplicationToken();
    console.log(state.vm.form);
    service.saveForm(state.vm.form).then((res) => {
      state.saveLoading = false;
      if (res.code != 1) return;
      tools.message("操作成功!", "成功");
      emits("onSuccess", res.data);
      state.visible = false;
    });
  },
  //打开表单初始化
  openForm({ visible, key }) {
    state.visible = visible;
    if (visible) {
      state.vm.id = key;
      methods.findForm();
    }
  },
};
// 暴露函数或者属性到外部
defineExpose({ ...methods });
</script>
<style lang="less" scoped>
.ant-form-item {
  margin-bottom: 0;
}
</style>