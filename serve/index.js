const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use('/uploads', express.static(uploadsDir));

// =======================
// 1. 模拟数据库 (内存数据)
// =======================

// --- 子应用列表数据 ---
// name, entry, activeRule不能重复
let appList = [
  {
    id: 1,
    name: 'test',
    shortName: '测试',
    code: 'app_1',
    category: 'platform',
    entry: '//localhost:5179',
    iconName: 'Menu',
    leader: '平台管理员',
    status: 1,
    showInWorkbench: true,
    activeRule: '/test-sub-app',
    container: '#sub-app-container',
    createTime: '2023-01-01 12:00:00',
    tenantId: 9001
  },
  {
    id: 2,
    name: 'case',
    shortName: '案例',
    code: 'app_2',
    category: 'platform',
    entry: '//localhost:8000',
    iconName: 'List',
    leader: '平台管理员',
    status: 0,
    showInWorkbench: true,
    activeRule: '/case',
    container: '#sub-app-container',
    createTime: '2023-01-01 12:00:00',
    tenantId: 9001
  },
  {
    id: 3,
    name: 'air',
    shortName: 'air',
    code: 'app_3',
    category: 'platform',
    entry: '//localhost:5180',
    iconName: 'Menu',
    leader: '平台管理员',
    status: 1,
    showInWorkbench: true,
    activeRule: '/platform-app-air',
    container: '#sub-app-container',
    createTime: '2023-01-01 12:00:00',
    tenantId: 9002
  },
  {
    id: 4,
    name: 'video',
    shortName: '视频会商',
    code: 'video',
    category: 'sso',
    entry: 'https://example.com/apps/video',
    iconName: 'VideoCamera',
    leader: '平台管理员',
    status: 1,
    showInWorkbench: true,
    activeRule: '/sso-video',
    container: '#sub-app-container',
    createTime: '2026-03-02 10:00:00',
    tenantId: 9001
  },
  {
    id: 5,
    name: 'learn',
    shortName: '学习平台',
    code: 'learn',
    category: 'external',
    entry: 'https://example.com/apps/learn',
    iconName: 'Reading',
    leader: '平台管理员',
    status: 0,
    showInWorkbench: false,
    activeRule: '/ext-learn',
    container: '#sub-app-container',
    createTime: '2026-03-02 11:00:00',
    tenantId: 9002
  }
];

// --- 工作台数据 ---
// 包含跳转类型 targetType (internal/external) 和 路径 path
let workbenchList = [
  {
    id: 1,
    title: '测试列表',
    icon: 'List',
    targetType: 'internal',
    path: '/test-sub-app/test/list',
    category: '业务系统', // 🚨 新增
    description: '进入子应用功能',
    sort: 1
  },
  {
    id: 2,
    title: 'Vue 官方文档',
    icon: 'Link',
    targetType: 'external',
    path: 'https://cn.vuejs.org',
    category: '开发文档', // 🚨 新增
    description: '新窗口打开官方文档',
    sort: 2
  }
];

// --- 我的待办数据 ---
const createTodoItems = () => {
  const base = [
    {
      category: '角色管理',
      createTime: '2026-03-11 08:45',
      desc: '角色配置核对',
      deadline: '2026-03-13 18:00',
      title: '角色配置核对',
      detailDesc:
        '请尽快完成用户在生产环境中的权限配置，要为后续的授权功能做准备，并且需要同步到PC端配置一次，确保PC端访问的流畅性。'
    },
    {
      category: '用户管理',
      createTime: '2026-03-11 09:20',
      desc: '用户信息审核',
      deadline: '2026-03-12 18:00',
      title: '用户信息审核',
      detailDesc: '请核对新用户资料并确认账号状态，处理完成后同步通知相关业务负责人。'
    },
    {
      category: '审批',
      createTime: '2026-03-10 16:30',
      desc: '审批单待处理',
      deadline: '2026-03-13 12:00',
      title: '审批单待处理',
      detailDesc: '您有一条审批任务待处理，请在截止时间前完成审批。'
    },
    {
      category: 'API管理',
      createTime: '2026-03-10 14:00',
      desc: '接口配置复核',
      deadline: '2026-03-12 18:00',
      title: '接口配置复核',
      detailDesc: '请复核新增接口的权限与分组配置，确认可正常发布。'
    },
    {
      category: '组织管理',
      createTime: '2026-03-09 10:00',
      desc: '组织架构审核',
      deadline: '2026-03-14 18:00',
      title: '组织架构审核',
      detailDesc: '请检查组织架构调整内容，确认人员归属和部门关系无误。'
    }
  ];

  const pending = base.map((item, index) => ({
    id: `pending-${index + 1}`,
    ...item,
    status: 'pending'
  }));

  const done = [
    {
      id: 'done-1',
      category: '审批',
      createTime: '2026-03-08 11:00',
      desc: '已处理完成的任务示例',
      deadline: '2026-03-10 18:00',
      status: 'done',
      title: '已处理完成的任务示例',
      detailDesc: '该待办已处理完成，仅用于演示已处理分页与详情数据。'
    }
  ];

  return [...pending, ...done];
};

let todoList = createTodoItems();

// --- 我的消息数据 ---
const createMessageItems = () => {
  return [
    {
      id: 'message-1',
      title: '企一档',
      summary: '组织架构调整将在本周五生效',
      detailContent:
        '根据近期组织调整安排，系统中的组织架构将在本周五统一生效。请各部门管理员提前核对本部门人员归属、岗位信息及联系人配置，如发现异常请在生效前完成修正，以免影响后续审批与数据权限使用。',
      publishTime: '2026-03-18 15:56',
      status: 'unread',
      level: 'warning',
      category: '业务公告'
    },
    {
      id: 'message-2',
      title: '',
      summary: '密码即将到期，请尽快修改',
      detailContent:
        '您的账号密码将于近期到期。为保障账号安全，请尽快进入个人中心完成密码修改，避免密码过期后影响系统登录与日常业务办理。',
      publishTime: '2026-03-18 13:18',
      status: 'unread',
      level: 'warning',
      category: '系统通知'
    },
    {
      id: 'message-3',
      title: 'AI问数',
      summary: '本月运行月报已生成，请查阅',
      detailContent:
        'AI问数已完成本月运行月报生成，包含核心指标汇总、同比趋势与异常波动提示。请相关负责人尽快查阅并确认内容，如需补充说明可在系统中追加备注。',
      publishTime: '2026-03-18 11:26',
      status: 'unread',
      level: 'danger',
      category: '业务公告'
    },
    {
      id: 'message-4',
      title: '',
      summary: '消息中心支持分页展示',
      detailContent:
        '消息中心功能已完成升级，当前支持分页浏览、未读已读分类查看以及详情展示。后续还将补充标记已读与批量处理能力。',
      publishTime: '2026-03-18 10:58',
      status: 'unread',
      level: 'danger',
      category: '系统通知'
    },
    {
      id: 'message-5',
      title: '污染源',
      summary: '友情链接复核任务已下发',
      detailContent:
        '友情链接配置本轮复核任务已下发至对应模块管理员，请在规定时间内完成链接有效性、跳转地址与展示名称校验，确保门户展示信息准确。',
      publishTime: '2026-03-18 09:26',
      status: 'unread',
      level: 'warning',
      category: '业务公告'
    },
    {
      id: 'message-6',
      title: '',
      summary: '新版本将于今晚 22:00 发布',
      detailContent:
        '平台新版本计划于今晚 22:00 发布，预计持续 15 分钟。发布期间部分功能可能出现短暂不可用，请提前安排好业务操作时间。',
      publishTime: '2026-03-18 09:16',
      status: 'unread',
      level: 'warning',
      category: '系统通知'
    },
    {
      id: 'message-7',
      title: '排污许可',
      summary: '故障码审批超时预警',
      detailContent:
        '系统检测到故障码审批流程存在超时风险，请相关负责人优先处理对应审批单据，避免流程滞留影响后续业务闭环。',
      publishTime: '2026-03-18 09:06',
      status: 'unread',
      level: 'warning',
      category: '待办提醒'
    },
    {
      id: 'message-8',
      title: '污染源',
      summary: '本周例行巡检计划已发布',
      detailContent:
        '污染源模块已发布本周例行巡检计划，请按计划完成巡检任务，并及时录入巡检结果与现场照片，确保台账数据完整。',
      publishTime: '2026-03-18 09:02',
      status: 'unread',
      level: 'danger',
      category: '业务公告'
    },
    {
      id: 'message-9',
      title: '企一档',
      summary: '企业画像标签已完成更新',
      detailContent:
        '企一档模块已完成本轮企业画像标签刷新。新标签结果已同步到企业详情页，可用于后续检索、筛查与研判分析。',
      publishTime: '2026-03-17 18:26',
      status: 'read',
      level: 'warning',
      category: '业务公告'
    },
    {
      id: 'message-10',
      title: '',
      summary: '平台登录策略已更新',
      detailContent:
        '系统已完成登录安全策略调整，包含密码复杂度、登录异常提醒与设备校验等内容，请各位用户及时关注后续使用提示。',
      publishTime: '2026-03-17 15:48',
      status: 'read',
      level: 'warning',
      category: '系统通知'
    },
    {
      id: 'message-11',
      title: 'AI问数',
      summary: '问数结果导出能力已开放',
      detailContent:
        'AI问数新增结果导出功能，当前支持表格导出与截图分享，便于在周报、会商和专题分析场景中直接复用查询结果。',
      publishTime: '2026-03-17 10:08',
      status: 'read',
      level: 'warning',
      category: '业务公告'
    }
  ];
};

