const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// =======================
// 1. 模拟数据库 (内存数据)
// =======================

// --- 子应用列表数据 ---
// name, entry, activeRule不能重复
let appList = [
  {
    id: 1,
    name: 'test',
    entry: '//localhost:5179',
    activeRule: '/test-sub-app',
    container: '#sub-app-container',
    createTime: '2023-01-01 12:00:00'
  }
];

// --- 统一的菜单与权限数据 ---
// 包含：目录(directory) -> 菜单(menu) -> 按钮(button)
let menuList = [
  // [主应用] Dashboard
  {
    id: -1,
    parentId: null,
    title: '主应用',
    path: '',
    icon: 'PriceTag',
    sort: 0,
    permission: 'admin',
    type: 'directory', // 这是一个目录，里面有子菜单
    app: 'main',
    children: [
      {
        id: 1,
        parentId: null,
        title: 'Dashboard',
        path: '/dashboard',
        icon: 'Odometer',
        sort: 1,
        permission: 'dashboard:view',
        type: 'menu',
        app: 'main',
        children: [] // 无按钮
      },
      // [主应用] 系统管理
      {
        id: 2,
        parentId: null,
        title: '系统管理',
        path: '',
        icon: 'Setting',
        sort: 99,
        permission: 'system:view',
        type: 'directory',
        app: 'main',
        children: [
          {
            id: 21,
            parentId: 2,
            title: '菜单管理',
            path: '/system/menu',
            icon: 'Menu',
            sort: 1,
            permission: 'system:menu:list',
            type: 'menu',
            app: 'main',
            children: [
              // 按钮级权限
              { id: 211, parentId: 21, title: '新增菜单', permission: 'system:menu:add', type: 'button', app: 'main' },
              { id: 212, parentId: 21, title: '修改菜单', permission: 'system:menu:edit', type: 'button', app: 'main' },
              { id: 213, parentId: 21, title: '删除菜单', permission: 'system:menu:remove', type: 'button', app: 'main' }
            ]
          },
          {
            id: 22,
            parentId: 2,
            title: '角色管理',
            path: '/system/role',
            icon: 'UserFilled',
            sort: 2,
            permission: 'system:role:list',
            type: 'menu',
            app: 'main',
            children: [
              { id: 221, parentId: 22, title: '新增角色', permission: 'system:role:add', type: 'button', app: 'main' },
              { id: 222, parentId: 22, title: '修改角色', permission: 'system:role:edit', type: 'button', app: 'main' },
              { id: 223, parentId: 22, title: '删除角色', permission: 'system:role:remove', type: 'button', app: 'main' }
            ]
          },
          {
            id: 23,
            parentId: 2,
            title: '应用管理',
            path: '/system/app',
            icon: 'Monitor',
            sort: 3,
            permission: 'system:app:list',
            type: 'menu',
            app: 'main',
            children: [
              { id: 231, parentId: 23, title: '新增应用', permission: 'system:app:add', type: 'button', app: 'main' },
              { id: 232, parentId: 23, title: '编辑应用', permission: 'system:app:edit', type: 'button', app: 'main' },
              { id: 233, parentId: 23, title: '删除应用', permission: 'system:app:remove', type: 'button', app: 'main' }
            ]
          },
          {
            id: 24,
            parentId: 2,
            title: '工作台管理',
            path: '/system/workbench',
            icon: 'Monitor',
            sort: 0,
            permission: 'system:workbench:list',
            type: 'menu',
            app: 'main',
            children: [
              { id: 241, parentId: 24, title: '新增工作台', permission: 'system:workbench:add', type: 'button', app: 'main' },
              { id: 242, parentId: 24, title: '编辑工作台', permission: 'system:workbench:edit', type: 'button', app: 'main' },
              { id: 243, parentId: 24, title: '删除工作台', permission: 'system:workbench:remove', type: 'button', app: 'main' }
            ]
          }
        ]
      },
    ]
  },
  // [子应用] 测试系统
  {
    id: 3,
    parentId: null,
    title: '测试子应用',
    path: '',
    icon: 'List',
    sort: 3,
    permission: 'sub:test:list',
    type: 'directory', // 这是一个目录，里面有子菜单
    app: 'test',
    children: [
      {
        id: 31,
        parentId: 3,
        title: '测试列表',
        path: '/test/list',
        icon: 'List',
        sort: 1,
        permission: 'sub:test:list',
        type: 'menu',
        app: 'test',
        children: [
          { id: 311, parentId: 31, title: '查看详情', permission: 'sub:test:detail', type: 'button', app: 'test' },
          { id: 312, parentId: 31, title: '新增测试', permission: 'sub:test:add', type: 'button', app: 'test' },
          { id: 313, parentId: 31, title: '修改测试', permission: 'sub:test:edit', type: 'button', app: 'test' },
          { id: 314, parentId: 31, title: '删除测试', permission: 'sub:test:delete', type: 'button', app: 'test' },
          { id: 315, parentId: 31, title: '测试导入', permission: 'sub:test:import', type: 'button', app: 'test' },
          { id: 316, parentId: 31, title: '删除导出', permission: 'sub:test:export', type: 'button', app: 'test' },
        ]
      },
      {
        id: 32,
        parentId: 3,
        title: '测试详情',
        path: '/test/detail',
        icon: 'InfoFilled',
        sort: 2,
        permission: 'sub:test:detail',
        type: 'menu',
        app: 'test'
      },
    ]
  }
];

