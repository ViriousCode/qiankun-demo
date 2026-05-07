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

const isValidHttpUrl = (value) => {
  try {
    const url = new URL(String(value || '').trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

/** 是否使用 entryLocal：MICRO_ENTRY_PROFILE=local|deploy 优先；本地开发默认走 entryLocal */
const isLocalMicroEntryProfile = () => {
  const p = String(process.env.MICRO_ENTRY_PROFILE || '').toLowerCase();
  if (p === 'local' || p === 'dev' || p === 'development') return true;
  if (p === 'deploy' || p === 'prod' || p === 'production') return false;
  const nodeEnv = String(process.env.NODE_ENV || '').toLowerCase();
  return nodeEnv === 'development' || nodeEnv === 'dev' || !nodeEnv;
};

/** 内存里 entry 为部署地址；entryLocal 为本地开发地址。接口返回的 entry 按环境解析。 */
const resolveAppEntry = (app) => {
  if (isLocalMicroEntryProfile() && app.entryLocal) {
    const local = String(app.entryLocal).trim();
    if (local && isValidHttpUrl(local)) return local;
  }
  return app.entry;
};

const mapAppsForApiResponse = (list) =>
  list.map((a) => ({
    ...a,
    entry: resolveAppEntry(a)
  }));

// =======================
// 1. 模拟数据库 (内存数据)
// =======================

// --- 子应用列表数据 ---
// name, entry, activeRule不能重复
// entry：打包部署 / 生产加载子应用；entryLocal：本机 npm run dev 时加载（由 MICRO_ENTRY_PROFILE 或 NODE_ENV 选择）
let appList = [
  {
    id: 2,
    name: 'case',
    shortName: '案例',
    code: 'app_2',
    category: 'platform',
    entry: 'http://192.168.1.88:3003',
    entryLocal: 'http://localhost:3003',
    iconName: 'urlIcon-icon-case',
    leader: '平台管理员',
    status: 1,
    showInWorkbench: true,
    activeRule: '/case',
    container: '#sub-app-container',
    createTime: '2023-01-01 12:00:00',
    tenantId: 9001
  },
  {
    id: 3,
    name: 'air',
    shortName: '空气管理平台',
    code: 'app_3',
    category: 'platform',
    entry: 'http://192.168.1.88:3001',
    entryLocal: 'http://192.168.15.72:5180',
    iconName: 'urlIcon-icon-air',
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
    name: 'water',
    shortName: '水环境管理平台',
    code: 'app_4',
    category: 'platform',
    entry: 'http://192.168.1.88:3002',
    entryLocal: 'http://localhost:5181',
    iconName: 'urlIcon-icon-water',
    leader: '平台管理员',
    status: 1,
    showInWorkbench: true,
    activeRule: '/platform-app-water',
    container: '#sub-app-container',
    createTime: '2026-04-02 11:00:00',
    tenantId: 9002
  },
  {
    id: 8,
    name: 'oa',
    shortName: 'OA工作流',
    code: 'app_8',
    category: 'platform',
    entry: 'http://192.168.1.88:3006',
    entryLocal: 'http://localhost:3006',
    iconName: 'urlIcon-icon-case',
    leader: '平台管理员',
    status: 1,
    showInWorkbench: true,
    activeRule: '/platform-app-oa',
    container: '#sub-app-container',
    createTime: '2026-04-28 16:00:00',
    tenantId: 9002
  },
  {
    id: 111,
    // 展示名称请用 shortName
    name: 'radiation',
    shortName: '辐射管理平台',
    code: 'app_radiation',
    category: 'platform',
    entry: 'http://192.168.1.88:3005/',
    entryLocal: 'http://localhost:5300/',
    iconName: 'urlIcon-icon-radiation',
    leader: '平台管理员',
    status: 1,
    showInWorkbench: true,
    activeRule: '/radiation',
    container: '#sub-app-container',
    createTime: '2023-01-01 12:00:00',
    tenantId: 9002
  },
  {
    id: 112,
    name: 'form-designer',
    shortName: '表单设计器',
    code: 'app_form-designer',
    category: 'platform',
    entry: 'http://192.168.1.88:3007',
    entryLocal: 'http://localhost:3007',
    iconName: 'urlIcon-icon-case',
    leader: '平台管理员',
    status: 1,
    showInWorkbench: true,
    activeRule: '/form-designer',
    container: '#sub-app-container',
    createTime: '2023-01-01 12:00:00',
    tenantId: 9002
  },
  {
    id: 5,
    name: 'radioactive-source',
    shortName: '放射源管理平台',
    code: 'app_5',
    category: 'platform',
    entry: 'http://192.168.1.88:3004/',
    entryLocal: 'http://localhost:5182/',
    iconName: 'urlIcon-icon-ray',
    leader: '平台管理员',
    status: 1,
    showInWorkbench: true,
    activeRule: '/platform-app-radioactive-source',
    container: '#sub-app-container',
    createTime: '2023-01-01 12:00:00',
    tenantId: 9002
  },
  {
    id: 6,
    name: 'ai',
    shortName: 'ai问数',
    code: 'app_6',
    category: 'platform',
    entry: 'http://192.168.15.72:5179',
    entryLocal: 'http://192.168.15.72:5179',
    iconName: 'urlIcon-icon-air',
    leader: '平台管理员',
    status: 1,
    showInWorkbench: true,
    activeRule: '/platform-app-ai',
    container: '#sub-app-container',
    createTime: '2023-01-01 12:00:00',
    tenantId: 9002
  },
  {
    id: 3008,
    name: 'pdl',
    shortName: '排污许可证',
    code: 'app_3008',
    category: 'platform',
    entry: 'http://192.168.1.88:3008/',
    entryLocal: 'http://localhost:5183',
    iconName: 'urlIcon-icon-file',
    leader: '平台管理员',
    status: 1,
    showInWorkbench: true,
    activeRule: '/platform-app-pdl',
    container: '#sub-app-container',
    createTime: '2026-04-29 12:00:00',
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
      appKey: 'main',
      createTime: '2026-03-11 08:45',
      desc: '角色配置核对',
      deadline: '2026-03-13 18:00',
      title: '角色配置核对',
      detailDesc:
        '请尽快完成用户在生产环境中的权限配置，要为后续的授权功能做准备，并且需要同步到PC端配置一次，确保PC端访问的流畅性。'
    },
    {
      category: '用户管理',
      appKey: 'main',
      createTime: '2026-03-11 09:20',
      desc: '用户信息审核',
      deadline: '2026-03-12 18:00',
      title: '用户信息审核',
      detailDesc: '请核对新用户资料并确认账号状态，处理完成后同步通知相关业务负责人。'
    },
    {
      category: '审批',
      appKey: 'main',
      createTime: '2026-03-10 16:30',
      desc: '审批单待处理',
      deadline: '2026-03-13 12:00',
      title: '审批单待处理',
      detailDesc: '您有一条审批任务待处理，请在截止时间前完成审批。'
    },
    {
      category: 'API管理',
      appKey: 'main',
      createTime: '2026-03-10 14:00',
      desc: '接口配置复核',
      deadline: '2026-03-12 18:00',
      title: '接口配置复核',
      detailDesc: '请复核新增接口的权限与分组配置，确认可正常发布。'
    },
    {
      category: '组织管理',
      appKey: 'main',
      createTime: '2026-03-09 10:00',
      desc: '组织架构审核',
      deadline: '2026-03-14 18:00',
      title: '组织架构审核',
      detailDesc: '请检查组织架构调整内容，确认人员归属和部门关系无误。'
    }
  ];

  const subAppPending = [
    {
      category: '站点巡检',
      appKey: 'water',
      createTime: '2026-03-12 09:10',
      desc: '自动站点位异常复核',
      deadline: '2026-03-13 18:00',
      title: '自动站点位异常复核',
      detailDesc: '请在水环境管理平台中核对异常站点的采样与审核记录，确认是否需要发起工单。'
    },
    {
      category: '污染源监控',
      appKey: 'air',
      createTime: '2026-03-12 10:30',
      desc: '企业排放数据异常提醒',
      deadline: '2026-03-13 12:00',
      title: '企业排放数据异常提醒',
      detailDesc: '请在空气管理平台中核对企业排放数据曲线与原始数据，必要时联系企业核查。'
    },
    {
      category: '案件办理',
      appKey: 'case',
      createTime: '2026-03-12 14:20',
      desc: '案件评查即将逾期',
      deadline: '2026-03-12 18:00',
      title: '案件评查即将逾期',
      detailDesc: '请在案例平台中尽快完成案件评查，避免逾期影响考核。'
    }
  ];

  const pending = base.map((item, index) => ({
    id: `pending-${index + 1}`,
    ...item,
    status: 'pending'
  }));

  const subPending = subAppPending.map((item, index) => ({
    id: `pending-sub-${index + 1}`,
    ...item,
    status: 'pending'
  }));

  const done = [
    {
      id: 'done-1',
      category: '审批',
      appKey: 'main',
      createTime: '2026-03-08 11:00',
      desc: '已处理完成的任务示例',
      deadline: '2026-03-10 18:00',
      status: 'done',
      completeTime: '2026-03-10 16:00',
      title: '已处理完成的任务示例',
      detailDesc: '该待办已处理完成，仅用于演示已处理分页与详情数据。'
    },
    {
      id: 'done-2',
      category: '工单处理',
      appKey: 'water',
      createTime: '2026-03-07 10:10',
      desc: '已完成工单处理示例',
      deadline: '2026-03-08 18:00',
      status: 'done',
      completeTime: '2026-03-08 17:20',
      title: '已完成工单处理示例',
      detailDesc: '该已办事项来自水环境管理平台，用于演示按应用筛选。'
    }
  ];

  return [...pending, ...subPending, ...done];
};

let todoList = createTodoItems();

// --- 我的消息数据 ---
const createMessageItems = () => {
  // 消息来源（子应用 key）：用于前端展示“来源子应用简称+图标”
  // key 可填 appList[].name / shortName / code；这里优先用 name
  const sourceAppByTitle = {
    企一档: 'case',
    污染源: 'air',
    排污许可: 'air',
    AI问数: 'ai'
  };
  return [
    {
      id: 'message-1',
      title: '企一档',
      summary: '请在 2026年02月28日 前及时完成「浙环案[2026] 6292」案件的评查，避免案件评查逾期',
      detailContent:
        '根据近期组织调整安排，系统中的组织架构将在本周五统一生效。请各部门管理员提前核对本部门人员归属、岗位信息及联系人配置，如发现异常请在生效前完成修正，以免影响后续审批与数据权限使用。',
      publishTime: '2026-03-18 15:56',
      status: 'unread',
      level: 'warning',
      sourceApp: sourceAppByTitle['企一档'],
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
      sourceApp: 'main',
      category: '系统通知'
    },
    {
      id: 'message-3',
      title: 'AI问数',
      summary:
        '「浙环案[2026] 6292」案件的评查人员分配任务 已逾期，请尽快处理，避免案件后续流程超期',
      detailContent:
        'AI问数已完成本月运行月报生成，包含核心指标汇总、同比趋势与异常波动提示。请相关负责人尽快查阅并确认内容，如需补充说明可在系统中追加备注。',
      publishTime: '2026-03-18 11:26',
      status: 'unread',
      level: 'danger',
      sourceApp: sourceAppByTitle['AI问数'],
      category: '业务公告'
    },
    {
      id: 'message-4',
      title: '',
      summary: '消息中心支持分页展示',
      detailContent:
        '消息中心功能已完成升级，当前支持分页浏览、未读已读分类查看以及详情展示。后续还将补充标记已读与批量处理能力。',
      publishTime: '2026-03-17 10:58',
      status: 'unread',
      level: 'danger',
      sourceApp: 'main',
      category: '系统通知'
    },
    {
      id: 'message-5',
      title: '污染源',
      summary: '请在 2026-02-28 前完成污染源模块友情链接复核任务，避免任务逾期',
      detailContent:
        '友情链接配置本轮复核任务已下发至对应模块管理员，请在规定时间内完成链接有效性、跳转地址与展示名称校验，确保门户展示信息准确。',
      publishTime: '2026-03-18 09:26',
      status: 'unread',
      level: 'warning',
      sourceApp: sourceAppByTitle['污染源'],
      category: '业务公告'
    },
    {
      id: 'message-6',
      title: '',
      summary: '新版本将于今晚 22:00 发布',
      detailContent:
        '平台新版本计划于今晚 22:00 发布，预计持续 15 分钟。发布期间部分功能可能出现短暂不可用，请提前安排好业务操作时间。',
      publishTime: '2026-03-16 09:16',
      status: 'unread',
      level: 'warning',
      sourceApp: 'main',
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
      sourceApp: sourceAppByTitle['排污许可'],
      category: '待办提醒'
    },
    {
      id: 'message-8',
      title: '污染源',
      summary: '本周例行巡检计划已发布',
      detailContent:
        '污染源模块已发布本周例行巡检计划，请按计划完成巡检任务，并及时录入巡检结果与现场照片，确保台账数据完整。',
      publishTime: '2026-03-15 09:02',
      status: 'unread',
      level: 'danger',
      sourceApp: sourceAppByTitle['污染源'],
      category: '业务公告'
    },
    {
      id: 'message-12',
      title: '企一档',
      summary: '请在 2026-03-25 前及时完成「浙环案[2026] 6310」案件的复核，避免逾期',
      detailContent: '案件复核任务已下发，请责任人按时完成复核并补充说明材料，确保后续流转正常。',
      publishTime: '2026-03-14 14:26',
      status: 'unread',
      level: 'warning',
      sourceApp: sourceAppByTitle['企一档'],
      category: '业务公告'
    },
    {
      id: 'message-13',
      title: 'AI问数',
      summary: '「浙环案[2026] 6308」案件的分配任务已逾期，请尽快处理，避免后续流程超期',
      detailContent: 'AI问数检测到该案件分配节点超时，请优先处理并关注后续节点时效。',
      publishTime: '2026-03-13 17:40',
      status: 'unread',
      level: 'danger',
      sourceApp: sourceAppByTitle['AI问数'],
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
      sourceApp: sourceAppByTitle['企一档'],
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
      sourceApp: 'main',
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
      sourceApp: sourceAppByTitle['AI问数'],
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
        id: 200,
        parentId: -1,
        title: '管理中心',
        path: '',
        icon: 'Setting',
        sort: 2,
        permission: 'main:center:view',
        type: 'directory',
        app: 'main',
        children: [
          {
            id: 26,
            parentId: 200,
            title: '用户管理',
            path: '/system/user',
            icon: 'icon-ic_yonghu',
            sort: 1,
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
            parentId: 200,
            title: '租户管理',
            path: '/system/tenant',
            icon: 'icon-ic_zuhu',
            sort: 0,
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
                id: 2055,
                parentId: 205,
                title: '授权应用',
                permission: 'main:tenant:authApp',
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
            id: 206,
            parentId: 200,
            title: '账号管理',
            path: '/system/account',
            icon: 'icon-ic_zhanghaoguanli',
            sort: 2,
            permission: 'main:account:view',
            type: 'menu',
            app: 'main',
            children: [
              {
                id: 2061,
                parentId: 206,
                title: '启用禁用账号',
                permission: 'main:account:enable',
                type: 'button',
                app: 'main'
              },
              {
                id: 2062,
                parentId: 206,
                title: '新增账号',
                permission: 'main:account:add',
                type: 'button',
                app: 'main'
              },
              {
                id: 2063,
                parentId: 206,
                title: '解锁账号',
                permission: 'main:account:unlock',
                type: 'button',
                app: 'main'
              },
              {
                id: 2064,
                parentId: 206,
                title: '重置密码',
                permission: 'main:account:resetPwd',
                type: 'button',
                app: 'main'
              },
              {
                id: 2065,
                parentId: 206,
                title: '移除账号',
                permission: 'main:account:remove',
                type: 'button',
                app: 'main'
              }
            ]
          },
          {
            id: 27,
            parentId: 200,
            title: '组织管理',
            path: '/system/org',
            icon: 'icon-ic_zuzhi',
            sort: 2,
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
            parentId: 200,
            title: '菜单管理',
            path: '/system/menu',
            icon: 'icon-ic_caidan',
            sort: 3,
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
            parentId: 200,
            title: 'API管理',
            path: '/system/api',
            icon: 'icon-ic_API',
            sort: 4,
            permission: 'main:api:view',
            type: 'menu',
            app: 'main',
            children: []
          },
          {
            id: 23,
            parentId: 200,
            title: '应用管理',
            path: '',
            icon: 'icon-ic_yingyong',
            sort: 5,
            permission: 'main:app:view',
            type: 'directory',
            app: 'main',
            children: [
              {
                id: 2341,
                parentId: 23,
                title: '平台应用',
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
                title: '单点应用',
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
            parentId: 200,
            title: '权限管理',
            path: '',
            icon: 'icon-ic_quanxian',
            sort: 6,
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
            parentId: 200,
            title: '资讯管理',
            path: '/system/info',
            icon: 'icon-ic_zixun',
            sort: 7,
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
              },
              {
                id: 31005,
                parentId: 31000,
                title: '资讯编辑',
                path: '/system/info/edit',
                permission: 'main:info:edit',
                type: 'menu',
                hidden: true,
                app: 'main'
              }
            ]
          },
          {
            id: 25,
            parentId: 200,
            title: '系统设置',
            path: '',
            icon: 'icon-ic_shezhi',
            sort: 8,
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
                id: 255,
                parentId: 25,
                title: '表单生成器',
                path: '/system/settings/formBuilder',
                icon: 'EditPen',
                sort: 2,
                permission: 'main:formDef:view',
                type: 'menu',
                app: 'main',
                children: [
                  {
                    id: 2551,
                    parentId: 255,
                    title: '新建表单',
                    permission: 'main:formDef:add',
                    type: 'button',
                    app: 'main'
                  },
                  {
                    id: 2552,
                    parentId: 255,
                    title: '设计表单',
                    permission: 'main:formDef:design',
                    type: 'button',
                    app: 'main'
                  },
                  {
                    id: 2553,
                    parentId: 255,
                    title: '编辑表单',
                    permission: 'main:formDef:edit',
                    type: 'button',
                    app: 'main'
                  },
                  {
                    id: 2554,
                    parentId: 255,
                    title: '删除表单',
                    permission: 'main:formDef:delete',
                    type: 'button',
                    app: 'main'
                  },
                  {
                    id: 2555,
                    parentId: 255,
                    title: '预览填报',
                    permission: 'main:formDef:fill',
                    type: 'button',
                    app: 'main'
                  },
                  {
                    id: 2556,
                    parentId: 255,
                    title: '查看提交记录',
                    permission: 'main:formDef:submission:view',
                    type: 'button',
                    app: 'main'
                  },
                  {
                    id: 25501,
                    parentId: 255,
                    title: '表单设计',
                    path: '/system/settings/formBuilder/designer',
                    permission: 'main:formDef:design',
                    type: 'menu',
                    hidden: true,
                    app: 'main',
                    children: []
                  },
                  {
                    id: 25502,
                    parentId: 255,
                    title: '表单填报',
                    path: '/system/settings/formBuilder/fill',
                    permission: 'main:formDef:fill',
                    type: 'menu',
                    hidden: true,
                    app: 'main',
                    children: []
                  },
                  {
                    id: 25503,
                    parentId: 255,
                    title: '提交记录',
                    path: '/system/settings/formBuilder/submissions',
                    permission: 'main:formDef:submission:view',
                    type: 'menu',
                    hidden: true,
                    app: 'main',
                    children: []
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
                  },
                  {
                    id: 2524,
                    parentId: 252,
                    title: '字典分类',
                    path: '/system/settings/dictCategory',
                    permission: 'main:dict:category:view',
                    type: 'menu',
                    hidden: true,
                    app: 'main',
                    children: [
                      {
                        id: 25241,
                        parentId: 2524,
                        title: '新增分类',
                        permission: 'main:dict:category:add',
                        type: 'button',
                        app: 'main'
                      },
                      {
                        id: 25242,
                        parentId: 2524,
                        title: '修改分类',
                        permission: 'main:dict:category:edit',
                        type: 'button',
                        app: 'main'
                      },
                      {
                        id: 25243,
                        parentId: 2524,
                        title: '删除分类',
                        permission: 'main:dict:category:delete',
                        type: 'button',
                        app: 'main'
                      }
                    ]
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
      }
    ]
  },
  // [子应用] 测试系统
  {
    id: 2000,
    parentId: null,
    title: '案卷智能评查系统',
    path: '',
    icon: 'urlIcon-icon-case',
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
        meta: { title: '首页' },
        icon: 'icon-shouye',
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
        meta: { title: '案件库' },
        icon: 'icon-ic_ajk',
        sort: 2,
        permission: 'case:caseDatabase:view',
        type: 'menu',
        app: 'case',
        hidden: false,
        children: [
          {
            id: 20021,
            parentId: 2002,
            title: '新建案件',
            path: '/case/caseDatabase/components/addCase',
            icon: '',
            sort: 1,
            permission: 'case:addCase:view',
            type: 'menu',
            app: 'case',
            hidden: true
          },
          {
            id: 20022,
            parentId: 2002,
            title: '案件详情',
            path: '/case/caseDatabase/components/caseInfo',
            icon: '',
            sort: 2,
            permission: 'case:caseInfo:view',
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
        meta: { title: '案卷评查管理' },
        icon: 'icon-ic_ajpcgl',
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
        meta: { title: '中队评查统计' },
        icon: 'icon-ic_zdpctj',
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
    title: '空气质量监测管理平台',
    path: '',
    icon: 'urlIcon-icon-air',
    sort: 3,
    permission: 'sub:air:view',
    type: 'directory',
    app: 'air',
    children: [
      {
        id: 41,
        parentId: 4,
        title: '首页',
        path: '/platform-app-air/home',
        icon: 'icon-shouye',
        sort: 1,
        permission: 'sub:air:view',
        type: 'menu',
        app: 'air'
      },
      {
        id: 42,
        parentId: 4,
        title: 'GIS一张图',
        path: '/platform-app-air/gis',
        icon: 'icon-xingzhuangjiehe',
        sort: 2,
        permission: 'sub:air:view',
        type: 'menu',
        app: 'air'
      },
      {
        id: 43,
        parentId: 4,
        title: '数据管理',
        path: '/platform-app-air/data',
        icon: 'icon-ic_ajpcgl',
        sort: 3,
        permission: 'sub:air:view',
        type: 'directory',
        app: 'air',
        children: [
          {
            id: 431,
            parentId: 43,
            title: '数据查询',
            path: '/platform-app-air/data/query',
            icon: 'Search',
            sort: 1,
            permission: 'sub:air:view',
            type: 'menu',
            app: 'air'
          },
          {
            id: 432,
            parentId: 43,
            title: '数据补遗',
            path: '/platform-app-air/data/patch',
            icon: 'Edit',
            sort: 2,
            permission: 'sub:air:view',
            type: 'menu',
            app: 'air'
          }
        ]
      },
      {
        id: 44,
        parentId: 4,
        title: '报警管理',
        path: '/platform-app-air/alarm',
        icon: 'icon-a-xingzhuang2',
        sort: 4,
        permission: 'sub:air:view',
        type: 'directory',
        app: 'air',
        children: [
          {
            id: 441,
            parentId: 44,
            title: '报警列表',
            path: '/platform-app-air/alarm/list',
            icon: 'List',
            sort: 1,
            permission: 'sub:air:view',
            type: 'menu',
            app: 'air'
          },
          {
            id: 442,
            parentId: 44,
            title: '规则配置',
            path: '/platform-app-air/alarm/rule',
            icon: 'Setting',
            sort: 2,
            permission: 'sub:air:view',
            type: 'menu',
            app: 'air'
          }
        ]
      },
      {
        id: 45,
        parentId: 4,
        title: '数据分析',
        path: '/platform-app-air/analysis',
        icon: 'icon-shujufenxibeifen',
        sort: 5,
        permission: 'sub:air:view',
        type: 'directory',
        app: 'air',
        children: [
          {
            id: 451,
            parentId: 45,
            title: '常规空气站',
            path: '/platform-app-air/analysis/normal',
            icon: 'TrendCharts',
            sort: 1,
            permission: 'sub:air:view',
            type: 'directory',
            app: 'air',
            children: [
              {
                id: 4511,
                parentId: 451,
                title: '趋势分析',
                path: '/platform-app-air/analysis/normal/trend',
                icon: 'TrendCharts',
                sort: 1,
                permission: 'sub:air:view',
                type: 'menu',
                app: 'air'
              },
              {
                id: 4512,
                parentId: 451,
                title: '24小时均值分析',
                path: '/platform-app-air/analysis/normal/avg24h',
                icon: 'Timer',
                sort: 2,
                permission: 'sub:air:view',
                type: 'menu',
                app: 'air'
              },
              {
                id: 4513,
                parentId: 451,
                title: '同比环比分析',
                path: '/platform-app-air/analysis/normal/compare',
                icon: 'DataLine',
                sort: 3,
                permission: 'sub:air:view',
                type: 'menu',
                app: 'air'
              },
              {
                id: 4514,
                parentId: 451,
                title: '相关性分析',
                path: '/platform-app-air/analysis/normal/relation',
                icon: 'Connection',
                sort: 4,
                permission: 'sub:air:view',
                type: 'menu',
                app: 'air'
              },
              {
                id: 4515,
                parentId: 451,
                title: '污染玫瑰图',
                path: '/platform-app-air/analysis/normal/rose',
                icon: 'PieChart',
                sort: 5,
                permission: 'sub:air:view',
                type: 'menu',
                app: 'air'
              }
            ]
          },
          {
            id: 452,
            parentId: 45,
            title: 'VOCs站',
            path: '/platform-app-air/analysis/vocs/',
            icon: 'PieChart',
            sort: 2,
            permission: 'sub:air:view',
            type: 'directory',
            app: 'air',
            children: [
              {
                id: 4521,
                parentId: 452,
                title: '趋势分析',
                path: '/platform-app-air/analysis/vocs/trend',
                icon: 'TrendCharts',
                sort: 1,
                permission: 'sub:air:view',
                type: 'menu',
                app: 'air'
              },
              {
                id: 4522,
                parentId: 452,
                title: '同比环比分析',
                path: '/platform-app-air/analysis/vocs/compare',
                icon: 'DataLine',
                sort: 2,
                permission: 'sub:air:view',
                type: 'menu',
                app: 'air'
              },
              {
                id: 4523,
                parentId: 452,
                title: '污染物类别',
                path: '/platform-app-air/analysis/vocs/category',
                icon: 'PieChart',
                sort: 3,
                permission: 'sub:air:view',
                type: 'menu',
                app: 'air'
              },
              {
                id: 4524,
                parentId: 452,
                title: '优势组分分析',
                path: '/platform-app-air/analysis/vocs/advantage',
                icon: 'Histogram',
                sort: 4,
                permission: 'sub:air:view',
                type: 'menu',
                app: 'air'
              }
            ]
          }
        ]
      },
      {
        id: 46,
        parentId: 4,
        title: '统计报表',
        path: '/platform-app-air/report',
        icon: 'icon-xingzhuang',
        sort: 6,
        permission: 'sub:air:view',
        type: 'directory',
        app: 'air',
        children: [
          {
            id: 461,
            parentId: 46,
            title: 'AQI日报',
            path: '/platform-app-air/report/aqi-daily',
            icon: 'Document',
            sort: 1,
            permission: 'sub:air:view',
            type: 'menu',
            app: 'air'
          },
          {
            id: 462,
            parentId: 46,
            title: '综合评价报表',
            path: '/platform-app-air/report/composite',
            icon: 'Document',
            sort: 2,
            permission: 'sub:air:view',
            type: 'menu',
            app: 'air'
          },
          {
            id: 463,
            parentId: 46,
            title: '空气质量汇总表',
            path: '/platform-app-air/report/summary',
            icon: 'Document',
            sort: 3,
            permission: 'sub:air:view',
            type: 'menu',
            app: 'air'
          },
          {
            id: 464,
            parentId: 46,
            title: '空气质量统计表',
            path: '/platform-app-air/report/stat',
            icon: 'Document',
            sort: 4,
            permission: 'sub:air:view',
            type: 'menu',
            app: 'air'
          },
          {
            id: 465,
            parentId: 46,
            title: '空气质量日历',
            path: '/platform-app-air/report/calendar',
            icon: 'Calendar',
            sort: 5,
            permission: 'sub:air:view',
            type: 'menu',
            app: 'air'
          },
          {
            id: 466,
            parentId: 46,
            title: '控制浓度表',
            path: '/platform-app-air/report/limit',
            icon: 'Document',
            sort: 6,
            permission: 'sub:air:view',
            type: 'menu',
            app: 'air'
          }
        ]
      },
      {
        id: 47,
        parentId: 4,
        title: '数据审核',
        path: '/platform-app-air/audit',
        icon: 'icon-a-xingzhuang3',
        sort: 7,
        permission: 'sub:air:view',
        type: 'menu',
        app: 'air'
      },
      {
        id: 48,
        parentId: 4,
        title: '走航管理',
        path: '/platform-app-air/mobile',
        icon: 'icon-a-xingzhuang4',
        sort: 8,
        permission: 'sub:air:view',
        type: 'menu',
        app: 'air'
      },
      {
        id: 49,
        parentId: 4,
        title: '信息管理',
        path: '/platform-app-air/info',
        icon: 'icon-a-xingzhuang5',
        sort: 9,
        permission: 'sub:air:view',
        type: 'directory',
        app: 'air',
        children: [
          {
            id: 491,
            parentId: 49,
            title: '站点管理',
            path: '/platform-app-air/info/station',
            icon: 'OfficeBuilding',
            sort: 1,
            permission: 'sub:air:view',
            type: 'menu',
            app: 'air'
          },
          {
            id: 492,
            parentId: 49,
            title: '因子管理',
            path: '/platform-app-air/info/factor',
            icon: 'SetUp',
            sort: 2,
            permission: 'sub:air:view',
            type: 'menu',
            app: 'air'
          },
          {
            id: 493,
            parentId: 49,
            title: '权限管理',
            path: '/platform-app-air/info/permission',
            icon: 'Key',
            sort: 3,
            permission: 'sub:air:view',
            type: 'menu',
            app: 'air'
          }
        ]
      }
    ]
  },
  {
    id: 5,
    parentId: null,
    title: '水环境监测管理平台',
    path: '',
    icon: 'urlIcon-icon-water',
    sort: 3,
    permission: 'sub:water:view',
    type: 'directory', // 这是一个目录，里面有子菜单
    app: 'water',
    children: [
      {
        id: 51,
        parentId: 5,
        title: '首页',
        path: '/platform-app-water/home',
        icon: 'icon-shouye',
        sort: 1,
        permission: 'sub:water:view',
        type: 'menu',
        app: 'water'
      },
      {
        id: 52,
        parentId: 5,
        title: '数据管理',
        path: '/platform-app-water/data',
        icon: 'icon-ic_ajpcgl',
        sort: 2,
        permission: 'sub:water:view',
        type: 'menu',
        app: 'water'
      },
      {
        id: 53,
        parentId: 5,
        title: '统计分析',
        path: '/platform-app-water/analysis',
        icon: 'icon-shujufenxibeifen',
        sort: 3,
        permission: 'sub:water:view',
        type: 'directory',
        app: 'water',
        children: [
          {
            id: 531,
            parentId: 53,
            title: '自动站统计分析',
            path: '/platform-app-water/analysis/auto',
            icon: 'TrendCharts',
            sort: 1,
            permission: 'sub:water:view',
            type: 'directory',
            app: 'water',
            children: [
              {
                id: 5311,
                parentId: 531,
                title: '水质类别占比分析',
                path: '/platform-app-water/analysis/auto/category-ratio',
                icon: 'PieChart',
                sort: 1,
                permission: 'sub:water:view',
                type: 'menu',
                app: 'water'
              },
              {
                id: 5312,
                parentId: 531,
                title: '水质日历',
                path: '/platform-app-water/analysis/auto/category-calendar',
                icon: 'Calendar',
                sort: 2,
                permission: 'sub:water:view',
                type: 'menu',
                app: 'water'
              },
              {
                id: 5313,
                parentId: 531,
                title: '趋势分析',
                path: '/platform-app-water/analysis/auto/trend',
                icon: 'TrendCharts',
                sort: 3,
                permission: 'sub:water:view',
                type: 'menu',
                app: 'water'
              },
              {
                id: 5314,
                parentId: 531,
                title: '同比环比',
                path: '/platform-app-water/analysis/auto/yoy-mom',
                icon: 'Histogram',
                sort: 4,
                permission: 'sub:water:view',
                type: 'menu',
                app: 'water'
              },
              {
                id: 5315,
                parentId: 531,
                title: '数据报表',
                path: '/platform-app-water/analysis/auto/report',
                icon: 'Document',
                sort: 5,
                permission: 'sub:water:view',
                type: 'menu',
                app: 'water'
              }
            ]
          },
          {
            id: 532,
            parentId: 53,
            title: '监测断面统计分析',
            path: '/platform-app-water/analysis/section',
            icon: 'DataLine',
            sort: 2,
            permission: 'sub:water:view',
            type: 'directory',
            app: 'water',
            children: [
              {
                id: 5321,
                parentId: 532,
                title: '趋势分析',
                path: '/platform-app-water/analysis/section/trend',
                icon: 'TrendCharts',
                sort: 1,
                permission: 'sub:water:view',
                type: 'menu',
                app: 'water'
              },
              {
                id: 5322,
                parentId: 532,
                title: '同比环比',
                path: '/platform-app-water/analysis/section/yoy-mom',
                icon: 'Histogram',
                sort: 2,
                permission: 'sub:water:view',
                type: 'menu',
                app: 'water'
              },
              {
                id: 5323,
                parentId: 532,
                title: '数据报表',
                path: '/platform-app-water/analysis/section/report',
                icon: 'Document',
                sort: 3,
                permission: 'sub:water:view',
                type: 'menu',
                app: 'water'
              }
            ]
          }
        ]
      },
      {
        id: 54,
        parentId: 5,
        title: '报警管理',
        path: '/platform-app-water/alarm',
        icon: 'icon-a-xingzhuang2',
        sort: 4,
        permission: 'sub:water:view',
        type: 'directory',
        app: 'water',
        children: [
          {
            id: 541,
            parentId: 54,
            title: '报警列表',
            path: '/platform-app-water/alarm/list',
            icon: 'List',
            sort: 1,
            permission: 'sub:water:view',
            type: 'menu',
            app: 'water'
          },
          {
            id: 542,
            parentId: 54,
            title: '规则配置',
            path: '/platform-app-water/alarm/rule',
            icon: 'Setting',
            sort: 2,
            permission: 'sub:water:view',
            type: 'menu',
            app: 'water'
          }
        ]
      },
      {
        id: 55,
        parentId: 5,
        title: '信息管理',
        path: '/platform-app-water/info',
        icon: 'icon-a-xingzhuang5',
        sort: 5,
        permission: 'sub:water:view',
        type: 'directory',
        app: 'water',
        children: [
          {
            id: 551,
            parentId: 55,
            title: '点位管理',
            path: '/platform-app-water/info/point',
            icon: 'OfficeBuilding',
            sort: 1,
            permission: 'sub:water:view',
            type: 'directory',
            app: 'water',
            children: [
              {
                id: 5511,
                parentId: 551,
                title: '站点管理',
                path: '/platform-app-water/info/point/station',
                icon: 'OfficeBuilding',
                sort: 1,
                permission: 'sub:water:view',
                type: 'menu',
                app: 'water'
              },
              {
                id: 5512,
                parentId: 551,
                title: '断面管理',
                path: '/platform-app-water/info/point/section',
                icon: 'OfficeBuilding',
                sort: 2,
                permission: 'sub:water:view',
                type: 'menu',
                app: 'water'
              }
            ]
          },
          {
            id: 552,
            parentId: 55,
            title: '设备管理',
            path: '/platform-app-water/info/device',
            icon: 'SetUp',
            sort: 2,
            permission: 'sub:water:view',
            type: 'menu',
            app: 'water'
          }
        ]
      }
    ]
  },
  {
    id: 8000,
    parentId: null,
    title: 'OA工作流平台',
    path: '',
    icon: 'urlIcon-icon-case',
    sort: 3,
    permission: 'sub:oa:view',
    type: 'directory',
    app: 'oa',
    children: [
      {
        id: 8001,
        parentId: 8000,
        title: '流程设计器',
        path: '/platform-app-oa/designer',
        icon: 'EditPen',
        sort: 1,
        permission: 'sub:oa:view',
        type: 'menu',
        app: 'oa'
      },
      {
        id: 8002,
        parentId: 8000,
        title: '流程数据列表',
        path: '/platform-app-oa/flow-data-list',
        icon: 'List',
        sort: 2,
        permission: 'sub:oa:view',
        type: 'menu',
        app: 'oa'
      },
      {
        id: 8003,
        parentId: 8000,
        title: 'OA工作流表单',
        path: '/platform-app-oa/workflow-form',
        icon: 'Document',
        sort: 3,
        permission: 'sub:oa:view',
        type: 'menu',
        app: 'oa'
      }
    ]
  },
  {
    id: 12000,
    parentId: null,
    title: '表单设计器',
    path: '',
    icon: 'urlIcon-icon-case',
    sort: 3,
    permission: 'sub:form-designer:view',
    type: 'directory',
    app: 'form-designer',
    children: [
      {
        id: 12002,
        parentId: 12000,
        title: '表单列表',
        path: '/form-designer/formBuilder',
        icon: 'EditPen',
        sort: 2,
        permission: 'form:definition:view',
        type: 'menu',
        app: 'form-designer',
        children: [
          {
            id: 120020,
            parentId: 12002,
            path: '/form-designer/formBuilder',
            title: '表单列表',
            permission: 'form:definition:view',
            type: 'menu',
            app: 'form-designer'
          },
          {
            id: 120021,
            parentId: 12002,
            title: '新建表单',
            permission: 'form:definition:add',
            type: 'button',
            app: 'form-designer'
          },
          {
            id: 120022,
            parentId: 12002,
            title: '设计表单',
            permission: 'form:definition:design',
            type: 'button',
            app: 'form-designer'
          },
          {
            id: 120023,
            parentId: 12002,
            title: '编辑表单',
            permission: 'form:definition:edit',
            type: 'button',
            app: 'form-designer'
          },
          {
            id: 120024,
            parentId: 12002,
            title: '删除表单',
            permission: 'form:definition:delete',
            type: 'button',
            app: 'form-designer'
          },
          {
            id: 120025,
            parentId: 12002,
            title: '预览填报',
            permission: 'form:definition:fill',
            type: 'button',
            app: 'form-designer'
          },
          {
            id: 120026,
            parentId: 12002,
            title: '查看提交记录',
            permission: 'form:submission:view',
            type: 'button',
            app: 'form-designer'
          },
          {
            id: 120027,
            parentId: 12002,
            title: '发布表单',
            permission: 'form:definition:publish',
            type: 'button',
            app: 'form-designer'
          },
          {
            id: 120028,
            parentId: 12002,
            title: '表单设计',
            path: '/form-designer/formBuilder/designer',
            permission: 'form:definition:design',
            type: 'menu',
            hidden: true,
            app: 'form-designer',
            children: []
          },
          {
            id: 120029,
            parentId: 12002,
            title: '表单填报',
            path: '/form-designer/formBuilder/fill',
            permission: 'form:definition:fill',
            type: 'menu',
            hidden: true,
            app: 'form-designer',
            children: []
          },
          {
            id: 120030,
            parentId: 12002,
            title: '提交记录',
            path: '/form-designer/formBuilder/submissions',
            permission: 'form:submission:view',
            type: 'menu',
            hidden: true,
            app: 'form-designer',
            children: []
          }
        ]
      },
      {
        id: 120040,
        parentId: 12000,
        title: '表单实例',
        path: '/form-designer/formBuilder/instances',
        icon: 'Document',
        sort: 2,
        permission: 'form:definition:view',
        type: 'menu',
        app: 'form-designer',
        children: [
          {
            id: 120041,
            parentId: 120040,
            path: '/form-designer/formBuilder/instances',
            title: '表单实例',
            permission: 'form:definition:view',
            type: 'menu',
            app: 'form-designer'
          }
        ]
      },
      {
        id: 12003,
        parentId: 12000,
        title: '字典管理',
        path: '/form-designer/dict',
        icon: 'Collection',
        sort: 3,
        permission: 'form:dict:view',
        type: 'menu',
        app: 'form-designer',
        children: [
          {
            id: 120031,
            parentId: 12003,
            title: '新增字典',
            permission: 'form:dict:add',
            type: 'button',
            app: 'form-designer'
          },
          {
            id: 120032,
            parentId: 12003,
            title: '编辑字典',
            permission: 'form:dict:edit',
            type: 'button',
            app: 'form-designer'
          },
          {
            id: 120033,
            parentId: 12003,
            title: '删除字典',
            permission: 'form:dict:delete',
            type: 'button',
            app: 'form-designer'
          },
          {
            id: 120034,
            parentId: 12003,
            title: '字典分类',
            path: '/form-designer/dictCategory',
            permission: 'form:dict:category:view',
            type: 'menu',
            hidden: true,
            app: 'form-designer',
            children: [
              {
                id: 1200341,
                parentId: 120034,
                title: '新增分类',
                permission: 'form:dict:category:add',
                type: 'button',
                app: 'form-designer'
              },
              {
                id: 1200342,
                parentId: 120034,
                title: '编辑分类',
                permission: 'form:dict:category:edit',
                type: 'button',
                app: 'form-designer'
              },
              {
                id: 1200343,
                parentId: 120034,
                title: '删除分类',
                permission: 'form:dict:category:delete',
                type: 'button',
                app: 'form-designer'
              }
            ]
          }
        ]
      },
      {
        id: 12004,
        parentId: 12000,
        title: '模板管理',
        path: '/form-designer/system/template',
        icon: 'Document',
        sort: 4,
        permission: 'form:template:view',
        type: 'menu',
        app: 'form-designer',
        children: [
          {
            id: 120041,
            parentId: 12004,
            title: '删除模板',
            permission: 'form:template:delete',
            type: 'button',
            app: 'form-designer'
          }
        ]
      }
    ]
  },
  {
    id: 111,
    parentId: null,
    title: '辐射管理系统',
    path: '',
    icon: 'urlIcon-icon-radiation',
    sort: 3,
    type: 'directory', // 目录
    app: 'radiation',
    children: [
      {
        id: 1111,
        parentId: 111,
        title: '首页',
        path: '/radiation/home',
        icon: 'icon-shouye',
        sort: 1,
        permission: 'radiation:test:view',
        type: 'menu',
        app: 'radiation'
      },
      {
        id: 1112,
        parentId: 111,
        title: 'GIS地图',
        path: '/radiation/gis',
        icon: 'InfoFilled',
        sort: 2,
        permission: 'radiation:gis:view',
        type: 'menu',
        app: 'radiation'
      },
      {
        id: 1113,
        parentId: 111,
        title: '数据查询',
        path: '/radiation/dataQuery',
        icon: 'icon-ic_ajpcgl',
        sort: 2,
        permission: 'radiation:dataQuery:view',
        type: 'menu',
        app: 'radiation'
      }
    ]
  },
  {
    id: 6,
    parentId: null,
    title: '放射源管理系统',
    path: '',
    icon: 'urlIcon-icon-ray',
    sort: 1,
    permission: 'sub:water:view',
    type: 'directory', // 目录
    app: 'radioactive-source',
    children: [
      {
        id: 61,
        parentId: 6,
        title: '首页',
        path: '/platform-app-radioactive-source/home',
        icon: 'icon-shouye',
        sort: 1,
        permission: 'radioactive:home:view',
        type: 'menu',
        app: 'radioactive-source'
      },
      {
        id: 62,
        parentId: 6,
        title: 'GIS地图',
        path: '/platform-app-radioactive-source/gis',
        icon: 'icon-xingzhuangjiehe',
        sort: 2,
        permission: 'radioactive:gis:view',
        type: 'menu',
        app: 'radioactive-source'
      },
      {
        id: 63,
        parentId: 6,
        title: '实时数据',
        path: '/platform-app-radioactive-source/realtime',
        icon: 'icon-a-xingzhuangjiehe2',
        sort: 3,
        permission: 'radioactive:realtime:view',
        type: 'menu',
        app: 'radioactive-source'
      },
      {
        id: 64,
        parentId: 6,
        title: '数据查询',
        path: '/platform-app-radioactive-source/data-query',
        icon: 'icon-ic_ajk',
        sort: 4,
        permission: 'radioactive:dataQuery:view',
        type: 'menu',
        app: 'radioactive-source'
      },
      {
        id: 65,
        parentId: 6,
        title: '放射源信息管理',
        path: '/platform-app-radioactive-source/info',
        icon: 'icon-a-xingzhuang5',
        sort: 5,
        permission: 'radioactive:info:view',
        type: 'menu',
        app: 'radioactive-source'
      },
      {
        id: 66,
        parentId: 6,
        title: '报警管理',
        path: '/platform-app-radioactive-source/alarm',
        icon: 'icon-a-xingzhuang2',
        sort: 6,
        permission: 'radioactive:alarm:view',
        type: 'directory',
        app: 'radioactive-source',
        children: [
          {
            id: 661,
            parentId: 66,
            title: '报警列表',
            path: '/platform-app-radioactive-source/alarm/list',
            icon: 'List',
            sort: 1,
            permission: 'radioactive:alarmList:view',
            type: 'menu',
            app: 'radioactive-source'
          },
          {
            id: 662,
            parentId: 66,
            title: '规则配置',
            path: '/platform-app-radioactive-source/alarm/rule',
            icon: 'Setting',
            sort: 2,
            permission: 'radioactive:alarmRule:view',
            type: 'menu',
            app: 'radioactive-source'
          }
        ]
      },
      {
        id: 67,
        parentId: 6,
        title: '停产申报',
        path: '/platform-app-radioactive-source/shutdown',
        icon: 'icon-a-xingzhuang3',
        sort: 7,
        permission: 'radioactive:shutdown:view',
        type: 'directory',
        app: 'radioactive-source',
        children: [
          {
            id: 671,
            parentId: 67,
            title: '管理端',
            path: '/platform-app-radioactive-source/shutdown/admin',
            icon: 'UserFilled',
            sort: 1,
            permission: 'radioactive:shutdownAdmin:view',
            type: 'menu',
            app: 'radioactive-source'
          },
          {
            id: 672,
            parentId: 67,
            title: '企业端',
            path: '/platform-app-radioactive-source/shutdown/enterprise',
            icon: 'Briefcase',
            sort: 2,
            permission: 'radioactive:shutdownEnterprise:view',
            type: 'menu',
            app: 'radioactive-source'
          }
        ]
      }
    ]
  },
  {
    id: 7,
    parentId: null,
    title: 'AI问数',
    path: '',
    icon: '',
    sort: 3,
    permission: 'sub:ai:view',
    type: 'directory', // 这是一个目录，里面有子菜单
    app: 'ai',
    children: [
      {
        id: 71,
        parentId: 7,
        title: 'AI问数',
        path: '/platform-app-ai/ai-chat',
        icon: 'icon-shouye',
        sort: 1,
        permission: 'sub:ai:view',
        type: 'menu',
        app: 'ai'
      }
    ]
  },
  {
    id: 3008,
    parentId: null,
    title: '排污许可证',
    path: '',
    icon: '',
    sort: 3,
    permission: 'sub:pdl:view',
    type: 'directory', // 这是一个目录，里面有子菜单
    app: 'pdl',
    children: [
      {
        id: 30081,
        parentId: 3008,
        title: '首页',
        path: '/platform-app-pdl/home',
        icon: 'icon-shouye',
        sort: 1,
        permission: 'sub:pdl:view',
        type: 'menu',
        app: 'pdl'
      },
      {
        id: 30082,
        parentId: 3008,
        title: '排污许可库',
        path: '/platform-app-pdl/list',
        icon: 'icon-shouye',
        sort: 1,
        permission: 'sub:pdl:view',
        type: 'menu',
        app: 'pdl'
      },
      {
        id: 30083,
        parentId: 3008,
        title: '规则库管理',
        path: '/platform-app-pdl/rule',
        icon: 'icon-shouye',
        sort: 1,
        permission: 'sub:pdl:view',
        type: 'menu',
        app: 'pdl'
      },
      {
        id: 30084,
        parentId: 3008,
        title: '短信发送管理',
        path: '/platform-app-pdl/sms',
        icon: 'icon-shouye',
        sort: 1,
        permission: 'sub:pdl:view',
        type: 'directory',
        app: 'pdl',
        children: [
          {
            id: 300841,
            parentId: 30084,
            title: '企业库',
            path: '/platform-app-pdl/sms/enterprise',
            icon: 'icon-shouye',
            sort: 1,
            permission: 'sub:pdl:view',
            type: 'menu',
            app: 'pdl'
          },
          {
            id: 300842,
            parentId: 30084,
            title: '短信规则配置',
            path: '/platform-app-pdl/sms/rule',
            icon: 'icon-shouye',
            sort: 1,
            permission: 'sub:pdl:view',
            type: 'menu',
            app: 'pdl'
          },
          {
            id: 300843,
            parentId: 30084,
            title: '短信日志列表',
            path: '/platform-app-pdl/sms/log',
            icon: 'icon-shouye',
            sort: 1,
            permission: 'sub:pdl:view',
            type: 'menu',
            app: 'pdl'
          }
        ]
      }
    ]
  }
];

const removeManagementCenterLayer = (list) => {
  const mainRoot = (list || []).find(
    (item) => item?.app === 'main' && item?.type === 'directory' && item?.parentId == null
  );
  if (!mainRoot || !Array.isArray(mainRoot.children)) return list;

  const mergedChildren = [];
  mainRoot.children.forEach((child) => {
    const isManagementCenter =
      child?.app === 'main' && child?.type === 'directory' && child?.title === '管理中心';
    if (!isManagementCenter) {
      mergedChildren.push(child);
      return;
    }

    (child.children || []).forEach((node) => {
      mergedChildren.push({
        ...node,
        parentId: mainRoot.id
      });
    });
  });

  mainRoot.children = mergedChildren;
  return list;
};

menuList = removeManagementCenterLayer(menuList);

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
      -1, 1, 100, 101, 102, 103, 104, 2000, 2001, 2002, 2003, 2004, 20021, 20022, 205, 2051, 2052,
      2053, 2054, 2055, 206, 2061, 2062, 2063, 2064, 2065, 21, 211, 212, 213, 22, 221, 222, 223, 23,
      2341, 2342, 2343, 231, 232, 233, 24, 241, 242, 243, 25, 251, 2511, 252, 2521, 2522, 2523,
      2524, 25241, 25242, 25243, 253, 2531, 2532, 2533, 254, 2541, 2542, 2543, 255, 2551, 2552,
      2553, 2554, 2555, 2556, 25501, 25502, 25503, 26, 261, 262, 263, 264, 265, 27, 271, 272, 273,
      274, 28, 29, 30, 301, 302, 303, 304, 305, 306, 31, 31000, 31005, 4, 41, 42, 43, 431, 432, 44,
      441, 442, 45, 451, 452, 453, 454, 455, 46, 461, 462, 463, 464, 465, 466, 47, 48, 49, 491, 492,
      493, 31001, 31002, 31003, 31004, 5, 51, 52, 53, 531, 5311, 5312, 5313, 5314, 5315, 532, 5321,
      5322, 5323, 54, 541, 542, 55, 551, 5511, 5512, 552, 8000, 8001, 8002, 8003, 12000, 12001,
      12002, 120020, 1200201, 120021, 120022, 120023, 120024, 120025, 120026, 120027, 120028,
      120029, 120030, 12003, 120031, 120032, 120033, 120034, 1200341, 1200342, 1200343, 12004,
      120041, 111, 1111, 1113, 6, 61, 62, 63, 64, 65, 66, 661, 662, 67, 671, 672, 7, 71, 3008,
      30081, 30082, 30083, 30084, 300841, 300842, 300843
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
    permissionIds: [3, 31, 311, 312, 313, 314, 315, 316, 32, 2000, 2001, 2002, 2003, 20021, 20022],
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
    tenantName: '浙江中环瑞兰科技发展有限公司',
    shortName: '中环瑞兰',
    tenantCode: 'zhyl',
    adminName: '张三',
    status: 1,
    createTime: '2023-10-01 10:00:00'
  },
  {
    id: 9002,
    tenantName: '宁波市生态环境局镇海分局',
    shortName: '镇海分局',
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
    authIdentifier: 'admin',
    accountType: 'name',
    nickName: '系统管理员',
    gender: 'male',
    phone: '13800000001',
    email: 'admin@platform.local',
    status: 1,
    createTime: '2023-10-01 09:00:00',
    locked: false,
    lockEndTime: '',
    lastLoginTime: '2026-03-18 09:30:00',
    lastLoginIp: '10.12.8.23',
    orgId: 5001,
    orgName: '平台组织',
    roleIds: [1],
    password: '123',
    tenantId: 9001
  },
  {
    id: 1002,
    name: 'zhangsan',
    authIdentifier: 'zhangsan',
    accountType: 'name',
    nickName: '李三',
    gender: 'male',
    phone: '13800000002',
    email: 'user@platform.local',
    status: 1,
    createTime: '2023-10-02 09:00:00',
    locked: false,
    lockEndTime: '',
    lastLoginTime: '2026-03-17 21:06:00',
    lastLoginIp: '10.12.9.16',
    orgId: 5002,
    orgName: '研发部',
    roleIds: [2],
    password: '123',
    tenantId: 9001
  },
  {
    id: 1003,
    name: 'lisi',
    authIdentifier: 'lisi',
    accountType: 'name',
    nickName: '李四',
    gender: 'female',
    phone: '13800000003',
    email: 'lisi@platform.local',
    status: 0,
    createTime: '2023-10-03 09:00:00',
    locked: false,
    lockEndTime: '',
    lastLoginTime: '2026-03-16 17:05:00',
    lastLoginIp: '10.12.10.30',
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
    createTime: '2023-10-03 09:00:00',
    locked: false,
    lockEndTime: '',
    lastLoginTime: '2026-03-18 08:15:00',
    lastLoginIp: '10.12.11.02'
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
    createTime: '2023-10-04 09:00:00',
    locked: false,
    lockEndTime: '',
    lastLoginTime: '2026-03-18 08:45:00',
    lastLoginIp: '10.12.11.03'
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
    orgCode: 'ORG-001',
    name: '中环瑞蓝',
    leader: '系统管理员',
    phone: '13800000001',
    status: 1,
    sort: 1,
    updateTime: '2026-03-12 09:00:00',
    children: [
      {
        id: 5002,
        parentId: 5001,
        orgCode: 'ORG-002',
        name: '研发部',
        leader: '张三',
        phone: '13900001111',
        status: 1,
        sort: 1,
        updateTime: '2026-03-12 10:00:00',
        children: []
      },
      {
        id: 5003,
        parentId: 5001,
        orgCode: 'ORG-003',
        name: '运维部',
        leader: '李四',
        phone: '13712345678',
        status: 1,
        sort: 2,
        updateTime: '2026-03-12 10:20:00',
        children: []
      }
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
      orgCode: 'ORG-101',
      name: '镇海分局组织',
      leader: '系统管理员',
      phone: '13800000003',
      status: 1,
      sort: 1,
      updateTime: '2026-03-12 09:00:00',
      children: [
        {
          id: 6002,
          parentId: 6001,
          orgCode: 'ORG-102',
          name: '综合部',
          leader: '李四',
          phone: '13700000001',
          status: 1,
          sort: 1,
          updateTime: '2026-03-12 10:00:00',
          children: []
        }
      ]
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

const findOrgNodeWithRoot = (tree, id) => {
  for (const node of tree) {
    if (node.id === id) return { node, root: tree };
    if (node.children && node.children.length > 0) {
      const found = findOrgNodeWithRoot(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

const getAllOrgTrees = () => {
  const list = [platformOrgTree];
  Object.keys(orgTreeByTenantId || {}).forEach((k) => {
    const t = orgTreeByTenantId[k];
    if (t && t !== platformOrgTree) list.push(t);
  });
  return list;
};

const findOrgNodeAcrossAllTenants = (id) => {
  for (const tree of getAllOrgTrees()) {
    const found = findOrgNodeWithRoot(tree, id);
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
// 租户-应用授权（多对多）辅助
// =======================

const resolveCurrentUserContext = (req) => {
  const token = req.headers['authorization'];
  const platformUserId = tokenToPlatformUserId[token];
  if (platformUserId != null) {
    const platformUser = platformUsers.find((u) => u.id === platformUserId);
    const firstRoleId =
      Array.isArray(platformUser?.roleIds) && platformUser.roleIds.length > 0
        ? platformUser.roleIds[0]
        : null;
    const firstRole = firstRoleId ? roles.find((r) => r.id === firstRoleId) : null;
    return {
      roleKey: firstRole?.roleKey || '',
      tenantId: platformUser?.tenantId ?? null
    };
  }
  const user = users.find((u) => u.token === token);
  if (user) {
    const linkedPlatformUser = platformUsers.find((u) => u.name === user.username);
    return {
      roleKey: user.roleKey || '',
      tenantId: linkedPlatformUser?.tenantId ?? null
    };
  }
  return { roleKey: '', tenantId: null };
};

// tenantId -> appIds（覆盖保存）；默认根据旧字段 appList[].tenantId 生成
const buildTenantAppMapFromLegacyAppList = () => {
  const map = {};
  (tenants || []).forEach((t) => {
    if (t?.id != null) map[t.id] = [];
  });
  (appList || []).forEach((a) => {
    const tid = a?.tenantId;
    if (tid == null) return;
    if (!map[tid]) map[tid] = [];
    if (a?.id != null && !map[tid].includes(a.id)) map[tid].push(a.id);
  });
  return map;
};

let tenantAppMap = buildTenantAppMapFromLegacyAppList();

const normalizeAuthorizedAppIds = (appIds) => {
  const existingIds = new Set((appList || []).map((a) => a.id));
  const unique = [];
  (Array.isArray(appIds) ? appIds : []).forEach((id) => {
    const num = Number(id);
    if (!Number.isFinite(num)) return;
    if (!existingIds.has(num)) return;
    if (!unique.includes(num)) unique.push(num);
  });
  return unique;
};

// =======================
// 3. API 接口定义
// =======================

// --- 认证模块 ---

// 登录：优先使用平台用户（platformUsers），userName + password；通过则发 token 并记录映射
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const platformUser = platformUsers.find((u) => u.name === username && u.password === password);
  if (platformUser) {
    if (platformUser.status !== 1) {
      res.status(401).json({ code: 401, msg: '账号已禁用' });
      return;
    }
    // 仅 mock：补充最后登录信息，供账号管理展示
    const ip =
      (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      '';
    platformUser.lastLoginTime = new Date().toLocaleString();
    platformUser.lastLoginIp = ip || platformUser.lastLoginIp || '';

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
    const firstRoleId =
      Array.isArray(roleIds) && roleIds.length > 0 ? roleIds[0] : fallbackRoleId || null;
    const firstRole = firstRoleId ? roles.find((r) => r.id === firstRoleId) : null;
    const roleNames = (Array.isArray(roleIds) ? roleIds : [])
      .map((id) => roles.find((r) => r.id === id)?.roleName)
      .filter(Boolean);
    const normalizedRoleNames = roleNames.length
      ? roleNames
      : firstRole?.roleName
        ? [firstRole.roleName]
        : [];
    return {
      userName: baseUser.name,
      nickName: baseUser.nickName || '',
      gender: baseUser.gender || '',
      deptName: baseUser.orgName || '',
      roleId: firstRoleId,
      roleKey: firstRole ? firstRole.roleKey : fallbackRoleKey || '',
      roleNames: normalizedRoleNames,
      avatar: baseUser.avatar || '',
      tenantId: baseUser.tenantId != null ? baseUser.tenantId : null
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
  const { status = 'pending', pageIndex = 1, pageSize = 10, appKey = '', keyword = '' } = req.query;
  const normalizedStatus = String(status) === 'done' ? 'done' : 'pending';
  const currentPage = Math.max(parseInt(String(pageIndex), 10) || 1, 1);
  const currentSize = Math.max(parseInt(String(pageSize), 10) || 10, 1);
  const appFilter = String(appKey || '').trim();
  const kw = String(keyword || '').trim();
  const baseFiltered = todoList.filter((item) => {
    if (appFilter && String(item.appKey || '') !== appFilter) return false;
    if (kw) {
      const hay = `${item.desc || ''} ${item.title || ''}`.toLowerCase();
      if (!hay.includes(kw.toLowerCase())) return false;
    }
    return true;
  });

  const pendingCount = baseFiltered.filter((item) => item.status === 'pending').length;
  const doneCount = baseFiltered.filter((item) => item.status === 'done').length;

  const filtered = baseFiltered.filter((item) => item.status === normalizedStatus);
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

// 标记消息已读（用于消息提醒“删除”按钮：从未读列表移除）
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
  if (current.status === 'pending') {
    const dt = new Date();
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    const hh = String(dt.getHours()).padStart(2, '0');
    const mi = String(dt.getMinutes()).padStart(2, '0');
    todoList[index] = {
      ...current,
      status: 'done',
      completeTime: `${yyyy}-${mm}-${dd} ${hh}:${mi}`
    };
  }

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
  if (
    tid != null &&
    groups.some((g) => Number(g.tenantId) === tid && String(g.groupCode) === code)
  ) {
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
  res.json({
    code: 200,
    data: { roleIds: Array.isArray(group.roleIds) ? group.roleIds : [] },
    msg: 'success'
  });
});

app.put('/api/system/groups/:id/roles', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = groups.findIndex((g) => Number(g.id) === id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: '群组不存在' });
  const roleIds = Array.isArray(req.body?.roleIds) ? req.body.roleIds : [];
  const ids = roleIds.map((x) => Number(x)).filter((n) => Number.isFinite(n));
  groups[idx] = {
    ...groups[idx],
    roleIds: Array.from(new Set(ids)),
    updateTime: new Date().toLocaleString()
  };
  res.json({ code: 200, data: { roleIds: groups[idx].roleIds }, msg: '保存成功' });
});

app.get('/api/system/groups/:id/users', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const group = groups.find((g) => Number(g.id) === id);
  if (!group) return res.status(404).json({ code: 404, msg: '群组不存在' });
  res.json({
    code: 200,
    data: { userIds: Array.isArray(group.userIds) ? group.userIds : [] },
    msg: 'success'
  });
});

app.put('/api/system/groups/:id/users', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = groups.findIndex((g) => Number(g.id) === id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: '群组不存在' });
  const userIds = Array.isArray(req.body?.userIds) ? req.body.userIds : [];
  const ids = userIds.map((x) => Number(x)).filter((n) => Number.isFinite(n));
  groups[idx] = {
    ...groups[idx],
    userIds: Array.from(new Set(ids)),
    updateTime: new Date().toLocaleString()
  };
  res.json({ code: 200, data: { userIds: groups[idx].userIds }, msg: '保存成功' });
});

// =======================
// 系统管理：租户管理 API（模拟）
// =======================

const tenantCodePattern = /^[a-zA-Z0-9]+$/;

const countUsersForTenant = (tenantId) =>
  platformUsers.filter((u) => u.tenantId === tenantId).length;

const countAppsForTenant = (tenantId) => {
  const ids = tenantAppMap?.[tenantId];
  return Array.isArray(ids) ? ids.length : 0;
};

const mapTenantRow = (t) => ({
  ...t,
  appCount: countAppsForTenant(t.id),
  userCount: countUsersForTenant(t.id)
});

app.get('/api/system/tenants', (req, res) => {
  const { tenantName = '', status, pageIndex = 1, pageSize = 10 } = req.query;
  const kw = String(tenantName || '')
    .trim()
    .toLowerCase();
  const statusNum = status !== undefined && status !== '' ? parseInt(status, 10) : null;

  let list = tenants.map(mapTenantRow);
  if (kw) {
    list = list.filter(
      (row) =>
        String(row.tenantName || '')
          .toLowerCase()
          .indexOf(kw) !== -1
    );
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
  tenantAppMap[row.id] = tenantAppMap[row.id] || [];
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
      tenants.some((t) => t.id !== id && String(t.tenantCode).toLowerCase() === code.toLowerCase())
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
  if (tenantAppMap && tenantAppMap[id]) delete tenantAppMap[id];
  res.json({ code: 200, msg: '删除成功' });
});

// 租户授权应用：查询
app.get('/api/system/tenants/:id/apps', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) return res.status(400).json({ code: 400, msg: '租户ID不合法' });
  const exists = tenants.some((t) => t.id === id);
  if (!exists) return res.status(404).json({ code: 404, msg: '租户不存在' });
  const appIds = Array.isArray(tenantAppMap?.[id]) ? tenantAppMap[id] : [];
  res.json({ code: 200, data: { appIds }, msg: 'success' });
});

// 租户授权应用：保存（覆盖）
app.put('/api/system/tenants/:id/apps', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) return res.status(400).json({ code: 400, msg: '租户ID不合法' });
  const exists = tenants.some((t) => t.id === id);
  if (!exists) return res.status(404).json({ code: 404, msg: '租户不存在' });
  const body = req.body || {};
  const nextIds = normalizeAuthorizedAppIds(body.appIds);
  tenantAppMap[id] = nextIds;
  res.json({ code: 200, data: { appIds: nextIds }, msg: '保存成功' });
});

// =======================
// 系统管理：用户管理 API（模拟）
// =======================

app.get('/api/system/users', (req, res) => {
  const {
    source = 'all',
    accountType = '',
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
  const tenantIdNum = tenantId !== undefined && tenantId !== '' ? parseInt(tenantId, 10) : null;
  const tenantEmpty =
    tenantEmptyQ === true || tenantEmptyQ === 'true' || tenantEmptyQ === '1' || tenantEmptyQ === 1;
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

  const type = String(accountType || '').trim();
  if (type) {
    const isPhone = (v) => /^1\d{10}$/.test(String(v || '').trim());
    if (type === 'zzd') {
      list = list.filter((u) => u.source === 'zzd');
    } else if (type === 'phone') {
      list = list.filter(
        (u) => u.source !== 'zzd' && (isPhone(u.phone) || isPhone(u.name) || isPhone(u.externalId))
      );
    } else if (type === 'name') {
      list = list.filter(
        (u) =>
          !(u.source === 'zzd') && !isPhone(u.phone) && !isPhone(u.name) && !isPhone(u.externalId)
      );
    }
  }

  if (kw) {
    list = list.filter((u) => {
      const values = [
        u.name,
        u.nickName,
        u.phone,
        u.email,
        u.externalId,
        u.source,
        u.authIdentifier
      ]
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
  const {
    authIdentifier: authRaw,
    accountType: accountTypeBody,
    nickName,
    gender,
    phone: phoneBody,
    email,
    status,
    roleIds,
    password,
    orgId,
    tenantId
  } = body;
  let name = body.name != null && body.name !== '' ? body.name : body.userName || '';
  let phone = phoneBody != null && phoneBody !== '' ? String(phoneBody) : '';
  const auth = authRaw != null ? String(authRaw).trim() : '';
  const atRaw = String(accountTypeBody || '').trim();
  const accountType = ['name', 'phone', 'zzd'].includes(atRaw) ? atRaw : 'name';

  if (auth) {
    if (accountType === 'phone') {
      phone = auth;
      if (!name) name = auth;
    } else {
      name = auth;
    }
  }

  if (!name) return res.status(400).json({ code: 400, msg: '认证标识或登录名不能为空' });
  if (platformUsers.some((u) => u.name === name)) {
    return res.status(400).json({ code: 400, msg: '登录名已存在' });
  }
  if (phone && platformUsers.some((u) => String(u.phone || '') === phone)) {
    return res.status(400).json({ code: 400, msg: '手机号已被使用' });
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
    authIdentifier: auth || name,
    accountType,
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
    password: password != null && password !== '' ? password : '123',
    locked: false,
    lockEndTime: '',
    lastLoginTime: '',
    lastLoginIp: ''
  };
  platformUsers.push(newUser);
  const { password: _p, ...safe } = newUser;
  res.json({ code: 200, data: safe, msg: '新增成功' });
});

/** 账号管理：为平台用户新增外部登录账号（第三方/浙政钉等）并绑定 */
app.post('/api/system/accounts', (req, res) => {
  const { platformUserId, accountType, authIdentifier, status } = req.body || {};
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
    accountType === 'zzd' ? (auth.startsWith('ZZD_') ? auth : `ZZD_${auth}`) : `THIRD_${id}`;

  const newExt = {
    id,
    source,
    externalId,
    name: auth,
    nickName: plat.nickName || '',
    gender: plat.gender === 'female' ? 'female' : 'male',
    // 仅「手机号」类型写入认证手机；用户名/浙政钉不要用关联用户 phone，否则列表会误判为手机号
    phone: accountType === 'phone' ? auth : '',
    email: plat.email || '',
    status: status === 0 ? 0 : 1,
    createTime: new Date().toLocaleString(),
    locked: false,
    lockEndTime: '',
    lastLoginTime: '',
    lastLoginIp: ''
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
  const body = req.body || {};
  const nextName = body.name != null && body.name !== '' ? body.name : body.userName;
  const { nickName, gender, phone, email, status, roleIds, password, orgId, tenantId } = body;
  // 外部账号：允许修改 status / authIdentifier（认证标识）
  if (idx === -1) {
    const extIdx = externalUsers.findIndex((u) => u.id === id);
    if (extIdx === -1) return res.status(404).json({ code: 404, msg: '用户不存在' });
    const patch = {};
    if (status != null) patch.status = status === 0 ? 0 : 1;
    if (body.authIdentifier != null && String(body.authIdentifier).trim() !== '') {
      const auth = String(body.authIdentifier).trim();
      // 这里沿用外部账号展示逻辑：name 为认证标识
      patch.name = auth;
      // 手机号形态时同步 phone，避免标签判断异常
      if (/^1\d{10}$/.test(auth)) patch.phone = auth;
    }
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ code: 400, msg: '仅支持修改 status/authIdentifier' });
    }
    externalUsers[extIdx] = { ...externalUsers[extIdx], ...patch };
    res.json({ code: 200, msg: '修改成功' });
    return;
  }
  if (
    nextName != null &&
    nextName !== '' &&
    platformUsers.some((u) => u.name === nextName && u.id !== id)
  ) {
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
  let patchName = nextName != null ? nextName : undefined;
  let patchPhone = phone != null ? phone : undefined;
  let patchAuth = body.authIdentifier != null ? String(body.authIdentifier).trim() : undefined;
  let patchAccountType =
    body.accountType != null && String(body.accountType).trim() !== ''
      ? String(body.accountType).trim()
      : undefined;
  if (patchAuth || patchAccountType) {
    const at =
      patchAccountType && ['name', 'phone', 'zzd'].includes(patchAccountType)
        ? patchAccountType
        : platformUsers[idx].accountType || 'name';
    const auth = patchAuth != null ? patchAuth : platformUsers[idx].authIdentifier || '';
    if (at === 'phone') {
      patchPhone = auth;
      patchName = patchName ?? platformUsers[idx].name;
      if (!patchName) patchName = auth;
    } else {
      patchName = auth || patchName;
    }
    if (patchName && platformUsers.some((u) => u.name === patchName && u.id !== id)) {
      return res.status(400).json({ code: 400, msg: '登录名已存在' });
    }
    if (
      patchPhone &&
      platformUsers.some((u) => String(u.phone || '') === patchPhone && u.id !== id)
    ) {
      return res.status(400).json({ code: 400, msg: '手机号已被使用' });
    }
  }

  platformUsers[idx] = {
    ...platformUsers[idx],
    ...(patchName != null ? { name: patchName } : {}),
    ...(patchAuth != null ? { authIdentifier: patchAuth } : {}),
    ...(patchAccountType != null && ['name', 'phone', 'zzd'].includes(patchAccountType)
      ? { accountType: patchAccountType }
      : {}),
    ...(nickName != null ? { nickName } : {}),
    ...(gender != null ? { gender: gender === 'female' ? 'female' : 'male' } : {}),
    ...(patchPhone != null ? { phone: patchPhone } : {}),
    ...(phone != null && patchPhone === undefined ? { phone } : {}),
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
    const newPwd =
      body.password != null && String(body.password) !== '' ? String(body.password) : '123';
    platformUsers[pIdx] = { ...platformUsers[pIdx], password: newPwd };
    return res.json({ code: 200, msg: '密码已重置' });
  }
  const eIdx = externalUsers.findIndex((u) => u.id === id);
  if (eIdx !== -1) {
    const body = req.body || {};
    const newPwd =
      body.password != null && String(body.password) !== '' ? String(body.password) : '123';
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
  if (infoType === 'external' && body.externalLink) {
    const link = String(body.externalLink).trim();
    if (link && !isValidHttpUrl(link)) {
      return res
        .status(400)
        .json({ code: 400, msg: '外部链接格式不正确，请输入 http(s):// 开头的完整地址' });
    }
  }
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
  const nextType =
    body.infoType == null
      ? current.infoType
      : body.infoType === 'external'
        ? 'external'
        : 'internal';
  if (nextType === 'external' && body.externalLink != null) {
    const link = String(body.externalLink).trim();
    if (link && !isValidHttpUrl(link)) {
      return res
        .status(400)
        .json({ code: 400, msg: '外部链接格式不正确，请输入 http(s):// 开头的完整地址' });
    }
  }
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
      nextType === 'internal' ? (body.content != null ? body.content : current.content || '') : '',
    status: nextStatus,
    publishTime:
      nextStatus === 1
        ? body.publishTime || current.publishTime || now
        : body.publishTime || current.publishTime || '',
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
  const { source = 'platform', orgCode = '', name = '', status = '', tenantId } = req.query;

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
  const tree =
    source === 'zzd'
      ? zzdOrgTree
      : tid != null && orgTreeByTenantId[tid]
        ? orgTreeByTenantId[tid]
        : platformOrgTree;

  const codeKw = String(orgCode || '')
    .trim()
    .toLowerCase();
  const nameKw = String(name || '')
    .trim()
    .toLowerCase();
  const parsedStatus = status !== undefined && status !== '' ? parseInt(String(status), 10) : null;
  const statusNum = parsedStatus !== null && !Number.isNaN(parsedStatus) ? parsedStatus : null;

  const hitSelf = (node) => {
    const code = String(node.orgCode || '').toLowerCase();
    const n = String(node.name || '').toLowerCase();
    const codeOk = !codeKw || code.includes(codeKw);
    const nameOk = !nameKw || n.includes(nameKw);
    const statusOk = statusNum == null || node.status === statusNum;
    return codeOk && nameOk && statusOk;
  };

  const filterTree = (nodes) => {
    const resList = [];
    (nodes || []).forEach((node) => {
      const children = filterTree(node.children || []);
      if (hitSelf(node) || children.length) {
        resList.push({ ...node, children });
      }
    });
    return resList;
  };

  const filtered = filterTree(tree);
  res.json({ code: 200, data: filtered, msg: 'success' });
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
    // 兼容：若未传 parentId，则写入默认组织树
    platformOrgTree.push(newNode);
  } else {
    // 按 parentId 自动定位所属租户的组织树，避免依赖额外传 tenantId
    const located = findOrgNodeAcrossAllTenants(newNode.parentId);
    if (!located?.node) return res.status(404).json({ code: 404, msg: '父节点不存在' });
    located.node.children = located.node.children || [];
    located.node.children.push(newNode);
  }
  res.json({ code: 200, data: newNode, msg: '新增成功' });
});

app.put('/api/system/org/node/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const located = findOrgNodeAcrossAllTenants(id);
  const node = located?.node;
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
  let removed = false;
  for (const tree of getAllOrgTrees()) {
    if (removeOrgNodeById(tree, id)) {
      removed = true;
      break;
    }
  }
  if (!removed) return res.status(404).json({ code: 404, msg: '节点不存在' });
  res.json({ code: 200, msg: '删除成功' });
});

// orgId -> userIds
const orgPersonnelMap = {};

// 获取某组织已配置的人员
app.get('/api/system/org/personnel/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const userIds = Array.isArray(orgPersonnelMap[id]) ? orgPersonnelMap[id] : [];
  const list = platformUsers
    .filter((u) => userIds.includes(u.id))
    .map((u) => ({ id: u.id, name: u.name, nickName: u.nickName || '' }));
  res.json({ code: 200, data: { userIds, list }, msg: 'success' });
});

// 更新某组织配置人员
app.put('/api/system/org/personnel/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { userIds } = req.body || {};
  if (!Array.isArray(userIds))
    return res.status(400).json({ code: 400, msg: 'userIds 必须为数组' });
  orgPersonnelMap[id] = userIds.map((x) => parseInt(x)).filter((x) => !isNaN(x));
  res.json({ code: 200, msg: '保存成功' });
});

// 获取可选用户列表（用于配置人员弹窗）
app.get('/api/system/org/users', (_req, res) => {
  const orgIdToName = {};
  const walkOrg = (nodes) => {
    (nodes || []).forEach((n) => {
      orgIdToName[n.id] = n.name || '';
      if (n.children?.length) walkOrg(n.children);
    });
  };
  walkOrg(platformOrgTree);

  const userIdToOrgId = {};
  Object.keys(orgPersonnelMap).forEach((orgIdStr) => {
    const orgId = parseInt(orgIdStr, 10);
    const ids = Array.isArray(orgPersonnelMap[orgId]) ? orgPersonnelMap[orgId] : [];
    ids.forEach((uid) => {
      if (userIdToOrgId[uid] == null) userIdToOrgId[uid] = orgId;
    });
  });

  const list = platformUsers.map((u) => {
    const assignedOrgId = userIdToOrgId[u.id] ?? null;
    return {
      id: u.id,
      name: u.name,
      nickName: u.nickName || '',
      orgId: assignedOrgId,
      orgName: assignedOrgId ? orgIdToName[assignedOrgId] || '' : ''
    };
  });
  res.json({ code: 200, data: list, msg: 'success' });
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
    appName: '主系统',
    method: 'POST',
    path: '/platform/auth/login',
    permissionCode: 'platform:user:login',
    needAuth: false,
    isCommon: true,
    enabled: true,
    createTime: '2026-03-01 10:00:00'
  },
  {
    id: 2,
    name: '查询用户列表',
    appName: '主系统',
    method: 'GET',
    path: '/platform/system/user/list',
    permissionCode: 'platform:user:list',
    needAuth: true,
    isCommon: false,
    enabled: true,
    createTime: '2026-03-01 10:05:00'
  },
  {
    id: 3,
    name: '新增用户',
    appName: '主系统',
    method: 'POST',
    path: '/platform/system/user/add',
    permissionCode: 'platform:user:add',
    needAuth: true,
    isCommon: false,
    enabled: true,
    createTime: '2026-03-01 10:10:00'
  },
  {
    id: 4,
    name: '删除用户',
    appName: '主系统',
    method: 'DELETE',
    path: '/platform/system/user/delete',
    permissionCode: 'platform:user:delete',
    needAuth: true,
    isCommon: false,
    enabled: true,
    createTime: '2026-03-01 10:15:00'
  }
];

function normalizeApiIds(value) {
  if (!value) return [];
  const raw = Array.isArray(value) ? value : [value];
  const nums = raw.map((v) => Number(v)).filter((n) => Number.isFinite(n) && n > 0);
  return Array.from(new Set(nums));
}

function buildApiPermissionCode({ method, path }) {
  const normalizedMethod = String(method || 'GET').toLowerCase();
  const pathValue = String(path || '')
    .trim()
    .replace(/^\/+/, '');
  if (!pathValue) return `${normalizedMethod}:`;
  return `${normalizedMethod}:${pathValue.replace(/\//g, '.')}`;
}

function normalizeApiItem(item) {
  const method = String(item.method || 'GET').toUpperCase();
  return {
    ...item,
    method,
    needAuth: item.needAuth !== false,
    permissionCode: buildApiPermissionCode({
      method,
      path: item.path
    })
  };
}

app.get('/api/apis', (req, res) => {
  const q = req.query || {};
  const name = String(q.name || '')
    .trim()
    .toLowerCase();
  const path = String(q.path || '')
    .trim()
    .toLowerCase();
  const method = String(q.method || '')
    .trim()
    .toUpperCase();
  const appName = String(q.appName || '')
    .trim()
    .toLowerCase();
  const enabled =
    q.enabled === undefined || q.enabled === ''
      ? undefined
      : String(q.enabled).toLowerCase() === 'true';
  const pageIndex = Math.max(1, Number(q.pageIndex || 1));
  const pageSize = Math.max(1, Number(q.pageSize || 10));

  let list = apiList.map(normalizeApiItem);
  if (name)
    list = list.filter((i) =>
      String(i.name || '')
        .toLowerCase()
        .includes(name)
    );
  if (path)
    list = list.filter((i) =>
      String(i.path || '')
        .toLowerCase()
        .includes(path)
    );
  if (method) list = list.filter((i) => String(i.method || '').toUpperCase() === method);
  if (appName) list = list.filter((i) => String(i.appName || '').toLowerCase() === appName);
  if (typeof enabled === 'boolean') list = list.filter((i) => Boolean(i.enabled) === enabled);

  const total = list.length;
  const start = (pageIndex - 1) * pageSize;
  const end = start + pageSize;
  list = list.slice(start, end);

  res.json({ code: 200, data: { list, total }, msg: 'success' });
});

app.post('/api/apis', (req, res) => {
  const body = req.body || {};
  const newApi = normalizeApiItem({
    id: Date.now(),
    name: body.name || '未命名API',
    appName: body.appName || '主系统',
    method: String(body.method || 'GET').toUpperCase(),
    path: body.path || '/',
    permissionCode: body.permissionCode || '',
    needAuth: body.needAuth !== false,
    isCommon: body.isCommon === true,
    enabled: body.enabled !== false,
    createTime: new Date().toLocaleString()
  });
  apiList.unshift(newApi);
  res.json({ code: 200, msg: '新增成功' });
});

app.put('/api/apis/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const body = req.body || {};
  const idx = apiList.findIndex((i) => i.id === id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: 'API不存在' });
  apiList[idx] = normalizeApiItem({
    ...apiList[idx],
    ...body,
    ...(body.method ? { method: String(body.method).toUpperCase() } : {}),
    ...(body.enabled != null ? { enabled: body.enabled === true } : {}),
    ...(body.needAuth != null ? { needAuth: body.needAuth === true } : {}),
    ...(body.isCommon != null ? { isCommon: body.isCommon === true } : {})
  });
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

// =======================
// 辐射子系统接口（Mock）
// =======================

const radiationStations = [
  { id: 'S-001', name: '监测站点A' },
  { id: 'S-002', name: '监测站点B' }
];

const pad2 = (n) => String(n).padStart(2, '0');
const formatTimeHM = (d) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
const formatTimeYMDHMS = (d) => {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}  ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(
    d.getSeconds()
  )}`;
};
/** 折线图 x 轴：xxxx-xx-xx xx:xx（单空格，无秒） */
const formatTimeYMDHM = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
const formatTimeFull = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(
    d.getSeconds()
  )}`;

const buildRadiationSeries = (minutes, base, noise) => {
  const now = new Date();
  const points = [];
  for (let i = minutes - 1; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60 * 1000);
    const v = base + (Math.random() - 0.5) * noise;
    points.push({
      time: formatTimeYMDHM(t),
      fullTime: formatTimeYMDHMS(t),
      value: Number(v.toFixed(3))
    });
  }
  return points;
};

const MAX_RADIATION_QUERY_POINTS = 240;

const parseRadiationDateTime = (s) => {
  const str = String(s || '').trim();
  const m = str.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
};

const getRadiationQueryTimeRange = (body) => {
  const tr = body.timeRange;
  if (!Array.isArray(tr) || tr.length < 2) return null;
  const start = parseRadiationDateTime(tr[0]);
  const end = parseRadiationDateTime(tr[1]);
  if (!start || !end || start.getTime() > end.getTime()) return null;
  return { start, end };
};

const buildRadiationSeriesForQuery = (range, dataType, base, noise) => {
  const { start, end } = range;
  const startMs = start.getTime();
  const endMs = end.getTime();
  const span = endMs - startMs;

  const stepByType = {
    raw: 60 * 1000,
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000
  };
  let step = stepByType[dataType] || stepByType.hour;

  if (span <= 0) {
    const v = base + (Math.random() - 0.5) * noise;
    return [
      {
        time: formatTimeYMDHM(start),
        fullTime: formatTimeYMDHMS(start),
        value: Number(v.toFixed(3))
      }
    ];
  }

  let estCount = Math.floor(span / step) + 1;
  while (estCount > MAX_RADIATION_QUERY_POINTS) {
    step *= 2;
    estCount = Math.floor(span / step) + 1;
  }

  const points = [];
  let lastMs = null;
  const pushPoint = (ms) => {
    if (lastMs === ms) return;
    lastMs = ms;
    const d = new Date(ms);
    const v = base + (Math.random() - 0.5) * noise;
    points.push({
      time: formatTimeYMDHM(d),
      fullTime: formatTimeYMDHMS(d),
      value: Number(v.toFixed(3))
    });
  };

  for (let t = startMs; t < endMs; t += step) {
    pushPoint(t);
  }
  pushPoint(endMs);

  return points;
};

app.get('/api/radiation/stations', (req, res) => {
  res.json({ code: 200, data: radiationStations, msg: 'success' });
});

app.get('/api/radiation/stations/:id/snapshot', (req, res) => {
  const stationId = String(req.params.id || '');
  const stationName = radiationStations.find((s) => s.id === stationId)?.name || '未知站点';
  const now = new Date();
  const isAbnormal = Math.random() < 0.03;

  res.json({
    code: 200,
    data: {
      stationName,
      temperature: isAbnormal ? null : Number((18 + Math.random() * 10).toFixed(1)),
      humidity: isAbnormal ? null : Number((40 + Math.random() * 20).toFixed(1)),
      weather: isAbnormal ? null : '多云',
      voltage: isAbnormal ? null : Number((3.7 + Math.random() * 0.2).toFixed(2)),
      isAbnormal,
      timeText: formatTimeFull(now)
    },
    msg: 'success'
  });
});

app.get('/api/radiation/stations/:id/realtime', (req, res) => {
  const offline = Math.random() < 0.03;
  if (offline) {
    return res.json({
      code: 200,
      data: { emFieldStrength: null, radiationDoseRate: null, emSeries: [], radSeries: [] },
      msg: 'success'
    });
  }

  const emSeries = buildRadiationSeries(10, 2.5, 0.8);
  const radSeries = buildRadiationSeries(10, 85, 20);
  res.json({
    code: 200,
    data: {
      emFieldStrength: emSeries[emSeries.length - 1]?.value ?? null,
      radiationDoseRate: radSeries[radSeries.length - 1]?.value ?? null,
      emSeries,
      radSeries
    },
    msg: 'success'
  });
});

app.post('/api/radiation/query', (req, res) => {
  const body = req.body || {};
  const sourceType = body.sourceType === 'rad' ? 'rad' : 'em';
  const dataType = String(body.dataType || 'hour');
  const stationId = String(body.stationId || '');
  const base = sourceType === 'em' ? 2.3 : 90;
  const noise = sourceType === 'em' ? 1.2 : 30;
  const range = getRadiationQueryTimeRange(body);
  const series = range
    ? buildRadiationSeriesForQuery(range, dataType, base, noise)
    : buildRadiationSeries(24, base, noise);
  const values = series.map((s) => s.value).filter((v) => typeof v === 'number');
  const maxValue = values.length ? Math.max(...values) : null;
  const minValue = values.length ? Math.min(...values) : null;
  const avgValue = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
  const maxIdx = maxValue == null ? -1 : series.findIndex((s) => s.value === maxValue);
  const minIdx = minValue == null ? -1 : series.findIndex((s) => s.value === minValue);

  const sourceTypeLabel = sourceType === 'em' ? '综合场强' : '辐射剂量率';
  const dataTypeLabel =
    dataType === 'raw'
      ? '原始值'
      : dataType === 'minute'
        ? '分钟均值'
        : dataType === 'hour'
          ? '时均值'
          : '日均值';

  res.json({
    code: 200,
    data: {
      rows: [
        {
          id: `${stationId || 'unknown'}-${sourceType}-${dataType}`,
          sourceTypeLabel: `${sourceTypeLabel}`,
          // 数据查询：状态异常阈值按场源类型固定返回
          abnormalThreshold: sourceType === 'em' ? 12 : 400,
          maxValue,
          maxTime: maxIdx >= 0 ? (series[maxIdx]?.fullTime ?? series[maxIdx]?.time ?? null) : null,
          minValue,
          minTime: minIdx >= 0 ? (series[minIdx]?.fullTime ?? series[minIdx]?.time ?? null) : null,
          avgValue: avgValue == null ? null : Number(avgValue.toFixed(3))
        }
      ],
      series
    },
    msg: 'success'
  });
});

app.post('/api/radiation/download', (req, res) => {
  const body = req.body || {};
  const stationId = String(body.stationId || 'unknown');
  const sourceType = body.sourceType === 'rad' ? 'rad' : 'em';
  const dataType = String(body.dataType || 'hour');
  const downloadType = body.downloadType === 'raw' ? 'raw' : 'stat';
  const now = new Date();
  const fileName = `radiation_${stationId}_${sourceType}_${downloadType}_${now.getTime()}.csv`;
  const filePath = path.join(uploadsDir, fileName);

  const base = sourceType === 'em' ? 2.3 : 90;
  const noise = sourceType === 'em' ? 1.2 : 30;
  const range = getRadiationQueryTimeRange(body);
  const series = range
    ? buildRadiationSeriesForQuery(range, dataType, base, noise)
    : buildRadiationSeries(24, base, noise);
  if (downloadType === 'raw') {
    const header = 'time,value\n';
    const lines = series.map((p) => `${p.fullTime || p.time},${p.value ?? ''}`).join('\n');
    fs.writeFileSync(filePath, header + lines, 'utf8');
  } else {
    const values = series.map((s) => s.value).filter((v) => typeof v === 'number');
    const maxValue = values.length ? Math.max(...values) : '';
    const minValue = values.length ? Math.min(...values) : '';
    const avgValue = values.length ? values.reduce((a, b) => a + b, 0) / values.length : '';
    const header = 'metric,value\n';
    const lines = [
      `max,${maxValue}`,
      `min,${minValue}`,
      `avg,${avgValue === '' ? '' : Number(avgValue.toFixed(3))}`
    ].join('\n');
    fs.writeFileSync(filePath, header + lines, 'utf8');
  }

  res.json({
    code: 200,
    data: {
      url: `/uploads/${fileName}`
    },
    msg: 'success'
  });
});

// --- 应用管理接口 ---
app.get('/api/apps', (req, res) => {
  const cat = req.query.category;
  const allowed = ['platform', 'sso', 'external'];
  let list = appList;

  const { roleKey, tenantId } = resolveCurrentUserContext(req);
  if (roleKey !== 'admin' && tenantId != null) {
    const authedIds = Array.isArray(tenantAppMap?.[tenantId]) ? tenantAppMap[tenantId] : [];
    list = list.filter((a) => authedIds.includes(a.id));
  }

  if (cat && allowed.includes(String(cat))) {
    list = list.filter((a) => a.category === cat);
  }
  res.json({ code: 200, data: mapAppsForApiResponse(list), msg: 'success' });
});
app.post('/api/apps', (req, res) => {
  const body = req.body || {};
  if (body.entry) {
    const entry = String(body.entry).trim();
    if (entry && !isValidHttpUrl(entry)) {
      return res
        .status(400)
        .json({ code: 400, msg: '服务地址格式不正确，请输入 http(s):// 开头的完整地址' });
    }
  }
  if (body.entryLocal != null && body.entryLocal !== '') {
    const entryLocal = String(body.entryLocal).trim();
    if (entryLocal && !isValidHttpUrl(entryLocal)) {
      return res
        .status(400)
        .json({ code: 400, msg: '本地服务地址格式不正确，请输入 http(s):// 开头的完整地址' });
    }
  }
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
    if (body.entry != null) {
      const entry = String(body.entry).trim();
      if (entry && !isValidHttpUrl(entry)) {
        return res
          .status(400)
          .json({ code: 400, msg: '服务地址格式不正确，请输入 http(s):// 开头的完整地址' });
      }
    }
    if (body.entryLocal != null && body.entryLocal !== '') {
      const entryLocal = String(body.entryLocal).trim();
      if (entryLocal && !isValidHttpUrl(entryLocal)) {
        return res
          .status(400)
          .json({ code: 400, msg: '本地服务地址格式不正确，请输入 http(s):// 开头的完整地址' });
      }
    }
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
  const profile = isLocalMicroEntryProfile() ? 'local(entryLocal)' : 'deploy(entry)';
  console.log(`Node.js 权限服务已启动: http://localhost:${PORT}`);
  console.log(`子应用入口模式: ${profile}（MICRO_ENTRY_PROFILE / NODE_ENV）`);
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

// =======================
// 系统设置：可视化表单生成器（模拟）
// =======================

const formCodePattern = /^[a-zA-Z][a-zA-Z0-9_]{2,49}$/;

const normalizePage = (v, fallback) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const normalizeStatus = (v) => {
  if (v === undefined || v === null || v === '') return null;
  const n = parseInt(v, 10);
  if (!Number.isFinite(n)) return null;
  return n === 0 ? 0 : 1;
};

let formDefinitions = [
  {
    id: 1,
    name: '示例：客户信息采集',
    code: 'customer_info',
    status: 1,
    schema: [
      {
        uid: 'c_1',
        type: 'card',
        title: '基础信息',
        children: [
          {
            uid: 'f_name',
            type: 'input',
            field: 'name',
            label: '姓名',
            placeholder: '请输入姓名',
            required: true,
            span: 12
          },
          {
            uid: 'f_phone',
            type: 'input',
            field: 'phone',
            label: '手机号',
            placeholder: '请输入手机号',
            required: true,
            span: 12
          },
          {
            uid: 'f_gender',
            type: 'select',
            field: 'gender',
            label: '性别',
            placeholder: '请选择',
            span: 12,
            options: [
              { label: '男', value: 'male' },
              { label: '女', value: 'female' }
            ],
            defaultValue: 'male'
          },
          {
            uid: 'f_agree',
            type: 'switch',
            field: 'agree',
            label: '同意协议',
            span: 12,
            defaultValue: false
          }
        ]
      }
    ],
    createTime: '2026-04-10 10:00:00',
    updateTime: '2026-04-10 10:00:00'
  }
];

let formSubmissions = [
  {
    id: 1,
    formId: 1,
    payload: { name: '张三', phone: '13800000000', gender: 'male', agree: true },
    createTime: '2026-04-10 10:05:00'
  }
];

// ---- 表单设计器：模板（以 card 为单位）----
let formTemplateCategories = [
  {
    id: 1,
    name: '默认',
    sort: 1,
    createTime: '2026-04-10 10:00:00',
    updateTime: '2026-04-10 10:00:00'
  }
];
let formTemplates = [];

const coerceSchemaArray = (schema) => (Array.isArray(schema) ? schema : null);
const flattenFieldListFromCards = (cards) => {
  const list = Array.isArray(cards) ? cards : [];
  return list.flatMap((c) =>
    c && c.type === 'card' && Array.isArray(c.children) ? c.children : []
  );
};

const parseRegex = (raw) => {
  const s = String(raw || '').trim();
  if (!s) return null;
  if (s.startsWith('/') && s.lastIndexOf('/') > 0) {
    const last = s.lastIndexOf('/');
    const source = s.slice(1, last);
    const flags = s.slice(last + 1);
    try {
      return new RegExp(source, flags);
    } catch (_) {
      return null;
    }
  }
  try {
    return new RegExp(s);
  } catch (_) {
    return null;
  }
};

const validateFieldItem = (item) => {
  const field = String(item?.field || '').trim();
  const label = String(item?.label || '').trim();
  const type = String(item?.type || '').trim();
  const uid = String(item?.uid || '').trim();
  if (!uid) return { ok: false, msg: 'schema.uid 不能为空' };
  if (!field) return { ok: false, msg: 'schema.field 不能为空' };
  if (!label) return { ok: false, msg: 'schema.label 不能为空' };
  if (!type) return { ok: false, msg: 'schema.type 不能为空' };

  const patternRaw = item?.pattern;
  if (patternRaw != null && String(patternRaw).trim() !== '') {
    const re = parseRegex(patternRaw);
    if (!re) return { ok: false, msg: `字段 ${field} 的正则表达式不合法` };
  }

  const requiredMsg = item?.requiredMessage;
  if (requiredMsg != null && typeof requiredMsg !== 'string') {
    return { ok: false, msg: `字段 ${field} 的必填提示文案必须为字符串` };
  }

  const presetKey = item?.patternPreset;
  if (presetKey != null && typeof presetKey !== 'string') {
    return { ok: false, msg: `字段 ${field} 的正则预设必须为字符串` };
  }

  const ds = item?.dataSource;
  if (ds != null) {
    if (!ds || typeof ds !== 'object')
      return { ok: false, msg: `字段 ${field} 的 dataSource 必须为对象` };
    if (ds.type !== 'remote')
      return { ok: false, msg: `字段 ${field} 的 dataSource.type 当前仅支持 remote` };
    const url = String(ds.url || '').trim();
    if (!url) return { ok: false, msg: `字段 ${field} 的 dataSource.url 不能为空` };
    if (!url.startsWith('/api/')) {
      return {
        ok: false,
        msg: `字段 ${field} 的 dataSource.url 必须以 /api/ 开头（仅允许同源接口路径）`
      };
    }
    const method = String(ds.method || 'GET').toUpperCase();
    if (method !== 'GET' && method !== 'POST') {
      return { ok: false, msg: `字段 ${field} 的 dataSource.method 仅支持 GET/POST` };
    }
    const ttl = ds.cacheTtlMs;
    if (ttl != null && (!Number.isFinite(Number(ttl)) || Number(ttl) < 0)) {
      return { ok: false, msg: `字段 ${field} 的 dataSource.cacheTtlMs 非法` };
    }
    if (ds.dependsOn != null && !Array.isArray(ds.dependsOn)) {
      return { ok: false, msg: `字段 ${field} 的 dataSource.dependsOn 必须为数组` };
    }
  }
  return { ok: true, field };
};

const validateSchema = (schema) => {
  const cards = coerceSchemaArray(schema);
  if (!cards) return { ok: false, msg: 'schema 必须为 card 数组' };
  if (cards.length === 0) return { ok: false, msg: 'schema 不能为空' };

  const fields = new Set();
  const collectField = (name) => {
    const f = String(name || '').trim();
    if (!f) return { ok: false, msg: 'schema.field 不能为空' };
    if (fields.has(f)) return { ok: false, msg: `字段 field 重复：${f}` };
    fields.add(f);
    return { ok: true };
  };
  const validateGrid = (item) => {
    const chk = validateFieldItem(item);
    if (!chk.ok) return chk;
    const cols = item?.columns;
    if (!Array.isArray(cols) || cols.length === 0) {
      return { ok: false, msg: `字段 ${chk.field} 的 columns 必须为非空数组` };
    }
    if (cols.length < 1 || cols.length > 4) {
      return { ok: false, msg: `字段 ${chk.field} 的 columns 数量仅支持 1-4` };
    }
    for (const [i, col] of cols.entries()) {
      const span = Number(col?.span);
      if (!Number.isFinite(span) || span < 1 || span > 24) {
        return { ok: false, msg: `字段 ${chk.field} 的 columns[${i}].span 非法（1-24）` };
      }
      const children = col?.children;
      if (children != null && !Array.isArray(children)) {
        return { ok: false, msg: `字段 ${chk.field} 的 columns[${i}].children 必须为数组` };
      }
      for (const child of children || []) {
        const t = String(child?.type || '').trim();
        if (t === 'grid') return { ok: false, msg: '不支持 grid 嵌套 grid' };
        const childChk = validateFieldItem(child);
        if (!childChk.ok) return childChk;
        const add = collectField(childChk.field);
        if (!add.ok) return add;
      }
    }
    return { ok: true, field: chk.field };
  };

  for (const card of cards) {
    const uid = String(card?.uid || '').trim();
    const type = String(card?.type || '').trim();
    const title = String(card?.title || '').trim();
    if (!uid) return { ok: false, msg: 'card.uid 不能为空' };
    if (type !== 'card') return { ok: false, msg: 'schema 元素必须为 card' };
    // title can be empty (root canvas or untitled card)
    if (card?.columns != null) {
      const cols = Number(card.columns);
      if (!Number.isFinite(cols) || cols < 1 || cols > 4) {
        return { ok: false, msg: `card.columns 非法（仅支持 1-4）：${String(card.columns)}` };
      }
    }
    if (!Array.isArray(card?.children)) return { ok: false, msg: 'card.children 必须为数组' };

    for (const item of card.children) {
      const t = String(item?.type || '').trim();
      if (t === 'grid') {
        const g = validateGrid(item);
        if (!g.ok) return g;
        const add = collectField(g.field);
        if (!add.ok) return add;
        continue;
      }
      const chk = validateFieldItem(item);
      if (!chk.ok) return chk;
      const add = collectField(chk.field);
      if (!add.ok) return add;
    }
  }
  return { ok: true };
};

const validateCrossFieldRules = (rules, fieldNames) => {
  if (rules == null) return { ok: true };
  if (!Array.isArray(rules)) return { ok: false, msg: 'crossFieldRules 必须为数组' };
  const names = new Set(fieldNames);
  for (const [idx, rule] of rules.entries()) {
    if (!rule || typeof rule !== 'object')
      return { ok: false, msg: `crossFieldRules[${idx}] 必须为对象` };
    const msg = String(rule.message || '').trim();
    if (!msg) return { ok: false, msg: `crossFieldRules[${idx}].message 不能为空` };
    const logic = rule.logic;
    if (logic != null && logic !== 'AND' && logic !== 'OR') {
      return { ok: false, msg: `crossFieldRules[${idx}].logic 仅支持 AND/OR` };
    }
    const when = rule.when;
    if (!Array.isArray(when) || when.length === 0) {
      return { ok: false, msg: `crossFieldRules[${idx}].when 必须为非空数组` };
    }
    for (const [j, c] of when.entries()) {
      if (!c || typeof c !== 'object')
        return { ok: false, msg: `crossFieldRules[${idx}].when[${j}] 非法` };
      const f = String(c.field || '').trim();
      const op = String(c.op || '').trim();
      if (!f) return { ok: false, msg: `crossFieldRules[${idx}].when[${j}].field 不能为空` };
      if (!op) return { ok: false, msg: `crossFieldRules[${idx}].when[${j}].op 不能为空` };
      if (!names.has(f))
        return { ok: false, msg: `crossFieldRules[${idx}] 引用了不存在的字段：${f}` };
    }
  }
  return { ok: true };
};

const deepCloneJson = (obj) => JSON.parse(JSON.stringify(obj));

const semverThreePartRe = /^\d+\.\d+\.\d+$/;
const parseSemverThreePart = (raw) => {
  const s = String(raw || '').trim();
  if (!semverThreePartRe.test(s)) return null;
  const parts = s.split('.').map((x) => parseInt(x, 10));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n) || n < 0)) return null;
  return parts;
};

const compareSemverThreePart = (a, b) => {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
  }
  return 0;
};

// Form builder: demo remote options for `dataSource.url=/api/system/form-builder/options/demo`
app.get('/api/system/form-builder/options/demo', (_req, res) => {
  res.json({
    code: 200,
    data: {
      list: [
        { label: '选项A', value: 'a' },
        { label: '选项B', value: 'b' },
        { label: '选项C', value: 'c' }
      ]
    },
    msg: 'success'
  });
});

// Form builder: dict-driven options for `dataSource.url=/api/system/form-builder/options/dict?code=xxx`
app.get('/api/system/form-builder/options/dict', (req, res) => {
  const code = String(req.query.code || '').trim();
  const items = formDesignerDictEntries
    .filter((x) => String(x?.categoryCode || '').trim() === code && Number(x?.status ?? 1) === 1)
    .sort((a, b) => (Number(a?.sort ?? 0) || 0) - (Number(b?.sort ?? 0) || 0))
    .map((x) => ({ label: String(x.name ?? ''), value: x.value ?? x.code }));
  res.json({
    code: 200,
    data: {
      list: items
    },
    msg: 'success'
  });
});

// 表单定义：列表（分页）
app.get('/api/system/form-definitions', (req, res) => {
  const { keyword = '', status, pageIndex = 1, pageSize = 10 } = req.query;
  const kw = String(keyword || '')
    .trim()
    .toLowerCase();
  const statusNum = normalizeStatus(status);

  let list = formDefinitions.map((x) => ({ ...x }));
  if (kw) {
    list = list.filter(
      (row) =>
        String(row.name || '')
          .toLowerCase()
          .includes(kw) ||
        String(row.code || '')
          .toLowerCase()
          .includes(kw)
    );
  }
  if (statusNum !== null) {
    list = list.filter((row) => row.status === statusNum);
  }

  list.sort((a, b) => (b.id || 0) - (a.id || 0));
  const page = paginate(list, normalizePage(pageIndex, 1), normalizePage(pageSize, 10));
  res.json({ code: 200, data: { list: page.list, total: page.total }, msg: 'success' });
});

// 表单定义：新增
app.post('/api/system/form-definitions', (req, res) => {
  const body = req.body || {};
  const name = String(body.name || '').trim();
  const code = String(body.code || '').trim();
  const status = normalizeStatus(body.status);
  const schema = body.schema;
  const crossFieldRules = body.crossFieldRules;
  const canvasGroups = body.canvasGroups;
  const draftSchema = body.draftSchema;
  const publishedSchema = body.publishedSchema;
  const publishedAt = body.publishedAt;

  if (!name) return res.status(400).json({ code: 400, msg: '表单名称不能为空' });
  if (!code) return res.status(400).json({ code: 400, msg: '表单编码不能为空' });
  if (!formCodePattern.test(code))
    return res
      .status(400)
      .json({ code: 400, msg: '表单编码格式不合法（字母开头，3-50 位，仅字母/数字/下划线）' });
  if (formDefinitions.some((f) => String(f.code).toLowerCase() === code.toLowerCase()))
    return res.status(400).json({ code: 400, msg: '表单编码已存在' });

  const schemaCheck = validateSchema(schema);
  if (!schemaCheck.ok) return res.status(400).json({ code: 400, msg: schemaCheck.msg });

  const fieldNames = flattenFieldListFromCards(schema)
    .map((x) => String(x?.field || '').trim())
    .filter(Boolean);
  const crossCheck = validateCrossFieldRules(crossFieldRules, fieldNames);
  if (!crossCheck.ok) return res.status(400).json({ code: 400, msg: crossCheck.msg });

  const draftToSave = draftSchema === undefined ? schema : draftSchema;
  const publishedToSave = publishedSchema === undefined ? schema : publishedSchema;
  if (draftToSave !== undefined) {
    const chk = validateSchema(draftToSave);
    if (!chk.ok) return res.status(400).json({ code: 400, msg: `draftSchema：${chk.msg}` });
  }
  if (publishedToSave !== undefined) {
    const chk = validateSchema(publishedToSave);
    if (!chk.ok) return res.status(400).json({ code: 400, msg: `publishedSchema：${chk.msg}` });
  }

  const id = Math.max(0, ...formDefinitions.map((x) => x.id)) + 1;
  const now = new Date().toLocaleString();
  const row = {
    id,
    name,
    code,
    status: status === null ? 1 : status,
    schema,
    ...(Array.isArray(crossFieldRules) && crossFieldRules.length > 0 ? { crossFieldRules } : {}),
    ...(Array.isArray(canvasGroups) && canvasGroups.length > 0 ? { canvasGroups } : {}),
    ...(Array.isArray(draftToSave) ? { draftSchema: draftToSave } : {}),
    ...(Array.isArray(publishedToSave) ? { publishedSchema: publishedToSave } : {}),
    ...(publishedAt != null ? { publishedAt: String(publishedAt) } : { publishedAt: now }),
    createTime: now,
    updateTime: now
  };
  formDefinitions.push(row);
  res.json({ code: 200, data: row, msg: '新增成功' });
});

// 表单定义：单条
app.get('/api/system/form-definitions/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const row = formDefinitions.find((x) => x.id === id);
  if (!row) return res.status(404).json({ code: 404, msg: '表单不存在' });
  res.json({ code: 200, data: { ...row }, msg: 'success' });
});

// 表单定义：已发布实例（扁平，每版本一行）
app.get('/api/system/form-definition-instances', (req, res) => {
  const kw = String(req.query.keyword || '')
    .trim()
    .toLowerCase();
  const statusNum = normalizeStatus(req.query.status);
  const list = [];
  for (const row of formDefinitions) {
    const releases = Array.isArray(row.publishedReleases) ? row.publishedReleases : [];
    for (const rel of releases) {
      const formName = String(row.name || '');
      if (kw && !formName.toLowerCase().includes(kw)) continue;
      const relStatus =
        rel.status !== undefined && rel.status !== null ? Number(rel.status) : 1;
      const releaseEnabled = relStatus === 1 ? 1 : 0;
      if (statusNum !== null && releaseEnabled !== statusNum) continue;
      list.push({
        formId: row.id,
        formName,
        code: String(row.code || ''),
        version: String(rel.version || ''),
        status: releaseEnabled,
        publishedAt: String(rel.publishedAt || '')
      });
    }
  }
  list.sort((a, b) => {
    const tb = new Date(String(b.publishedAt).replace(/-/g, '/')).getTime();
    const ta = new Date(String(a.publishedAt).replace(/-/g, '/')).getTime();
    const nb = Number.isFinite(tb) ? tb : 0;
    const na = Number.isFinite(ta) ? ta : 0;
    if (nb !== na) return nb - na;
    const vb = parseSemverThreePart(b.version);
    const va = parseSemverThreePart(a.version);
    if (vb && va) {
      const c = compareSemverThreePart(vb, va);
      if (c !== 0) return c;
    }
    return (b.formId || 0) - (a.formId || 0);
  });
  res.json({ code: 200, data: { list }, msg: 'success' });
});

// 表单定义：发布新版本
app.post('/api/system/form-definitions/:id/publish', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = formDefinitions.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: '表单不存在' });

  const body = req.body || {};
  const versionRaw = String(body.version || '').trim();
  const parsedNew = parseSemverThreePart(versionRaw);
  if (!parsedNew) {
    return res.status(400).json({
      code: 400,
      msg: '版本号格式须为 major.minor.patch（每段为非负整数）'
    });
  }

  const row = formDefinitions[idx];
  const prevVer = String(row.publishedVersion || '').trim();
  if (prevVer) {
    const parsedPrev = parseSemverThreePart(prevVer);
    if (parsedPrev && compareSemverThreePart(parsedNew, parsedPrev) <= 0) {
      return res.status(400).json({ code: 400, msg: `新版本须严格大于上一版本 ${prevVer}` });
    }
  }

  const releases = Array.isArray(row.publishedReleases) ? row.publishedReleases : [];
  if (releases.some((r) => String(r?.version || '').trim() === versionRaw)) {
    return res.status(400).json({ code: 400, msg: `版本 ${versionRaw} 已存在` });
  }

  let sourceSchema =
    Array.isArray(row.draftSchema) && row.draftSchema.length > 0 ? row.draftSchema : row.schema;
  sourceSchema = deepCloneJson(sourceSchema);
  const crossFieldRules =
    Array.isArray(row.crossFieldRules) && row.crossFieldRules.length > 0
      ? deepCloneJson(row.crossFieldRules)
      : undefined;

  const schemaCheck = validateSchema(sourceSchema);
  if (!schemaCheck.ok) return res.status(400).json({ code: 400, msg: schemaCheck.msg });

  const fieldNames = flattenFieldListFromCards(sourceSchema)
    .map((x) => String(x?.field || '').trim())
    .filter(Boolean);
  const crossCheck = validateCrossFieldRules(crossFieldRules, fieldNames);
  if (!crossCheck.ok) return res.status(400).json({ code: 400, msg: crossCheck.msg });

  const now = new Date().toLocaleString();
  const release = {
    version: versionRaw,
    publishedAt: now,
    schema: sourceSchema,
    status: 1,
    ...(crossFieldRules ? { crossFieldRules } : {})
  };

  const nextReleases = [...releases, release];

  formDefinitions[idx] = {
    ...row,
    publishedVersion: versionRaw,
    publishedAt: now,
    publishedSchema: deepCloneJson(sourceSchema),
    publishedReleases: nextReleases,
    updateTime: now
  };

  res.json({ code: 200, data: { ...formDefinitions[idx] }, msg: '发布成功' });
});

