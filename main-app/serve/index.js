const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use("/uploads", express.static(uploadsDir));

// =======================
// 1. 模拟数据库 (内存数据)
// =======================

// --- 子应用列表数据 ---
// name, entry, activeRule不能重复
let appList = [
  {
    id: 1,
    name: "test",
    entry: "//localhost:5179",
    activeRule: "/test-sub-app",
    container: "#sub-app-container",
    createTime: "2023-01-01 12:00:00",
  },
];

// --- 工作台数据 ---
// 包含跳转类型 targetType (internal/external) 和 路径 path
let workbenchList = [
  {
    id: 1,
    title: "测试列表",
    icon: "List",
    targetType: "internal",
    path: "/test-sub-app/test/list",
    category: "业务系统", // 🚨 新增
    description: "进入子应用功能",
    sort: 1,
  },
  {
    id: 2,
    title: "Vue 官方文档",
    icon: "Link",
    targetType: "external",
    path: "https://cn.vuejs.org",
    category: "开发文档", // 🚨 新增
    description: "新窗口打开官方文档",
    sort: 2,
  },
];

// --- 统一的菜单与权限数据 ---
// 包含：目录(directory) -> 菜单(menu) -> 按钮(button)
let menuList = [
  // [主应用] Dashboard
  {
    id: -1,
    parentId: null,
    title: "主应用",
    path: "",
    icon: "PriceTag",
    sort: 0,
    permission: "admin",
    type: "directory", // 这是一个目录，里面有子菜单
    app: "main",
    children: [
      {
        id: 1,
        parentId: null,
        title: "Dashboard",
        path: "/dashboard",
        icon: "Odometer",
        sort: 1,
        permission: "dashboard:view",
        type: "menu",
        app: "main",
        children: [], // 无按钮
      },
      // [主应用] 系统管理
      {
        id: 2,
        parentId: null,
        title: "系统管理",
        path: "",
        icon: "Setting",
        sort: 99,
        permission: "system:view",
        type: "directory",
        app: "main",
        children: [
          {
            id: 21,
            parentId: 2,
            title: "菜单管理",
            path: "/system/menu",
            icon: "Menu",
            sort: 1,
            permission: "system:menu:list",
            type: "menu",
            app: "main",
            children: [
              // 按钮级权限
              {
                id: 211,
                parentId: 21,
                title: "新增菜单",
                permission: "system:menu:add",
                type: "button",
                app: "main",
              },
              {
                id: 212,
                parentId: 21,
                title: "修改菜单",
                permission: "system:menu:edit",
                type: "button",
                app: "main",
              },
              {
                id: 213,
                parentId: 21,
                title: "删除菜单",
                permission: "system:menu:remove",
                type: "button",
                app: "main",
              },
            ],
          },
          {
            id: 22,
            parentId: 2,
            title: "角色管理",
            path: "/system/role",
            icon: "UserFilled",
            sort: 2,
            permission: "system:role:list",
            type: "menu",
            app: "main",
            children: [
              {
                id: 221,
                parentId: 22,
                title: "新增角色",
                permission: "system:role:add",
                type: "button",
                app: "main",
              },
              {
                id: 222,
                parentId: 22,
                title: "修改角色",
                permission: "system:role:edit",
                type: "button",
                app: "main",
              },
              {
                id: 223,
                parentId: 22,
                title: "删除角色",
                permission: "system:role:remove",
                type: "button",
                app: "main",
              },
            ],
          },
          {
            id: 23,
            parentId: 2,
            title: "应用管理",
            path: "/system/app",
            icon: "Monitor",
            sort: 3,
            permission: "system:app:list",
            type: "menu",
            app: "main",
            children: [
              {
                id: 231,
                parentId: 23,
                title: "新增应用",
                permission: "system:app:add",
                type: "button",
                app: "main",
              },
              {
                id: 232,
                parentId: 23,
                title: "编辑应用",
                permission: "system:app:edit",
                type: "button",
                app: "main",
              },
              {
                id: 233,
                parentId: 23,
                title: "删除应用",
                permission: "system:app:remove",
                type: "button",
                app: "main",
              },
            ],
          },
          {
            id: 24,
            parentId: 2,
            title: "工作台管理",
            path: "/system/workbench",
            icon: "Monitor",
            sort: 0,
            permission: "system:workbench:list",
            type: "menu",
            app: "main",
            children: [
              {
                id: 241,
                parentId: 24,
                title: "新增工作台",
                permission: "system:workbench:add",
                type: "button",
                app: "main",
              },
              {
                id: 242,
                parentId: 24,
                title: "编辑工作台",
                permission: "system:workbench:edit",
                type: "button",
                app: "main",
              },
              {
                id: 243,
                parentId: 24,
                title: "删除工作台",
                permission: "system:workbench:remove",
                type: "button",
                app: "main",
              },
            ],
          },
          {
            id: 25,
            parentId: 2,
            title: "系统设置",
            permission: "system:setting:list",
            path: "/system/setting",
            icon: "Setting",
            type: "menu",
            app: "main",
            children: [
              {
                id: 251,
                parentId: 25,
                title: "基础设置",
                path: "/system/settings/config",
                icon: "Operation",
                sort: 1,
                permission: "system:config:view",
                type: "menu",
                app: "main",
                children: [
                  { id: 2511, parentId: 251, title: "保存基础设置", permission: "system:config:edit", type: "button", app: "main" }
                ]
              },
              {
                id: 252,
                parentId: 25,
                title: "系统字典",
                path: "/system/settings/dict",
                icon: "Collection",
                sort: 2,
                permission: "system:dict:list",
                type: "menu",
                app: "main",
                children: [
                  { id: 2521, parentId: 252, title: "新增字典", permission: "system:dict:add", type: "button", app: "main" },
                  { id: 2522, parentId: 252, title: "修改字典", permission: "system:dict:edit", type: "button", app: "main" },
                  { id: 2523, parentId: 252, title: "删除字典", permission: "system:dict:remove", type: "button", app: "main" }
                ]
              },
              {
                id: 253,
                parentId: 25,
                title: "故障码管理",
                path: "/system/settings/daultDict",
                icon: "Warning",
                sort: 3,
                permission: "system:fault:list",
                type: "menu",
                app: "main",
                children: [
                  { id: 2531, parentId: 253, title: "新增故障码", permission: "system:fault:add", type: "button", app: "main" },
                  { id: 2532, parentId: 253, title: "修改故障码", permission: "system:fault:edit", type: "button", app: "main" },
                  { id: 2533, parentId: 253, title: "删除故障码", permission: "system:fault:remove", type: "button", app: "main" }
                ]
              }
            ]
          }
        ],
      },
    ],
  },
  // [子应用] 测试系统
  {
    id: 3,
    parentId: null,
    title: "测试子应用",
    path: "",
    icon: "List",
    sort: 3,
    permission: "sub:test:list",
    type: "directory", // 这是一个目录，里面有子菜单
    app: "test",
    children: [
      {
        id: 31,
        parentId: 3,
        title: "测试列表",
        path: "/test/list",
        icon: "List",
        sort: 1,
        permission: "sub:test:list",
        type: "menu",
        app: "test",
        children: [
          {
            id: 311,
            parentId: 31,
            title: "查看详情",
            permission: "sub:test:detail",
            type: "button",
            app: "test",
          },
          {
            id: 312,
            parentId: 31,
            title: "新增测试",
            permission: "sub:test:add",
            type: "button",
            app: "test",
          },
          {
            id: 313,
            parentId: 31,
            title: "修改测试",
            permission: "sub:test:edit",
            type: "button",
            app: "test",
          },
          {
            id: 314,
            parentId: 31,
            title: "删除测试",
            permission: "sub:test:delete",
            type: "button",
            app: "test",
          },
          {
            id: 315,
            parentId: 31,
            title: "测试导入",
            permission: "sub:test:import",
            type: "button",
            app: "test",
          },
          {
            id: 316,
            parentId: 31,
            title: "删除导出",
            permission: "sub:test:export",
            type: "button",
            app: "test",
          },
        ],
      },
      {
        id: 32,
        parentId: 3,
        title: "测试详情",
        path: "/test/detail",
        icon: "InfoFilled",
        sort: 2,
        permission: "sub:test:detail",
        type: "menu",
        app: "test",
      },
    ],
  },
];

