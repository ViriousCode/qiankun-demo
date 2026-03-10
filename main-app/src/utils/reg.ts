import { useSystemStore } from '@/store/system';

export const validateDynamicPassword = (rule: any, value: string, callback: any) => {
  const systemStore = useSystemStore();
  const { minLength, complexity } = systemStore.passwordPolicy;

  if (!value) {
    return callback(new Error('请输入密码'));
  }

  // 1. 校验最小长度
  if (value.length < minLength) {
    return callback(new Error(`密码长度不能少于 ${minLength} 位`));
  }

  // 2. 定义复杂度对象
  const checks = {
    uppercase: { reg: /[A-Z]/, msg: '大写字母' },
    lowercase: { reg: /[a-z]/, msg: '小写字母' },
    number: { reg: /[0-9]/, msg: '数字' },
    special: { reg: /[!@#$%^&*(),.?":{}|<>]/, msg: '特殊字符' }
  };

  // 🌟 核心修复：定义合法键的类型
  type CheckKeys = keyof typeof checks;

  const missing: string[] = [];

  // 3. 动态校验复杂度
  complexity.forEach((type: string) => {
    // 🌟 修复：使用 'in' 操作符进行类型收窄，确保 type 是 checks 的键
    if (type in checks) {
      const key = type as CheckKeys; // 断言为合法键
      if (!checks[key].reg.test(value)) {
        missing.push(checks[key].msg);
      }
    }
  });

  if (missing.length > 0) {
    return callback(new Error(`密码还缺少: ${missing.join('、')}`));
  }

  callback();
};
