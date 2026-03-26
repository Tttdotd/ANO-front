import request from './request'

/** 创建产出物（触发任务状态 NOTED → DONE） */
export const createOutput = (data) =>
  request.post('/outputs', data)  // { taskId, platform, url }

/** 查看任务关联产出物 */
export const fetchOutput = (taskId) =>
  request.get('/outputs', { params: { taskId } })