// 角色数据
let roles = [
  {
    id: 1,
    roleName: '超级管理员',
    roleKey: 'admin',
    description: '拥有所有权限',
    // 权限ID列表 (对应 menuList 中的 id)
    permissionIds: [
      -1,
      1,
      2, 21, 211, 212, 213, 22, 221, 222, 223, 23, 231, 232, 233, 24, 241, 242, 243,
      3, 31, 311, 312, 313, 314, 315, 316, 32
    ],
    createTime: '2023-01-01 12:00:00'
  },
  {
    id: 2,
    roleName: '普通用户',
    roleKey: 'common',
    description: '仅查看测试',
    // 只有查看权限
    permissionIds: [1, 3, 31, 311, 32],
    createTime: '2023-01-02 12:00:00'
  }
];

// 用户数据
let users = [
  { id: 1, username: 'admin', password: '123', roleId: 1, roleKey: 'admin', token: 'token-admin-123' },
  { id: 2, username: 'user', password: '123', roleId: 2, token: 'token-user-123' }
];

// =======================
// 2. 辅助函数
// =======================

// [核心] 动态生成 ID -> Permission Code 的映射
// 这样不需要手动维护 ID_TO_CODE_MAP
const generateIdToCodeMap = (menus) => {
  let map = {};
  const traverse = (list) => {
    list.forEach(item => {
      if (item.id && item.permission) {
        map[item.id] = item.permission;
      }
      if (item.children && item.children.length > 0) {
        traverse(item.children);
      }
    });
  };
  traverse(menus);
  return map;
};

const sortMenus = (list) => {
  // 1. 对当前层级进行排序 (升序: sort 小的在前)
  list.sort((a, b) => (a.sort || 0) - (b.sort || 0));

  // 2. 递归对子节点进行排序
  list.forEach(item => {
    if (item.children && item.children.length > 0) {
      sortMenus(item.children);
    }
  });

  return list;
};

// 根据角色ID计算权限字符串数组
const getPermissionsByRoleId = (roleId) => {
  const role = roles.find(r => r.id === roleId);
  if (!role) return [];

  // 1. 动态生成映射表 (实际项目中可缓存)
  const idToCodeMap = generateIdToCodeMap(menuList);

  // 2. 映射 ID 为 Code
  return role.permissionIds
    .map(id => idToCodeMap[id])
    .filter(code => !!code);
};

// 递归查找菜单节点
const findMenuById = (list, id) => {
  for (const item of list) {
    if (item.id === id) {
      return item;
    }
    if (item.children && item.children.length > 0) {
      const found = findMenuById(item.children, id);
      if (found) return found;
    }
  }
  return null;
};

// 递归移除菜单节点
const removeMenuById = (list, id) => {
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (item.id === id) {
      list.splice(i, 1);
      return item;
    }
    if (item.children && item.children.length > 0) {
      const removed = removeMenuById(item.children, id);
      if (removed) return removed;
    }
  }
  return null;
};

// =======================
// 3. API 接口定义
// =======================

// --- 认证模块 ---

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    res.json({ code: 200, data: { token: user.token }, msg: '登录成功' });
  } else {
    res.status(401).json({ code: 401, msg: '用户名或密码错误' });
  }
});

app.get('/api/user/info', (req, res) => {
  const token = req.headers['authorization'];
  const user = users.find(u => u.token === token);
  if (user) {
    const perms = getPermissionsByRoleId(user.roleId);
    res.json({
      code: 200,
      data: {
        userName: user.username,
        roleId: user.roleId,
        roleKey: user ? user.roleKey : '',
        permissions: perms
      }
    });
  } else {
    res.status(401).json({ code: 401, msg: 'Token 无效' });
  }
});

