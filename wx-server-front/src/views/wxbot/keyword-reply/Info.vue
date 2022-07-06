<template>
  <a-modal v-model:visible="state.visible" :title="state.vm.id ? '编辑' : '新建'" centered @ok="state.visible = false" :width="400">
    <template #footer>
      <a-button type="primary" @click="methods.saveForm()" :loading="state.saveLoading">提交</a-button>
      <a-button type="danger" ghost @click="state.visible = false" class="ml-15">关闭</a-button>
    </template>
    <a-spin :spinning="state.saveLoading">
      <a-form layout="vertical" :model="state.vm.form">
        <a-row :gutter="[15, 15]">
                <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                    <a-form-item label="应用Token">
                        <a-input v-model:value="state.vm.form.applicationToken" placeholder="请输入 应用Token" />
                    </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                    <a-form-item label="发送类型">
                        <a-input v-model:value="state.vm.form.sendType" placeholder="请输入 发送类型" />
                    </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                    <a-form-item label="发送内容(发送类型为文本时生效)">
                        <a-input v-model:value="state.vm.form.sendContent" placeholder="请输入 发送内容(发送类型为文本时生效)" />
                    </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                    <a-form-item label="生效类型">
                        <a-input v-model:value="state.vm.form.takeEffectType" placeholder="请输入 生效类型" />
                    </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                    <a-form-item label="关键词">
                        <a-input v-model:value="state.vm.form.keyWord" placeholder="请输入 关键词" />
                    </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                    <a-form-item label="匹配类型(模糊匹配,精确匹配)">
                        <a-input v-model:value="state.vm.form.matchType" placeholder="请输入 匹配类型(模糊匹配,精确匹配)" />
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
import service from "@/service/wxbot/wxKeywordReplyService";

//定义组件事件
const emits = defineEmits(["onSuccess"]);

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