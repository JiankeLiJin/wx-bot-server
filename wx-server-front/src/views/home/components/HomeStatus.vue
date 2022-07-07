<template>
  <a-card
    class="home-status"
    :bordered="false"
    hoverable
    :headStyle="headStyle"
  >
    <template #title>
      微秘书状态
      <!-- <a-tag color="#6a615d">未在线</a-tag> -->
      <v-if v-if="state.wxUserInfo.wxId">
        <a-tag color="#87d068">在线</a-tag>
      </v-if>
      <v-if v-if="!state.wxUserInfo.wxId">
        <a-tag color="#6a615d">离线</a-tag>
      </v-if>
    </template>
    <div class="content">
      <a-image
        :width="150"
        :preview="false"
        :src="state.wxUserInfo.avatarUrl"
      />
      <div class="content-info">
        <div class="name">{{ state.wxUserInfo.wxName }}</div>
        <div class="vx-code">微信Code：{{ state.wxUserInfo.wxCode }}</div>
      </div>
    </div>
  </a-card>
</template>
<script>
export default { name: "HomeStatus" };
</script>
<script setup>
import { headStyle } from "@/views/home/config";
import { onMounted, reactive } from "vue";
import homeService from "@/service/home/homeService";

//微信用户信息
const state = reactive({
  wxUserInfo: {
    avatarUrl: "https://i.52112.com/icon/jpg/256/20210901/130307/5566843.jpg",
    wxId: "",
    wxCode: "未登录",
    wxName: "未登录",
  },
});

onMounted(() => {
  methods.init();
});
const methods = {
  init: async () => {
    let res = await homeService.getWxUserInfo();
    if (res && res.code == 1) {
      if (res.data) state.wxUserInfo = res.data;
    }
    console.log(res, "RES");
  },
};
</script>

<style lang="less">
.home-status {
  height: 249px;
  border-radius: 10px;

  .content {
    display: flex;
    padding: 0 20px;

    .ant-image {
      .ant-image-img {
        border-radius: 50%;
      }
    }

    .content-info {
      margin-left: 35px;
      padding: 30px 0;

      .name {
        font-size: 30px;
        font-weight: 700;
      }

      .vx-code {
        margin-top: 5px;
      }
    }
  }
}
</style>