// 表单定义：某发布版本的启用状态（按版本独立）
app.put('/api/system/form-definitions/:id/published-versions/:version/status', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const versionParam = String(req.params.version || '').trim();
  const idx = formDefinitions.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: '表单不存在' });

  const statusNum = normalizeStatus(req.body?.status);
  if (statusNum === null) {
    return res.status(400).json({ code: 400, msg: 'status 须为 0 或 1' });
  }

  const row = formDefinitions[idx];
  const releases = Array.isArray(row.publishedReleases) ? [...row.publishedReleases] : [];
  const relIdx = releases.findIndex((r) => String(r?.version || '').trim() === versionParam);
  if (relIdx === -1) {
    return res.status(404).json({ code: 404, msg: '未找到该发布版本' });
  }

  const now = new Date().toLocaleString();
  releases[relIdx] = {
    ...releases[relIdx],
    status: statusNum
  };

  formDefinitions[idx] = {
    ...row,
    publishedReleases: releases,
    updateTime: now
  };

  res.json({ code: 200, data: { ...formDefinitions[idx] }, msg: '保存成功' });
});

// 表单定义：更新
app.put('/api/system/form-definitions/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = formDefinitions.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: '表单不存在' });

  const body = req.body || {};
  const name = body.name != null ? String(body.name || '').trim() : null;
  const code = body.code != null ? String(body.code || '').trim() : null;
  const status = body.status != null ? normalizeStatus(body.status) : null;
  const schema = body.schema;
  const crossFieldRules = body.crossFieldRules;
  const canvasGroups = body.canvasGroups;
  const draftSchema = body.draftSchema;
  const publishedSchema = body.publishedSchema;
  const publishedAt = body.publishedAt;

  if (name !== null && !name) return res.status(400).json({ code: 400, msg: '表单名称不能为空' });
  if (code !== null) {
    if (!code) return res.status(400).json({ code: 400, msg: '表单编码不能为空' });
    if (!formCodePattern.test(code))
      return res
        .status(400)
        .json({ code: 400, msg: '表单编码格式不合法（字母开头，3-50 位，仅字母/数字/下划线）' });
    if (
      formDefinitions.some(
        (f) => f.id !== id && String(f.code).toLowerCase() === code.toLowerCase()
      )
    )
      return res.status(400).json({ code: 400, msg: '表单编码已存在' });
  }

  if (schema !== undefined) {
    const schemaCheck = validateSchema(schema);
    if (!schemaCheck.ok) return res.status(400).json({ code: 400, msg: schemaCheck.msg });
    const fieldNames = flattenFieldListFromCards(schema)
      .map((x) => String(x?.field || '').trim())
      .filter(Boolean);
    const crossCheck = validateCrossFieldRules(crossFieldRules, fieldNames);
    if (!crossCheck.ok) return res.status(400).json({ code: 400, msg: crossCheck.msg });
  }

  if (draftSchema !== undefined) {
    const chk = validateSchema(draftSchema);
    if (!chk.ok) return res.status(400).json({ code: 400, msg: `draftSchema：${chk.msg}` });
  }
  if (publishedSchema !== undefined) {
    const chk = validateSchema(publishedSchema);
    if (!chk.ok) return res.status(400).json({ code: 400, msg: `publishedSchema：${chk.msg}` });
  }
  if (publishedAt !== undefined && publishedAt !== null && typeof publishedAt !== 'string') {
    return res.status(400).json({ code: 400, msg: 'publishedAt 必须为字符串' });
  }

  const now = new Date().toLocaleString();
  formDefinitions[idx] = {
    ...formDefinitions[idx],
    ...(name !== null ? { name } : {}),
    ...(code !== null ? { code } : {}),
    ...(status !== null ? { status } : {}),
    ...(schema !== undefined ? { schema } : {}),
    ...(crossFieldRules !== undefined
      ? Array.isArray(crossFieldRules) && crossFieldRules.length > 0
        ? { crossFieldRules }
        : { crossFieldRules: undefined }
      : {}),
    ...(canvasGroups !== undefined
      ? Array.isArray(canvasGroups) && canvasGroups.length > 0
        ? { canvasGroups }
        : { canvasGroups: undefined }
      : {}),
    ...(draftSchema !== undefined
      ? Array.isArray(draftSchema) && draftSchema.length > 0
        ? { draftSchema }
        : { draftSchema: undefined }
      : {}),
    ...(publishedSchema !== undefined
      ? Array.isArray(publishedSchema) && publishedSchema.length > 0
        ? { publishedSchema }
        : { publishedSchema: undefined }
      : {}),
    ...(publishedAt !== undefined
      ? { publishedAt: publishedAt == null ? undefined : String(publishedAt) }
      : {}),
    updateTime: now
  };
  res.json({ code: 200, data: { ...formDefinitions[idx] }, msg: '修改成功' });
});

