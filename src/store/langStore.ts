// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

export const useLangStore = defineStore('langStore', () => {
  const lang = ref()

  const i18n = useI18n()
  const route = useRoute()

  function setLang(val: string) {
    lang.value = val
  }

  function setDoctitle(title: string) {
    (document.title = `${i18n.t(title)} - A-OPS` as string)
  }

  watch(() => lang.value, (val) => {
    if (val) {
      i18n.locale.value = val
      if (route.meta.title)
        setDoctitle(route.meta.title as string)
    }
  }, { immediate: true })

  return {
    lang,
    setLang,
    setDoctitle,
  }
}, {
  persist: {
    key: 'lang',
    paths: ['lang'],
  },
})
