import axios from 'axios'

const request = axios.create({
  // 使用相对路径，请求经 Vite dev server 代理转发至后端，避免浏览器 CORS 拦截
  baseURL: '/api/v1',
  timeout: 10000,
})

export default request
