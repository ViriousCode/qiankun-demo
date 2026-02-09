import request from '@/utils/request'

// 登录接口
export const loginApi = (data: { username: string; password: string }) => {
  return request.post<{ token: string }>('/api/login', data)
}

// 获取用户信息接口
interface UserInfo { 
  userName: string; 
  roleId: string; 
  permissions: string[] 
}
export const getUserInfoApi = () => {
  return request.get<UserInfo>('/api/user/info')
}