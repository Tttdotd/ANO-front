<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import TaskItem          from '../components/TaskItem.vue'
import CreateTaskModal   from '../components/CreateTaskModal.vue'
import EditTaskModal     from '../components/EditTaskModal.vue'
import NoteEditorModal   from '../components/NoteEditorModal.vue'
import CreateOutputModal from '../components/CreateOutputModal.vue'

import { fetchTasks, createTask, updateTask, archiveTask } from '../api/task'
import { createNote, fetchNote, updateNote } from '../api/note'
import { createOutput, fetchOutput }  from '../api/output'

// ── 状态常量（与 DB schema state 字段对应） ──────────────────────
const TASK_STATUS = { TODO: 0, DOING: 1, NOTED: 2, DONE: 3, ARCHIVED: 4 }

// ── 筛选按钮配置 ────────────────────────────────────────────────
const STATUS_FILTERS = [
  { key: TASK_STATUS.TODO,     label: 'TODO',     activeClass: 'bg-gray-400/20    border-gray-400    text-gray-300'    },
  { key: TASK_STATUS.DOING,    label: 'DOING',    activeClass: 'bg-blue-400/20    border-blue-400    text-blue-300'    },
  { key: TASK_STATUS.NOTED,    label: 'NOTED',    activeClass: 'bg-violet-400/20  border-violet-400  text-violet-300'  },
  { key: TASK_STATUS.DONE,     label: 'DONE',     activeClass: 'bg-emerald-400/20 border-emerald-400 text-emerald-300' },
  { key: TASK_STATUS.ARCHIVED, label: 'ARCHIVED', activeClass: 'bg-gray-600/20    border-gray-500    text-gray-400'    },
]

// ── 任务列表（从 API 加载，不使用 Mock 数据） ────────────────────
const tasks = ref([])

onMounted(async () => {
  const today = new Date().toISOString().slice(0, 10)
  try {
    const res = await fetchTasks({ date: today })
    tasks.value = res.data.data ?? []
  } catch (e) {
    console.error('[TodoView] 加载任务失败', e)
  }
})

// ── 状态筛选 ────────────────────────────────────────────────────
const activeStatuses = ref(new Set())

function toggleStatus(statusKey) {
  const next = new Set(activeStatuses.value)
  next.has(statusKey) ? next.delete(statusKey) : next.add(statusKey)
  activeStatuses.value = next
}

const filteredTasks = computed(() =>
  activeStatuses.value.size === 0
    ? tasks.value
    : tasks.value.filter(t => activeStatuses.value.has(t.state))
)

// ── 今日日期标题 ─────────────────────────────────────────────────
const todayLabel = computed(() =>
  new Date().toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  })
)

// ── 辅助：按 id 找任务对象 ────────────────────────────────────────
function findTask(taskId) {
  return tasks.value.find(t => t.id === taskId)
}

// ── 编辑任务弹窗（点击任务行打开） ────────────────────────────────
const isEditTaskModalOpen = ref(false)
const taskForEditModal    = ref(null)

function handleOpenTaskDetail(taskId) {
  const t = findTask(taskId)
  if (!t) return
  taskForEditModal.value    = t
  isEditTaskModalOpen.value = true
}

function closeEditTaskModal() {
  isEditTaskModalOpen.value = false
  taskForEditModal.value    = null
}

async function handleTaskUpdated({ title, description }) {
  if (!taskForEditModal.value) return
  const id = taskForEditModal.value.id
  try {
    await updateTask({ id, title, description })
    const task = findTask(id)
    if (task) {
      task.title       = title
      task.description = description
    }
    closeEditTaskModal()
  } catch (e) {
    console.error('[TodoView] 修改任务失败', e)
  }
}

// ── 任务归档 ──────────────────────────────────────────────────────
async function handleArchiveTask(taskId) {
  try {
    await archiveTask({ id: taskId })
    const task = findTask(taskId)
    if (task) task.state = TASK_STATUS.ARCHIVED
  } catch (e) {
    console.error('[TodoView] 任务归档失败', e)
  }
}

// ── 新增任务弹窗 ──────────────────────────────────────────────────
const isTaskModalOpen = ref(false)

async function handleTaskCreated({ title, description }) {
  try {
    const res = await createTask({ title, description })
    tasks.value.push(res.data.data)
  } catch (e) {
    console.error('[TodoView] 创建任务失败', e)
  }
}

// ── 创建笔记（TODO → DOING） ──────────────────────────────────────
async function handleCreateNote(taskId) {
  try {
    const res = await createNote(taskId)
    const task = findTask(taskId)
    if (task) task.state = TASK_STATUS.DOING

    // 创建后直接打开笔记编辑弹窗，减少用户二次点击
    noteForModal.value    = res.data.data
    noteTaskState.value   = TASK_STATUS.DOING
    isNoteModalOpen.value = true
  } catch (e) {
    console.error('[TodoView] 创建笔记失败', e)
  }
}

// ── 查看/编辑笔记弹窗 ─────────────────────────────────────────────
const isNoteModalOpen = ref(false)
const noteForModal    = ref(null)   // NoteDisplayVO
const noteTaskState   = ref(null)   // 打开时的任务 state，决定按钮策略

