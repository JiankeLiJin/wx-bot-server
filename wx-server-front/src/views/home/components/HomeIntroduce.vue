<template>
  <a-card title="平台介绍" class="home-status" :bordered="false" hoverable>
    <p>平台介绍</p>
  </a-card>
</template>
<script>
export default { name: "HomeStatus" };
</script>
<script setup>
import { ref } from "vue";
</script>

<style lang="less">
.home-status {
  height: 249px;
  border-radius: 10px;
}
</style>