// 角色数据
let roles = [
  {
    id: 1,
    roleName: "超级管理员",
    roleKey: "admin",
    description: "拥有所有权限",
    // 权限ID列表 (对应 menuList 中的 id)
    permissionIds: [
      -1, 1, 2, 21, 211, 212, 213, 22, 221, 222, 223, 23, 231, 232, 233, 24,
      241, 242, 243, 25, 251, 2511, 252, 2521, 2522, 2523, 253, 2531, 2532, 2533, 3, 31, 311, 312, 313, 314, 315, 316, 32,
    ],
    createTime: "2023-01-01 12:00:00",
  },
  {
    id: 2,
    roleName: "普通用户",
    roleKey: "common",
    description: "仅查看测试",
    // 只有查看权限
    permissionIds: [1, 3, 31, 311, 32],
    createTime: "2023-01-02 12:00:00",
  },
];

// 用户数据
let users = [
  {
    id: 1,
    username: "admin",
    password: "123",
    roleId: 1,
    roleKey: "admin",
    token: "token-admin-123",
  },
  {
    id: 2,
    username: "user",
    password: "123",
    roleId: 2,
    token: "token-user-123",
  },
];

// =======================
// 2. 辅助函数
// =======================

// [核心] 动态生成 ID -> Permission Code 的映射
// 这样不需要手动维护 ID_TO_CODE_MAP
const generateIdToCodeMap = (menus) => {
  let map = {};
  const traverse = (list) => {
    list.forEach((item) => {
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
  list.forEach((item) => {
    if (item.children && item.children.length > 0) {
      sortMenus(item.children);
    }
  });

  return list;
};

// 根据角色ID计算权限字符串数组
const getPermissionsByRoleId = (roleId) => {
  const role = roles.find((r) => r.id === roleId);
  if (!role) return [];

  // 1. 动态生成映射表 (实际项目中可缓存)
  const idToCodeMap = generateIdToCodeMap(menuList);

  // 2. 映射 ID 为 Code
  return role.permissionIds
    .map((id) => idToCodeMap[id])
    .filter((code) => !!code);
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

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password,
  );
  if (user) {
    res.json({ code: 200, data: { token: user.token }, msg: "登录成功" });
  } else {
    res.status(401).json({ code: 401, msg: "用户名或密码错误" });
  }
});

app.get("/api/user/info", (req, res) => {
  const token = req.headers["authorization"];
  const user = users.find((u) => u.token === token);
  if (user) {
    const perms = getPermissionsByRoleId(user.roleId);
    res.json({
      code: 200,
      data: {
        userName: user.username,
        roleId: user.roleId,
        roleKey: user ? user.roleKey : "",
        permissions: perms,
      },
    });
  } else {
    res.status(401).json({ code: 401, msg: "Token 无效" });
  }
});

// --- 角色/权限模块 ---

// [修改] 获取权限树：现在直接返回 menuList
// 这样角色授权时看到的树结构，和菜单管理里配置的结构完全一致
app.get("/api/permissions/tree", (req, res) => {
  const sortedList = sortMenus([...menuList]);
  res.json({ code: 200, data: sortedList });
});

app.get("/api/roles", (req, res) => {
  const list = roles.map((r) => ({ ...r }));
  res.json({ code: 200, data: { list, total: list.length } });
});

app.post("/api/roles", (req, res) => {
  const { roleName, roleKey, description, permissionIds } = req.body;
  const newRole = {
    id: roles.length > 0 ? roles[roles.length - 1].id + 1 : 1,
    roleName,
    roleKey,
    description,
    permissionIds: permissionIds || [],
    createTime: new Date().toLocaleString(),
  };
  roles.push(newRole);
  res.json({ code: 200, msg: "新增成功" });
});

app.put("/api/roles/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { roleName, roleKey, description, permissionIds } = req.body;
  const idx = roles.findIndex((r) => r.id === id);
  if (idx !== -1) {
    roles[idx] = {
      ...roles[idx],
      roleName,
      roleKey,
      description,
      permissionIds,
    };
    res.json({ code: 200, msg: "修改成功" });
  } else {
    res.status(404).json({ code: 404, msg: "角色不存在" });
  }
});

