import request from './request'

/** 为任务创建笔记（触发任务状态 TODO → DOING） */
export const createNote = (taskId) =>
  request.post('/notes', { task_id: taskId })

/** 查看任务关联笔记 */
export const fetchNote = (taskId) =>
  request.get('/notes', { params: { task_id: taskId } })

/** 更新笔记内容和状态（state=1 时触发任务状态 DOING → NOTED） */
export const updateNote = (data) =>
  request.put('/notes', data)  // { id, content, state }