let messageList = createMessageItems();

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
        id: 100,
        parentId: -1,
        title: '个人中心',
        path: '',
        icon: 'User',
        sort: 1,
        permission: 'main:profile:view',
        type: 'directory',
        app: 'main',
        children: [
          {
            id: 101,
            parentId: 100,
            title: '个人信息',
            path: '/profile/info',
            icon: 'User',
            sort: 1,
            permission: 'main:profile:info',
            type: 'menu',
            app: 'main',
            children: []
          },
          {
            id: 102,
            parentId: 100,
            title: '我的应用',
            path: '/profile/apps',
            icon: 'Document',
            sort: 2,
            permission: 'main:profile:apps',
            type: 'menu',
            app: 'main',
            children: []
          },
          {
            id: 103,
            parentId: 100,
            title: '我的待办',
            path: '/profile/todo',
            icon: 'List',
            sort: 3,
            permission: 'main:profile:todo',
            type: 'menu',
            app: 'main',
            children: [
              {
                id: 1031,
                parentId: 103,
                name: 'ProfileTodoDetail',
                title: '待办详情',
                path: '/profile/todo/detail',
                icon: '',
                sort: 1,
                permission: 'main:profile:todo:detail',
                type: 'menu',
                app: 'main',
                hidden: true,
                children: []
              }
            ]
          },
          {
            id: 104,
            parentId: 100,
            title: '我的消息',
            path: '/profile/message',
            icon: 'Bell',
            sort: 4,
            permission: 'main:profile:message',
            type: 'menu',
            app: 'main',
            children: [
              {
                id: 1041,
                parentId: 104,
                name: 'ProfileMessageDetail',
                title: '消息详情',
                path: '/profile/message/detail',
                icon: '',
                sort: 1,
                permission: 'main:profile:message:detail',
                type: 'menu',
                app: 'main',
                hidden: true,
                children: []
              }
            ]
          }
        ]
      },
      {
        id: 26,
        parentId: -1,
        title: '用户管理',
        path: '/system/user',
        icon: 'User',
        sort: 2,
        permission: 'main:user:view',
        type: 'menu',
        app: 'main',
        children: [
          {
            id: 261,
            parentId: 26,
            title: '新增用户',
            permission: 'main:user:add',
            type: 'button',
            app: 'main'
          },
          {
            id: 262,
            parentId: 26,
            title: '修改用户',
            permission: 'main:user:edit',
            type: 'button',
            app: 'main'
          },
          {
            id: 263,
            parentId: 26,
            title: '删除用户',
            permission: 'main:user:delete',
            type: 'button',
            app: 'main'
          },
          {
            id: 264,
            parentId: 26,
            title: '启用禁用用户',
            permission: 'main:user:enable',
            type: 'button',
            app: 'main'
          }
        ]
      },
      {
        id: 205,
        parentId: -1,
        title: '租户管理',
        path: '/system/tenant',
        icon: 'School',
        sort: 3,
        permission: 'main:tenant:view',
        type: 'menu',
        app: 'main',
        children: [
          {
            id: 2051,
            parentId: 205,
            title: '新增租户',
            permission: 'main:tenant:add',
            type: 'button',
            app: 'main'
          },
          {
            id: 2052,
            parentId: 205,
            title: '修改租户',
            permission: 'main:tenant:edit',
            type: 'button',
            app: 'main'
          },
          {
            id: 2053,
            parentId: 205,
            title: '删除租户',
            permission: 'main:tenant:delete',
            type: 'button',
            app: 'main'
          },
          {
            id: 2054,
            parentId: 205,
            title: '启用禁用租户',
            permission: 'main:tenant:enable',
            type: 'button',
            app: 'main'
          }
        ]
      },
      {
        id: 27,
        parentId: -1,
        title: '组织管理',
        path: '/system/org',
        icon: 'OfficeBuilding',
        sort: 4,
        permission: 'main:org:view',
        type: 'menu',
        app: 'main',
        children: [
          {
            id: 271,
            parentId: 27,
            title: '新增组织',
            permission: 'main:org:add',
            type: 'button',
            app: 'main'
          },
          {
            id: 272,
            parentId: 27,
            title: '修改组织',
            permission: 'main:org:edit',
            type: 'button',
            app: 'main'
          },
          {
            id: 273,
            parentId: 27,
            title: '删除组织',
            permission: 'main:org:delete',
            type: 'button',
            app: 'main'
          }
        ]
      },
      {
        id: 21,
        parentId: -1,
        title: '菜单管理',
        path: '/system/menu',
        icon: 'Menu',
        sort: 5,
        permission: 'main:menu:view',
        type: 'menu',
        app: 'main',
        children: [
          {
            id: 211,
            parentId: 21,
            title: '新增菜单',
            permission: 'main:menu:add',
            type: 'button',
            app: 'main'
          },
          {
            id: 212,
            parentId: 21,
            title: '修改菜单',
            permission: 'main:menu:edit',
            type: 'button',
            app: 'main'
          },
          {
            id: 213,
            parentId: 21,
            title: '删除菜单',
            permission: 'main:menu:delete',
            type: 'button',
            app: 'main'
          }
        ]
      },
      {
        id: 28,
        parentId: -1,
        title: 'API管理',
        path: '/system/api',
        icon: 'Connection',
        sort: 6,
        permission: 'main:api:view',
        type: 'menu',
        app: 'main',
        children: []
      },
      {
        id: 23,
        parentId: -1,
        title: '应用管理',
        path: '',
        icon: 'Monitor',
        sort: 7,
        permission: 'main:app:view',
        type: 'directory',
        app: 'main',
        children: [
          {
            id: 2341,
            parentId: 23,
            title: '平台',
            path: '/system/app/platform',
            icon: 'Monitor',
            sort: 1,
            permission: 'main:app:view',
            type: 'menu',
            app: 'main',
            children: [
              {
                id: 231,
                parentId: 2341,
                title: '新增应用',
                permission: 'main:app:add',
                type: 'button',
                app: 'main'
              },
              {
                id: 232,
                parentId: 2341,
                title: '编辑应用',
                permission: 'main:app:edit',
                type: 'button',
                app: 'main'
              },
              {
                id: 233,
                parentId: 2341,
                title: '删除应用',
                permission: 'main:app:delete',
                type: 'button',
                app: 'main'
              }
            ]
          },
          {
            id: 2342,
            parentId: 23,
            title: '单点',
            path: '/system/app/sso',
            icon: 'Monitor',
            sort: 2,
            permission: 'main:app:view',
            type: 'menu',
            app: 'main',
            children: []
          },
          {
            id: 2343,
            parentId: 23,
            title: '外部应用',
            path: '/system/app/external',
            icon: 'Monitor',
            sort: 3,
            permission: 'main:app:view',
            type: 'menu',
            app: 'main',
            children: []
          }
        ]
      },
      {
        id: 29,
        parentId: -1,
        title: '权限管理',
        path: '',
        icon: 'Lock',
        sort: 8,
        permission: 'main:permission:view',
        type: 'directory',
        app: 'main',
        children: [
          {
            id: 22,
            parentId: 29,
            title: '角色管理',
            path: '/system/role',
            icon: 'UserFilled',
            sort: 1,
            permission: 'main:role:view',
            type: 'menu',
            app: 'main',
            children: [
              {
                id: 221,
                parentId: 22,
                title: '新增角色',
                permission: 'main:role:add',
                type: 'button',
                app: 'main'
              },
              {
                id: 222,
                parentId: 22,
                title: '修改角色',
                permission: 'main:role:edit',
                type: 'button',
                app: 'main'
              },
              {
                id: 223,
                parentId: 22,
                title: '删除角色',
                permission: 'main:role:delete',
                type: 'button',
                app: 'main'
              }
            ]
          },
          {
            id: 30,
            parentId: 29,
            title: '群组管理',
            path: '/system/group',
            icon: 'UserFilled',
            sort: 2,
            permission: 'main:group:view',
            type: 'menu',
            app: 'main',
            children: [
              {
                id: 301,
                parentId: 30,
                title: '新增群组',
                permission: 'main:group:add',
                type: 'button',
                app: 'main'
              },
              {
                id: 302,
                parentId: 30,
                title: '修改群组',
                permission: 'main:group:edit',
                type: 'button',
                app: 'main'
              },
              {
                id: 303,
                parentId: 30,
                title: '删除群组',
                permission: 'main:group:delete',
                type: 'button',
                app: 'main'
              },
              {
                id: 304,
                parentId: 30,
                title: '启用禁用群组',
                permission: 'main:group:enable',
                type: 'button',
                app: 'main'
              },
              {
                id: 305,
                parentId: 30,
                title: '配置角色',
                permission: 'main:group:authRole',
                type: 'button',
                app: 'main'
              },
              {
                id: 306,
                parentId: 30,
                title: '授权账户',
                permission: 'main:group:authUser',
                type: 'button',
                app: 'main'
              }
            ]
          }
        ]
      },
      {
        id: 31000,
        parentId: -1,
        title: '资讯管理',
        path: '/system/info',
        icon: 'Document',
        sort: 9,
        permission: 'main:info:view',
        type: 'menu',
        app: 'main',
        children: [
          {
            id: 31001,
            parentId: 31000,
            title: '新增资讯',
            permission: 'main:info:add',
            type: 'button',
            app: 'main'
          },
          {
            id: 31002,
            parentId: 31000,
            title: '编辑资讯',
            permission: 'main:info:edit',
            type: 'button',
            app: 'main'
          },
          {
            id: 31003,
            parentId: 31000,
            title: '删除资讯',
            permission: 'main:info:delete',
            type: 'button',
            app: 'main'
          },
          {
            id: 31004,
            parentId: 31000,
            title: '发布资讯',
            permission: 'main:info:publish',
            type: 'button',
            app: 'main'
          }
        ]
      },
      {
        id: 25,
        parentId: -1,
        title: '系统设置',
        path: '',
        icon: 'Setting',
        sort: 10,
        permission: 'main:setting:view',
        type: 'directory',
        app: 'main',
        children: [
          {
            id: 254,
            parentId: 25,
            title: '友情链接',
            path: '/system/settings/links',
            icon: 'Link',
            sort: 1,
            permission: 'main:links:view',
            type: 'menu',
            app: 'main',
            children: [
              {
                id: 2541,
                parentId: 254,
                title: '新增友情链接',
                permission: 'main:links:add',
                type: 'button',
                app: 'main'
              },
              {
                id: 2542,
                parentId: 254,
                title: '编辑友情链接',
                permission: 'main:links:edit',
                type: 'button',
                app: 'main'
              },
              {
                id: 2543,
                parentId: 254,
                title: '删除友情链接',
                permission: 'main:links:delete',
                type: 'button',
                app: 'main'
              }
            ]
          },
          {
            id: 252,
            parentId: 25,
            title: '系统字典',
            path: '/system/settings/dict',
            icon: 'Collection',
            sort: 2,
            permission: 'main:dict:view',
            type: 'menu',
            app: 'main',
            children: [
              {
                id: 2521,
                parentId: 252,
                title: '新增字典',
                permission: 'main:dict:add',
                type: 'button',
                app: 'main'
              },
              {
                id: 2522,
                parentId: 252,
                title: '修改字典',
                permission: 'main:dict:edit',
                type: 'button',
                app: 'main'
              },
              {
                id: 2523,
                parentId: 252,
                title: '删除字典',
                permission: 'main:dict:delete',
                type: 'button',
                app: 'main'
              }
            ]
          },
          {
            id: 253,
            parentId: 25,
            title: '故障码',
            path: '/system/settings/daultDict',
            icon: 'Warning',
            sort: 3,
            permission: 'main:fault:view',
            type: 'menu',
            app: 'main',
            children: [
              {
                id: 2531,
                parentId: 253,
                title: '新增故障码',
                permission: 'main:fault:add',
                type: 'button',
                app: 'main'
              },
              {
                id: 2532,
                parentId: 253,
                title: '修改故障码',
                permission: 'main:fault:edit',
                type: 'button',
                app: 'main'
              },
              {
                id: 2533,
                parentId: 253,
                title: '删除故障码',
                permission: 'main:fault:delete',
                type: 'button',
                app: 'main'
              }
            ]
          }
        ]
      }
    ]
  },
  // [子应用] 测试系统
  {
    id: 2000,
    parentId: null,
    title: '案卷智能评查系统',
    path: '',
    icon: 'List',
    sort: 3,
    permission: 'sub:case:view',
    type: 'directory', // 这是一个目录，里面有子菜单
    app: 'case',
    children: [
      {
        id: 2001,
        parentId: 2000,
        title: '首页',
        name: 'Home',
        path: '/case/home',
        meta: { title: '首页', icon: 'HomeFilled' },
        icon: 'HomeFilled',
        sort: 1,
        permission: 'case:home',
        type: 'menu',
        app: 'case'
      },
      {
        id: 2002,
        parentId: 2000,
        title: '案件库',
        name: 'CaseDatabase',
        path: '/case/caseDatabase',
        meta: { title: '案件库', icon: 'List' },
        icon: 'List',
        sort: 2,
        permission: 'case:caseDatabase:view',
        type: 'menu',
        app: 'case',
        hidden: false,
        children: [
          {
            id: 1773805167104,
            parentId: 2002,
            title: '新建案件',
            path: '/case/addCase',
            icon: '',
            sort: 1,
            permission: 'case:addCase:view',
            type: 'menu',
            app: 'case',
            hidden: true
          }
        ]
      },
      {
        id: 2003,
        parentId: 2000,
        title: '案卷评查管理',
        name: 'CaseManag',
        path: '/case/caseManag',
        meta: { title: '案卷评查管理', icon: 'Folder' },
        icon: 'Folder',
        sort: 3,
        permission: 'case:caseManag:view',
        type: 'menu',
        app: 'case'
      },
      {
        id: 200311,
        parentId: 2000,
        title: 'test',
        name: 'CaseManag',
        path: '/case/caseDatabase/components/caseInfo',
        meta: { title: '案卷评查管理', icon: 'Folder' },
        icon: 'Folder',
        sort: 3,
        permission: 'case:caseManag:view',
        type: 'menu',
        app: 'case'
      },
      {
        id: 2004,
        parentId: 2000,
        title: '中队评查统计',
        name: 'SquadronEvaluation',
        path: '/case/squadronEvaluation',
        meta: { title: '中队评查统计', icon: 'DataBoard' },
        icon: 'DataBoard',
        sort: 4,
        permission: 'case:squadronEvaluation:view',
        type: 'menu',
        app: 'case'
      }
    ]
  },
  {
    id: 3,
    parentId: null,
    title: '测试子应用',
    path: '',
    icon: 'List',
    sort: 3,
    permission: 'sub:test:view',
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
        permission: 'sub:test:view',
        type: 'menu',
        app: 'test',
        children: [
          {
            id: 311,
            parentId: 31,
            title: '查看详情',
            permission: 'sub:test:detail',
            type: 'button',
            app: 'test'
          },
          {
            id: 312,
            parentId: 31,
            title: '新增测试',
            permission: 'sub:test:add',
            type: 'button',
            app: 'test'
          },
          {
            id: 313,
            parentId: 31,
            title: '修改测试',
            permission: 'sub:test:edit',
            type: 'button',
            app: 'test'
          },
          {
            id: 314,
            parentId: 31,
            title: '删除测试',
            permission: 'sub:test:delete',
            type: 'button',
            app: 'test'
          },
          {
            id: 315,
            parentId: 31,
            title: '测试导入',
            permission: 'sub:test:import',
            type: 'button',
            app: 'test'
          },
          {
            id: 316,
            parentId: 31,
            title: '删除导出',
            permission: 'sub:test:export',
            type: 'button',
            app: 'test'
          }
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
      }
    ]
  },
  {
    id: 4,
    parentId: null,
    title: '测试空气',
    path: '',
    icon: 'List',
    sort: 3,
    permission: 'sub:air:view',
    type: 'directory', // 这是一个目录，里面有子菜单
    app: 'air',
    children: [
      {
        id: 41,
        parentId: 4,
        title: '测试列表',
        path: '/test/list',
        icon: 'List',
        sort: 1,
        permission: 'sub:air:view',
        type: 'menu',
        app: 'air'
      }
    ]
  }
];

