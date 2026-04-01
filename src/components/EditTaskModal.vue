<script setup>
import { ref, watch, computed } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  task: { type: Object, required: true },
})

const emit = defineEmits(['save', 'close'])

const ARCHIVED = 4

const readOnly = computed(() => props.task.state === ARCHIVED)

const title       = ref(props.task.title ?? '')
const description = ref(props.task.description ?? '')

watch(
  () => props.task,
  (t) => {
    title.value       = t.title ?? ''
    description.value = t.description ?? ''
  },
  { deep: true },
)

function handleSave() {
  if (readOnly.value || !title.value.trim()) return
  emit('save', {
    title:       title.value.trim(),
    description: description.value.trim(),
  })
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

      <div class="flex items-center justify-between mb-8">
        <h2 class="text-white font-semibold text-lg">
          {{ readOnly ? '任务详情' : '编辑任务' }}
        </h2>
        <button
          class="text-gray-400 hover:text-gray-200 transition-colors"
          @click="emit('close')"
        >
          <X :size="20" />
        </button>
      </div>

      <div class="flex flex-col gap-6">
        <div class="flex items-center gap-4">
          <label class="text-gray-300 text-sm w-16 shrink-0">任务主题</label>
          <input
            v-model="title"
            type="text"
            :readonly="readOnly"
            placeholder="输入任务主题..."
            class="flex-1 bg-white/5 border border-white/20 rounded-lg
                   px-4 py-2.5 text-gray-100 text-sm placeholder-gray-600
                   outline-none focus:border-violet-500/60 focus:bg-white/10
                   transition-colors read-only:opacity-80 read-only:cursor-default"
            @keydown.enter="handleSave"
          />
        </div>

        <div class="flex items-start gap-4">
          <label class="text-gray-300 text-sm w-16 shrink-0 pt-2.5">任务描述</label>
          <textarea
            v-model="description"
            :readonly="readOnly"
            placeholder="输入任务描述（可选）..."
            rows="4"
            class="flex-1 bg-white/5 border border-white/20 rounded-lg
                   px-4 py-2.5 text-gray-100 text-sm placeholder-gray-600
                   outline-none focus:border-violet-500/60 focus:bg-white/10
                   transition-colors resize-none read-only:opacity-80 read-only:cursor-default"
          />
        </div>
      </div>

      <div v-if="!readOnly" class="flex justify-center mt-8">
        <button
          :disabled="!title.trim()"
          class="px-12 py-2.5 rounded-xl text-sm font-medium transition-all
                 bg-violet-500 text-white
                 hover:bg-violet-400 hover:scale-105
                 active:scale-100
                 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          @click="handleSave"
        >
          保存
        </button>
      </div>
    </div>
  </div>
</template>
