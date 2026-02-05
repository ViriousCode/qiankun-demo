import request from '@/utils/request'

// 登录接口
export const loginApi = (data: { username: string; password: string }) => {
  return request.post<{ token: string }>('/api/login', data)
}

// 获取用户信息接口
export const getUserInfoApi = () => {
  return request.get<{ 
    userName: string; 
    roleId: string; 
    permissions: string[] 
  }>('/api/user/info')
}