// 角色数据（多租户 + 状态；保留 app 供权限树过滤）
let roles = [
  {
    id: 1,
    app: 'main',
    roleName: '超级管理员',
    roleKey: 'admin',
    roleCode: 'admin',
    description: '拥有所有权限',
    status: 1,
    tenantId: 9001,
    // 权限ID列表 (对应 menuList 中的 id)
    permissionIds: [
      -1, 1, 100, 101, 102, 103, 1031, 104, 1041, 2000, 2001, 2002, 2003, 2004, 1773805167104, 21,
      211, 212, 213, 22, 221, 222, 223, 23, 2341, 2342, 2343, 231, 232, 233, 24, 241, 242, 243, 25, 251, 2511, 252,
      2521, 2522, 2523, 253, 2531, 2532, 2533, 254, 2541, 2542, 2543, 26, 261, 262, 263, 264, 265, 205, 2051, 2052,
      2053, 2054, 27,
      271, 272, 273, 274, 28, 29, 30, 301, 302, 303, 304, 305, 306, 31, 31000, 31001, 31002, 31003, 31004
    ],
    updateTime: '2023-01-01 12:00:00'
  },
  {
    id: 2,
    app: 'main',
    roleName: '普通用户',
    roleKey: 'common',
    roleCode: 'common',
    description: '仅查看测试',
    status: 1,
    tenantId: 9001,
    // 只有查看权限
    permissionIds: [1, 3, 31, 311, 32],
    updateTime: '2023-01-02 12:00:00'
  },
  {
    id: 3,
    app: 'test',
    roleName: '测试子应用管理员',
    roleKey: 'testsubapp',
    roleCode: 'testsubapp',
    description: '',
    status: 0,
    tenantId: 9002,
    permissionIds: [3, 31, 311, 312, 313, 314, 315, 316, 32, 2000, 2001, 2002, 2003],
    updateTime: '2026/3/11 13:44:26'
  }
];

// 用户数据
let users = [
  {
    id: 1,
    username: 'admin',
    password: '123',
    roleId: 1,
    roleKey: 'admin',
    token: 'token-admin-123'
  },
  {
    id: 2,
    username: 'user',
    password: '123',
    roleId: 2,
    token: 'token-user-123'
  }
];

// =======================
// 1.1 系统管理 mock 数据：用户与组织架构
// =======================

let tenants = [
  {
    id: 9001,
    tenantName: '浙江中咏蓝环境科技有限公司',
    shortName: '中咏蓝',
    tenantCode: 'zhyl',
    adminName: '张三',
    status: 1,
    createTime: '2023-10-01 10:00:00'
  },
  {
    id: 9002,
    tenantName: '浙江中环精创机械发展有限公司',
    shortName: '中环精创',
    tenantCode: 'zhhb',
    adminName: '系统管理员',
    status: 1,
    createTime: '2023-10-02 11:30:00'
  }
];

let platformUsers = [
  {
    id: 1001,
    name: 'admin',
    nickName: '系统管理员',
    gender: 'male',
    phone: '13800000001',
    email: 'admin@platform.local',
    status: 1,
    createTime: '2023-10-01 09:00:00',
    orgId: 5001,
    orgName: '平台组织',
    orgPath: '浙江中咏蓝环境科技有限公司 技术中心 平台研发部',
    roleIds: [1, 2],
    password: '123',
    tenantId: 9001
  },
  {
    id: 1002,
    name: 'zhangsan',
    nickName: '李三',
    gender: 'male',
    phone: '13800000002',
    email: 'user@platform.local',
    status: 0,
    createTime: '2023-10-02 09:00:00',
    orgId: 5002,
    orgName: '研发部',
    roleIds: [],
    password: '123',
    tenantId: 9001
  },
  {
    id: 1003,
    name: 'lisi',
    nickName: '李四',
    gender: 'female',
    phone: '13800000003',
    email: 'lisi@platform.local',
    status: 0,
    createTime: '2023-10-03 09:00:00',
    orgId: 5003,
    orgName: '运维部',
    roleIds: [],
    password: '123',
    tenantId: 9002
  }
];

// token -> platformUserId，用于登录后鉴权（平台用户登录）
const tokenToPlatformUserId = {};

let externalUsers = [
  {
    id: 2001,
    source: 'third',
    externalId: 'THIRD_0001',
    name: 'third_user_01',
    nickName: '第三方用户01',
    gender: 'male',
    phone: '13900000001',
    status: 1,
    createTime: '2023-10-03 09:00:00'
  },
  {
    id: 2002,
    source: 'zzd',
    externalId: 'ZZD_0001',
    name: 'zzd_user_01',
    nickName: '浙政钉用户01',
    gender: 'male',
    phone: '13700000001',
    status: 1,
    createTime: '2023-10-04 09:00:00'
  }
];

// externalUserId -> platformUserId
let userBindings = [
  { externalUserId: 2002, platformUserId: 1002, bindTime: '2023-10-04 10:00:00' }
];

let infoList = [
  {
    id: 7001,
    title: '生态环境协同治理通知',
    infoCategory: '政策资讯',
    infoType: 'internal',
    externalLink: '',
    publisher: '平台管理员',
    content: '<p>请各相关单位于本周内完成生态环境协同治理数据报送。</p>',
    status: 1,
    publishTime: '2026-03-20 10:30:00',
    updateTime: '2026-03-20 10:30:00'
  },
  {
    id: 7002,
    title: '系统升级说明',
    infoCategory: '平台资讯',
    infoType: 'external',
    externalLink: 'https://example.com/platform-upgrade',
    publisher: '技术运营组',
    content: '',
    status: 0,
    publishTime: '',
    updateTime: '2026-03-19 18:20:00'
  },
  {
    id: 7003,
    title: '重点任务月度通报',
    infoCategory: '行业资讯',
    infoType: 'internal',
    externalLink: '',
    publisher: '督查中心',
    content: '<p>本月重点任务总体推进顺利，请继续跟进问题闭环。</p>',
    status: 1,
    publishTime: '2026-03-18 09:00:00',
    updateTime: '2026-03-18 09:00:00'
  },
  {
    id: 7004,
    title: '环保资讯示例',
    infoCategory: '环保资讯',
    infoType: 'internal',
    externalLink: '',
    publisher: '生态环境部',
    content: '<p>用于工作台环保资讯展示的已发布内容。</p>',
    status: 1,
    publishTime: '2026-03-21 08:30:00',
    updateTime: '2026-03-21 08:30:00'
  }
];

let platformOrgTree = [
  {
    id: 5001,
    parentId: null,
    name: '平台组织',
    sort: 1,
    children: [
      { id: 5002, parentId: 5001, name: '研发部', sort: 1, children: [] },
      { id: 5003, parentId: 5001, name: '运维部', sort: 2, children: [] }
    ]
  }
];

let zzdOrgTree = [];

// 按租户拆分组织树（用于租户筛选/根节点随租户）
const orgTreeByTenantId = {
  9001: platformOrgTree,
  9002: [
    {
      id: 6001,
      parentId: null,
      name: '中环瑞蓝组织',
      sort: 1,
      children: [{ id: 6002, parentId: 6001, name: '综合部', sort: 1, children: [] }]
    }
  ]
};

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

// 递归收集某应用下所有菜单节点 id（node.app === app 的整棵子树）
const getMenuIdsForApp = (list, app) => {
  const ids = [];
  const traverse = (nodes) => {
    nodes.forEach((node) => {
      if (node.app === app && node.id != null) ids.push(node.id);
      if (node.children && node.children.length > 0) traverse(node.children);
    });
  };
  traverse(list);
  return ids;
};

// 根据角色ID计算权限字符串数组（单角色）
const getPermissionsByRoleId = (roleId) => {
  const role = roles.find((r) => r.id === roleId);
  if (!role) return [];

  // 1. 动态生成映射表 (实际项目中可缓存)
  const idToCodeMap = generateIdToCodeMap(menuList);

  // 2. 映射 ID 为 Code
  return role.permissionIds.map((id) => idToCodeMap[id]).filter((code) => !!code);
};

// 根据多个角色 ID 合并权限（去重），用于平台用户 roleIds
const getPermissionsByRoleIds = (roleIds) => {
  if (!Array.isArray(roleIds) || roleIds.length === 0) return [];
  const idToCodeMap = generateIdToCodeMap(menuList);
  const allIds = new Set();
  roleIds.forEach((roleId) => {
    const role = roles.find((r) => r.id === roleId);
    if (role && role.permissionIds) role.permissionIds.forEach((id) => allIds.add(id));
  });
  return [...allIds].map((id) => idToCodeMap[id]).filter((code) => !!code);
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

const paginate = (list, pageIndex, pageSize) => {
  const pIndex = Math.max(parseInt(pageIndex || 1), 1);
  const pSize = Math.max(parseInt(pageSize || 10), 1);
  const start = (pIndex - 1) * pSize;
  return {
    list: list.slice(start, start + pSize),
    total: list.length,
    pageIndex: pIndex,
    pageSize: pSize
  };
};

const findOrgNodeById = (tree, id) => {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children && node.children.length > 0) {
      const found = findOrgNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

const findOrgNodeAcrossAllTenants = (id) => {
  const direct = findOrgNodeById(platformOrgTree, id);
  if (direct) return direct;
  const byTenant = orgTreeByTenantId || {};
  for (const k of Object.keys(byTenant)) {
    const tree = byTenant[k];
    const found = findOrgNodeById(tree, id);
    if (found) return found;
  }
  return null;
};

const removeOrgNodeById = (tree, id) => {
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.id === id) {
      tree.splice(i, 1);
      return true;
    }
    if (node.children && node.children.length > 0) {
      const removed = removeOrgNodeById(node.children, id);
      if (removed) return true;
    }
  }
  return false;
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

// 登录：优先使用平台用户（platformUsers），userName + password；通过则发 token 并记录映射
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const platformUser = platformUsers.find(
    (u) => u.name === username && u.password === password && u.status === 1
  );
  if (platformUser) {
    const token = `token-platform-${platformUser.id}-${Date.now()}`;
    tokenToPlatformUserId[token] = platformUser.id;
    res.json({ code: 200, data: { token }, msg: '登录成功' });
    return;
  }
  // 兼容旧 users 表（可选保留）
  const user = users.find((u) => u.username === username && u.password === password);
  if (user) {
    res.json({ code: 200, data: { token: user.token }, msg: '登录成功' });
  } else {
    res.status(401).json({ code: 401, msg: '用户名或密码错误' });
  }
});

