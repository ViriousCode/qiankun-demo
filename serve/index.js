const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors()); // 允许跨域（重要：主应用5173和子应用5179都要访问）
app.use(bodyParser.json());

// =======================
// 1. 模拟数据库 (内存数据)
// =======================

// --- 1.2 权限树定义 (Permission Tree) ---
// 用于“角色管理”中配置权限
// 结构：模块 -> 页面(菜单) -> 按钮
const PERMISSION_TREE = [
  // === 主应用权限 ===
  {
    id: 1, label: 'Dashboard', code: 'dashboard:view' // 既是菜单也是权限点
  },
  {
    id: 2, label: '系统管理', children: [
      {
        id: 21, label: '菜单管理', code: 'system:menu:list', children: [
          { id: 211, label: '新增菜单', code: 'system:menu:add' },
          { id: 212, label: '修改菜单', code: 'system:menu:edit' },
          { id: 213, label: '删除菜单', code: 'system:menu:remove' }
        ]
      },
      {
        id: 22, label: '角色管理', code: 'system:role:list', children: [
          { id: 221, label: '新增角色', code: 'system:role:add' },
          { id: 222, label: '修改角色', code: 'system:role:edit' },
          { id: 223, label: '删除角色', code: 'system:role:remove' }
        ]
      }
    ]
  },

  // === 子应用权限 (测试系统) ===
  {
    id: 3, label: '测试子应用', children: [
      {
        id: 31, label: '测试列表', code: 'sub:test:list', children: [
          { id: 311, label: '查看详情', code: 'sub:test:detail' },
          { id: 312, label: '新增测试', code: 'sub:test:add' },
          { id: 313, label: '修改测试', code: 'sub:test:edit' },
          { id: 314, label: '删除测试', code: 'sub:test:delete' }
        ]
      }
    ]
  }
];

let menuList = [
  // [主应用] Dashboard
  {
    id: 1,
    parentId: null,
    title: 'Dashboard',
    path: '/dashboard',
    icon: 'Odometer',
    sort: 1,
    permission: 'dashboard:view',
    type: 'menu',
    app: 'main'
  },
  // [主应用] 系统管理
  {
    id: 2,
    parentId: null,
    title: '系统管理',
    path: '/system',
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
        app: 'main'
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
        app: 'main'
      }
    ]
  },
  // [子应用] 测试系统
  {
    id: 3,
    parentId: null,
    title: '测试子应用',
    path: '/sub-app/test',
    icon: 'List',
    sort: 3,
    permission: 'sub:test:list',
    type: 'directory',
    app: 'test',
    children: [
      {
        id: 31,
        parentId: 3,
        title: '测试列表',
        path: '/sub-app/test/list',
        icon: 'List',
        sort: 1,
        permission: 'sub:test:list',
        type: 'menu',
        app: 'test'
      },
      {
        id: 32,
        parentId: 3,
        title: '测试详情',
        path: '/sub-app/test/detail',
        icon: 'InfoFilled',
        sort: 2,
        permission: 'sub:test:detail',
        type: 'menu',
        app: 'test'
      },
    ]
  }
];

// --- 1.3 权限映射表 (ID -> Code) ---
// 用于后端根据 role.permissionIds 快速计算 permissions 数组
const ID_TO_CODE_MAP = {
  // Dashboard
  1: 'dashboard:view',

  // 系统管理 - 菜单
  21: 'system:menu:list',
  211: 'system:menu:add',
  212: 'system:menu:edit',
  213: 'system:menu:remove',

  // 系统管理 - 角色
  22: 'system:role:list',
  221: 'system:role:add',
  222: 'system:role:edit',
  223: 'system:role:remove',

  // 测试子应用
  3: 'sub:test:app', // 对应菜单权限
  31: 'sub:test:list', // 对应列表页权限
  311: 'sub:test:detail',
  312: 'sub:test:add',
  313: 'sub:test:edit',
  314: 'sub:test:delete'
};

// 角色数据
let roles = [
  {
    id: 1,
    roleName: '超级管理员',
    roleKey: 'admin',
    description: '拥有所有权限',
    // 拥有所有权限 ID
    permissionIds: [
      1,
      2, 21, 211, 212, 213, 22, 221, 222, 223,
      3, 31, 311, 312, 313, 314
    ],
    createTime: '2023-01-01 12:00:00'
  },
  {
    id: 2,
    roleName: '普通用户',
    roleKey: 'common',
    description: '仅查看测试',
    permissionIds: [1, 2, 21, 22, 3, 31, 311], // 只有查看权限 + 首页
    createTime: '2023-01-02 12:00:00'
  }
];

// 用户数据
let users = [
  { id: 1, username: 'admin', password: '123', roleId: 1, token: 'token-admin-123' },
  { id: 2, username: 'user', password: '123', roleId: 2, token: 'token-user-123' }
];

// =======================
// 2. 辅助函数
// =======================