// 表单定义：删除（级联删除提交记录）
app.delete('/api/system/form-definitions/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = formDefinitions.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: '表单不存在' });
  formDefinitions.splice(idx, 1);
  formSubmissions = formSubmissions.filter((s) => s.formId !== id);
  res.json({ code: 200, msg: '删除成功' });
});

// 提交记录：列表（分页）
app.get('/api/system/form-definitions/:id/submissions', (req, res) => {
  const formId = parseInt(req.params.id, 10);
  const exists = formDefinitions.some((x) => x.id === formId);
  if (!exists) return res.status(404).json({ code: 404, msg: '表单不存在' });

  const { pageIndex = 1, pageSize = 10 } = req.query;
  let list = formSubmissions.filter((s) => s.formId === formId).map((x) => ({ ...x }));
  list.sort((a, b) => (b.id || 0) - (a.id || 0));
  const page = paginate(list, normalizePage(pageIndex, 1), normalizePage(pageSize, 10));
  res.json({ code: 200, data: { list: page.list, total: page.total }, msg: 'success' });
});

// 提交记录：新增
app.post('/api/system/form-definitions/:id/submissions', (req, res) => {
  const formId = parseInt(req.params.id, 10);
  const exists = formDefinitions.some((x) => x.id === formId);
  if (!exists) return res.status(404).json({ code: 404, msg: '表单不存在' });

  const body = req.body || {};
  const payload = body.payload && typeof body.payload === 'object' ? body.payload : null;
  if (!payload) return res.status(400).json({ code: 400, msg: 'payload 必须为对象' });

  const id = Math.max(0, ...formSubmissions.map((x) => x.id)) + 1;
  const now = new Date().toLocaleString();
  const row = { id, formId, payload, createTime: now };
  formSubmissions.push(row);
  res.json({ code: 200, data: row, msg: '提交成功' });
});