// 用户信息：优先按 token 解析平台用户，否则回退到旧 users
app.get('/api/user/info', (req, res) => {
  const token = req.headers['authorization'];
  const buildUserInfoData = (baseUser, roleIds, fallbackRoleId, fallbackRoleKey) => {
    const resolvedRoleIds =
      Array.isArray(roleIds) && roleIds.length > 0
        ? roleIds
        : fallbackRoleId != null && fallbackRoleId !== ''
          ? [fallbackRoleId]
          : [];
    const firstRoleId = resolvedRoleIds.length > 0 ? resolvedRoleIds[0] : null;
    const firstRole = firstRoleId != null ? roles.find((r) => r.id === firstRoleId) : null;
    const roleNames = resolvedRoleIds
      .map((rid) => roles.find((r) => r.id === rid)?.roleName)
      .filter(Boolean);
    const tenant =
      baseUser.tenantId != null ? tenants.find((t) => t.id === baseUser.tenantId) : null;
    const orgPathDefault = [tenant?.tenantName, baseUser.orgName].filter(Boolean).join(' ');
    return {
      userName: baseUser.name,
      nickName: baseUser.nickName || '',
      gender: baseUser.gender || '',
      deptName: baseUser.orgName || '',
      roleId: firstRoleId,
      roleKey: firstRole ? firstRole.roleKey : fallbackRoleKey || '',
      avatar: baseUser.avatar || '',
      tenantId: baseUser.tenantId != null ? baseUser.tenantId : null,
      email: baseUser.email || '',
      phone: baseUser.phone || '',
      roleNames,
      orgPath: baseUser.orgPath || orgPathDefault || baseUser.orgName || ''
    };
  };
  const platformUserId = tokenToPlatformUserId[token];
  if (platformUserId != null) {
    const platformUser = platformUsers.find((u) => u.id === platformUserId);
    if (platformUser) {
      const perms = getPermissionsByRoleIds(platformUser.roleIds || []);
      res.json({
        code: 200,
        data: {
          ...buildUserInfoData(platformUser, platformUser.roleIds || [], null, ''),
          permissions: perms
        }
      });
      return;
    }
  }
  const user = users.find((u) => u.token === token);
  if (user) {
    const linkedPlatformUser = platformUsers.find((u) => u.name === user.username);
    const perms = getPermissionsByRoleId(user.roleId);
    res.json({
      code: 200,
      data: {
        ...buildUserInfoData(
          linkedPlatformUser || { name: user.username },
          linkedPlatformUser?.roleIds || [],
          user.roleId,
          user.roleKey
        ),
        permissions: perms
      }
    });
  } else {
    res.status(401).json({ code: 401, msg: 'Token 无效' });
  }
});

app.get('/api/profile/todo/list', (req, res) => {
  const { status = 'pending', pageIndex = 1, pageSize = 10 } = req.query;
  const normalizedStatus = String(status) === 'done' ? 'done' : 'pending';
  const currentPage = Math.max(parseInt(String(pageIndex), 10) || 1, 1);
  const currentSize = Math.max(parseInt(String(pageSize), 10) || 10, 1);
  const pendingCount = todoList.filter((item) => item.status === 'pending').length;
  const doneCount = todoList.filter((item) => item.status === 'done').length;
  const filtered = todoList.filter((item) => item.status === normalizedStatus);
  const start = (currentPage - 1) * currentSize;
  const list = filtered.slice(start, start + currentSize);

  res.json({
    code: 200,
    data: {
      list,
      total: filtered.length,
      pendingCount,
      doneCount
    },
    msg: 'success'
  });
});

app.get('/api/profile/message/list', (req, res) => {
  const { status = 'unread', pageIndex = 1, pageSize = 10, sourceApp } = req.query;
  const normalizedStatus = String(status) === 'read' ? 'read' : 'unread';
  const currentPage = Math.max(parseInt(String(pageIndex), 10) || 1, 1);
  const currentSize = Math.max(parseInt(String(pageSize), 10) || 10, 1);
  const sourceKey = String(sourceApp || '').trim();
  const scoped = messageList.filter((item) => {
    if (!sourceKey) return true;
    if (sourceKey === 'main') return item.sourceApp === 'main' || item.category === '系统通知';
    return String(item.sourceApp || '') === sourceKey || String(item.title || '') === sourceKey;
  });
  const unreadCount = scoped.filter((item) => item.status === 'unread').length;
  const readCount = scoped.filter((item) => item.status === 'read').length;
  const filtered = scoped.filter((item) => item.status === normalizedStatus);
  const start = (currentPage - 1) * currentSize;
  const list = filtered.slice(start, start + currentSize);

  res.json({
    code: 200,
    data: {
      list,
      total: filtered.length,
      unreadCount,
      readCount
    },
    msg: 'success'
  });
});

app.get('/api/profile/message/detail/:id', (req, res) => {
  const item = messageList.find((message) => String(message.id) === String(req.params.id));
  if (!item) {
    return res.status(404).json({ code: 404, msg: '消息不存在' });
  }
  return res.json({ code: 200, data: item, msg: 'success' });
});

// 标记消息已读
app.post('/api/profile/message/:id/read', (req, res) => {
  const id = String(req.params.id);
  const idx = messageList.findIndex((m) => String(m.id) === id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: '消息不存在' });
  messageList[idx] = { ...messageList[idx], status: 'read' };
  return res.json({ code: 200, msg: 'success' });
});

// 删除消息
app.delete('/api/profile/message/:id', (req, res) => {
  const id = String(req.params.id);
  const idx = messageList.findIndex((m) => String(m.id) === id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: '消息不存在' });
  messageList.splice(idx, 1);
  return res.json({ code: 200, msg: 'success' });
});

app.get('/api/profile/todo/detail/:id', (req, res) => {
  const item = todoList.find((todo) => String(todo.id) === String(req.params.id));
  if (!item) {
    return res.status(404).json({ code: 404, msg: '待办不存在' });
  }
  return res.json({ code: 200, data: item, msg: 'success' });
});

app.post('/api/profile/todo/:id/process', (req, res) => {
  const index = todoList.findIndex((todo) => String(todo.id) === String(req.params.id));
  if (index === -1) {
    return res.status(404).json({ code: 404, msg: '待办不存在' });
  }

  const current = todoList[index];
  todoList[index] = current.status === 'pending' ? { ...current, status: 'done' } : current;

  return res.json({
    code: 200,
    data: todoList[index],
    msg: '处理成功'
  });
});

// --- 角色/权限模块 ---

// 获取权限树：支持 query.app 仅返回该应用下的子树
app.get('/api/permissions/tree', (req, res) => {
  const { app: appFilter } = req.query;
  const list = JSON.parse(JSON.stringify(menuList));
  const sortedList = sortMenus(list);
  if (appFilter && String(appFilter).trim()) {
    const filtered = sortedList.filter((item) => item.app === String(appFilter).trim());
    return res.json({ code: 200, data: filtered });
  }
  res.json({ code: 200, data: sortedList });
});

app.get('/api/roles', (req, res) => {
  const { keyword = '', status, tenantId } = req.query || {};
  const kw = String(keyword || '')
    .trim()
    .toLowerCase();
  const statusNum = status !== undefined && status !== '' ? Number(status) : null;
  const tenantIdNum = tenantId !== undefined && tenantId !== '' ? Number(tenantId) : null;

  let list = roles.map((r) => ({ ...r }));
  if (tenantIdNum != null && !Number.isNaN(tenantIdNum)) {
    list = list.filter((r) => Number(r.tenantId) === tenantIdNum);
  }
  if (statusNum === 0 || statusNum === 1) {
    list = list.filter((r) => Number(r.status) === statusNum);
  }
  if (kw) {
    list = list.filter((r) => {
      const values = [r.roleName, r.roleCode, r.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return values.includes(kw);
    });
  }
  res.json({ code: 200, data: { list, total: list.length } });
});

app.post('/api/roles', (req, res) => {
  const { roleName, roleCode, description, permissionIds, app, status, tenantId } = req.body;
  if (!roleName || !roleCode) {
    return res.status(400).json({ code: 400, msg: 'roleName/roleCode 不能为空' });
  }
  const newRole = {
    id: roles.length > 0 ? roles[roles.length - 1].id + 1 : 1,
    app: app != null && app !== '' ? app : 'main',
    roleName,
    // 兼容旧逻辑：系统内部仍用 roleKey 作为角色标识
    roleKey: String(roleCode).trim(),
    roleCode,
    description,
    status: Number(status) === 0 ? 0 : 1,
    tenantId: tenantId != null && tenantId !== '' ? Number(tenantId) : null,
    permissionIds: permissionIds || [],
    updateTime: new Date().toLocaleString()
  };
  roles.push(newRole);
  res.json({ code: 200, msg: '新增成功' });
});

app.put('/api/roles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { roleName, description, permissionIds, app, status } = req.body;
  const idx = roles.findIndex((r) => r.id === id);
  if (idx !== -1) {
    const role = roles[idx];
    let nextPermissionIds = permissionIds;
    if (permissionIds && role.app && Array.isArray(permissionIds)) {
      const appIds = getMenuIdsForApp(menuList, role.app);
      const otherIds = (role.permissionIds || []).filter((pid) => !appIds.includes(pid));
      nextPermissionIds = [...otherIds, ...permissionIds];
    }
    roles[idx] = {
      ...role,
      ...(roleName != null && { roleName }),
      ...(description != null && { description }),
      ...(app != null && app !== '' && { app }),
      ...(status != null && { status: Number(status) === 0 ? 0 : 1 }),
      ...(nextPermissionIds != null && { permissionIds: nextPermissionIds }),
      updateTime: new Date().toLocaleString()
    };
    res.json({ code: 200, msg: '修改成功' });
  } else {
    res.status(404).json({ code: 404, msg: '角色不存在' });
  }
});

app.delete('/api/roles/:id', (req, res) => {
  const id = parseInt(req.params.id);
  roles = roles.filter((r) => r.id !== id);
  res.json({ code: 200, msg: '删除成功' });
});

// =======================
// 系统管理：群组管理 API（模拟）
// =======================

let groups = [
  {
    id: 50001,
    tenantId: 9001,
    groupName: '默认群组',
    groupCode: 'default',
    description: '默认群组（示例）',
    status: 1,
    isDefault: true,
    roleIds: [1, 2],
    userIds: [1001, 1002],
    updateTime: '2026-03-11 10:00:00'
  },
  {
    id: 50002,
    tenantId: 9001,
    groupName: '平台运维组',
    groupCode: 'ops-center',
    description: '平台运维与应急响应',
    status: 1,
    isDefault: false,
    roleIds: [1],
    userIds: [1001],
    updateTime: '2026-03-22 09:40:00'
  },
  {
    id: 50003,
    tenantId: 9002,
    groupName: '业务协作组',
    groupCode: 'biz-admin-group',
    description: '业务协作组（示例）',
    status: 1,
    isDefault: true,
    roleIds: [2],
    userIds: [1003],
    updateTime: '2026-03-31 10:20:00'
  }
];

const groupCodePattern = /^[a-z]+$/;

