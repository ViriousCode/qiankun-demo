/** 星期文案（索引 0 为周日） */
export const WEEK_DAY_NAMES = [
  '星期日',
  '星期一',
  '星期二',
  '星期三',
  '星期四',
  '星期五',
  '星期六'
] as const;

/** 环保资讯单项 */
export interface NewsItem {
  title: string;
  date: string;
}

/** 快速入口单项 */
export interface QuickEntryItem {
  name: string;
}

/** 待办事项单项 */
export interface TodoItem {
  category: string;
  time: string;
  desc: string;
  /** 来源子应用 key（name/shortName/code），用于渲染应用 icon */
  sourceApp?: string;
}

/** 默认环保资讯（占位） */
export const DEFAULT_NEWS_LIST: NewsItem[] = [
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' },
  { title: '《中国环境报》浙江创新污染源自动监测监管模式', date: '2026-03-01' }
];

/** 默认快速入口（占位） */
export const DEFAULT_QUICK_ENTRIES: QuickEntryItem[] = [
  { name: '国家生态环境部' },
  { name: '国家生态环境部' },
  { name: '国家生态环境部' },
  { name: '空气质量统计分析' },
  { name: '空气质量统计分析' }
];

/** 默认待办列表（占位） */
export const DEFAULT_TODO_LIST: TodoItem[] = [
  {
    category: '大气环境管理',
    sourceApp: 'air',
    time: '2026-03-01 10:12',
    desc: '您有一条艾美坚持废气排口的二氧化硫数据突变预警待处置字很长时省略您有一条艾美坚持废气排口的二氧化硫数据突变预警待处置字很长时省略您有一条艾美坚持废气排口的二氧化硫数据突变预警待处置字很长时省略您有一条艾美坚持废气排口的二氧化硫数据突变预警待处置字很长时省略您有一条艾美坚持废气排口的二氧化硫数据突变预警待处置字很长时省略'
  },
  {
    category: '大气环境管理',
    sourceApp: 'air',
    time: '2026-03-01 09:55',
    desc: '您有一条待办事项描述您有一条待办事项描述您有一条待办事项描述您有一条待办事项描述'
  },
  { category: '污染源管理', sourceApp: 'air', time: '2026-03-01 09:30', desc: '您有一条待办事项描述' },
  { category: '水环境管理', sourceApp: 'water', time: '2026-03-01 09:30', desc: '您有一条待办事项描述' },
  { category: '信访管理', sourceApp: 'case', time: '2026-02-28 16:00', desc: '您有一条待办事项描述' },
  { category: 'GIS一张图', sourceApp: 'main', time: '2026-02-28 14:20', desc: '您有一条待办事项描述' },
  { category: '码上环保', sourceApp: 'main', time: '2026-02-28 13:00', desc: '您有一条待办事项描述' },
  { category: 'AI助手', sourceApp: 'ai', time: '2026-02-27 11:00', desc: '您有一条待办事项描述' },
  { category: '噪声管理', sourceApp: 'air', time: '2026-02-27 10:00', desc: '您有一条待办事项描述' }
];

/** 待办/已办数量默认值（占位） */
export const DEFAULT_TODO_PENDING_COUNT = 6;
export const DEFAULT_TODO_DONE_COUNT = 186;

/** 我的应用占位展示名称（图标在组件内按名称映射） */
export const PLACEHOLDER_APP_NAMES = [
  '水环境管理',
  '污染源管理',
  '大气环境管理',
  '噪声管理',
  '案件管理',
  '信访管理',
  '环评审批',
  '码上环保',
  'GIS一张图',
  'AI助手'
] as const;