app.delete("/api/roles/:id", (req, res) => {
  const id = parseInt(req.params.id);
  roles = roles.filter((r) => r.id !== id);
  res.json({ code: 200, msg: "删除成功" });
});

// --- 菜单管理接口 ---

app.get("/api/menus", (req, res) => {
  // 注意：这里返回了包含按钮的全量树
  // 前端 Sidebar 组件如果不想显示按钮，需要根据 type !== 'button' 进行过滤
  const sortedList = sortMenus(menuList);

  res.json({
    code: 200,
    data: sortedList,
    msg: "success",
  });
});

app.post("/api/menus", (req, res) => {
  const newMenu = {
    id: Date.now(),
    children: [],
    ...req.body,
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
  res.json({ code: 200, data: newMenu, msg: "添加成功" });
});

app.put("/api/menus/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const body = req.body;
  const targetNode = findMenuById(menuList, id);
  if (!targetNode)
    return res.status(404).json({ code: 404, msg: "菜单不存在" });

  const newParentId =
    body.parentId === undefined ? targetNode.parentId : body.parentId;
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
  res.json({ code: 200, msg: "更新成功" });
});

app.delete("/api/menus/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const deleteNode = (list) => {
    const index = list.findIndex((item) => item.id === id);
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
  res.json({ code: 200, msg: "删除成功" });
});

