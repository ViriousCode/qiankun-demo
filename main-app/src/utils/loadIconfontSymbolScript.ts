/**
 * 加载 iconfont Symbol 脚本，向 document 注入 `<svg><symbol id="icon-...">`。
 * 与仅 fetch `iconfont.json` 不同：没有此脚本则 `AzuraIcon` 的 `<use href="#...">` 无法解析。
 */
export function loadIconfontSymbolScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const trimmed = String(src || '').trim();
    if (!trimmed) {
      resolve();
      return;
    }
    const already = Array.from(document.scripts).some(
      (el) => el.src === trimmed || el.getAttribute('src') === trimmed
    );
    if (already) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = trimmed;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load iconfont symbol script: ${trimmed}`));
    document.head.appendChild(s);
  });
}
