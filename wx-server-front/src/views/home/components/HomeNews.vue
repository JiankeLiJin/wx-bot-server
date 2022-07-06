<template>
  <a-card title="系统消息" class="home-news" :bordered="false" hoverable :headStyle="headStyle">
    <p>系统消息</p>
  </a-card>
</template>
<script>
export default { name: "HomeNews" };
</script>
<script setup>
import { headStyle } from "@/views/home/config";
import { ref } from "vue";
</script>

<style lang="less">
.home-news {
  height: 249px;
  border-radius: 10px;
}
</style>