const enforceSingleDefaultGroup = (tenantId, defaultGroupId) => {
  if (tenantId == null) return;
  groups = groups.map((g) => {
    if (Number(g.tenantId) !== Number(tenantId)) return g;
    if (Number(g.id) === Number(defaultGroupId)) return { ...g, isDefault: true };
    return { ...g, isDefault: false };
  });
};

const mapGroupRow = (g) => {
  const roleIds = Array.isArray(g.roleIds) ? g.roleIds : [];
  const userIds = Array.isArray(g.userIds) ? g.userIds : [];
  return {
    ...g,
    roleIds,
    userIds,
    roleCount: roleIds.length,
    userCount: userIds.length
  };
};

app.get('/api/system/groups', (req, res) => {
  const { keyword = '', status, tenantId } = req.query || {};
  const kw = String(keyword || '')
    .trim()
    .toLowerCase();
  const statusNum = status !== undefined && status !== '' ? Number(status) : null;
  const tenantIdNum = tenantId !== undefined && tenantId !== '' ? Number(tenantId) : null;

  let list = groups.map(mapGroupRow);
  if (tenantIdNum != null && !Number.isNaN(tenantIdNum)) {
    list = list.filter((g) => Number(g.tenantId) === tenantIdNum);
  }
  if (statusNum === 0 || statusNum === 1) {
    list = list.filter((g) => Number(g.status) === statusNum);
  }
  if (kw) {
    list = list.filter((g) => {
      const values = [g.groupName, g.groupCode, g.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return values.includes(kw);
    });
  }
  res.json({ code: 200, data: { list, total: list.length }, msg: 'success' });
});

app.post('/api/system/groups', (req, res) => {
  const body = req.body || {};
  const { groupName, groupCode, description, status, tenantId } = body;
  if (!groupName || !groupCode) {
    return res.status(400).json({ code: 400, msg: 'groupName/groupCode 不能为空' });
  }
  const code = String(groupCode).trim();
  if (!groupCodePattern.test(code)) {
    return res.status(400).json({ code: 400, msg: '群组编码仅支持小写英文' });
  }
  const tid = tenantId != null && tenantId !== '' ? Number(tenantId) : null;
  if (tid != null && groups.some((g) => Number(g.tenantId) === tid && String(g.groupCode) === code)) {
    return res.status(400).json({ code: 400, msg: '群组编码已存在' });
  }
  const newGroup = {
    id: Math.max(0, ...groups.map((g) => Number(g.id) || 0)) + 1,
    tenantId: tid,
    groupName: String(groupName).trim(),
    groupCode: code,
    description: String(description || '').trim(),
    status: Number(status) === 0 ? 0 : 1,
    // 新增时不允许设置默认群组
    isDefault: false,
    roleIds: [],
    userIds: [],
    updateTime: new Date().toLocaleString()
  };
  groups.push(newGroup);
  res.json({ code: 200, data: mapGroupRow(newGroup), msg: '新增成功' });
});

app.put('/api/system/groups/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = groups.findIndex((g) => Number(g.id) === id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: '群组不存在' });
  const body = req.body || {};
  const { groupName, description, status, isDefault } = body;
  const current = groups[idx];

  groups[idx] = {
    ...current,
    ...(groupName != null ? { groupName: String(groupName).trim() } : {}),
    ...(description != null ? { description: String(description).trim() } : {}),
    ...(status != null ? { status: Number(status) === 0 ? 0 : 1 } : {}),
    ...(isDefault != null ? { isDefault: isDefault === true } : {}),
    updateTime: new Date().toLocaleString()
  };
  if (groups[idx].isDefault) enforceSingleDefaultGroup(groups[idx].tenantId, groups[idx].id);
  res.json({ code: 200, msg: '修改成功' });
});

app.delete('/api/system/groups/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const before = groups.length;
  groups = groups.filter((g) => Number(g.id) !== id);
  if (groups.length === before) return res.status(404).json({ code: 404, msg: '群组不存在' });
  res.json({ code: 200, msg: '删除成功' });
});

app.get('/api/system/groups/:id/roles', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const group = groups.find((g) => Number(g.id) === id);
  if (!group) return res.status(404).json({ code: 404, msg: '群组不存在' });
  res.json({ code: 200, data: { roleIds: Array.isArray(group.roleIds) ? group.roleIds : [] }, msg: 'success' });
});

app.put('/api/system/groups/:id/roles', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = groups.findIndex((g) => Number(g.id) === id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: '群组不存在' });
  const roleIds = Array.isArray(req.body?.roleIds) ? req.body.roleIds : [];
  const ids = roleIds.map((x) => Number(x)).filter((n) => Number.isFinite(n));
  groups[idx] = { ...groups[idx], roleIds: Array.from(new Set(ids)), updateTime: new Date().toLocaleString() };
  res.json({ code: 200, data: { roleIds: groups[idx].roleIds }, msg: '保存成功' });
});

app.get('/api/system/groups/:id/users', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const group = groups.find((g) => Number(g.id) === id);
  if (!group) return res.status(404).json({ code: 404, msg: '群组不存在' });
  res.json({ code: 200, data: { userIds: Array.isArray(group.userIds) ? group.userIds : [] }, msg: 'success' });
});

app.put('/api/system/groups/:id/users', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = groups.findIndex((g) => Number(g.id) === id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: '群组不存在' });
  const userIds = Array.isArray(req.body?.userIds) ? req.body.userIds : [];
  const ids = userIds.map((x) => Number(x)).filter((n) => Number.isFinite(n));
  groups[idx] = { ...groups[idx], userIds: Array.from(new Set(ids)), updateTime: new Date().toLocaleString() };
  res.json({ code: 200, data: { userIds: groups[idx].userIds }, msg: '保存成功' });
});

// =======================
// 系统管理：租户管理 API（模拟）
// =======================

const tenantCodePattern = /^[a-zA-Z0-9]+$/;

const countUsersForTenant = (tenantId) =>
  platformUsers.filter((u) => u.tenantId === tenantId).length;

const countAppsForTenant = (tenantId) =>
  appList.filter((a) => a.tenantId === tenantId).length;

const mapTenantRow = (t) => ({
  ...t,
  appCount: countAppsForTenant(t.id),
  userCount: countUsersForTenant(t.id)
});

app.get('/api/system/tenants', (req, res) => {
  const {
    tenantName = '',
    status,
    pageIndex = 1,
    pageSize = 10
  } = req.query;
  const kw = String(tenantName || '')
    .trim()
    .toLowerCase();
  const statusNum = status !== undefined && status !== '' ? parseInt(status, 10) : null;

  let list = tenants.map(mapTenantRow);
  if (kw) {
    list = list.filter((row) => String(row.tenantName || '').toLowerCase().indexOf(kw) !== -1);
  }
  if (statusNum !== null && !isNaN(statusNum)) {
    list = list.filter((row) => row.status === statusNum);
  }
  const page = paginate(list, pageIndex, pageSize);
  res.json({ code: 200, data: { list: page.list, total: page.total }, msg: 'success' });
});

app.post('/api/system/tenants', (req, res) => {
  const body = req.body || {};
  const { tenantName, shortName, tenantCode, adminName, status } = body;
  if (!tenantName || !shortName || !tenantCode || !adminName) {
    return res.status(400).json({ code: 400, msg: '租户名称、简称、编码、管理员不能为空' });
  }
  const code = String(tenantCode).trim();
  if (!tenantCodePattern.test(code)) {
    return res.status(400).json({ code: 400, msg: '租户编码仅支持字母或数字' });
  }
  if (tenants.some((t) => String(t.tenantCode).toLowerCase() === code.toLowerCase())) {
    return res.status(400).json({ code: 400, msg: '租户编码已存在' });
  }
  const id = Math.max(0, ...tenants.map((t) => t.id)) + 1;
  const row = {
    id,
    tenantName: String(tenantName).trim(),
    shortName: String(shortName).trim(),
    tenantCode: code,
    adminName: String(adminName).trim(),
    status: status === 0 ? 0 : 1,
    createTime: new Date().toLocaleString()
  };
  tenants.push(row);
  res.json({ code: 200, data: mapTenantRow(row), msg: '新增成功' });
});

app.put('/api/system/tenants/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = tenants.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: '租户不存在' });
  const body = req.body || {};
  const { tenantName, shortName, tenantCode, adminName, status } = body;
  if (tenantCode != null && tenantCode !== '') {
    const code = String(tenantCode).trim();
    if (!tenantCodePattern.test(code)) {
      return res.status(400).json({ code: 400, msg: '租户编码仅支持字母或数字' });
    }
    if (
      tenants.some(
        (t) => t.id !== id && String(t.tenantCode).toLowerCase() === code.toLowerCase()
      )
    ) {
      return res.status(400).json({ code: 400, msg: '租户编码已存在' });
    }
    tenants[idx].tenantCode = code;
  }
  if (tenantName != null) tenants[idx].tenantName = String(tenantName).trim();
  if (shortName != null) tenants[idx].shortName = String(shortName).trim();
  if (adminName != null) tenants[idx].adminName = String(adminName).trim();
  if (status != null) tenants[idx].status = status === 0 ? 0 : 1;
  res.json({ code: 200, msg: '修改成功' });
});

app.delete('/api/system/tenants/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = tenants.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: '租户不存在' });
  if (countUsersForTenant(id) > 0) {
    return res.status(400).json({ code: 400, msg: '该租户下仍有用户，无法删除' });
  }
  if (countAppsForTenant(id) > 0) {
    return res.status(400).json({ code: 400, msg: '该租户下仍有应用，无法删除' });
  }
  tenants.splice(idx, 1);
  res.json({ code: 200, msg: '删除成功' });
});

// =======================
// 系统管理：用户管理 API（模拟）
// =======================

app.get('/api/system/users', (req, res) => {
  const {
    source = 'all',
    keyword = '',
    name = '',
    orgId,
    tenantId,
    tenantEmpty: tenantEmptyQ,
    status,
    pageIndex = 1,
    pageSize = 10
  } = req.query;
  const kw = String(keyword || name || '')
    .trim()
    .toLowerCase();
  const orgIdNum = orgId !== undefined && orgId !== '' ? parseInt(orgId, 10) : null;
  const tenantIdNum =
    tenantId !== undefined && tenantId !== '' ? parseInt(tenantId, 10) : null;
  const tenantEmpty =
    tenantEmptyQ === true ||
    tenantEmptyQ === 'true' ||
    tenantEmptyQ === '1' ||
    tenantEmptyQ === 1;
  const statusNum = status !== undefined && status !== '' ? parseInt(status, 10) : null;

  const toPlatformItem = (u) => {
    const { password, ...rest } = u;
    return { ...rest, source: 'platform' };
  };
  let list = [];
  if (source === 'platform') list = platformUsers.map(toPlatformItem);
  else if (source === 'third')
    list = externalUsers.filter((u) => u.source === 'third').map((u) => ({ ...u }));
  else if (source === 'zzd')
    list = externalUsers.filter((u) => u.source === 'zzd').map((u) => ({ ...u }));
  else {
    list = [...platformUsers.map(toPlatformItem), ...externalUsers.map((u) => ({ ...u }))];
  }

  if (kw) {
    list = list.filter((u) => {
      const values = [u.name, u.nickName, u.phone, u.email, u.externalId, u.source]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return values.indexOf(kw) !== -1;
    });
  }

  if (statusNum !== null && !isNaN(statusNum)) {
    list = list.filter((u) => u.status === statusNum);
  }

  if (orgIdNum !== null && !isNaN(orgIdNum)) {
    list = list.filter((u) => u.orgId === orgIdNum);
  }

  if (tenantEmpty) {
    list = list.filter((u) => u.tenantId == null || u.tenantId === '');
  } else if (tenantIdNum !== null && !isNaN(tenantIdNum)) {
    list = list.filter((u) => u.tenantId === tenantIdNum);
  }

  // attach binding info for external users
  const bindingMap = {};
  userBindings.forEach((b) => {
    bindingMap[b.externalUserId] = b.platformUserId;
  });
  list = list.map((u) => {
    const tenantRow = u.tenantId != null ? tenants.find((t) => t.id === u.tenantId) : null;
    const withTenant = { ...u, tenantName: tenantRow ? tenantRow.tenantName : u.tenantName || '' };
    if (u.source === 'third' || u.source === 'zzd') {
      const platformUserId = bindingMap[u.id] || null;
      return { ...withTenant, platformUserId };
    }
    return withTenant;
  });

  const page = paginate(list, pageIndex, pageSize);
  res.json({ code: 200, data: { list: page.list, total: page.total }, msg: 'success' });
});

