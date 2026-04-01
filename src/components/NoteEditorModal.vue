<script setup>
import { ref, computed, watch } from 'vue'
import { X, FileEdit, Eye } from 'lucide-vue-next'
import MarkdownIt from 'markdown-it'

const props = defineProps({
  note:      { type: Object,  required: true },
  taskState: { type: Number,  required: true },
  readOnly:  { type: Boolean, default: false },
})

const emit = defineEmits(['save', 'close'])

const TASK_DOING = 1

const md             = new MarkdownIt({ breaks: true, linkify: true })
const editedContent  = ref(props.note.content ?? '')
const activeTab      = ref('edit')  // 'edit' | 'preview'

watch(
  () => props.note?.content,
  (c) => { editedContent.value = c ?? '' },
)

const renderedHtml = computed(() =>
  editedContent.value.trim()
    ? md.render(editedContent.value)
    : '<p class="empty-hint">暂无内容</p>'
)

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) emit('close')
}

function handleSaveDraft() {
  emit('save', { content: editedContent.value, noteState: 0 })
}

function handleSubmit() {
  emit('save', { content: editedContent.value, noteState: 1 })
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center
           bg-black/50 backdrop-blur-sm"
    @click="handleBackdropClick"
  >
    <div class="w-full max-w-4xl mx-4
                bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl
                p-8 shadow-2xl flex flex-col"
    >

      <!-- 头部：标题 + Tab 切换 + 关闭 -->
      <div class="flex items-center w-full gap-3 mb-5 shrink-0">
        <div class="flex items-center gap-2 shrink-0">
          <h2 class="text-white font-semibold text-lg">任务笔记</h2>
          <span
            v-if="readOnly"
            class="text-[10px] px-2 py-0.5 rounded-md border border-white/20 text-gray-500"
          >
            只读
          </span>
        </div>

        <div
          v-if="!readOnly"
          class="flex-1 flex justify-center"
        >
          <div class="flex items-center gap-1 bg-white/5 border border-white/15 rounded-lg p-0.5">
            <button
              :class="[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                activeTab === 'edit'
                  ? 'bg-violet-500/30 text-violet-300 border border-violet-500/40'
                  : 'text-gray-400 hover:text-gray-200',
              ]"
              @click="activeTab = 'edit'"
            >
              <FileEdit :size="13" />
              编写
            </button>
            <button
              :class="[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                activeTab === 'preview'
                  ? 'bg-violet-500/30 text-violet-300 border border-violet-500/40'
                  : 'text-gray-400 hover:text-gray-200',
              ]"
              @click="activeTab = 'preview'"
            >
              <Eye :size="13" />
              预览
            </button>
          </div>
        </div>
        <div v-else class="flex-1" />

        <button
          class="text-gray-400 hover:text-gray-200 transition-colors shrink-0"
          @click="emit('close')"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- 编写区 -->
      <textarea
        v-show="!readOnly && activeTab === 'edit'"
        v-model="editedContent"
        :disabled="readOnly"
        placeholder="支持 Markdown 语法：**加粗**、# 标题、- 列表、> 引用..."
        class="w-full bg-white/5 border border-white/20 rounded-xl
               px-4 py-3 text-gray-100 text-sm placeholder-gray-600 leading-relaxed
               outline-none focus:border-violet-500/60 focus:bg-white/10
               transition-colors resize-none font-mono scrollbar-thin-violet
               disabled:opacity-60 disabled:cursor-not-allowed"
        style="height: 420px"
      />

      <!-- 预览区（只读时始终显示） -->
      <div
        v-show="readOnly || activeTab === 'preview'"
        class="overflow-y-auto bg-white/5 border border-white/20 rounded-xl
               px-5 py-4 scrollbar-thin-violet prose-note"
        style="height: 420px"
        v-html="renderedHtml"
      />

      <!-- 操作按钮 -->
      <div v-if="!readOnly" class="flex justify-center gap-3 mt-5 shrink-0">
        <button
          class="px-8 py-2.5 rounded-xl text-sm font-medium transition-all
                 border border-white/20 text-gray-300
                 hover:bg-white/10 hover:border-white/40"
          @click="handleSaveDraft"
        >
          保存草稿
        </button>
        <button
          v-if="taskState === TASK_DOING"
          class="px-8 py-2.5 rounded-xl text-sm font-medium transition-all
                 bg-violet-500 text-white
                 hover:bg-violet-400 hover:scale-105 active:scale-100"
          @click="handleSubmit"
        >
          提交笔记
        </button>
      </div>

    </div>
  </div>
</template>
