const STORAGE_KEY = 'notie-private-board-v1';

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

export function loadPrivateBoardState() {
  if (typeof window === 'undefined') {
    return { notesByDate: {}, checkinsByDate: {} };
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');

    if (!isObject(parsed)) {
      return { notesByDate: {}, checkinsByDate: {} };
    }

    if ('notesByDate' in parsed || 'checkinsByDate' in parsed) {
      return {
        notesByDate: isObject(parsed.notesByDate) ? parsed.notesByDate : {},
        checkinsByDate: isObject(parsed.checkinsByDate) ? parsed.checkinsByDate : {},
      };
    }

    return {
      notesByDate: parsed,
      checkinsByDate: {},
    };
  } catch {
    return { notesByDate: {}, checkinsByDate: {} };
  }
}

export function savePrivateBoardState(state) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
