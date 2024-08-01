<script lang="ts" setup>
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import DarkTogger from './DarkTogger.vue'
import AvatarDropdown from './AvatarDropdown.vue'
import LangCheck from './LangCheck.vue'
import { useLangStore } from '@/store'

const { t } = useI18n()
const { lang } = storeToRefs(useLangStore())

const enDoc = 'https://docs.openeuler.org/en/docs/22.03_LTS_SP2/docs/A-Ops/overview.html'
const zhDoc = 'https://docs.openeuler.org/zh/docs/22.03_LTS_SP2/docs/A-Ops/overview.html'
function toSupportFile() {
  let link = zhDoc
  if (lang.value === 'en')
    link = enDoc
  window.open(link)
}
</script>

<template>
  <div class="right-content">
    <a-space>
      <DarkTogger />
      <LangCheck />
      <span class="support" @click="toSupportFile"> <QuestionCircleOutlined /> {{ t('common.helpDoc') }} </span>
      <AvatarDropdown />
    </a-space>
  </div>
</template>

<style lang="less" scoped>
.right-content {
  display: flex;
  align-items: center;
  user-select: none;
}
.support {
  display: inline-block;
  width: 75px;
  cursor: pointer;
  text-align: center
}
</style>
