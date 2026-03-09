import request from '@/utils/request';

export interface Menu {
  id?: number;
  parentId?: number | null;
  title: string;
  path: string;
  icon?: string;
  sort?: number;
  permission?: string;
  type?: 'directory' | 'menu' | 'button';
  app?: string;
  name?: string;
  menuName?: string;
  disabled?: boolean;
  children?: Menu[];
}

// 获取菜单列表
export const getMenuList = () => {
  return request.get<Menu[]>('/api/menus');
};

// 新增菜单
export const addMenu = (data: Menu) => {
  return request.post<Menu>('/api/menus', data);
};

// 更新菜单
export const updateMenu = (id: number, data: Menu) => {
  return request.put<any>(`/api/menus/${id}`, data);
};

// 删除菜单
export const deleteMenu = (id: number) => {
  return request.delete<any>(`/api/menus/${id}`);
};
