<template>
  <a-card title="微秘书状态" class="home-status" :bordered="false" hoverable>
    <p>微秘书状态</p>
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
