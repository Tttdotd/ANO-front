<script setup>
import { computed } from 'vue'
import {
  Clock, Zap, BookOpen, CheckCheck, Archive as ArchiveIcon,
  FileText, ExternalLink,
} from 'lucide-vue-next'

const props = defineProps({
  task: { type: Object, required: true },
})

const emit = defineEmits([
  'open-task-detail',
  'create-note',
  'view-note',
  'open-output-modal',
  'view-output',
  'archive-task',
])

const S = { TODO: 0, DOING: 1, NOTED: 2, DONE: 3, ARCHIVED: 4 }

const STATUS_META = {
  0: { icon: Clock,      circleClass: 'bg-gray-400/10    ring-gray-500/50    text-gray-400'    },
  1: { icon: Zap,        circleClass: 'bg-blue-400/10    ring-blue-500/50    text-blue-400'    },
  2: { icon: BookOpen,   circleClass: 'bg-violet-400/10  ring-violet-500/50  text-violet-400'  },
  3: { icon: CheckCheck, circleClass: 'bg-emerald-400/10 ring-emerald-500/50 text-emerald-400' },
  4: { icon: ArchiveIcon, circleClass: 'bg-gray-600/10    ring-gray-600/40    text-gray-500'    },
}

const meta = computed(() => STATUS_META[props.task.state] ?? STATUS_META[0])
</script>

<template>
  <article
    class="flex items-center justify-between
           bg-white/10 backdrop-blur-md border border-white/20 rounded-xl
           px-5 py-4
           hover:bg-white/15 transition-colors"
  >
    <!-- 可点击：打开任务详情 / 编辑 -->
    <div
      class="flex-1 min-w-0 mr-4 cursor-pointer select-none"
      @click="emit('open-task-detail', task.id)"
    >
      <p class="text-gray-100 text-sm leading-relaxed truncate">
        {{ task.title }}
      </p>
    </div>

    <!-- 操作按钮（阻止冒泡，避免触发详情） -->
    <div class="flex flex-wrap items-center justify-end gap-2 shrink-0 mr-3" @click.stop>

      <template v-if="task.state === S.TODO">
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                 border border-white/20 bg-white/5 text-gray-400
                 hover:bg-white/10 hover:text-gray-200 hover:border-white/40 transition-all"
          @click="emit('create-note', task.id)"
        >
          <FileText :size="13" />
          创建笔记
        </button>
      </template>

      <template v-else-if="task.state === S.DOING">
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                 border border-blue-500/40 bg-blue-500/10 text-blue-400
                 hover:bg-blue-500/20 hover:border-blue-400 transition-all"
          @click="emit('view-note', { taskId: task.id, taskState: task.state })"
        >
          <FileText :size="13" />
          查看笔记
        </button>
      </template>

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
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                 border border-amber-500/40 bg-amber-500/10 text-amber-400
                 hover:bg-amber-500/20 hover:border-amber-400 transition-all"
          @click="emit('archive-task', task.id)"
        >
          <ArchiveIcon :size="13" />
          任务归档
        </button>
      </template>

      <template v-else-if="task.state === S.ARCHIVED">
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

    <div
      class="shrink-0 w-9 h-9 rounded-full ring-1 flex items-center justify-center"
      :class="meta.circleClass"
      @click.stop
    >
      <component :is="meta.icon" :size="15" />
    </div>

  </article>
</template>
