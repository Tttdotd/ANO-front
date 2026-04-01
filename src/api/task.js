import request from './request'

/** 查询任务列表（可选 date、state 等 query，与后端 GET /tasks 一致） */
export const fetchTasks = (params = {}) =>
  request.get('/tasks', { params })

/** 创建任务 */
export const createTask = (data) =>
  request.post('/tasks', data)  // { title, description }

/** 修改任务标题与描述（已归档不可调用） */
export const updateTask = (data) =>
  request.patch('/tasks', data)  // { id, title, description }

/** 任务归档 → ARCHIVED */
export const archiveTask = (data) =>
  request.put('/tasks', data)  // { id }
