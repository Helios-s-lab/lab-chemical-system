import axios from 'axios'

const request = axios.create({
  baseURL: '/api',          // 线上环境无需写域名
  timeout: 10000
})

request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default request