// =======================
// 表单设计器：模板分类 / 模板（以 card 为单位）
// =======================

app.get('/api/system/form-templates/categories', (_req, res) => {
  const list = (formTemplateCategories || []).map((x) => ({ ...x }));
  list.sort((a, b) => (Number(a.sort ?? 0) || 0) - (Number(b.sort ?? 0) || 0));
  res.json({ code: 200, data: list, msg: 'success' });
});

app.post('/api/system/form-templates/categories', (req, res) => {
  const body = req.body || {};
  const name = String(body.name || '').trim();
  const sort = body.sort != null ? Number(body.sort) : 0;
  if (!name) return res.status(400).json({ code: 400, msg: '分类名称不能为空' });
  const id = Math.max(0, ...formTemplateCategories.map((x) => x.id || 0)) + 1;
  const now = new Date().toLocaleString();
  const row = {
    id,
    name,
    sort: Number.isFinite(sort) ? sort : 0,
    createTime: now,
    updateTime: now
  };
  formTemplateCategories.push(row);
  res.json({ code: 200, data: row, msg: '新增成功' });
});

app.put('/api/system/form-templates/categories/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = formTemplateCategories.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: '分类不存在' });
  const body = req.body || {};
  const name = body.name != null ? String(body.name || '').trim() : null;
  const sort = body.sort != null ? Number(body.sort) : null;
  if (name !== null && !name) return res.status(400).json({ code: 400, msg: '分类名称不能为空' });
  const now = new Date().toLocaleString();
  formTemplateCategories[idx] = {
    ...formTemplateCategories[idx],
    ...(name !== null ? { name } : {}),
    ...(sort !== null && Number.isFinite(sort) ? { sort } : {}),
    updateTime: now
  };
  res.json({ code: 200, data: { ...formTemplateCategories[idx] }, msg: '修改成功' });
});