// --- 应用管理接口 ---
app.get("/api/apps", (req, res) => {
  res.json({ code: 200, data: appList, msg: "success" });
});
app.post("/api/apps", (req, res) => {
  const newApp = {
    id: Date.now(),
    createTime: new Date().toLocaleString(),
    ...req.body,
  };
  appList.push(newApp);
  res.json({ code: 200, msg: "新增成功" });
});
app.put("/api/apps/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const idx = appList.findIndex((item) => item.id === id);
  if (idx !== -1) {
    appList[idx] = { ...appList[idx], ...req.body };
    res.json({ code: 200, msg: "修改成功" });
  } else {
    res.status(404).json({ code: 404, msg: "应用不存在" });
  }
});
app.delete("/api/apps/:id", (req, res) => {
  const id = parseInt(req.params.id);
  appList = appList.filter((item) => item.id !== id);
  res.json({ code: 200, msg: "删除成功" });
});

app.listen(PORT, () => {
  console.log(`Node.js 权限服务已启动: http://localhost:${PORT}`);
});

// --- 工作台管理接口 ---

// 1. 获取工作台列表
app.get("/api/workbench", (req, res) => {
  // 按照 sort 字段升序排序
  const sortedList = [...workbenchList].sort(
    (a, b) => (a.sort || 0) - (b.sort || 0),
  );
  res.json({ code: 200, data: sortedList, msg: "success" });
});

// 2. 新增工作台卡片
app.post("/api/workbench", (req, res) => {
  const newItem = {
    id: Date.now(),
    createTime: new Date().toLocaleString(),
    ...req.body,
  };
  workbenchList.push(newItem);
  res.json({ code: 200, msg: "新增成功", data: newItem });
});

// 3. 修改工作台卡片
app.put("/api/workbench/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const idx = workbenchList.findIndex((item) => item.id === id);
  if (idx !== -1) {
    workbenchList[idx] = { ...workbenchList[idx], ...req.body };
    res.json({ code: 200, msg: "修改成功" });
  } else {
    res.status(404).json({ code: 404, msg: "数据不存在" });
  }
});

// 4. 删除工作台卡片
app.delete("/api/workbench/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const initialLength = workbenchList.length;
  workbenchList = workbenchList.filter((item) => item.id !== id);

  if (workbenchList.length < initialLength) {
    res.json({ code: 200, msg: "删除成功" });
  } else {
    res.status(404).json({ code: 404, msg: "数据不存在" });
  }
});

// =======================
// 系统设置、字典、故障码 API
// =======================

// --- 基础配置数据 ---
let basicConfig = {
  systemName: "微前端基座系统",
  logo: "",
  themeColor: "#409eff",
  layout: "side"
};

let securityConfig = {
  defaultPassword: "Password123!",
  minLength: 8,
  complexity: ["uppercase", "lowercase", "number"],
  expireDays: 90,
  maxFailures: 5
};

// 获取基础设置
app.get("/api/settings/basic", (req, res) => {
  res.json({ code: 200, data: basicConfig, msg: "success" });
});
// 修改基础设置
app.put("/api/settings/basic", (req, res) => {
  basicConfig = { ...basicConfig, ...req.body };
  res.json({ code: 200, msg: "基础设置保存成功" });
});

// 获取安全策略
app.get("/api/settings/security", (req, res) => {
  res.json({ code: 200, data: securityConfig, msg: "success" });
});
// 修改安全策略
app.put("/api/settings/security", (req, res) => {
  securityConfig = { ...securityConfig, ...req.body };
  res.json({ code: 200, msg: "安全策略保存成功" });
});


