<script setup>
import { ref } from 'vue'
import { X } from 'lucide-vue-next'

const emit = defineEmits(['submit', 'close'])

const platform = ref('')
const url      = ref('')

const isValid = () => platform.value.trim() && url.value.trim()

function handleSubmit() {
  if (!isValid()) return
  emit('submit', { platform: platform.value.trim(), url: url.value.trim() })
  platform.value = ''
  url.value      = ''
  emit('close')
}

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) emit('close')
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center
           bg-black/50 backdrop-blur-sm"
    @click="handleBackdropClick"
  >
    <div class="w-full max-w-lg mx-4
                bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl
                p-8 shadow-2xl">

      <!-- 头部 -->
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-white font-semibold text-lg">创建输出</h2>
        <button
          class="text-gray-400 hover:text-gray-200 transition-colors"
          @click="emit('close')"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- 表单 -->
      <div class="flex flex-col gap-6">
        <!-- 发布平台 -->
        <div class="flex items-center gap-4">
          <label class="text-gray-300 text-sm w-16 shrink-0">发布平台</label>
          <input
            v-model="platform"
            type="text"
            placeholder="如：知乎、B站、GitHub..."
            class="flex-1 bg-white/5 border border-white/20 rounded-lg
                   px-4 py-2.5 text-gray-100 text-sm placeholder-gray-600
                   outline-none focus:border-violet-500/60 focus:bg-white/10
                   transition-colors"
          />
        </div>

        <!-- 输出链接 -->
        <div class="flex items-center gap-4">
          <label class="text-gray-300 text-sm w-16 shrink-0">输出链接</label>
          <input
            v-model="url"
            type="url"
            placeholder="https://..."
            class="flex-1 bg-white/5 border border-white/20 rounded-lg
                   px-4 py-2.5 text-gray-100 text-sm placeholder-gray-600
                   outline-none focus:border-violet-500/60 focus:bg-white/10
                   transition-colors"
            @keydown.enter="handleSubmit"
          />
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="flex justify-center mt-8">
        <button
          :disabled="!isValid()"
          class="px-12 py-2.5 rounded-xl text-sm font-medium transition-all
                 bg-violet-500 text-white
                 hover:bg-violet-400 hover:scale-105
                 active:scale-100
                 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          @click="handleSubmit"
        >
          发布
        </button>
      </div>

    </div>
  </div>
</template>
