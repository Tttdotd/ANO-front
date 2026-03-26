<script setup>
import { ref, computed } from 'vue'
import {
  Clock, Zap, BookOpen, CheckCheck, Archive,
  FileText, ExternalLink, ChevronDown,
} from 'lucide-vue-next'

const props = defineProps({
  task: { type: Object, required: true },
})

const emit = defineEmits([
  'create-note',
  'view-note',
  'open-output-modal',
  'view-output',
])

const S = { TODO: 0, DOING: 1, NOTED: 2, DONE: 3, ARCHIVED: 4 }

const STATUS_META = {
  0: { icon: Clock,      circleClass: 'bg-gray-400/10    ring-gray-500/50    text-gray-400'    },
  1: { icon: Zap,        circleClass: 'bg-blue-400/10    ring-blue-500/50    text-blue-400'    },
  2: { icon: BookOpen,   circleClass: 'bg-violet-400/10  ring-violet-500/50  text-violet-400'  },
  3: { icon: CheckCheck, circleClass: 'bg-emerald-400/10 ring-emerald-500/50 text-emerald-400' },
  4: { icon: Archive,    circleClass: 'bg-gray-600/10    ring-gray-600/40    text-gray-500'    },
}

const meta        = computed(() => STATUS_META[props.task.state] ?? STATUS_META[0])
const isExpanded  = ref(false)
const hasDesc     = computed(() => !!props.task.description?.trim())
</script>

<template>
  <article
    class="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl
           transition-colors overflow-hidden"
    :class="isExpanded ? 'bg-white/15' : 'hover:bg-white/15'"
  >
    <!-- 主行：标题 + 操作区 + 状态图标 -->
    <div class="flex items-center px-5 py-4">

      <!-- 展开箭头（有描述时才显示） -->
      <button
        v-if="hasDesc"
        class="shrink-0 mr-3 text-gray-500 hover:text-gray-300 transition-all"
        :class="isExpanded ? 'rotate-0' : '-rotate-90'"
        style="transition: transform 0.2s ease"
        @click.stop="isExpanded = !isExpanded"
      >
        <ChevronDown :size="15" />
      </button>
      <!-- 无描述时保留等宽占位，保证标题对齐 -->
      <span v-else class="shrink-0 mr-3 w-[15px]" />

      <!-- 任务标题（点击也可以展开/收起描述） -->
      <p
        class="text-gray-100 text-sm leading-relaxed flex-1 mr-4 select-none"
        :class="hasDesc ? 'cursor-pointer' : ''"
        @click="hasDesc && (isExpanded = !isExpanded)"
      >
        {{ task.title }}
      </p>

      <!-- 操作按钮区 -->
      <div class="flex items-center gap-2 shrink-0 mr-3">

        <button
          v-if="task.state === S.TODO"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                 border border-white/20 bg-white/5 text-gray-400
                 hover:bg-white/10 hover:text-gray-200 hover:border-white/40 transition-all"
          @click="emit('create-note', task.id)"
        >
          <FileText :size="13" />
          创建笔记
        </button>

        <button
          v-else-if="task.state === S.DOING"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                 border border-blue-500/40 bg-blue-500/10 text-blue-400
                 hover:bg-blue-500/20 hover:border-blue-400 transition-all"
          @click="emit('view-note', { taskId: task.id, taskState: task.state })"
        >
          <FileText :size="13" />
          查看笔记
        </button>

        <template v-else-if="task.state === S.NOTED">
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                   border border-white/20 bg-white/5 text-gray-400
                   hover:bg-white/10 hover:text-gray-200 hover:border-white/40 transition-all"
            @click="emit('view-note', { taskId: task.id, taskState: task.state })"
          >
            <FileText :size="13" />
            查看笔记
          </button>
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                   border border-violet-500/50 bg-violet-500/10 text-violet-400
                   hover:bg-violet-500/20 hover:border-violet-400 transition-all"
            @click="emit('open-output-modal', task.id)"
          >
            <ExternalLink :size="13" />
            创建输出
          </button>
        </template>

        <template v-else-if="task.state === S.DONE">
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                   border border-white/20 bg-white/5 text-gray-400
                   hover:bg-white/10 hover:text-gray-200 hover:border-white/40 transition-all"
            @click="emit('view-note', { taskId: task.id, taskState: task.state })"
          >
            <FileText :size="13" />
            查看笔记
          </button>
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                   border border-emerald-500/40 bg-emerald-500/10 text-emerald-400
                   hover:bg-emerald-500/20 hover:border-emerald-400 transition-all"
            @click="emit('view-output', task.id)"
          >
            <ExternalLink :size="13" />
            查看输出
          </button>
        </template>

      </div>

      <!-- 状态图标圆圈 -->
      <div :class="['shrink-0 w-9 h-9 rounded-full ring-1 flex items-center justify-center', meta.circleClass]">
        <component :is="meta.icon" :size="15" />
      </div>

    </div>

    <!-- 描述展开区：smooth 动画 -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-150 ease-in"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-40"
      leave-from-class="opacity-100 max-h-40"
      leave-to-class="opacity-0 max-h-0"
    >
      <div
        v-if="isExpanded && hasDesc"
        class="overflow-hidden border-t border-white/10
               px-5 pb-4 pt-3"
      >
        <!-- 箭头占位 + 描述文字，与标题列对齐 -->
        <div class="flex gap-3">
          <span class="shrink-0 w-[15px]" />
          <p class="text-gray-400 text-xs leading-relaxed">
            {{ task.description }}
          </p>
        </div>
      </div>
    </Transition>

  </article>
</template>