app.delete('/api/system/form-templates/categories/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = formTemplateCategories.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: '分类不存在' });
  formTemplateCategories.splice(idx, 1);
  formTemplates = (formTemplates || []).filter((t) => Number(t.categoryId) !== id);
  res.json({ code: 200, msg: '删除成功' });
});

app.get('/api/system/form-templates', (req, res) => {
  const { categoryId, keyword = '' } = req.query;
  const cid = categoryId != null && categoryId !== '' ? parseInt(categoryId, 10) : null;
  const kw = String(keyword || '')
    .trim()
    .toLowerCase();
  let list = (formTemplates || []).map((x) => ({ ...x }));
  if (Number.isFinite(cid) && cid != null) {
    list = list.filter((t) => Number(t.categoryId) === cid);
  }
  if (kw) {
    list = list.filter((t) =>
      String(t.name || '')
        .toLowerCase()
        .includes(kw)
    );
  }
  list.sort((a, b) => (b.id || 0) - (a.id || 0));
  res.json({ code: 200, data: list, msg: 'success' });
});

app.post('/api/system/form-templates', (req, res) => {
  const body = req.body || {};
  const name = String(body.name || '').trim();
  const categoryId = parseInt(body.categoryId, 10);
  const card = body.card;
  if (!name) return res.status(400).json({ code: 400, msg: '模板名称不能为空' });
  if (!Number.isFinite(categoryId))
    return res.status(400).json({ code: 400, msg: 'categoryId 必须为数字' });
  const catExists = (formTemplateCategories || []).some((c) => c.id === categoryId);
  if (!catExists) return res.status(400).json({ code: 400, msg: '分类不存在' });
  // Validate as a single-card schema
  const chk = validateSchema([card]);
  if (!chk.ok) return res.status(400).json({ code: 400, msg: chk.msg });
  const id = Math.max(0, ...formTemplates.map((x) => x.id || 0)) + 1;
  const now = new Date().toLocaleString();
  const row = { id, name, categoryId, card, createTime: now, updateTime: now };
  formTemplates.push(row);
  res.json({ code: 200, data: row, msg: '新增成功' });
});

