import { ref, watch, onMounted } from 'vue';

const STORAGE_KEY = 'app-theme';

function getSystemPreference() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme() {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function useTheme() {
  const isDark = ref(false);

  function applyTheme(dark) {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }

  function setDark(value) {
    isDark.value = !!value;
    applyTheme(isDark.value);
    try {
      if (value) {
        localStorage.setItem(STORAGE_KEY, 'dark');
      } else {
        localStorage.setItem(STORAGE_KEY, 'light');
      }
    } catch {}
  }

  function toggle() {
    setDark(!isDark.value);
  }

  onMounted(() => {
    const stored = getStoredTheme();
    if (stored === 'dark' || stored === 'light') {
      isDark.value = stored === 'dark';
    } else {
      isDark.value = getSystemPreference() === 'dark';
    }
    applyTheme(isDark.value);
  });

  watch(
    isDark,
    (v) => {
      applyTheme(v);
      try {
        localStorage.setItem(STORAGE_KEY, v ? 'dark' : 'light');
      } catch {}
    },
    { flush: 'post' }
  );

  return { isDark, setDark, toggle };
}
