/** 列表 / 详情正文分段，用于任务类消息的固定模板着色 */

export type MessageContentSegment = { text: string; className?: string };

/** 案号/说明与后文之间：中英文逗号、句号（常见为「…。避免…」） */
const WARN_PATTERN =
  /请在\s*((?:\d{4}年\d{1,2}月\d{1,2}日)|(?:\d{4}[-/]\d{1,2}[-/]\d{1,2}(?:日)?))\s*(前(?:及时)?(?:完成|提交))\s*(.+?)\s*([，,。.；;])/;

/** 支持「…的任务 已逾期」或「…的任务已逾期」（无空格） */
const DANGER_STRICT = /^(.+?)\s+的任务\s*已逾期([，,。.；;].*)?$/;
/** 案号开头、任务名与「已逾期」紧连等情况 */
const DANGER_LOOSE = /^(.+)已逾期([，,。.；;].*)?$/;

const DATE_RE = /\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{4}年\d{1,2}月\d{1,2}日/g;
/** 仅高亮「已逾期」，避免「避免…逾期」等尾部词被标红 */
const OVERDUE_RE = /已逾期/g;

function pushTaskTitleFocus(
  rawTitle: string,
  out: MessageContentSegment[],
  options?: { trailingClassName?: string }
) {
  const title = String(rawTitle || '').trim();
  if (!title) return;
  const trailingClassName = options?.trailingClassName;
  // 只高亮案号主体，如「浙环案[2026]6292」；后续“案件的评查”等按正文显示
  const m = title.match(/^(「[^」]+」|《[^》]+》|“[^”]+”|"[^"]+"|『[^』]+』|【[^】]+】)(.*)$/);
  if (!m) {
    out.push({ text: title, className: 'is-task-title' });
    return;
  }
  out.push({ text: m[1], className: 'is-task-title' });
  if (m[2]) out.push({ text: m[2], className: trailingClassName });
}

function appendOverdueHighlights(part: string, out: MessageContentSegment[]) {
  let cursor = 0;
  for (const m of part.matchAll(OVERDUE_RE)) {
    const start = m.index ?? 0;
    const end = start + m[0].length;
    if (start > cursor) out.push({ text: part.slice(cursor, start) });
    out.push({ text: m[0], className: 'is-overdue' });
    cursor = end;
  }
  if (cursor < part.length) out.push({ text: part.slice(cursor) });
}

function stripLeadingTypeLabel(summary: string, level: 'warning' | 'danger'): string {
  let s = summary.trim();
  if (level === 'warning') s = s.replace(/^即将到期[：:]\s*/u, '');
  if (level === 'danger') s = s.replace(/^已逾期[：:]\s*/u, '');
  return s;
}

function appendDateThenOverdue(raw: string, out: MessageContentSegment[]) {
  const dateParts: MessageContentSegment[] = [];
  let last = 0;
  for (const m of raw.matchAll(DATE_RE)) {
    const start = m.index ?? 0;
    const end = start + m[0].length;
    if (start > last) dateParts.push({ text: raw.slice(last, start) });
    dateParts.push({ text: m[0], className: 'is-due-date' });
    last = end;
  }
  if (last < raw.length) dateParts.push({ text: raw.slice(last) });

  for (const p of dateParts) {
    if (!p.text) continue;
    if (p.className === 'is-due-date') {
      out.push(p);
      continue;
    }
    appendOverdueHighlights(p.text, out);
  }
}

/**
 * 参考设计稿：类型只在标题行（任务即将到期 / 任务已逾期），
 * 正文分别以「请在…」或案号/任务描述开头；日期蓝、任务名 #333、句中「已逾期」粉。
 */
export function buildMessageContentSegments(
  summary: string,
  level: 'warning' | 'danger'
): MessageContentSegment[] {
  const rawOriginal = String(summary || '').trim();
  if (!rawOriginal) return [];

  const raw = stripLeadingTypeLabel(rawOriginal, level);

  if (level === 'warning') {
    const m = raw.match(WARN_PATTERN);
    if (m && m.index !== undefined) {
      const delim = m[4];
      const before = raw.slice(0, m.index);
      const after = raw.slice(m.index + m[0].length);
      const segs: MessageContentSegment[] = [];
      if (before) segs.push({ text: before });
      segs.push({ text: '请在 ' });
      segs.push({ text: m[1], className: 'is-due-date' });
      segs.push({ text: ` ${m[2]} ` });
      pushTaskTitleFocus(m[3], segs, { trailingClassName: 'is-template-glue' });
      segs.push({ text: delim });
      if (after) segs.push({ text: after });
      return segs;
    }
  }

  if (level === 'danger') {
    let m = raw.match(DANGER_STRICT);
    if (m) {
      const tail = m[2] ?? '';
      const segs: MessageContentSegment[] = [];
      pushTaskTitleFocus(m[1], segs, { trailingClassName: 'is-template-glue' });
      segs.push({ text: ' 的任务 ', className: 'is-template-glue' });
      segs.push({ text: '已逾期', className: 'is-overdue-flag' });
      segs.push({ text: tail });
      return segs;
    }
    m = raw.match(DANGER_LOOSE);
    if (m) {
      const tail = m[2] ?? '';
      const segs: MessageContentSegment[] = [];
      pushTaskTitleFocus(m[1], segs, { trailingClassName: 'is-template-glue' });
      segs.push({ text: '已逾期', className: 'is-overdue-flag' });
      segs.push({ text: tail });
      return segs;
    }
  }

  const out: MessageContentSegment[] = [];
  appendDateThenOverdue(raw, out);
  return out;
}