app.put('/api/system/form-templates/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = formTemplates.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: '模板不存在' });
  const body = req.body || {};
  const name = body.name != null ? String(body.name || '').trim() : null;
  const categoryId = body.categoryId != null ? parseInt(body.categoryId, 10) : null;
  const card = body.card;
  if (name !== null && !name) return res.status(400).json({ code: 400, msg: '模板名称不能为空' });
  if (categoryId !== null && !Number.isFinite(categoryId))
    return res.status(400).json({ code: 400, msg: 'categoryId 必须为数字' });
  if (categoryId !== null) {
    const catExists = (formTemplateCategories || []).some((c) => c.id === categoryId);
    if (!catExists) return res.status(400).json({ code: 400, msg: '分类不存在' });
  }
  if (card !== undefined) {
    const chk = validateSchema([card]);
    if (!chk.ok) return res.status(400).json({ code: 400, msg: chk.msg });
  }
  const now = new Date().toLocaleString();
  formTemplates[idx] = {
    ...formTemplates[idx],
    ...(name !== null ? { name } : {}),
    ...(categoryId !== null ? { categoryId } : {}),
    ...(card !== undefined ? { card } : {}),
    updateTime: now
  };
  res.json({ code: 200, data: { ...formTemplates[idx] }, msg: '修改成功' });
});

