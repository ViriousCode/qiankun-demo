import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { errorHandler } from './errorHandler'
import type { ApiResponse, RequestConfig } from './types'

class Request {
  private instance: AxiosInstance

  constructor(config: RequestConfig) {
    this.instance = axios.create({
      timeout: 10000,
      baseURL: import.meta.env.VITE_API_BASE,
      ...config
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // 请求拦截器 - 添加 token
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器 - 统一错误处理
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { data } = response
        
        // 业务成功（code === 0 或 200，根据后端约定调整）
        if (data.code === 0 || data.code === 200) {
          return data.data // 直接返回业务数据
        }

        // 业务错误 - 抛出异常，由错误拦截器处理
        const error = new Error(data.message) as any
        error.response = { data }
        error.isBusinessError = true
        return Promise.reject(error)
      },
      (error) => {
        // 网络错误或 HTTP 错误
        errorHandler.handle(error, error.config || {})
        return Promise.reject(error)
      }
    )
  }

  // 核心请求方法
  public request<T = any>(config: RequestConfig): Promise<T> {
    return this.instance.request(config)
  }

  // 快捷方法
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

// 创建默认实例
const request = new Request({})

export default request