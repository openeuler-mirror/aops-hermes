import { createI18n } from 'vue-i18n'
import zh_cn from './lang/zh-cn'
import en from './lang/en'

const lang = 'zh_cn'

const i18n = createI18n({
  locale: lang,
  messages: {
    zh_cn,
    en,
  },
})

export default i18n
