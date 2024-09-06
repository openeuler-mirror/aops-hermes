<script lang="ts" setup>
import { ref, watch } from 'vue'
import Minutes from './Minutes.vue'
import Hour from './Hour.vue'
import Day from './Day.vue'
import Month from './Month.vue'
import Weeks from './Week.vue'
import Seconds from './Seconds.vue'
import Year from './Year.vue'
import { ElInput, ElPopover, ElTabPane, ElTabs } from 'element-plus'
import 'element-plus/es/components/tabs/style/css'
import 'element-plus/es/components/tab-pane/style/css'
import 'element-plus/es/components/popover/style/css'
import 'element-plus/es/components/input/style/css'
import i18n from './locales'

const props = withDefaults(
  defineProps<{
    cron?: string
    lang?: string
    theme?: string
  }>(),
  {
    cron: '* * * * * ? *',
    lang: 'zh_cn',
    theme: 'light',
  },
)

const { t } = i18n.global
const _cron = ref<string[]>([])
const _cronStr = ref('')

watch(
  () => props.cron,
  () => {
    _cron.value = props.cron.split(' ')
    _cronStr.value = props.cron
  },
  { immediate: true },
)

watch(
  () => props.lang,
  (val: any) => {
    i18n.global.locale.value = val
  },
  { immediate: true },
)

const activeName = ref('minutes')
const emits = defineEmits(['change'])

const handleChange = (index: number, value: string) => {
  if (_cron.value) {
    _cron.value[index] = value
  } else {
    _cron.value = [value]
  }
  _cronStr.value = _cron.value.join(' ').trim()
  emits('change', _cron.value.join(' ').trim())
}
</script>

<template>
  <el-input v-model="_cronStr" placeholder="cron" readonly style="width: 300px">
    <template #append>
      <el-popover :width="700" placement="bottom" trigger="click">
        <el-tabs v-model="activeName">
          <el-tab-pane :label="t('seconds')" name="seconds">
            <seconds :value="_cron[0]" @change="handleChange(0, $event)" />
          </el-tab-pane>
          <el-tab-pane :label="t('minutes')" name="minutes">
            <minutes :value="_cron[1]" @change="handleChange(1, $event)" />
          </el-tab-pane>
          <el-tab-pane :label="t('hour')" name="Hour">
            <hour :value="_cron[2]" @change="handleChange(2, $event)" />
          </el-tab-pane>
          <el-tab-pane :label="t('day')" name="day">
            <day :value="_cron[3]" @change="handleChange(3, $event)" />
          </el-tab-pane>
          <el-tab-pane :label="t('month')" name="month">
            <month :value="_cron[4]" @change="handleChange(4, $event)" />
          </el-tab-pane>
          <el-tab-pane :label="t('dayOfWeek')" name="weeks">
            <weeks :value="_cron[5]" @change="handleChange(5, $event)" />
          </el-tab-pane>
          <el-tab-pane :label="t('year')" name="years">
            <year :value="_cron[6]" @change="handleChange(6, $event)" />
          </el-tab-pane>
        </el-tabs>
        <template #reference>
          <div style="cursor: pointer">{{ t('select') }}</div>
        </template>
      </el-popover>
    </template>
  </el-input>
</template>