// --- 角色/权限模块 ---

// [修改] 获取权限树：现在直接返回 menuList
// 这样角色授权时看到的树结构，和菜单管理里配置的结构完全一致
app.get('/api/permissions/tree', (req, res) => {
  const sortedList = sortMenus([...menuList]);
  res.json({ code: 200, data: sortedList });
});

app.get('/api/roles', (req, res) => {
  const list = roles.map(r => ({ ...r }));
  res.json({ code: 200, data: { list, total: list.length } });
});

app.post('/api/roles', (req, res) => {
  const { roleName, roleKey, description, permissionIds } = req.body;
  const newRole = {
    id: roles.length > 0 ? roles[roles.length - 1].id + 1 : 1,
    roleName,
    roleKey,
    description,
    permissionIds: permissionIds || [],
    createTime: new Date().toLocaleString()
  };
  roles.push(newRole);
  res.json({ code: 200, msg: '新增成功' });
});

app.put('/api/roles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { roleName, roleKey, description, permissionIds } = req.body;
  const idx = roles.findIndex(r => r.id === id);
  if (idx !== -1) {
    roles[idx] = { ...roles[idx], roleName, roleKey, description, permissionIds };
    res.json({ code: 200, msg: '修改成功' });
  } else {
    res.status(404).json({ code: 404, msg: '角色不存在' });
  }
});

app.delete('/api/roles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  roles = roles.filter(r => r.id !== id);
  res.json({ code: 200, msg: '删除成功' });
});

// --- 菜单管理接口 ---

app.get('/api/menus', (req, res) => {
  // 注意：这里返回了包含按钮的全量树
  // 前端 Sidebar 组件如果不想显示按钮，需要根据 type !== 'button' 进行过滤
  const sortedList = sortMenus(menuList);

  res.json({
    code: 200,
    data: sortedList,
    msg: 'success'
  });
});

app.post('/api/menus', (req, res) => {
  const newMenu = {
    id: Date.now(),
    children: [],
    ...req.body
  };
  if (newMenu.parentId) {
    const parent = findMenuById(menuList, newMenu.parentId);
    if (parent) {
      if (!parent.children) parent.children = [];
      parent.children.push(newMenu);
    } else {
      menuList.push(newMenu);
    }
  } else {
    menuList.push(newMenu);
  }
  res.json({ code: 200, data: newMenu, msg: '添加成功' });
});

app.put('/api/menus/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const body = req.body;
  const targetNode = findMenuById(menuList, id);
  if (!targetNode) return res.status(404).json({ code: 404, msg: '菜单不存在' });

  const newParentId = body.parentId === undefined ? targetNode.parentId : body.parentId;
  const isMove = newParentId !== targetNode.parentId;

  if (isMove) {
    removeMenuById(menuList, id);
    if (newParentId) {
      const newParent = findMenuById(menuList, newParentId);
      if (newParent) {
        if (!newParent.children) newParent.children = [];
        newParent.children.push(targetNode);
      } else {
        menuList.push(targetNode);
      }
    } else {
      menuList.push(targetNode);
    }
  }
  Object.assign(targetNode, body);
  res.json({ code: 200, msg: '更新成功' });
});

app.delete('/api/menus/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const deleteNode = (list) => {
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      list.splice(index, 1);
      return true;
    }
    for (let item of list) {
      if (item.children && deleteNode(item.children)) return true;
    }
    return false;
  };
  deleteNode(menuList);
  res.json({ code: 200, msg: '删除成功' });
});

// --- 应用管理接口 ---
app.get('/api/apps', (req, res) => {
  res.json({ code: 200, data: appList, msg: 'success' });
});
app.post('/api/apps', (req, res) => {
  const newApp = { id: Date.now(), createTime: new Date().toLocaleString(), ...req.body };
  appList.push(newApp);
  res.json({ code: 200, msg: '新增成功' });
});
app.put('/api/apps/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = appList.findIndex(item => item.id === id);
  if (idx !== -1) {
    appList[idx] = { ...appList[idx], ...req.body };
    res.json({ code: 200, msg: '修改成功' });
  } else {
    res.status(404).json({ code: 404, msg: '应用不存在' });
  }
});
app.delete('/api/apps/:id', (req, res) => {
  const id = parseInt(req.params.id);
  appList = appList.filter(item => item.id !== id);
  res.json({ code: 200, msg: '删除成功' });
});

app.listen(PORT, () => {
  console.log(`Node.js 权限服务已启动: http://localhost:${PORT}`);
});