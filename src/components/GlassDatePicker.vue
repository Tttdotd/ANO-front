<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const selected = defineModel({ type: String, default: '' })

const open      = ref(false)
const rootRef   = ref(null)
const viewYear  = ref(new Date().getFullYear())
const viewMonth = ref(new Date().getMonth()) // 0–11

const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日']

function pad(n) {
  return String(n).padStart(2, '0')
}

function toISODate(y, m0, d) {
  return `${y}-${pad(m0 + 1)}-${pad(d)}`
}

function daysInMonth(y, m0) {
  return new Date(y, m0 + 1, 0).getDate()
}

/** 当月 1 号在「周一起始」网格中的列偏移，0–6 */
function mondayOffset(y, m0) {
  const w = new Date(y, m0, 1).getDay()
  return w === 0 ? 6 : w - 1
}

const gridCells = computed(() => {
  const y   = viewYear.value
  const m0  = viewMonth.value
  const dim = daysInMonth(y, m0)
  const off = mondayOffset(y, m0)
  const cells = []
  let i = 0
  for (; i < off; i++) cells.push({ kind: 'pad' })
  for (let d = 1; d <= dim; d++, i++) cells.push({ kind: 'day', day: d })
  while (cells.length % 7 !== 0) cells.push({ kind: 'pad' })
  return cells
})

const monthTitle = computed(() =>
  `${viewYear.value}年${viewMonth.value + 1}月`,
)

const displayTrigger = computed(() => {
  if (!selected.value) return '选择日期'
  const [y, m, d] = selected.value.split('-').map(Number)
  if (!y || !m || !d) return '选择日期'
  return `${y}年${m}月${d}日`
})

const todayISO = computed(() => {
  const t = new Date()
  return toISODate(t.getFullYear(), t.getMonth(), t.getDate())
})

function isSelectedDay(day) {
  return selected.value === toISODate(viewYear.value, viewMonth.value, day)
}

function isTodayDay(day) {
  return todayISO.value === toISODate(viewYear.value, viewMonth.value, day)
}

function pickDay(day) {
  selected.value = toISODate(viewYear.value, viewMonth.value, day)
  open.value     = false
}

function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value -= 1
  } else {
    viewMonth.value -= 1
  }
}

function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value += 1
  } else {
    viewMonth.value += 1
  }
}

function pickToday() {
  const t = new Date()
  viewYear.value  = t.getFullYear()
  viewMonth.value = t.getMonth()
  selected.value  = toISODate(t.getFullYear(), t.getMonth(), t.getDate())
  open.value      = false
}

function clearPick() {
  selected.value = ''
  open.value     = false
}

function toggle() {
  open.value = !open.value
}

function syncViewFromSelection() {
  if (selected.value) {
    const [y, m] = selected.value.split('-').map(Number)
    if (y && m) {
      viewYear.value  = y
      viewMonth.value = m - 1
      return
    }
  }
  const t = new Date()
  viewYear.value  = t.getFullYear()
  viewMonth.value = t.getMonth()
}

watch(open, (v) => {
  if (v) syncViewFromSelection()
})

function onDocPointerDown(e) {
  if (!open.value || !rootRef.value) return
  if (!rootRef.value.contains(e.target)) open.value = false
}

function onKeydown(e) {
  if (e.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocPointerDown, true)
  document.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocPointerDown, true)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="rootRef" class="relative w-full min-w-0">
    <!-- 触发器：与下拉同宽 -->
    <button
      type="button"
      class="flex w-full items-center justify-between gap-2 rounded-lg border border-white/15 bg-white/5
             px-3 py-2.5 text-left text-sm tabular-nums text-gray-100 outline-none transition-all
             hover:bg-white/[0.07]
             focus:border-violet-500/50 focus:bg-white/8 focus:ring-1 focus:ring-violet-500/25"
      :class="!selected ? 'text-gray-500' : ''"
      @click.stop="toggle"
    >
      <span class="min-w-0 truncate">{{ displayTrigger }}</span>
      <Calendar class="shrink-0 text-violet-400/80" :size="16" />
    </button>

    <!-- 自定义日历：宽度与触发器一致（同列 100%） -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="absolute left-0 right-0 top-full z-[100] mt-1.5 w-full overflow-hidden rounded-xl
               border border-violet-400/25 bg-violet-950/55 backdrop-blur-xl
               shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)]"
        @click.stop
      >
        <div class="border-b border-white/10 px-3 py-2.5">
          <div class="flex items-center justify-between gap-2">
            <button
              type="button"
              class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-gray-200"
              aria-label="上一月"
              @click="prevMonth"
            >
              <ChevronLeft :size="18" />
            </button>
            <span class="text-sm font-medium text-gray-100">{{ monthTitle }}</span>
            <button
              type="button"
              class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-gray-200"
              aria-label="下一月"
              @click="nextMonth"
            >
              <ChevronRight :size="18" />
            </button>
          </div>
        </div>

        <div class="px-2 pb-2 pt-1">
          <div class="grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium text-gray-500">
            <span v-for="w in WEEK_LABELS" :key="w" class="py-1">{{ w }}</span>
          </div>
          <div class="mt-1 grid grid-cols-7 gap-1">
            <template v-for="(cell, idx) in gridCells" :key="idx">
              <div v-if="cell.kind === 'pad'" class="aspect-square min-h-8" />
              <button
                v-else
                type="button"
                class="aspect-square min-h-8 rounded-lg text-sm transition-colors
                       text-gray-200 hover:bg-violet-500/25"
                :class="[
                  isSelectedDay(cell.day)
                    ? 'bg-violet-500/45 font-medium text-white ring-1 ring-violet-400/50'
                    : '',
                  !isSelectedDay(cell.day) && isTodayDay(cell.day)
                    ? 'ring-1 ring-violet-400/35'
                    : '',
                ]"
                @click="pickDay(cell.day)"
              >
                {{ cell.day }}
              </button>
            </template>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 border-t border-white/10 px-3 py-2">
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs text-violet-300/90 transition-colors hover:bg-white/10"
            @click="clearPick"
          >
            清除
          </button>
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-medium text-violet-300 transition-colors
                   hover:bg-violet-500/25"
            @click="pickToday"
          >
            今天
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
