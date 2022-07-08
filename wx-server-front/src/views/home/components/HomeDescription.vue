<template>
  <a-card title="项目说明" class="home-description" :bordered="false" hoverable :headStyle="headStyle">
    <p>平台配置<br/>
1.申请天行数据秘钥，填入基础配置中进行保存。<br/>
2.申请天行数据平台分类新闻、天行机器人、one一个、土味情话、天气预报接口。<br/>
3.点击此处下载工具包。<br/>
4.智能配置的任务需用户微信成功启动机器人过后才能获取到联系人。<br/>
注：用户微信会在第一次启动机器人成功后进行绑定，请选择合适的微信启动机器人。<br/>
<br/>
工具包使用
<br/>
初次运行，步骤如下<br/>
1.安装指定版本微信 登录后设置从不更新<br/>
2.安装 node-v16.13.0-x64.msi，如果电脑系统为win7 则安装node-v12.3.0-x64.msi（直接点next）<br/>
注：win7系统安装完后 解压node-v16.0.0-win-x64.zip 将里面的文件替换掉C:\Program Files\nodejs里面的文件 （最好先删除然后再复制粘贴）然后执行 禁止校验.bat 文件<br/>
3.点击 环境变量配置.bat 执行完关闭命令框<br/>
4.点击安装依赖文件，等待依赖安装完成（如已有 node_modules 文件夹则无需此步骤）<br/>
5.编辑 examples文件夹下的lizhou-bot.ts 文件 将平台秘钥填入 如：const WINDY_ID = "xxxxxxxxxxxx";//平台KEY 保存后关闭文件<br/>
6.点击启动文件 启动机器人<br/>
<br/>
已经运行过 因关机、退出微信后再运行，步骤如下<br/>
1.登录微信<br/>
2.点击启动文件 启动机器人<br/>
<br/>
因关闭命令框后再运行，步骤如下<br/>
1.点击启动文件 启动机器人<br/>
<br/>
机器人启动默认开启群聊回复 私聊回复默认关闭<br/>
群聊收到消息-开启机器人 会开启群聊回复（临时性，需永久开启需要去平台配置）<br/>
群聊收到消息-关闭机器人 会关闭群聊回复（临时性，需永久关闭需要去平台配置）<br/>
私聊收到消息-开启私聊 会开启私聊回复<br/>
私聊收到消息-关闭私聊 会关闭私聊回复<br/>
群聊中需有人@机器人 才会进行回复
</p>
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
