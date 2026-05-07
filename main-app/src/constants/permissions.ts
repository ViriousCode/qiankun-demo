// 将后台配置的标识统一放在这里管理
export const PERMS = {
  WORKBENCH: {
    ADD: 'main:workbench:add',
    EDIT: 'main:workbench:edit',
    DEL: 'main:workbench:delete'
  },
  APP: {
    ADD: 'main:app:add',
    EDIT: 'main:app:edit',
    DEL: 'main:app:delete'
  },
  MENU: {
    ADD: 'main:menu:add',
    EDIT: 'main:menu:edit',
    DEL: 'main:menu:delete'
  },
  ROLE: {
    ADD: 'main:role:add',
    EDIT: 'main:role:edit',
    DEL: 'main:role:delete'
  },
  GROUP: {
    ADD: 'main:group:add',
    EDIT: 'main:group:edit',
    DEL: 'main:group:delete',
    ENABLE: 'main:group:enable',
    AUTH_ROLE: 'main:group:authRole',
    AUTH_USER: 'main:group:authUser'
  },
  USER: {
    ADD: 'main:user:add',
    ENABLE: 'main:user:enable',
    EDIT: 'main:user:edit',
    DEL: 'main:user:delete',
    BIND: 'main:user:bind',
    UNBIND: 'main:user:unbind'
  },
  INFO: {
    ADD: 'main:info:add',
    EDIT: 'main:info:edit',
    DEL: 'main:info:delete',
    PUBLISH: 'main:info:publish'
  },
  TENANT: {
    VIEW: 'main:tenant:view',
    ADD: 'main:tenant:add',
    ENABLE: 'main:tenant:enable',
    EDIT: 'main:tenant:edit',
    DEL: 'main:tenant:delete',
    AUTH_APP: 'main:tenant:authApp'
  },
  ACCOUNT: {
    VIEW: 'main:account:view',
    ADD: 'main:account:add',
    ENABLE: 'main:account:enable',
    UNLOCK: 'main:account:unlock',
    RESET_PWD: 'main:account:resetPwd',
    REMOVE: 'main:account:remove'
  },
  ORG: {
    ADD: 'main:org:add',
    EDIT: 'main:org:edit',
    DEL: 'main:org:delete',
    IMPORT_ZZD: 'main:org:importZzd'
  },
  FAULT: {
    ADD: 'main:fault:add',
    EDIT: 'main:fault:edit',
    DEL: 'main:fault:delete'
  },
  DICT: {
    ADD: 'main:dict:add',
    EDIT: 'main:dict:edit',
    DEL: 'main:dict:delete',
    CATEGORY_VIEW: 'main:dict:category:view',
    CATEGORY_ADD: 'main:dict:category:add',
    CATEGORY_EDIT: 'main:dict:category:edit',
    CATEGORY_DEL: 'main:dict:category:delete'
  },
  LINK: {
    ADD: 'main:links:add',
    EDIT: 'main:links:edit',
    DEL: 'main:links:delete'
  },
  FORM_DEF: {
    VIEW: 'main:formDef:view',
    ADD: 'main:formDef:add',
    DESIGN: 'main:formDef:design',
    EDIT: 'main:formDef:edit',
    DEL: 'main:formDef:delete',
    FILL: 'main:formDef:fill',
    SUBMISSION_VIEW: 'main:formDef:submission:view'
  },
  BASIC: {
    SAVE: 'main:config:edit'
  },
  SECURITY: {
    SAVE: 'main:config:edit'
  }
};
