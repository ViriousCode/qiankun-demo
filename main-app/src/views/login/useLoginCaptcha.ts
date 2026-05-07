import { ref, computed } from 'vue';
import type { FormItemRule } from 'element-plus';
import { CAPTCHA_CONFIG, LOGIN_FORM_MESSAGES } from './constants';

function randomCaptcha(): string {
  const { chars, length } = CAPTCHA_CONFIG;
  let s = '';
  for (let i = 0; i < length; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

export function useLoginCaptcha() {
  const captchaText = ref('');

  const captchaDataUrl = computed(() => {
    const text = captchaText.value || '----';
    const jitter = () => Math.floor(Math.random() * 6) - 3;
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="32" viewBox="0 0 96 32">
      <g opacity="0.35" stroke="#86a6d9">
        <line x1="6" y1="${6 + jitter()}" x2="90" y2="${10 + jitter()}" />
        <line x1="6" y1="${18 + jitter()}" x2="90" y2="${22 + jitter()}" />
        <line x1="10" y1="${28 + jitter()}" x2="92" y2="${16 + jitter()}" />
      </g>
      <text x="12" y="22" font-size="18" font-family="ui-sans-serif, system-ui" fill="#2b5fff" letter-spacing="3">
        ${text}
      </text>
    </svg>
  `.trim();
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });

  const refreshCaptcha = (clearCode?: () => void) => {
    captchaText.value = randomCaptcha();
    clearCode?.();
  };

  const createCodeValidator = (): FormItemRule['validator'] => {
    return (_rule, value, callback) => {
      const input = String(value ?? '')
        .trim()
        .toUpperCase();
      const target = String(captchaText.value ?? '')
        .trim()
        .toUpperCase();
      if (!input) return callback();
      if (input !== target) return callback(new Error(LOGIN_FORM_MESSAGES.codeInvalid));
      callback();
    };
  };

  return {
    captchaDataUrl,
    refreshCaptcha,
    createCodeValidator
  };
}
