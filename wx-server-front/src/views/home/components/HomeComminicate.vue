<template>
  <a-card
    class="home-comminicate"
    title="微信交流群"
    :bordered="false"
    hoverable
    :headStyle="headStyle"
  >
    <p>微信交流群</p>
  </a-card>
</template>
<script>
export default { name: "HomeComminicate" };
</script>
<script setup>
import { headStyle } from "@/views/home/config";
import { ref } from "vue";
</script>

<style lang="less">
.home-comminicate {
  flex: 1;
  margin-top: 15px;
  border-radius: 10px;
}
</style>
