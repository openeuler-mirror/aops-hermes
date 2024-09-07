import { initGlobalState, type MicroAppStateActions } from "qiankun";

export function getCurrentState() {
  const isDarkTheme = window.matchMedia("(prefers-color-scheme: dark)");

  const theme = localStorage.getItem('theme-appearance') !== 'auto' ? localStorage.getItem('theme-appearance') : isDarkTheme.matches ? 'dark' : 'light'
  let lang = 'zh_cn'

  const langStorage = localStorage.getItem('lang')
  if (langStorage) {
    const { lang: langValue } = JSON.parse(langStorage)
    lang = langValue
  }

  return {
    theme,
    lang
  }
}

const actions: MicroAppStateActions = initGlobalState(getCurrentState());

export default actions;

