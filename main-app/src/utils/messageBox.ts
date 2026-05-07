import { ElMessageBox } from 'element-plus';

/**
 * 使用约束：
 * - 业务代码禁止直接调用 ElMessageBox.*，统一使用本文件导出的封装方法。
 * - 目的：确保 appendTo 默认挂载到 .app-main，避免遮罩覆盖导航栏和侧边菜单。
 */
type ConfirmParams = Parameters<typeof ElMessageBox.confirm>;
type PromptParams = Parameters<typeof ElMessageBox.prompt>;
type AlertParams = Parameters<typeof ElMessageBox.alert>;

type ConfirmOptions = NonNullable<ConfirmParams[2]>;
type PromptOptions = NonNullable<PromptParams[2]>;
type AlertOptions = NonNullable<AlertParams[2]>;

const resolveDefaultAppendTo = () => {
  const appMainContainer = document.querySelector('.app-main');
  return appMainContainer instanceof HTMLElement ? appMainContainer : document.body;
};

const withAppMainAppendTo = <T extends Record<string, any>>(options?: T): T & { appendTo: HTMLElement } => {
  const next = (options || {}) as T & { appendTo?: HTMLElement };
  return {
    ...next,
    appendTo: next.appendTo ?? resolveDefaultAppendTo()
  };
};

export const confirmInAppMain = (
  message: ConfirmParams[0],
  title: ConfirmParams[1],
  options: ConfirmOptions = {}
) => ElMessageBox.confirm(message, title, withAppMainAppendTo(options));

export const promptInAppMain = (
  message: PromptParams[0],
  title: PromptParams[1],
  options: PromptOptions = {}
) => ElMessageBox.prompt(message, title, withAppMainAppendTo(options));

export const alertInAppMain = (
  message: AlertParams[0],
  title: AlertParams[1],
  options: AlertOptions = {}
) => ElMessageBox.alert(message, title, withAppMainAppendTo(options));
