import Ops from './src/index.vue'
import './src/styles/theme.css'
import './src/styles/markdown.less'
import './src/styles/flow.less'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'highlight.js/styles/github-dark.css'

import type { App, Plugin } from 'vue'

type SFCWithInstall<T> = T & Plugin

function withInstall<T, E extends Record<string, any>>(main: T, extra?: E) {
  ;(main as SFCWithInstall<T>).install = (app: App) => {
    for (const comp of [main, ...Object.values(extra ?? {})]) {
      app.component(comp.name, comp)
    }
  }

  if (extra)
    for (const [key, comp] of Object.entries(extra)) {
      main[key] = comp
    }

  return main as SFCWithInstall<T> & E
}

const OpsAssistant = withInstall(Ops)

export default OpsAssistant