app.post('/api/system/users', (req, res) => {
  const body = req.body || {};
  const name = body.name != null && body.name !== '' ? body.name : body.userName;
  const { nickName, gender, phone, email, status, roleIds, password, orgId, tenantId } = body;
  if (!name) return res.status(400).json({ code: 400, msg: 'name 不能为空' });
  if (platformUsers.some((u) => u.name === name)) {
    return res.status(400).json({ code: 400, msg: 'name 已存在' });
  }
  const orgIdNum = orgId != null && orgId !== '' ? parseInt(orgId, 10) : null;
  const orgNode = orgIdNum ? findOrgNodeById(platformOrgTree, orgIdNum) : null;
  let tenantIdResolved = null;
  if (tenantId !== undefined && tenantId !== null && tenantId !== '') {
    const parsed = parseInt(String(tenantId), 10);
    if (!isNaN(parsed)) tenantIdResolved = parsed;
  }
  const tenantRow =
    tenantIdResolved != null && !isNaN(tenantIdResolved)
      ? tenants.find((t) => t.id === tenantIdResolved)
      : null;
  const newUser = {
    id: Date.now(),
    name,
    nickName: nickName || '',
    gender: gender === 'female' ? 'female' : 'male',
    phone: phone || '',
    email: email || '',
    status: status === 0 ? 0 : 1,
    createTime: new Date().toLocaleString(),
    orgId: orgNode?.id ?? null,
    orgName: orgNode?.name ?? '',
    tenantId: tenantRow ? tenantRow.id : null,
    tenantName: tenantRow ? tenantRow.tenantName : '',
    roleIds: Array.isArray(roleIds) ? roleIds : [],
    password: password != null && password !== '' ? password : '123'
  };
  platformUsers.push(newUser);
  const { password: _p, ...safe } = newUser;
  res.json({ code: 200, data: safe, msg: '新增成功' });
});

/** 账号管理：为平台用户新增外部登录账号并绑定 */
app.post('/api/system/accounts', (req, res) => {
  const { platformUserId, accountType, authIdentifier } = req.body || {};
  const pId = parseInt(String(platformUserId), 10);
  if (isNaN(pId)) {
    return res.status(400).json({ code: 400, msg: 'platformUserId 无效' });
  }
  const plat = platformUsers.find((u) => u.id === pId);
  if (!plat) return res.status(404).json({ code: 404, msg: '关联用户不存在' });
  const auth = String(authIdentifier || '').trim();
  if (!auth) return res.status(400).json({ code: 400, msg: '认证标识不能为空' });
  if (!['name', 'phone', 'zzd'].includes(accountType)) {
    return res.status(400).json({ code: 400, msg: '账号类型无效' });
  }

  const source = accountType === 'zzd' ? 'zzd' : 'third';
  if (externalUsers.some((u) => u.source === source && u.name === auth)) {
    return res.status(400).json({ code: 400, msg: '该认证标识已存在' });
  }

  const id = Date.now();
  const externalId =
    accountType === 'zzd'
      ? auth.startsWith('ZZD_')
        ? auth
        : `ZZD_${auth}`
      : `THIRD_${id}`;

  const newExt = {
    id,
    source,
    externalId,
    name: auth,
    nickName: plat.nickName || '',
    gender: plat.gender === 'female' ? 'female' : 'male',
    phone: accountType === 'phone' ? auth : '',
    email: plat.email || '',
    status: 1,
    createTime: new Date().toLocaleString()
  };
  externalUsers.push(newExt);
  userBindings.push({
    externalUserId: id,
    platformUserId: pId,
    bindTime: new Date().toLocaleString()
  });
  res.json({
    code: 200,
    data: { ...newExt, platformUserId: pId },
    msg: '新增成功'
  });
});

app.put('/api/system/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = platformUsers.findIndex((u) => u.id === id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: '用户不存在' });
  const body = req.body || {};
  const nextName = body.name != null && body.name !== '' ? body.name : body.userName;
  const { nickName, gender, phone, email, status, roleIds, password, orgId, tenantId } = body;
  if (nextName != null && nextName !== '' && platformUsers.some((u) => u.name === nextName && u.id !== id)) {
    return res.status(400).json({ code: 400, msg: 'name 已存在' });
  }
  const orgIdNum = orgId != null && orgId !== '' ? parseInt(orgId, 10) : null;
  const orgNode = orgIdNum ? findOrgNodeById(platformOrgTree, orgIdNum) : null;
  let tenantPatch = {};
  if (tenantId !== undefined) {
    const tid = tenantId != null && tenantId !== '' ? parseInt(tenantId, 10) : null;
    const tRow = tid != null && !isNaN(tid) ? tenants.find((t) => t.id === tid) : null;
    tenantPatch = {
      tenantId: tRow ? tid : null,
      tenantName: tRow ? tRow.tenantName : ''
    };
  }
  platformUsers[idx] = {
    ...platformUsers[idx],
    ...(nextName != null ? { name: nextName } : {}),
    ...(nickName != null ? { nickName } : {}),
    ...(gender != null ? { gender: gender === 'female' ? 'female' : 'male' } : {}),
    ...(phone != null ? { phone } : {}),
    ...(email != null ? { email } : {}),
    ...(status != null ? { status } : {}),
    ...(orgId != null ? { orgId: orgNode?.id ?? null, orgName: orgNode?.name ?? '' } : {}),
    ...tenantPatch,
    ...(roleIds != null && Array.isArray(roleIds) ? { roleIds } : {}),
    ...(password != null && password !== '' ? { password } : {})
  };
  res.json({ code: 200, msg: '修改成功' });
});

app.post('/api/system/users/:id/unlock', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const pIdx = platformUsers.findIndex((u) => u.id === id);
  if (pIdx !== -1) {
    platformUsers[pIdx] = { ...platformUsers[pIdx], locked: false, lockEndTime: '' };
    return res.json({ code: 200, msg: '解锁成功' });
  }
  const eIdx = externalUsers.findIndex((u) => u.id === id);
  if (eIdx !== -1) {
    externalUsers[eIdx] = { ...externalUsers[eIdx], locked: false, lockEndTime: '' };
    return res.json({ code: 200, msg: '解锁成功' });
  }
  return res.status(404).json({ code: 404, msg: '用户不存在' });
});

app.post('/api/system/users/:id/reset-password', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const pIdx = platformUsers.findIndex((u) => u.id === id);
  if (pIdx !== -1) {
    const body = req.body || {};
    const newPwd = body.password != null && String(body.password) !== '' ? String(body.password) : '123';
    platformUsers[pIdx] = { ...platformUsers[pIdx], password: newPwd };
    return res.json({ code: 200, msg: '密码已重置' });
  }
  const eIdx = externalUsers.findIndex((u) => u.id === id);
  if (eIdx !== -1) {
    const body = req.body || {};
    const newPwd = body.password != null && String(body.password) !== '' ? String(body.password) : '123';
    externalUsers[eIdx] = { ...externalUsers[eIdx], password: newPwd };
    return res.json({ code: 200, msg: '密码已重置' });
  }
  return res.status(404).json({ code: 404, msg: '用户不存在' });
});

app.delete('/api/system/users/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const beforePlatform = platformUsers.length;
  platformUsers = platformUsers.filter((u) => u.id !== id);
  if (platformUsers.length < beforePlatform) {
    userBindings = userBindings.filter((b) => b.platformUserId !== id);
    return res.json({ code: 200, msg: '删除成功' });
  }
  const beforeExt = externalUsers.length;
  externalUsers = externalUsers.filter((u) => u.id !== id);
  if (externalUsers.length < beforeExt) {
    userBindings = userBindings.filter((b) => b.externalUserId !== id);
    return res.json({ code: 200, msg: '删除成功' });
  }
  return res.status(404).json({ code: 404, msg: '用户不存在' });
});

app.post('/api/system/users/bind', (req, res) => {
  const { externalUserId, platformUserId } = req.body || {};
  const eId = parseInt(externalUserId);
  const pId = parseInt(platformUserId);
  const ext = externalUsers.find((u) => u.id === eId);
  const plat = platformUsers.find((u) => u.id === pId);
  if (!ext) return res.status(404).json({ code: 404, msg: '外部用户不存在' });
  if (!plat) return res.status(404).json({ code: 404, msg: '平台用户不存在' });

  // 先删旧绑定再写新绑定
  userBindings = userBindings.filter((b) => b.externalUserId !== eId);
  userBindings.push({
    externalUserId: eId,
    platformUserId: pId,
    bindTime: new Date().toLocaleString()
  });
  res.json({ code: 200, msg: '绑定成功' });
});

app.post('/api/system/users/unbind', (req, res) => {
  const { externalUserId } = req.body || {};
  const eId = parseInt(externalUserId);
  const before = userBindings.length;
  userBindings = userBindings.filter((b) => b.externalUserId !== eId);
  if (userBindings.length === before)
    return res.status(404).json({ code: 404, msg: '绑定关系不存在' });
  res.json({ code: 200, msg: '解绑成功' });
});

app.get('/api/system/infos', (req, res) => {
  const q = req.query || {};
  const title = String(q.title || '')
    .trim()
    .toLowerCase();
  const infoCategory = String(q.infoCategory || '')
    .trim()
    .toLowerCase();
  const infoType = String(q.infoType || '')
    .trim()
    .toLowerCase();
  const statusValue = q.status === '' || q.status == null ? undefined : Number(q.status);
  const pageIndex = Math.max(1, Number(q.pageIndex || 1));
  const pageSize = Math.max(1, Number(q.pageSize || 10));

  let list = [...infoList];
  if (title) {
    list = list.filter((item) =>
      String(item.title || '')
        .toLowerCase()
        .includes(title)
    );
  }
  if (infoCategory) {
    list = list.filter((item) =>
      String(item.infoCategory || '')
        .toLowerCase()
        .includes(infoCategory)
    );
  }
  if (infoType) {
    list = list.filter((item) => String(item.infoType || '').toLowerCase() === infoType);
  }
  if (statusValue === 0 || statusValue === 1) {
    list = list.filter((item) => Number(item.status) === statusValue);
  }
  list.sort((a, b) => Number(b.id) - Number(a.id));

  const data = paginate(list, pageIndex, pageSize);
  res.json({ code: 200, data: { list: data.list, total: data.total }, msg: 'success' });
});

app.get('/api/system/infos/:id', (req, res) => {
  const id = Number(req.params.id);
  const detail = infoList.find((item) => item.id === id);
  if (!detail) {
    return res.status(404).json({ code: 404, msg: '资讯不存在' });
  }
  return res.json({ code: 200, data: detail, msg: 'success' });
});

app.post('/api/system/infos', (req, res) => {
  const body = req.body || {};
  const now = new Date().toLocaleString();
  const infoType = body.infoType === 'external' ? 'external' : 'internal';
  const newItem = {
    id: Date.now(),
    title: String(body.title || '').trim(),
    infoCategory: String(body.infoCategory || '').trim(),
    infoType,
    externalLink: infoType === 'external' ? String(body.externalLink || '').trim() : '',
    publisher: String(body.publisher || '').trim(),
    content: infoType === 'internal' ? body.content || '' : '',
    status: Number(body.status) === 1 ? 1 : 0,
    publishTime: Number(body.status) === 1 ? body.publishTime || now : '',
    updateTime: now
  };
  infoList.unshift(newItem);
  res.json({ code: 200, data: newItem, msg: '新增成功' });
});

