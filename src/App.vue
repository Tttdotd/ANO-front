<script setup>
import { RouterView } from 'vue-router'
import SideBar from './components/SideBar.vue'
</script>

<template>
  <!-- 渐变背景是玻璃态效果的必要条件：纯色背景上 backdrop-blur 无法产生折射感 -->
  <div class="flex h-screen overflow-hidden
              bg-gradient-to-br from-gray-950 via-slate-900 to-violet-950">
    <SideBar />
    <RouterView />
  </div>
</template>