app.delete('/api/system/form-templates/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = formTemplates.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: '模板不存在' });
  formTemplates.splice(idx, 1);
  res.json({ code: 200, msg: '删除成功' });
});

// --- 系统字典（主应用，独立于表单设计器字典） ---
// 字典分类
let mainDictCategories = [
  {
    id: 1,
    categoryName: '用户状态',
    categoryCode: 'user_status',
    status: 1,
    sort: 1,
    description: '用户账号状态类型',
    createTime: '2023-10-01 10:00:00'
  },
  {
    id: 2,
    categoryName: '性别',
    categoryCode: 'gender',
    status: 1,
    sort: 2,
    description: '用户性别标记',
    createTime: '2023-10-01 10:00:00'
  }
];

// 字典项（每一行就是一个选项：value=值字段，label=name；categoryCode 用于表单绑定/筛选）
let mainDictEntries = [
  {
    id: 1,
    categoryId: 1,
    categoryName: '用户状态',
    categoryCode: 'user_status',
    name: '启用',
    code: 'enabled',
    value: 1,
    sort: 1,
    status: 1,
    ext: '',
    description: ''
  },
  {
    id: 2,
    categoryId: 1,
    categoryName: '用户状态',
    categoryCode: 'user_status',
    name: '禁用',
    code: 'disabled',
    value: 0,
    sort: 2,
    status: 1,
    ext: '',
    description: ''
  },
  {
    id: 3,
    categoryId: 2,
    categoryName: '性别',
    categoryCode: 'gender',
    name: '男',
    code: 'male',
    value: 1,
    sort: 1,
    status: 1,
    ext: '',
    description: ''
  },
  {
    id: 4,
    categoryId: 2,
    categoryName: '性别',
    categoryCode: 'gender',
    name: '女',
    code: 'female',
    value: 2,
    sort: 2,
    status: 1,
    ext: '',
    description: ''
  }
];

