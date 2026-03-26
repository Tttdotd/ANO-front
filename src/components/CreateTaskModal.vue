<script setup>
import { ref } from 'vue'
import { X } from 'lucide-vue-next'

const emit = defineEmits(['add-task', 'close'])

const title       = ref('')
const description = ref('')

function handleCreate() {
  if (!title.value.trim()) return

  // 只传业务字段，id/state/createTime 由后端生成
  emit('add-task', {
    title:       title.value.trim(),
    description: description.value.trim(),
  })

  title.value       = ''
  description.value = ''
  emit('close')
}

function handleBackdropClick(e) {
  // 仅当点击遮罩本身（非弹窗内部）时关闭
  if (e.target === e.currentTarget) emit('close')
}
</script>

<template>
  <!-- 遮罩层：磨砂玻璃背景 -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center
           bg-black/50 backdrop-blur-sm"
    @click="handleBackdropClick"
  >
    <!-- 弹窗主体 -->
    <div class="w-full max-w-lg mx-4
                bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl
                p-8 shadow-2xl">

      <!-- 弹窗头部 -->
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-white font-semibold text-lg">新增任务</h2>
        <button
          class="text-gray-400 hover:text-gray-200 transition-colors"
          @click="emit('close')"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- 表单区域 -->
      <div class="flex flex-col gap-6">
        <!-- 任务主题 -->
        <div class="flex items-center gap-4">
          <label class="text-gray-300 text-sm w-16 shrink-0">任务主题</label>
          <input
            v-model="title"
            type="text"
            placeholder="输入任务主题..."
            class="flex-1 bg-white/5 border border-white/20 rounded-lg
                   px-4 py-2.5 text-gray-100 text-sm placeholder-gray-600
                   outline-none focus:border-violet-500/60 focus:bg-white/10
                   transition-colors"
            @keydown.enter="handleCreate"
          />
        </div>

        <!-- 任务描述 -->
        <div class="flex items-start gap-4">
          <label class="text-gray-300 text-sm w-16 shrink-0 pt-2.5">任务描述</label>
          <textarea
            v-model="description"
            placeholder="输入任务描述（可选）..."
            rows="4"
            class="flex-1 bg-white/5 border border-white/20 rounded-lg
                   px-4 py-2.5 text-gray-100 text-sm placeholder-gray-600
                   outline-none focus:border-violet-500/60 focus:bg-white/10
                   transition-colors resize-none"
          />
        </div>
      </div>

      <!-- 创建按钮 -->
      <div class="flex justify-center mt-8">
        <button
          :disabled="!title.trim()"
          class="px-12 py-2.5 rounded-xl text-sm font-medium transition-all
                 bg-violet-500 text-white
                 hover:bg-violet-400 hover:scale-105
                 active:scale-100
                 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          @click="handleCreate"
        >
          创建
        </button>
      </div>

    </div>
  </div>
</template>
