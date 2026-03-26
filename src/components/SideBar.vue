<script setup>
import { useRoute, RouterLink } from 'vue-router'
import { CheckSquare, Settings } from 'lucide-vue-next'

const route = useRoute()

// 导航项定义——扩展时只需追加此数组
const navItems = [
  { key: 'Todo',     label: '每日待办', icon: CheckSquare, to: '/todo' },
  { key: 'Settings', label: '设置',     icon: Settings,    to: '/settings' },
]
</script>

<template>
  <aside class="flex flex-col w-64 h-screen shrink-0
                 bg-white/5 backdrop-blur-md border-r border-white/10
                 px-3 py-6">
    <!-- Logo / 品牌区 -->
    <div class="mb-8 px-2">
      <span class="text-white font-bold text-2xl tracking-widest">ANO</span>
      <p class="text-gray-500 text-xs mt-1">Action · Note · Output</p>
    </div>

    <!-- 导航列表 -->
    <nav class="flex flex-col gap-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.key"
        :to="item.to"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
          route.name === item.key
            ? 'bg-violet-500/20 text-violet-400'
            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200',
        ]"
      >
        <component :is="item.icon" :size="16" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>
