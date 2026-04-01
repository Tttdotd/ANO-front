<script setup>
import { ref, watch, onMounted } from 'vue'
import TaskItem         from '../components/TaskItem.vue'
import GlassDatePicker  from '../components/GlassDatePicker.vue'
import EditTaskModal    from '../components/EditTaskModal.vue'
import NoteEditorModal  from '../components/NoteEditorModal.vue'

import { fetchTasks } from '../api/task'
import { fetchNote } from '../api/note'
import { fetchOutput } from '../api/output'

const TASK_STATUS = { ARCHIVED: 4 }

const tasks = ref([])
const selectedDate = ref('')

async function loadArchivedTasks() {
  try {
    const params = { state: TASK_STATUS.ARCHIVED }
    if (selectedDate.value) params.date = selectedDate.value
    const res = await fetchTasks(params)
    tasks.value = res.data.data ?? []
  } catch (e) {
    console.error('[KnowledgeBaseView] 加载归档任务失败', e)
  }
}

onMounted(loadArchivedTasks)
watch(selectedDate, loadArchivedTasks)

function clearDateFilter() {
  selectedDate.value = ''
}

function findTask(taskId) {
  return tasks.value.find(t => t.id === taskId)
}

// ── 任务详情（只读） ──────────────────────────────────────────────
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

// 知识库内任务均为归档，不允许 PATCH；EditTaskModal 已只读，此处不实现 save

// ── 笔记（只读展示） ────────────────────────────────────────────
const isNoteModalOpen = ref(false)
const noteForModal    = ref(null)
const noteTaskState   = ref(null)

async function handleViewNote({ taskId, taskState }) {
  try {
    const res = await fetchNote(taskId)
    noteForModal.value    = res.data.data
    noteTaskState.value   = taskState
    isNoteModalOpen.value = true
  } catch (e) {
    console.error('[KnowledgeBaseView] 获取笔记失败', e)
  }
}

function closeNoteModal() {
  isNoteModalOpen.value = false
  noteForModal.value    = null
  noteTaskState.value   = null
}

// ── 查看输出 ─────────────────────────────────────────────────────
async function handleViewOutput(taskId) {
  try {
    const res = await fetchOutput(taskId)
    const output = res.data.data
    if (output?.url) window.open(output.url, '_blank', 'noopener')
  } catch (e) {
    console.error('[KnowledgeBaseView] 获取输出失败', e)
  }
}
</script>

<template>
  <main class="flex flex-col flex-1 min-w-0 overflow-hidden">

    <!-- z-index：避免日期下拉（absolute）被下方任务列表盖住（后兄弟默认叠在上面） -->
    <div class="relative z-30 shrink-0 px-8 pt-8 pb-4 flex flex-col gap-4">
      <section class="text-center">
        <h1 class="text-white font-semibold text-base">知识库</h1>
        <p class="text-gray-500 text-xs mt-1">已归档任务 · 可按创建日期筛选</p>
      </section>

      <section class="flex justify-center px-2">
        <div
          class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full max-w-xl
                 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md
                 px-5 py-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
        >
          <span class="text-gray-500 text-xs font-medium shrink-0 text-center sm:text-left">
            按创建日期筛选
          </span>
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-1 min-w-0 justify-center sm:justify-end">
            <div class="w-full min-w-0 sm:flex-1 sm:min-w-44 sm:max-w-none">
              <GlassDatePicker v-model="selectedDate" />
            </div>
            <button
              type="button"
              class="shrink-0 px-4 py-2.5 rounded-lg text-xs font-medium transition-all
                     border border-white/20 text-gray-400
                     hover:border-white/40 hover:bg-white/10 hover:text-gray-200"
              @click="clearDateFilter"
            >
              全部时间
            </button>
          </div>
        </div>
      </section>
    </div>

    <div class="relative z-0 min-h-0 flex-1 overflow-y-auto px-8 py-4 scrollbar-thin-violet">
      <div class="flex flex-col gap-3">
        <template v-if="tasks.length > 0">
          <TaskItem
            v-for="task in tasks"
            :key="task.id"
            :task="task"
            @open-task-detail="handleOpenTaskDetail"
            @view-note="handleViewNote"
            @view-output="handleViewOutput"
          />
        </template>

        <div
          v-else
          class="flex flex-col items-center justify-center py-20
                 text-gray-600 text-sm select-none"
        >
          <p class="text-3xl mb-3">📚</p>
          <p>暂无归档任务</p>
          <p class="text-gray-700 text-xs mt-2">归档每日待办中的任务后将显示在这里</p>
        </div>
      </div>
    </div>
  </main>

  <EditTaskModal
    v-if="isEditTaskModalOpen && taskForEditModal"
    :task="taskForEditModal"
    @close="closeEditTaskModal"
  />

  <NoteEditorModal
    v-if="isNoteModalOpen && noteForModal"
    :note="noteForModal"
    :task-state="noteTaskState"
    read-only
    @close="closeNoteModal"
  />
</template>
