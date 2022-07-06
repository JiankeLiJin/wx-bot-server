<template>
  <div class="home">
    <a-row :gutter="16">
      <a-col :span="8">
        <HomeStatus />
      </a-col>
      <a-col :span="8">
        <HomeIntroduce />
      </a-col>
      <a-col :span="8">
        <HomeNews />
      </a-col>
    </a-row>
    <HomeDescription />
    <HomeComminicate />
  </div>
</template>
<script>
export default { name: "HomeIndexCom" };
</script>
<script setup>
import HomeStatus from "@/views/home/components/HomeStatus.vue";
import HomeIntroduce from "@/views/home/components/HomeIntroduce.vue";
import HomeNews from "@/views/home/components/HomeNews.vue";
import HomeDescription from "@/views/home/components/HomeDescription.vue";
import HomeComminicate from "@/views/home/components/HomeComminicate.vue";
import { ref } from "vue";
</script>

<style lang="less">
.home {
  min-height: calc(100vh - 180px);
  display: flex;
  flex-direction: column;
}
</style>
