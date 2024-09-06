import Cron from "./index.vue";
import "element-plus/dist/index.css";
import 'element-plus/theme-chalk/dark/css-vars.css'
import i18n from './locales'

import type { App, Plugin } from "vue";

type SFCWithInstall<T> = T & Plugin;

function withInstall<T, E extends Record<string, any>>(
  main: T,
  extra?: E
) {
  (main as SFCWithInstall<T>).install = (app: App) => {
    for (const comp of [main, ...Object.values(extra ?? {})]) {
      app.component(comp.name, comp);
    }
    app.use(i18n)
  };

  if (extra)
    for (const [key, comp] of Object.entries(extra)) {
      main[key] = comp;
    }

  return main as SFCWithInstall<T> & E;
}



const CronSelect = withInstall(Cron);

export default CronSelect;
