<template>
  <a-card title="项目说明" class="home-description" :bordered="false" hoverable :headStyle="headStyle">
    <p>项目说明</p>
  </a-card>
</template>
<script>
export default { name: "HomeDescription" };
</script>
<script setup>
import { headStyle } from "@/views/home/config";
import { ref } from "vue";
</script>

<style lang="less">
.home-description {
  margin-top: 15px;
  border-radius: 10px;
}
</style>
