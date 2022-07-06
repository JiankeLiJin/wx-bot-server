<template>
  <a-card title="系统消息" class="home-news" :bordered="false" hoverable>
    <p>系统消息</p>
  </a-card>
</template>
<script>
export default { name: "HomeNews" };
</script>
<script setup>
import { ref } from "vue";
</script>

<style lang="less">
.home-news {
  height: 249px;
  border-radius: 10px;
}
</style>
