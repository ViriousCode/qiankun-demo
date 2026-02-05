// main-app/src/utils/request.ts
import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
// 移除 errorHandler 引用，直接在这里处理简单错误即可
// import { errorHandler } from './errorHandler' 
import type { ApiResponse, RequestConfig } from './types'

class Request {
  private instance: AxiosInstance

  constructor(config: RequestConfig) {
    this.instance = axios.create({
      timeout: 10000,
      // 【关键修改 1】指向 Node 服务地址
      baseURL: import.meta.env.VITE_BASE_URL, 
      ...config
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 【关键修改 2】Token Key 统一为 'main-app-token'
        const token = localStorage.getItem('main-app-token')
        if (token && config.headers) {
          // 注意：Node 服务端如果只是简单取 header，可能不需要 Bearer 前缀
          // 但标准做法是加 Bearer，服务端需要对应解析 (req.headers['authorization'])
          // 这里我们直接传 token 字符串，方便演示
          config.headers.Authorization = token
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<any>) => {
        const { data } = response
        
        // 兼容处理：有些接口直接返回数据，有些返回 { code: 200, data: ... }
        if (data.code === 200) {
          return data.data 
        }

        // 业务错误
        const msg = data.msg || data.message || '请求失败'
        ElMessage.error(msg)
        return Promise.reject(new Error(msg))
      },
      (error) => {
        const msg = error.response?.data?.msg || error.message || '网络错误'
        ElMessage.error(msg)
        return Promise.reject(error)
      }
    )
  }

  // 方法封装
  public request<T = any>(config: RequestConfig): Promise<T> {
    return this.instance.request(config)
  }

  public get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request({ ...config, url, method: 'GET' })
  }

  public post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request({ ...config, url, data, method: 'POST' })
  }

  public put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request({ ...config, url, data, method: 'PUT' })
  }

  public delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request({ ...config, url, method: 'DELETE' })
  }
}

// 导出单例
export default new Request({})