app.put('/api/system/infos/:id', (req, res) => {
  const id = Number(req.params.id);
  const body = req.body || {};
  const idx = infoList.findIndex((item) => item.id === id);
  if (idx === -1) {
    return res.status(404).json({ code: 404, msg: '资讯不存在' });
  }
  const current = infoList[idx];
  const nextType = body.infoType == null ? current.infoType : body.infoType === 'external' ? 'external' : 'internal';
  const nextStatus = body.status == null ? current.status : Number(body.status) === 1 ? 1 : 0;
  const now = new Date().toLocaleString();
  const nextItem = {
    ...current,
    ...(body.title != null ? { title: String(body.title).trim() } : {}),
    ...(body.infoCategory != null ? { infoCategory: String(body.infoCategory).trim() } : {}),
    ...(body.publisher != null ? { publisher: String(body.publisher).trim() } : {}),
    infoType: nextType,
    externalLink:
      nextType === 'external'
        ? body.externalLink != null
          ? String(body.externalLink).trim()
          : current.externalLink || ''
        : '',
    content:
      nextType === 'internal'
        ? body.content != null
          ? body.content
          : current.content || ''
        : '',
    status: nextStatus,
    publishTime:
      nextStatus === 1 ? body.publishTime || current.publishTime || now : body.publishTime || current.publishTime || '',
    updateTime: now
  };
  infoList[idx] = nextItem;
  return res.json({ code: 200, data: nextItem, msg: '更新成功' });
});

app.delete('/api/system/infos/:id', (req, res) => {
  const id = Number(req.params.id);
  infoList = infoList.filter((item) => item.id !== id);
  res.json({ code: 200, msg: '删除成功' });
});

// =======================
// 系统管理：组织架构 API（模拟）
// =======================

app.get('/api/system/org/tree', (req, res) => {
  const { source = 'platform', tenantId } = req.query;

  const resolveTenantId = () => {
    // 1) admin 显式传 tenantId（前端筛选）
    if (tenantId !== undefined && tenantId !== '') {
      const tid = parseInt(String(tenantId), 10);
      return Number.isFinite(tid) ? tid : null;
    }
    // 2) 其他角色：根据登录态自动取 tenantId
    const token = req.headers['authorization'];
    const platformUserId = tokenToPlatformUserId[token];
    if (platformUserId != null) {
      const u = platformUsers.find((x) => x.id === platformUserId);
      return u?.tenantId ?? null;
    }
    return null;
  };

  const tid = resolveTenantId();
  const baseTree =
    source === 'zzd'
      ? zzdOrgTree
      : tid != null && orgTreeByTenantId[tid]
        ? orgTreeByTenantId[tid]
        : platformOrgTree;

  res.json({ code: 200, data: baseTree, msg: 'success' });
});

app.post('/api/system/org/node', (req, res) => {
  const { parentId = null, name, sort = 1 } = req.body || {};
  if (!name) return res.status(400).json({ code: 400, msg: 'name 不能为空' });
  const newNode = {
    id: Date.now(),
    parentId: parentId ? parseInt(parentId) : null,
    name,
    sort,
    children: []
  };
  if (!newNode.parentId) {
    platformOrgTree.push(newNode);
  } else {
    const parent = findOrgNodeById(platformOrgTree, newNode.parentId);
    if (!parent) return res.status(404).json({ code: 404, msg: '父节点不存在' });
    parent.children = parent.children || [];
    parent.children.push(newNode);
  }
  res.json({ code: 200, data: newNode, msg: '新增成功' });
});

app.put('/api/system/org/node/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const node = findOrgNodeAcrossAllTenants(id);
  if (!node) return res.status(404).json({ code: 404, msg: '节点不存在' });
  const { name, sort, status, orgCode, leader, phone } = req.body || {};
  if (name != null) node.name = name;
  if (sort != null) node.sort = sort;
  if (status != null && (status === 0 || status === 1 || status === '0' || status === '1')) {
    node.status = Number(status);
  }
  if (orgCode != null) node.orgCode = String(orgCode);
  if (leader != null) node.leader = String(leader);
  if (phone != null) node.phone = String(phone);
  node.updateTime = new Date().toLocaleString();
  res.json({ code: 200, msg: '修改成功' });
});

app.delete('/api/system/org/node/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const removed = removeOrgNodeById(platformOrgTree, id);
  if (!removed) return res.status(404).json({ code: 404, msg: '节点不存在' });
  res.json({ code: 200, msg: '删除成功' });
});

app.post('/api/system/org/import/zzd', (req, res) => {
  // 模拟导入：覆盖 zzdOrgTree
  const now = new Date().toLocaleString();
  zzdOrgTree = [
    {
      id: 9001,
      parentId: null,
      name: '浙政钉组织',
      sort: 1,
      importTime: now,
      children: [
        { id: 9002, parentId: 9001, name: '省级单位', sort: 1, children: [] },
        {
          id: 9003,
          parentId: 9001,
          name: '市级单位',
          sort: 2,
          children: [{ id: 9004, parentId: 9003, name: '某市局', sort: 1, children: [] }]
        }
      ]
    }
  ];
  res.json({ code: 200, data: { importedAt: now }, msg: '导入成功' });
});

// --- API管理接口 ---
let apiList = [
  {
    id: 1,
    name: '用户登录',
    moduleName: '主系统',
    method: 'POST',
    path: '/platform/auth/login',
    status: 1,
    description: '账号密码登录',
    createTime: '2026-03-01 10:00:00'
  },
  {
    id: 2,
    name: '查询用户列表',
    moduleName: '主系统',
    method: 'GET',
    path: '/platform/system/user/list',
    status: 1,
    description: '分页查询用户',
    createTime: '2026-03-01 10:05:00'
  },
  {
    id: 3,
    name: '新增用户',
    moduleName: '主系统',
    method: 'POST',
    path: '/platform/system/user/add',
    status: 1,
    description: '新增用户',
    createTime: '2026-03-01 10:10:00'
  },
  {
    id: 4,
    name: '删除用户',
    moduleName: '主系统',
    method: 'DELETE',
    path: '/platform/system/user/delete',
    status: 1,
    description: '删除用户',
    createTime: '2026-03-01 10:15:00'
  }
];

function normalizeApiIds(value) {
  if (!value) return [];
  const raw = Array.isArray(value) ? value : [value];
  const nums = raw
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n) && n > 0);
  return Array.from(new Set(nums));
}

app.get('/api/apis', (req, res) => {
  const q = req.query || {};
  const name = String(q.name || '').trim().toLowerCase();
  const moduleName = String(q.moduleName || '').trim().toLowerCase();
  const method = String(q.method || '').trim().toUpperCase();
  const status = q.status === undefined || q.status === '' ? undefined : Number(q.status);
  const pageIndex = Math.max(1, Number(q.pageIndex || 1));
  const pageSize = Math.max(1, Number(q.pageSize || 10));

  let list = apiList.slice();
  if (name) list = list.filter((i) => String(i.name || '').toLowerCase().includes(name));
  if (moduleName) list = list.filter((i) => String(i.moduleName || '').toLowerCase().includes(moduleName));
  if (method) list = list.filter((i) => String(i.method || '').toUpperCase() === method);
  if (status === 0 || status === 1) list = list.filter((i) => Number(i.status) === status);

  const total = list.length;
  const start = (pageIndex - 1) * pageSize;
  const end = start + pageSize;
  list = list.slice(start, end);

  res.json({ code: 200, data: { list, total }, msg: 'success' });
});

app.post('/api/apis', (req, res) => {
  const body = req.body || {};
  const newApi = {
    id: Date.now(),
    name: body.name || '未命名API',
    moduleName: body.moduleName || '未分组',
    method: String(body.method || 'GET').toUpperCase(),
    path: body.path || '/',
    status: body.status === 0 ? 0 : 1,
    description: body.description || '',
    createTime: new Date().toLocaleString()
  };
  apiList.unshift(newApi);
  res.json({ code: 200, msg: '新增成功' });
});

app.put('/api/apis/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const body = req.body || {};
  const idx = apiList.findIndex((i) => i.id === id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: 'API不存在' });
  apiList[idx] = {
    ...apiList[idx],
    ...body,
    ...(body.method ? { method: String(body.method).toUpperCase() } : {})
  };
  res.json({ code: 200, msg: '更新成功' });
});

app.delete('/api/apis/:id', (req, res) => {
  const id = parseInt(req.params.id);
  apiList = apiList.filter((i) => i.id !== id);
  res.json({ code: 200, msg: '删除成功' });
});

// --- 菜单管理接口 ---

app.get('/api/menus', (req, res) => {
  // 注意：这里返回了包含按钮的全量树
  // 前端 Sidebar 组件如果不想显示按钮，需要根据 type !== 'button' 进行过滤
  const sortedList = sortMenus(menuList);
  const removePersonalCenter = (list) =>
    (list || [])
      .filter((item) => !(item?.app === 'main' && item?.title === '个人中心'))
      .map((item) => ({
        ...item,
        children: removePersonalCenter(item.children || [])
      }));
  const visibleList = removePersonalCenter(sortedList);

  res.json({
    code: 200,
    data: visibleList,
    msg: 'success'
  });
});

app.post('/api/menus', (req, res) => {
  const body = req.body || {};
  const newMenu = {
    id: Date.now(),
    children: [],
    ...body,
    hidden: body.hidden === true,
    apiIds: normalizeApiIds(body.apiIds)
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
  const body = req.body || {};
  const targetNode = findMenuById(menuList, id);
  if (!targetNode) return res.status(404).json({ code: 404, msg: '菜单不存在' });
  if (body.apiIds !== undefined) body.apiIds = normalizeApiIds(body.apiIds);

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
  Object.assign(targetNode, {
    ...body,
    ...(body.hidden != null ? { hidden: body.hidden === true } : {})
  });
  res.json({ code: 200, msg: '更新成功' });
});

app.delete('/api/menus/:id', (req, res) => {
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
  res.json({ code: 200, msg: '删除成功' });
});

// --- 应用管理接口 ---
app.get('/api/apps', (req, res) => {
  const cat = req.query.category;
  const allowed = ['platform', 'sso', 'external'];
  let list = appList;
  if (cat && allowed.includes(String(cat))) {
    list = appList.filter((a) => a.category === cat);
  }
  res.json({ code: 200, data: list, msg: 'success' });
});
app.post('/api/apps', (req, res) => {
  const body = req.body || {};
  const newApp = {
    id: Date.now(),
    createTime: new Date().toLocaleString(),
    ...body,
    category: body.category || 'platform',
    showInWorkbench: body.showInWorkbench === true
  };
  appList.push(newApp);
  res.json({ code: 200, msg: '新增成功' });
});
app.put('/api/apps/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = appList.findIndex((item) => item.id === id);
  if (idx !== -1) {
    const body = req.body || {};
    appList[idx] = {
      ...appList[idx],
      ...body,
      ...(body.showInWorkbench != null ? { showInWorkbench: body.showInWorkbench === true } : {})
    };
    res.json({ code: 200, msg: '修改成功' });
  } else {
    res.status(404).json({ code: 404, msg: '应用不存在' });
  }
});
app.delete('/api/apps/:id', (req, res) => {
  const id = parseInt(req.params.id);
  appList = appList.filter((item) => item.id !== id);
  res.json({ code: 200, msg: '删除成功' });
});

app.listen(PORT, () => {
  console.log(`Node.js 权限服务已启动: http://localhost:${PORT}`);
});

// --- 工作台管理接口 ---

