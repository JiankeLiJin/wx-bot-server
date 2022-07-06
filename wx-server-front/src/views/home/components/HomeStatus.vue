<template>
  <a-card class="home-status" :bordered="false" hoverable :headStyle="headStyle">
    <template #title>
      微秘书状态
      <!-- <a-tag color="#6a615d">未在线</a-tag> -->
      <a-tag color="#87d068">在线</a-tag>
    </template>
    <div class="content">
      <a-image :width="150" :preview="false" :src="info.vx_img" />
      <div class="content-info">
        <div class="name">{{ info.vx_name }} </div>
        <div class="vx-code">微信号：{{ info.vx_code }}</div>
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

const info = reactive({
  vx_img: 'https://nimg.ws.126.net/?url=http%3A%2F%2Fdingyue.ws.126.net%2F2022%2F0218%2Fb7ad0502j00r7hw51003qd200u000u0g007w007w.jpg&thumbnail=660x2147483647&quality=80&type=jpg',
  vx_name: '边城',
  vx_code: 'Surname__Wu'
})
onMounted(() => {
  methods.init()
})
const methods = {
  init: async () => {
    let res = await homeService.getWxUserInfo()
    console.log(res, 'RES');
  }
}
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
