import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/user';

const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_API, 
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
});

// 2. 请求拦截器：自动携带 Token
service.interceptors.request.use(
  (config) => {
    // 从 Pinia 中获取 Token（如果有）
    // 注意：这里需要确保 store 已经初始化
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers['Authorization'] = userStore.token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. 响应拦截器：解包数据 & 统一报错
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    
    // 假设后端返回结构为 { code: 200, data: ..., msg: ... }
    if (res.code === 200) {
      return res.data; // 直接返回 data，调用时不需要再 .data
    } else {
      // 业务错误处理（如 401 Token 失效）
      ElMessage.error(res.msg || '系统错误');
      return Promise.reject(new Error(res.msg || 'Error'));
    }
  },
  (error) => {
    console.error('Request Error:', error);
    ElMessage.error(error.message || '请求失败');
    return Promise.reject(error);
  }
);

export default service;