// --- 系统字典数据 ---
let dictList = [
  { id: 1, dictName: "用户性别", dictType: "sys_user_sex", status: 1, remark: "用户性别列表", createTime: "2023-10-01 10:00:00" },
  { id: 2, dictName: "系统状态", dictType: "sys_normal_disable", status: 1, remark: "系统开关状态", createTime: "2023-10-01 10:00:00" }
];

app.get("/api/dict", (req, res) => {
  res.json({ code: 200, data: dictList, msg: "success" });
});
app.post("/api/dict", (req, res) => {
  const newItem = { id: Date.now(), createTime: new Date().toLocaleString(), ...req.body };
  dictList.push(newItem);
  res.json({ code: 200, msg: "新增字典成功" });
});
app.put("/api/dict/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const idx = dictList.findIndex(item => item.id === id);
  if (idx !== -1) {
    dictList[idx] = { ...dictList[idx], ...req.body };
    res.json({ code: 200, msg: "修改字典成功" });
  } else {
    res.status(404).json({ code: 404, msg: "字典不存在" });
  }
});
app.delete("/api/dict/:id", (req, res) => {
  const id = parseInt(req.params.id);
  dictList = dictList.filter(item => item.id !== id);
  res.json({ code: 200, msg: "删除字典成功" });
});


// --- 故障码数据（含 status、updateTime、remark；level 与前端统一为 '1'～'4'）---
let faultList = [
  { id: 1, faultCode: "ERR_SYS_001", faultName: "数据库连接超时", level: "3", status: 1, remark: "检查数据库服务是否正常启动", createTime: "2023-10-05 14:00:00", updateTime: "2023-10-05 14:00:00" },
  { id: 2, faultCode: "WARN_NET_002", faultName: "网络波动导致包丢失", level: "2", status: 1, remark: "联系网络管理员排查路由节点", createTime: "2023-10-05 15:30:00", updateTime: "2023-10-05 15:30:00" }
];

app.get("/api/fault", (req, res) => {
  const { name, level } = req.query;
  let list = [...faultList];
  if (name && String(name).trim()) {
    const n = String(name).trim().toLowerCase();
    list = list.filter(item => (item.faultName || "").toLowerCase().includes(n) || (item.faultCode || "").toLowerCase().includes(n));
  }
  if (level && String(level).trim()) {
    list = list.filter(item => String(item.level) === String(level));
  }
  res.json({ code: 200, data: list, msg: "success" });
});
app.post("/api/fault", (req, res) => {
  const now = new Date().toLocaleString();
  const newItem = { id: Date.now(), createTime: now, updateTime: now, status: 1, ...req.body };
  faultList.push(newItem);
  res.json({ code: 200, msg: "新增故障码成功", data: newItem });
});
app.put("/api/fault/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const idx = faultList.findIndex(item => item.id === id);
  if (idx !== -1) {
    faultList[idx] = { ...faultList[idx], ...req.body, updateTime: new Date().toLocaleString() };
    res.json({ code: 200, msg: "修改故障码成功" });
  } else {
    res.status(404).json({ code: 404, msg: "故障码不存在" });
  }
});
app.delete("/api/fault/:id", (req, res) => {
  const id = parseInt(req.params.id);
  faultList = faultList.filter(item => item.id !== id);
  res.json({ code: 200, msg: "删除故障码成功" });
});
app.post("/api/fault/batch-delete", (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : (req.body.ids ? [req.body.ids] : []);
  const numIds = ids.map(id => parseInt(id)).filter(n => !isNaN(n));
  const before = faultList.length;
  faultList = faultList.filter(item => !numIds.includes(item.id));
  const deleted = before - faultList.length;
  res.json({ code: 200, msg: "批量删除成功", data: { deleted } });
});

// --- Logo 上传（可选：JSON body 传 base64 + filename，返回 url）---
app.post("/api/upload", (req, res) => {
  const { base64, filename } = req.body || {};
  if (!base64 || !filename) {
    return res.status(400).json({ code: 400, msg: "缺少 base64 或 filename" });
  }
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  const buf = Buffer.from(base64Data, "base64");
  const ext = path.extname(filename) || ".png";
  const name = (path.basename(filename, ext) || "logo") + "_" + Date.now() + ext;
  const filePath = path.join(uploadsDir, name);
  fs.writeFileSync(filePath, buf);
  const url = "/uploads/" + name;
  res.json({ code: 200, data: { url }, msg: "上传成功" });
});