// 1. 获取工作台列表
app.get('/api/workbench', (req, res) => {
  // 按照 sort 字段升序排序
  const sortedList = [...workbenchList].sort((a, b) => (a.sort || 0) - (b.sort || 0));
  res.json({ code: 200, data: sortedList, msg: 'success' });
});

// 2. 新增工作台卡片
app.post('/api/workbench', (req, res) => {
  const newItem = {
    id: Date.now(),
    createTime: new Date().toLocaleString(),
    ...req.body
  };
  workbenchList.push(newItem);
  res.json({ code: 200, msg: '新增成功', data: newItem });
});

// 3. 修改工作台卡片
app.put('/api/workbench/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = workbenchList.findIndex((item) => item.id === id);
  if (idx !== -1) {
    workbenchList[idx] = { ...workbenchList[idx], ...req.body };
    res.json({ code: 200, msg: '修改成功' });
  } else {
    res.status(404).json({ code: 404, msg: '数据不存在' });
  }
});

// 4. 删除工作台卡片
app.delete('/api/workbench/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const initialLength = workbenchList.length;
  workbenchList = workbenchList.filter((item) => item.id !== id);

  if (workbenchList.length < initialLength) {
    res.json({ code: 200, msg: '删除成功' });
  } else {
    res.status(404).json({ code: 404, msg: '数据不存在' });
  }
});

// =======================
// 系统设置、字典、故障码 API
// =======================

// --- 基础配置数据 ---
let basicConfig = {
  systemName: '微前端基座系统',
  logo: '',
  themeColor: '#409eff',
  layout: 'side'
};

let securityConfig = {
  defaultPassword: 'Password123!',
  minLength: 8,
  complexity: ['uppercase', 'lowercase', 'number'],
  expireDays: 90,
  maxFailures: 5
};

// 获取基础设置
app.get('/api/settings/basic', (req, res) => {
  res.json({ code: 200, data: basicConfig, msg: 'success' });
});
// 修改基础设置
app.put('/api/settings/basic', (req, res) => {
  basicConfig = { ...basicConfig, ...req.body };
  res.json({ code: 200, msg: '基础设置保存成功' });
});

// 获取安全策略
app.get('/api/settings/security', (req, res) => {
  res.json({ code: 200, data: securityConfig, msg: 'success' });
});
// 修改安全策略
app.put('/api/settings/security', (req, res) => {
  securityConfig = { ...securityConfig, ...req.body };
  res.json({ code: 200, msg: '安全策略保存成功' });
});

// --- 系统字典数据 ---
let dictList = [
  {
    id: 1,
    dictName: '用户性别',
    dictType: 'sys_user_sex',
    status: 1,
    remark: '用户性别列表',
    createTime: '2023-10-01 10:00:00'
  },
  {
    id: 2,
    dictName: '系统状态',
    dictType: 'sys_normal_disable',
    status: 1,
    remark: '系统开关状态',
    createTime: '2023-10-01 10:00:00'
  }
];

app.get('/api/dict', (req, res) => {
  res.json({ code: 200, data: dictList, msg: 'success' });
});
app.post('/api/dict', (req, res) => {
  const newItem = { id: Date.now(), createTime: new Date().toLocaleString(), ...req.body };
  dictList.push(newItem);
  res.json({ code: 200, msg: '新增字典成功' });
});
app.put('/api/dict/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = dictList.findIndex((item) => item.id === id);
  if (idx !== -1) {
    dictList[idx] = { ...dictList[idx], ...req.body };
    res.json({ code: 200, msg: '修改字典成功' });
  } else {
    res.status(404).json({ code: 404, msg: '字典不存在' });
  }
});
app.delete('/api/dict/:id', (req, res) => {
  const id = parseInt(req.params.id);
  dictList = dictList.filter((item) => item.id !== id);
  res.json({ code: 200, msg: '删除字典成功' });
});

// --- 故障码数据 ---
let faultList = [
  {
    id: 1,
    faultCode: 'E201',
    faultCategory: '机房暖通故障',
    faultLevel: '3',
    status: 1,
    suggestion: '检查机柜通风及制冷设备运行状态',
    createTime: '2026-03-10 09:00:00'
  },
  {
    id: 2,
    faultCode: 'E202',
    faultCategory: '数据通信故障',
    faultLevel: '2',
    status: 1,
    suggestion: '检查数据通信回路及设备连接',
    createTime: '2026-03-10 10:00:00'
  },
  {
    id: 3,
    faultCode: 'E203',
    faultCategory: '消防设施异常',
    faultLevel: '3',
    status: 1,
    suggestion: '排查灭火设施及管路密封检测',
    createTime: '2026-03-11 08:30:00'
  },
  {
    id: 4,
    faultCode: 'W001',
    faultCategory: '给排水泵故障',
    faultLevel: '1',
    status: 1,
    suggestion: '查看相应消防监控设备及联动',
    createTime: '2026-03-12 14:00:00'
  },
  {
    id: 5,
    faultCode: 'W002',
    faultCategory: '环境监测仪小隐患',
    faultLevel: '2',
    status: 0,
    suggestion: '清理排烟设施金属互导联通检查',
    createTime: '2026-03-13 11:00:00'
  }
];

app.get('/api/fault', (req, res) => {
  const { faultCode, faultCategory, faultLevel } = req.query;
  let list = [...faultList];
  if (faultCode && String(faultCode).trim()) {
    const c = String(faultCode).trim().toLowerCase();
    list = list.filter((item) => (item.faultCode || '').toLowerCase().includes(c));
  }
  if (faultCategory && String(faultCategory).trim()) {
    const n = String(faultCategory).trim().toLowerCase();
    list = list.filter((item) => (item.faultCategory || '').toLowerCase().includes(n));
  }
  if (faultLevel && String(faultLevel).trim()) {
    list = list.filter((item) => String(item.faultLevel) === String(faultLevel));
  }
  res.json({ code: 200, data: list, msg: 'success' });
});
app.post('/api/fault', (req, res) => {
  const now = new Date().toLocaleString();
  const newItem = { id: Date.now(), createTime: now, status: 1, ...req.body };
  faultList.push(newItem);
  res.json({ code: 200, msg: '新增故障码成功', data: newItem });
});
app.put('/api/fault/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = faultList.findIndex((item) => item.id === id);
  if (idx !== -1) {
    faultList[idx] = { ...faultList[idx], ...req.body };
    res.json({ code: 200, msg: '修改故障码成功' });
  } else {
    res.status(404).json({ code: 404, msg: '故障码不存在' });
  }
});
app.delete('/api/fault/:id', (req, res) => {
  const id = parseInt(req.params.id);
  faultList = faultList.filter((item) => item.id !== id);
  res.json({ code: 200, msg: '删除故障码成功' });
});

// --- 友情链接数据 ---
let linkList = [
  {
    id: 1,
    name: '中华人民共和国生态环境部',
    url: 'https://www.mee.gov.cn/',
    sort: 1,
    status: 1,
    createTime: '2026-03-10 09:00:00'
  },
  {
    id: 2,
    name: '浙江省生态环境厅',
    url: 'https://sthjt.zj.gov.cn/',
    sort: 2,
    status: 1,
    createTime: '2026-03-10 09:10:00'
  },
  {
    id: 3,
    name: '浙江省污染源自动监控信息管理系统',
    url: 'https://zxpt.zjepb.gov.cn/',
    sort: 3,
    status: 1,
    createTime: '2026-03-10 09:20:00'
  },
  {
    id: 4,
    name: '空气质量预报网',
    url: 'https://air.cnemc.cn:18007/',
    sort: 4,
    status: 1,
    createTime: '2026-03-10 09:30:00'
  },
  {
    id: 5,
    name: '中央气象台空气污染气象条件预报',
    url: 'http://www.nmc.cn/publish/air.html',
    sort: 5,
    status: 1,
    createTime: '2026-03-10 09:40:00'
  },
  {
    id: 6,
    name: '浙江省环境监测中心',
    url: 'http://www.zjemc.org.cn/',
    sort: 6,
    status: 1,
    createTime: '2026-03-10 09:50:00'
  },
  {
    id: 7,
    name: '国家环境空气质量预报中心',
    url: 'http://aqicn.org/city/hangzhou/cn/',
    sort: 7,
    status: 1,
    createTime: '2026-03-10 10:00:00'
  },
  {
    id: 8,
    name: '浙江政务服务网',
    url: 'https://www.zjzwfw.gov.cn/',
    sort: 8,
    status: 1,
    createTime: '2026-03-10 10:10:00'
  },
  {
    id: 9,
    name: '全国排污许可证管理信息平台',
    url: 'https://permit.mee.gov.cn/',
    sort: 9,
    status: 1,
    createTime: '2026-03-10 10:20:00'
  },
  {
    id: 10,
    name: '浙江省生态环境大数据平台',
    url: 'https://example.com/eco-platform',
    sort: 10,
    status: 0,
    createTime: '2026-03-10 10:30:00'
  }
];

app.get('/api/link', (req, res) => {
  const { name, status } = req.query;
  let list = [...linkList];
  if (name && String(name).trim()) {
    const keyword = String(name).trim().toLowerCase();
    list = list.filter((item) => String(item.name || '').toLowerCase().includes(keyword));
  }
  if (status !== undefined && status !== null && status !== '') {
    const statusNum = Number(status);
    if (!isNaN(statusNum)) {
      list = list.filter((item) => Number(item.status) === statusNum);
    }
  }
  list.sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0));
  res.json({ code: 200, data: list, msg: 'success' });
});

app.post('/api/link', (req, res) => {
  const now = new Date().toLocaleString();
  const payload = req.body || {};
  const newItem = {
    id: Date.now(),
    name: String(payload.name || '').trim(),
    url: String(payload.url || '').trim(),
    sort: Number(payload.sort || 0),
    status: Number(payload.status) === 0 ? 0 : 1,
    createTime: now
  };
  linkList.push(newItem);
  res.json({ code: 200, msg: '新增友情链接成功', data: newItem });
});

app.put('/api/link/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = linkList.findIndex((item) => item.id === id);
  if (idx === -1) {
    return res.status(404).json({ code: 404, msg: '友情链接不存在' });
  }
  const patch = req.body || {};
  linkList[idx] = {
    ...linkList[idx],
    ...(patch.name != null ? { name: String(patch.name).trim() } : {}),
    ...(patch.url != null ? { url: String(patch.url).trim() } : {}),
    ...(patch.sort != null ? { sort: Number(patch.sort) } : {}),
    ...(patch.status != null ? { status: Number(patch.status) === 0 ? 0 : 1 } : {})
  };
  res.json({ code: 200, msg: '修改友情链接成功' });
});

app.delete('/api/link/batch', (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  const idSet = new Set(ids.map((item) => Number(item)).filter((item) => !isNaN(item)));
  if (!idSet.size) {
    return res.status(400).json({ code: 400, msg: '请选择要删除的数据' });
  }
  linkList = linkList.filter((item) => !idSet.has(Number(item.id)));
  res.json({ code: 200, msg: '批量删除成功' });
});

app.delete('/api/link/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  linkList = linkList.filter((item) => item.id !== id);
  res.json({ code: 200, msg: '删除友情链接成功' });
});

// --- Logo 上传（可选：JSON body 传 base64 + filename，返回 url）---
app.post('/api/upload', (req, res) => {
  const { base64, filename } = req.body || {};
  if (!base64 || !filename) {
    return res.status(400).json({ code: 400, msg: '缺少 base64 或 filename' });
  }
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  const buf = Buffer.from(base64Data, 'base64');
  const ext = path.extname(filename) || '.png';
  const name = (path.basename(filename, ext) || 'logo') + '_' + Date.now() + ext;
  const filePath = path.join(uploadsDir, name);
  fs.writeFileSync(filePath, buf);
  const url = '/uploads/' + name;
  res.json({ code: 200, data: { url }, msg: '上传成功' });
});
