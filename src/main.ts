// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.
import 'ant-design-vue/dist/reset.css'
import '@/assets/styles/main.css'
import '@/assets/styles/global.less'
import 'nprogress/nprogress.css'
import '@/assets/styles/tailwind.css'
import 'animate.css'

import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createHead } from '@unhead/vue'
import App from './App.vue'
import router from './router'
import Vuei18n from '@/locales'
import { addGlobalUncaughtErrorHandler, registerMicroApps, start as qiankunStart } from 'qiankun'

import actions, { getCurrentState } from './actions'

createApp(App)
  .use(Antd)
  .use(createHead())
  .use(createPinia().use(piniaPluginPersistedstate))
  .use(Vuei18n)
  .use(router)
  .mount('#app')

const apps = [
  {
    name: 'copilot',
    entry: import.meta.env.MODE === 'development' ? '//localhost:3000' : '/copilot/',
    container: '#copilot-container',
    activeRule: '/eulercopilot',
    props: { actions, inittailData: getCurrentState },
  },
]

registerMicroApps(apps, {
  beforeLoad: (app) => {
    return Promise.resolve()
  },
  afterMount: (app) => {
    if (app.name === 'copilot') {
      actions.setGlobalState(getCurrentState())
    }

    return Promise.resolve()
  },
})

addGlobalUncaughtErrorHandler((event) => {
  // console.error("qiankun全局异常", event);
})

qiankunStart()