// 根据角色ID计算权限字符串数组
const getPermissionsByRoleId = (roleId) => {
  const role = roles.find(r => r.id === roleId);
  if (!role) return [];

  // 将 ID 映射为 Code (如 211 -> 'sub:role:add')
  return role.permissionIds
    .map(id => ID_TO_CODE_MAP[id])
    .filter(code => !!code); // 过滤掉没有对应code的节点（如目录节点）
};

// =======================
// 3. API 接口定义
// =======================

// --- 认证模块 ---

// 登录
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    res.json({
      code: 200,
      data: { token: user.token },
      msg: '登录成功'
    });
  } else {
    res.status(401).json({ code: 401, msg: '用户名或密码错误' });
  }
});

// 获取用户信息 (核心：动态返回权限)
app.get('/api/user/info', (req, res) => {
  const token = req.headers['authorization'];
  // 简单模拟 Token 校验
  const user = users.find(u => u.token === token);

  if (user) {
    const perms = getPermissionsByRoleId(user.roleId);
    res.json({
      code: 200,
      data: {
        userName: user.username,
        roleId: user.roleId,
        permissions: perms // <--- 动态计算出来的权限列表
      }
    });
  } else {
    res.status(401).json({ code: 401, msg: 'Token 无效' });
  }
});

// --- 角色/权限模块 ---

// 获取权限树 (供前端渲染 Tree)
app.get('/api/permissions/tree', (req, res) => {
  res.json({ code: 200, data: PERMISSION_TREE });
});

// 获取角色列表
app.get('/api/roles', (req, res) => {
  const list = roles.map(r => ({
    ...r,
    // 也可以返回 permissionIds 给前端回显
  }));
  res.json({ code: 200, data: { list, total: list.length } });
});

// 新增角色
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

// 修改角色 (包含修改权限)
app.put('/api/roles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { roleName, roleKey, description, permissionIds } = req.body;

  const idx = roles.findIndex(r => r.id === id);
  if (idx !== -1) {
    roles[idx] = {
      ...roles[idx],
      roleName,
      roleKey,
      description,
      permissionIds: permissionIds // 更新权限关联
    };
    res.json({ code: 200, msg: '修改成功' });
  } else {
    res.status(404).json({ code: 404, msg: '角色不存在' });
  }
});

// 删除角色
app.delete('/api/roles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  roles = roles.filter(r => r.id !== id);
  res.json({ code: 200, msg: '删除成功' });
});

// --- 菜单管理接口 ---
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
// 获取菜单列表
app.get('/api/menus', (req, res) => {
  res.json({
    code: 200,
    data: menuList,
    msg: 'success'
  });
});

// 新增菜单
app.post('/api/menus', (req, res) => {
  const newMenu = {
    id: Date.now(), // 简易ID生成
    children: [],
    ...req.body
  };

  if (newMenu.parentId) {
    // 查找父节点并插入 (这里简化处理，只查找了一级，实际应递归查找)
    const parent = findMenuById(menuList, newMenu.parentId);
    if (parent) {
      if (!parent.children) parent.children = [];
      parent.children.push(newMenu);
    } else {
      // 如果找不到父节点，作为根节点（简化逻辑）
      menuList.push(newMenu);
    }
  } else {
    menuList.push(newMenu);
  }

  res.json({ code: 200, data: newMenu, msg: '添加成功' });
});

// 更新菜单
const removeMenuById = (list, id) => {
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (item.id === id) {
      // 找到并移除
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
app.put('/api/menus/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const body = req.body;
  
  // 1. 先找到目标节点
  const targetNode = findMenuById(menuList, id);
  if (!targetNode) {
    return res.status(404).json({ code: 404, msg: '菜单不存在' });
  }

  // 2. 判断是否需要移动位置 (改变了 parentId)
  // 注意：前端传来的 null 和 undefined 需要处理一致
  const newParentId = body.parentId === undefined ? targetNode.parentId : body.parentId;
  const isMove = newParentId !== targetNode.parentId;

  if (isMove) {
    // === 执行移动逻辑 ===
    
    // A. 从原位置移除
    removeMenuById(menuList, id);

    // B. 插入到新位置
    if (newParentId) {
      // 找到新父节点
      const newParent = findMenuById(menuList, newParentId);
      if (newParent) {
        if (!newParent.children) newParent.children = [];
        newParent.children.push(targetNode);
      } else {
        // 如果新父节点找不到（异常情况），默认放回根目录
        menuList.push(targetNode);
      }
    } else {
      // 移到根目录
      menuList.push(targetNode);
    }
  }

  // 3. 更新属性
  Object.assign(targetNode, body);
  
  res.json({ code: 200, msg: '更新成功' });
});

// 删除菜单
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

// 启动服务
app.listen(PORT, () => {
  console.log(`Node.js 权限服务已启动: http://localhost:${PORT}`);
});