// 分类 CRUD
app.get('/api/dict-category', (_req, res) => {
  const list = mainDictCategories.map((x) => ({ ...x }));
  list.sort((a, b) => (Number(a.sort ?? 0) || 0) - (Number(b.sort ?? 0) || 0));
  res.json({ code: 200, data: list, msg: 'success' });
});
app.post('/api/dict-category', (req, res) => {
  const row = { id: Date.now(), createTime: new Date().toLocaleString(), ...req.body };
  mainDictCategories.push(row);
  res.json({ code: 200, msg: '新增分类成功' });
});
app.put('/api/dict-category/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = mainDictCategories.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: '分类不存在' });
  const prevCode = String(mainDictCategories[idx]?.categoryCode || '').trim();
  mainDictCategories[idx] = { ...mainDictCategories[idx], ...req.body };
  const nextCode = String(mainDictCategories[idx]?.categoryCode || '').trim();
  if (prevCode && nextCode && prevCode !== nextCode) {
    mainDictEntries = mainDictEntries.map((it) =>
      String(it.categoryCode || '').trim() === prevCode ? { ...it, categoryCode: nextCode } : it
    );
  }
  res.json({ code: 200, msg: '修改分类成功' });
});
app.delete('/api/dict-category/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const row = mainDictCategories.find((x) => x.id === id);
  mainDictCategories = mainDictCategories.filter((x) => x.id !== id);
  const code = String(row?.categoryCode || '').trim();
  if (code) mainDictEntries = mainDictEntries.filter((it) => it.categoryCode !== code);
  res.json({ code: 200, msg: '删除分类成功' });
});

// 字典项 CRUD（对外仍使用 /api/dict）
app.get('/api/dict', (_req, res) => {
  const list = mainDictEntries.map((x) => ({ ...x }));
  list.sort((a, b) => (Number(a.sort ?? 0) || 0) - (Number(b.sort ?? 0) || 0));
  res.json({ code: 200, data: list, msg: 'success' });
});
app.post('/api/dict', (req, res) => {
  const body = req.body || {};
  const categoryCode = String(body.categoryCode || '').trim();
  const category = mainDictCategories.find(
    (c) => String(c.categoryCode || '').trim() === categoryCode
  );
  const row = {
    id: Date.now(),
    categoryId: category?.id ?? null,
    categoryName: category?.categoryName ?? '',
    categoryCode,
    name: body.name,
    code: body.code,
    value: body.value ?? null,
    sort: body.sort ?? 1,
    status: body.status ?? 1,
    ext: body.ext ?? '',
    description: body.description ?? ''
  };
  mainDictEntries.push(row);
  res.json({ code: 200, msg: '新增字典成功' });
});
app.put('/api/dict/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = mainDictEntries.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: '字典不存在' });
  const body = req.body || {};
  const nextCategoryCode =
    body.categoryCode != null
      ? String(body.categoryCode || '').trim()
      : mainDictEntries[idx].categoryCode;
  const category = mainDictCategories.find(
    (c) => String(c.categoryCode || '').trim() === String(nextCategoryCode || '').trim()
  );
  mainDictEntries[idx] = {
    ...mainDictEntries[idx],
    ...body,
    categoryId: category?.id ?? mainDictEntries[idx].categoryId,
    categoryName: category?.categoryName ?? mainDictEntries[idx].categoryName,
    categoryCode: String(nextCategoryCode || '').trim()
  };
  res.json({ code: 200, msg: '修改字典成功' });
});
app.delete('/api/dict/:id', (req, res) => {
  const id = parseInt(req.params.id);
  mainDictEntries = mainDictEntries.filter((x) => x.id !== id);
  res.json({ code: 200, msg: '删除字典成功' });
});

// --- 表单设计器字典（独立于主应用字典 /api/dict） ---
// 字典分类
let formDesignerDictCategories = [
  {
    id: 1,
    categoryName: '证件类型',
    categoryCode: 'certificate_type',
    status: 1,
    sort: 1,
    description: '表单设计器专用：证件类型',
    createTime: '2026-04-01 10:00:00'
  },
  {
    id: 2,
    categoryName: '学历',
    categoryCode: 'degree',
    status: 1,
    sort: 2,
    description: '表单设计器专用：学历',
    createTime: '2026-04-01 10:00:00'
  }
];

// 字典项（每一行就是一个可选项，value 字段将作为 value；categoryCode 用于表单字段绑定）
let formDesignerDictEntries = [
  {
    id: 1,
    categoryId: 1,
    categoryName: '证件类型',
    categoryCode: 'certificate_type',
    name: '居民身份证',
    code: 'ct01',
    value: 1,
    sort: 1,
    status: 1,
    ext: '',
    description: ''
  },
  {
    id: 2,
    categoryId: 1,
    categoryName: '证件类型',
    categoryCode: 'certificate_type',
    name: '军官证',
    code: 'ct02',
    value: 2,
    sort: 2,
    status: 1,
    ext: '',
    description: ''
  },
  {
    id: 3,
    categoryId: 2,
    categoryName: '学历',
    categoryCode: 'degree',
    name: '博士',
    code: 'deg_doctor',
    value: 1,
    sort: 1,
    status: 1,
    ext: '',
    description: ''
  }
];

// 字典分类 CRUD
app.get('/api/form-designer/dict-category', (_req, res) => {
  const list = formDesignerDictCategories.map((x) => ({ ...x }));
  list.sort((a, b) => (Number(a.sort ?? 0) || 0) - (Number(b.sort ?? 0) || 0));
  res.json({ code: 200, data: list, msg: 'success' });
});
app.post('/api/form-designer/dict-category', (req, res) => {
  const row = { id: Date.now(), createTime: new Date().toLocaleString(), ...req.body };
  formDesignerDictCategories.push(row);
  res.json({ code: 200, msg: '新增分类成功' });
});
app.put('/api/form-designer/dict-category/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = formDesignerDictCategories.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: '分类不存在' });
  const prevCode = String(formDesignerDictCategories[idx]?.categoryCode || '').trim();
  formDesignerDictCategories[idx] = { ...formDesignerDictCategories[idx], ...req.body };
  const nextCode = String(formDesignerDictCategories[idx]?.categoryCode || '').trim();
  if (prevCode && nextCode && prevCode !== nextCode) {
    formDesignerDictEntries = formDesignerDictEntries.map((it) =>
      String(it.categoryCode || '').trim() === prevCode ? { ...it, categoryCode: nextCode } : it
    );
  }
  res.json({ code: 200, msg: '修改分类成功' });
});
app.delete('/api/form-designer/dict-category/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const row = formDesignerDictCategories.find((x) => x.id === id);
  formDesignerDictCategories = formDesignerDictCategories.filter((x) => x.id !== id);
  const code = String(row?.categoryCode || '').trim();
  if (code)
    formDesignerDictEntries = formDesignerDictEntries.filter((it) => it.categoryCode !== code);
  res.json({ code: 200, msg: '删除分类成功' });
});

// 字典项 CRUD（对外仍使用 /api/form-designer/dict）
app.get('/api/form-designer/dict', (_req, res) => {
  const list = formDesignerDictEntries.map((x) => ({ ...x }));
  list.sort((a, b) => (Number(a.sort ?? 0) || 0) - (Number(b.sort ?? 0) || 0));
  res.json({ code: 200, data: list, msg: 'success' });
});
app.post('/api/form-designer/dict', (req, res) => {
  const body = req.body || {};
  const categoryCode = String(body.categoryCode || '').trim();
  const category = formDesignerDictCategories.find(
    (c) => String(c.categoryCode || '').trim() === categoryCode
  );
  const row = {
    id: Date.now(),
    categoryId: category?.id ?? null,
    categoryName: category?.categoryName ?? '',
    categoryCode,
    name: body.name,
    code: body.code,
    value: body.value ?? null,
    sort: body.sort ?? 1,
    status: body.status ?? 1,
    ext: body.ext ?? '',
    description: body.description ?? ''
  };
  formDesignerDictEntries.push(row);
  res.json({ code: 200, msg: '新增字典成功' });
});
app.put('/api/form-designer/dict/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = formDesignerDictEntries.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ code: 404, msg: '字典不存在' });
  const body = req.body || {};
  const nextCategoryCode =
    body.categoryCode != null
      ? String(body.categoryCode || '').trim()
      : formDesignerDictEntries[idx].categoryCode;
  const category = formDesignerDictCategories.find(
    (c) => String(c.categoryCode || '').trim() === String(nextCategoryCode || '').trim()
  );
  formDesignerDictEntries[idx] = {
    ...formDesignerDictEntries[idx],
    ...body,
    categoryId: category?.id ?? formDesignerDictEntries[idx].categoryId,
    categoryName: category?.categoryName ?? formDesignerDictEntries[idx].categoryName,
    categoryCode: String(nextCategoryCode || '').trim()
  };
  res.json({ code: 200, msg: '修改字典成功' });
});
app.delete('/api/form-designer/dict/:id', (req, res) => {
  const id = parseInt(req.params.id);
  formDesignerDictEntries = formDesignerDictEntries.filter((x) => x.id !== id);
  res.json({ code: 200, msg: '删除字典成功' });
});

// 表单设计器字典选项配置（dictCode -> [{label,value}]）
app.get('/api/form-designer/dict-items/:code', (req, res) => {
  const code = String(req.params.code || '').trim();
  const list = formDesignerDictEntries
    .filter((x) => String(x?.categoryCode || '').trim() === code)
    .sort((a, b) => (Number(a?.sort ?? 0) || 0) - (Number(b?.sort ?? 0) || 0))
    .map((x) => ({ label: String(x.name ?? ''), value: x.value ?? x.code }));
  res.json({ code: 200, data: list, msg: 'success' });
});
app.put('/api/form-designer/dict-items/:code', (req, res) => {
  res.status(400).json({ code: 400, msg: '已废弃：请使用 /api/form-designer/dict 维护字典项' });
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
    name: '国家生态环境部',
    url: 'https://www.mee.gov.cn',
    sort: 1,
    status: 1,
    createTime: '2026-03-10 09:00:00'
  },
  {
    id: 2,
    name: '浙江省生态环境厅',
    url: 'https://sthjt.zj.gov.cn',
    sort: 2,
    status: 1,
    createTime: '2026-03-10 09:10:00'
  },
  {
    id: 3,
    name: '中国环境监测总站',
    url: 'http://www.cnemc.cn',
    sort: 3,
    status: 1,
    createTime: '2026-03-10 09:20:00'
  },
  {
    id: 4,
    name: '空气质量预报',
    url: 'https://example.com/air-quality',
    sort: 4,
    status: 1,
    createTime: '2026-03-10 09:30:00'
  },
  {
    id: 5,
    name: '污染源自动监控',
    url: 'https://example.com/pollution-monitor',
    sort: 5,
    status: 1,
    createTime: '2026-03-10 09:40:00'
  },
  {
    id: 6,
    name: '环境法规库',
    url: 'https://example.com/regulations',
    sort: 6,
    status: 1,
    createTime: '2026-03-10 09:50:00'
  },
  {
    id: 7,
    name: '排污许可平台',
    url: 'https://permit.mee.gov.cn',
    sort: 7,
    status: 1,
    createTime: '2026-03-10 10:00:00'
  },
  {
    id: 8,
    name: '生态环境数据开放平台',
    url: 'https://example.com/open-data',
    sort: 8,
    status: 1,
    createTime: '2026-03-10 10:10:00'
  },
  {
    id: 9,
    name: '应急事件管理平台',
    url: 'https://example.com/emcase',
    sort: 9,
    status: 1,
    createTime: '2026-03-10 10:20:00'
  },
  {
    id: 10,
    name: '温室气体门户',
    url: 'https://example.com/ghg',
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
    list = list.filter((item) =>
      String(item.name || '')
        .toLowerCase()
        .includes(keyword)
    );
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
  const url = String(payload.url || '').trim();
  if (!isValidHttpUrl(url)) {
    return res
      .status(400)
      .json({ code: 400, msg: '链接地址格式不正确，请输入 http(s):// 开头的完整地址' });
  }
  const newItem = {
    id: Date.now(),
    name: String(payload.name || '').trim(),
    url,
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
  if (patch.url != null) {
    const url = String(patch.url || '').trim();
    if (!isValidHttpUrl(url)) {
      return res
        .status(400)
        .json({ code: 400, msg: '链接地址格式不正确，请输入 http(s):// 开头的完整地址' });
    }
  }
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
  const idSet = new Set(ids.map((v) => Number(v)).filter((v) => !isNaN(v)));
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
