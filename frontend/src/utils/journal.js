// Shared helpers for journal data — imported by Dashboard, Journal, Insights, Chatbot.

export const MS_DAY = 86_400_000;

export function getEntryDate(journal) {
  if (journal.createdAt) return new Date(journal.createdAt);
  if (journal._id) return new Date(parseInt(journal._id.substring(0, 8), 16) * 1000);
  return new Date();
}

export function getTodayEntry(journals) {
  const todayStr = new Date().toDateString();
  return journals.find((j) => getEntryDate(j).toDateString() === todayStr) || null;
}

export function calcStreak(journals) {
  if (!journals.length) return 0;
  const uniqueDays = [...new Set(journals.map((j) => getEntryDate(j).toDateString()))].sort(
    (a, b) => new Date(b) - new Date(a)
  );
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - MS_DAY).toDateString();
  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;
  let streak = 0;
  let cursor = new Date(uniqueDays[0]);
  for (const dayStr of uniqueDays) {
    if (dayStr === cursor.toDateString()) {
      streak++;
      cursor = new Date(cursor.getTime() - MS_DAY);
    } else break;
  }
  return streak;
}

// Truncates to the first natural sentence within maxLen characters.
export function firstSentence(text, maxLen = 110) {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;
  const end = clean.search(/[.!?]/);
  if (end > 0 && end < maxLen) return clean.slice(0, end + 1);
  const cut = clean.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > maxLen * 0.7 ? cut.slice(0, lastSpace) : cut) + '…';
}

// "3:45 PM"
export function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// "Today" / "Yesterday" / "3 days ago" / "Jun 14, 2025"
export function formatRelative(date) {
  const diffDays = Math.floor((Date.now() - date.getTime()) / MS_DAY);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// "Today · Monday" / "Yesterday · Tuesday" / "3 days ago · Friday" / "Jun 14"
export function formatRelativeFull(date) {
  const diffDays = Math.floor((Date.now() - date.getTime()) / MS_DAY);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  if (diffDays === 0) return `Today · ${dayName}`;
  if (diffDays === 1) return `Yesterday · ${dayName}`;
  if (diffDays < 7) return `${diffDays} days ago · ${dayName}`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
