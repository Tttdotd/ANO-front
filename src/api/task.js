import request from './request'

/** 查询任务列表，按日期过滤 */
export const fetchTasks = (date) =>
  request.get('/tasks', { params: { date } })

/** 创建任务 */
export const createTask = (data) =>
  request.post('/tasks', data)  // { title, description }
