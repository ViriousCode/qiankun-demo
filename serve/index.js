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

// 权限定义 (菜单 + 按钮)
// 这里定义了 ID 和 权限标识(code) 的对应关系
const PERMISSION_TREE = [
  {
    id: 1, label: '订单系统', children: [
      { id: 11, label: '订单列表', children: [
        { id: 111, label: '查看列表', code: 'sub:order:list' },
        { id: 112, label: '新增订单', code: 'sub:order:add' },
        { id: 113, label: '编辑订单', code: 'sub:order:edit' },
        { id: 114, label: '删除订单', code: 'sub:order:delete' }
      ]},
      { id: 12, label: '订单详情', code: 'sub:order:detail' } // 既是菜单也是权限点
    ]
  },
  {
    id: 2, label: '系统管理', children: [
      { id: 21, label: '角色管理', code: 'sub:role:list', children: [
        { id: 211, label: '新增角色', code: 'sub:role:add' },
        { id: 212, label: '编辑角色', code: 'sub:role:edit' },
        { id: 213, label: '删除角色', code: 'sub:role:delete' }
      ]}
    ]
  },
  {
    id: 99, label: '主应用', children: [
       { id: 991, label: '控制台访问', code: 'main:dashboard' }
    ]
  }
];

// 扁平化映射表 (ID -> Code)，用于快速查找
// 实际开发中可以通过递归 PERMISSION_TREE 生成
const ID_TO_CODE_MAP = {
  111: 'sub:order:list',
  112: 'sub:order:add',
  113: 'sub:order:edit',
  114: 'sub:order:delete',
  12:  'sub:order:detail',
  21:  'sub:role:list',
  211: 'sub:role:add',
  212: 'sub:role:edit',
  213: 'sub:role:delete',
  991: 'main:dashboard'
};

// 角色数据
let roles = [
  { 
    id: 1, 
    roleName: '超级管理员', 
    roleKey: 'admin', 
    description: '全权', 
    // 拥有所有权限 ID
    permissionIds: [111, 112, 113, 114, 12, 21, 211, 212, 213, 991],
    createTime: '2023-01-01 12:00:00' 
  },
  { 
    id: 2, 
    roleName: '普通用户', 
    roleKey: 'common', 
    description: '仅查看订单', 
    permissionIds: [111, 12, 991], // 只有查看权限 + 首页
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
    console.log(`角色 [${id}] 权限已更新为:`, permissionIds);
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

// 启动服务
app.listen(PORT, () => {
  console.log(`Node.js 权限服务已启动: http://localhost:${PORT}`);
});