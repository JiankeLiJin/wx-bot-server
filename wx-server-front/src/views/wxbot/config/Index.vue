<template>
<div>
  <a-form layout="horizontal" :model="state.vm.form" v-bind="{
            labelCol: { span: 4 },
            wrapperCol: { span: 14 },
          }">
    <a-form-item label="群聊自动回复是否开启">
      <a-switch v-model:checked="state.vm.form.groupAutoReplyFlag" checked-children="开" un-checked-children="关" />
    </a-form-item>
    <a-form-item label="私聊自动回复是否开启">
      <a-switch v-model:checked="state.vm.form.talkPrivateAutoReplyFlag" checked-children="开" un-checked-children="关" />
    </a-form-item>
    <a-form-item label="回复机器人类型">
      <a-radio-group v-model:value="state.vm.form.replyBotType" default-value="TXJQR">
      <a-radio value="TXJQR" >天行机器人</a-radio>
      <a-radio value="TXXLJQR">腾讯闲聊机器人</a-radio>
    </a-radio-group>
    </a-form-item>
    <a-form-item label="天行机器人key">
      <a-input
        v-model:value="state.vm.form.tianXingApiKey"
        placeholder="请输入 天行机器人key"
      />
    </a-form-item>
    <a-form-item label="腾讯TencentSecretId">
      <a-input
        v-model:value="state.vm.form.tencentSecretId"
        placeholder="请输入 腾讯TencentSecretId"
      />
    </a-form-item>
    <a-form-item label="腾讯TencentSecretKey">
      <a-input
        v-model:value="state.vm.form.tencentSecretKey"
        placeholder="请输入 腾讯TencentSecretKey"
      />
    </a-form-item>
    <a-form-item :wrapper-col="{ span: 14, offset: 4 }" >
      <a-button type="primary" @click="methods.saveForm()">保存</a-button>
    </a-form-item>
  </a-form>
  </div>
</template>
<script setup>
import { reactive,onMounted } from "vue";
import tools from "@/scripts/tools";
import service from "@/service/wxbot/wxBotConfigService";

//定义组件事件
const emits = defineEmits(["onSuccess"]);

const state = reactive({
  vm: {
    id: "",
    form: {
    },
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
};
onMounted(() => {
 // methods.findForm();
});
</script>
<style lang="less" scoped>
</style>