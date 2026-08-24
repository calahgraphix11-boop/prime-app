// Locale-aware date/time formatting.
// Every helper takes the app's `lang` (and `t` where words are involved) so
// month names, weekday names and relative-time suffixes follow the toggle
// instead of falling back to 'en-US' or the browser locale.

export const localeFor = (lang) => (lang === 'fr' ? 'fr-FR' : 'en-US');

const fill = (tpl, n) => String(tpl ?? '').replace('{n}', n);

// Raw locale date — "3/4/2026" / "04/03/2026"
export function fmtDate(iso, lang, opts) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(localeFor(lang), opts);
}

// "Mar 4" / "4 mars"
export function fmtShortDate(iso, lang) {
  return fmtDate(iso, lang, { month: 'short', day: 'numeric' });
}

// "Mar 4, 3:05 PM" / "4 mars, 15:05"
export function fmtDateTime(iso, lang) {
  if (!iso) return '';
  const d = new Date(iso);
  const locale = localeFor(lang);
  return (
    d.toLocaleDateString(locale, { month: 'short', day: 'numeric' }) +
    ', ' +
    d.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })
  );
}

// "Monday, March 4, 2026" / "lundi 4 mars 2026"
export function fmtLongDate(date, lang) {
  return new Date(date).toLocaleDateString(localeFor(lang), {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

// Minute-grain relative time: "just now" → "5m ago" → "3h ago" → date
export function fmtAgo(iso, t, lang) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return t.justNow;
  if (diff < 3600000) return fill(t.minutesAgo, Math.floor(diff / 60000));
  if (diff < 86400000) return fill(t.hoursAgo, Math.floor(diff / 3600000));
  return fmtDate(iso, lang);
}

// Day-grain relative time: "Today" → "Yesterday" → "3d ago" → "Mar 4"
export function fmtRelativeDay(iso, t, lang) {
  if (!iso) return '';
  const d = new Date(iso);
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diffDays === 0) return t.today;
  if (diffDays === 1) return t.yesterday;
  if (diffDays < 7) return fill(t.daysAgo, diffDays);
  return fmtShortDate(iso, lang);
}

// Duration formatting is fully template-driven because the *shape* differs by
// language, not just the unit words. English appends a unit to each part
// ("2h 30m"); French uses the "h" as the separator and drops the minute unit
// entirely ("2 h 30"), padding the minutes to two digits.
// Tokens: {h} hours, {m} minutes, {mm} zero-padded minutes.
export function fmtDuration(minutes, t) {
  const total = Math.max(0, Math.floor(minutes || 0));
  const h = Math.floor(total / 60);
  const m = total % 60;
  const tpl =
    h === 0 ? t.durationMinutesOnly
    : m === 0 ? t.durationHoursOnly
    : t.durationHoursMinutes;
  return String(tpl ?? '')
    .replace('{mm}', String(m).padStart(2, '0'))
    .replace('{h}', h)
    .replace('{m}', m);
}