async function handleViewNote({ taskId, taskState }) {
  try {
    const res = await fetchNote(taskId)
    noteForModal.value  = res.data.data
    noteTaskState.value = taskState
    isNoteModalOpen.value = true
  } catch (e) {
    console.error('[TodoView] 获取笔记失败', e)
  }
}

// 保存/提交笔记回调
async function handleNoteSave({ content, noteState }) {
  if (!noteForModal.value) return
  try {
    await updateNote({ id: noteForModal.value.id, content, state: noteState })
    // noteState=1（提交）且任务处于 DOING → 流转至 NOTED
    if (noteState === 1 && noteTaskState.value === TASK_STATUS.DOING) {
      const task = findTask(noteForModal.value.taskId)
      if (task) task.state = TASK_STATUS.NOTED
    }
  } catch (e) {
    console.error('[TodoView] 保存笔记失败', e)
  } finally {
    isNoteModalOpen.value = false
    noteForModal.value    = null
    noteTaskState.value   = null
  }
}

// ── 创建输出弹窗（NOTED → DONE） ────────────────────────────────
const isOutputModalOpen = ref(false)
const outputTargetId    = ref(null)

function handleOpenOutputModal(taskId) {
  outputTargetId.value    = taskId
  isOutputModalOpen.value = true
}

async function handleOutputSubmit({ platform, url }) {
  try {
    await createOutput({ taskId: outputTargetId.value, platform, url })
    const task = findTask(outputTargetId.value)
    if (task) task.state = TASK_STATUS.DONE
  } catch (e) {
    console.error('[TodoView] 创建输出失败', e)
  } finally {
    outputTargetId.value    = null
    isOutputModalOpen.value = false
  }
}

// ── 查看输出（直接在新标签打开链接） ────────────────────────────
async function handleViewOutput(taskId) {
  try {
    const res = await fetchOutput(taskId)
    const output = res.data.data
    if (output?.url) window.open(output.url, '_blank', 'noopener')
  } catch (e) {
    console.error('[TodoView] 获取输出失败', e)
  }
}
</script>

<template>
  <main class="flex flex-col flex-1 min-w-0 overflow-hidden">

    <!-- 1. 顶部固定区：时间 + 状态筛选 -->
    <div class="shrink-0 px-8 pt-8 pb-4 flex flex-col gap-4">
      <section class="text-center">
        <p class="text-white font-semibold text-base">{{ todayLabel }}</p>
      </section>

      <section class="flex items-center justify-center gap-2 flex-wrap">
        <button
          v-for="filter in STATUS_FILTERS"
          :key="filter.key"
          :class="[
            'px-4 py-1.5 rounded-lg border text-xs font-medium transition-all',
            activeStatuses.has(filter.key)
              ? filter.activeClass
              : 'border-white/20 text-gray-400 hover:border-white/40 hover:text-gray-200',
          ]"
          @click="toggleStatus(filter.key)"
        >
          {{ filter.label }}
        </button>
      </section>
    </div>

    <!-- 2. 中间滚动区：任务列表 -->
    <div class="flex-1 overflow-y-auto px-8 py-4 scrollbar-thin-violet">
      <div class="flex flex-col gap-3">
        <template v-if="filteredTasks.length > 0">
          <TaskItem
            v-for="task in filteredTasks"
            :key="task.id"
            :task="task"
            @open-task-detail="handleOpenTaskDetail"
            @create-note="handleCreateNote"
            @view-note="handleViewNote"
            @open-output-modal="handleOpenOutputModal"
            @view-output="handleViewOutput"
            @archive-task="handleArchiveTask"
          />
        </template>

        <!-- 空状态 -->
        <div
          v-else
          class="flex flex-col items-center justify-center py-20
                 text-gray-600 text-sm select-none"
        >
          <p class="text-3xl mb-3">🌱</p>
          <p>没有符合条件的任务</p>
        </div>
      </div>
    </div>

    <!-- 3. 底部固定区：新增任务 -->
    <div class="shrink-0 px-8 py-5 border-t border-white/10 flex justify-center">
      <button
        class="flex items-center gap-2 px-6 py-2.5 rounded-xl
               bg-violet-500 hover:bg-violet-400 active:bg-violet-600
               text-white text-sm font-medium transition-colors"
        @click="isTaskModalOpen = true"
      >
        <Plus :size="16" />
        新增任务
      </button>
    </div>
  </main>

  <!-- 新增任务弹窗 -->
  <CreateTaskModal
    v-if="isTaskModalOpen"
    @add-task="handleTaskCreated"
    @close="isTaskModalOpen = false"
  />

  <!-- 编辑 / 查看任务详情 -->
  <EditTaskModal
    v-if="isEditTaskModalOpen && taskForEditModal"
    :task="taskForEditModal"
    @save="handleTaskUpdated"
    @close="closeEditTaskModal"
  />

  <!-- 笔记编辑弹窗 -->
  <NoteEditorModal
    v-if="isNoteModalOpen && noteForModal"
    :note="noteForModal"
    :task-state="noteTaskState"
    :read-only="noteTaskState === TASK_STATUS.ARCHIVED"
    @save="handleNoteSave"
    @close="isNoteModalOpen = false"
  />

  <!-- 创建输出弹窗 -->
  <CreateOutputModal
    v-if="isOutputModalOpen"
    @submit="handleOutputSubmit"
    @close="isOutputModalOpen = false"
  />
</template>
