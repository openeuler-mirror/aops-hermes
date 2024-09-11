<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import { Cycle, InitiationCycle } from './Cycle'
import { ElCheckbox, ElCheckboxGroup, ElInputNumber, ElRadio, ElRadioGroup, ElSpace, ElText } from 'element-plus'
import 'element-plus/es/components/radio-group/style/css'
import 'element-plus/es/components/radio/style/css'
import 'element-plus/es/components/space/style/css'
import 'element-plus/es/components/text/style/css'
import 'element-plus/es/components/input-number/style/css'
import 'element-plus/es/components/checkbox-group/style/css'
import 'element-plus/es/components/checkbox/style/css'
import i18n from './locales'

const props = defineProps({
  value: {
    type: String,
    required: false,
    default: () => '*',
  },
})
const { t } = i18n.global
const _value = ref('*')

const radio = ref(1)

const _cycle = reactive<Cycle>({
  end: 2,
  start: 1,
})

const _initiationCycle = reactive<InitiationCycle>({
  cycle: 1,
  initiation: 1,
})
const workingDay = ref(1)
const checkList = ref<number[]>([])

watch(
  () => props.value,
  () => {
    _value.value = props.value
    if (props.value === '*') {
      radio.value = 1
    } else if (props.value === '?') {
      radio.value = 2
    } else if (props.value.includes('-')) {
      const arr = props.value.split('-')
      if (arr.length === 2) {
        radio.value = 3
        _cycle.start = !isNaN(parseInt(arr[0])) ? parseInt(arr[0]) : 1
        _cycle.end = !isNaN(parseInt(arr[1])) ? parseInt(arr[1]) : 2
      }
    } else if (props.value.includes('/')) {
      const arr = props.value.split('/')
      if (arr.length === 2) {
        radio.value = 4
        _initiationCycle.initiation = !isNaN(parseInt(arr[0])) ? parseInt(arr[0]) : 1
        _initiationCycle.cycle = !isNaN(parseInt(arr[1])) ? parseInt(arr[1]) : 1
      }
    } else if (props.value.includes('W')) {
      radio.value = 5
      workingDay.value = parseInt(props.value.replace('W', ''))
    } else if (props.value.includes('L')) {
      radio.value = 6
    } else {
      radio.value = 7
      checkList.value = []
      const strings = props.value.split(',')
      strings.forEach((item) => {
        if (!isNaN(parseInt(item))) {
          checkList.value.push(parseInt(item))
        }
      })
    }
  },
  { immediate: true },
)

const emits = defineEmits(['change'])

const handleChange = (value: any) => {
  switch (value) {
    case 1:
      _value.value = '*'
      _cycle.start = 1
      _cycle.end = 2
      _initiationCycle.initiation = 1
      _initiationCycle.cycle = 1
      workingDay.value = 1
      checkList.value = []
      break
    case 2:
      _value.value = '?'
      _cycle.start = 1
      _cycle.end = 2
      _initiationCycle.initiation = 1
      _initiationCycle.cycle = 1
      workingDay.value = 1
      checkList.value = []
      break
    case 3:
      _value.value = `${_cycle.start}-${_cycle.end}`
      _initiationCycle.initiation = 1
      _initiationCycle.cycle = 1
      workingDay.value = 1
      checkList.value = []
      break
    case 4:
      _value.value = `${_initiationCycle.initiation}/${_initiationCycle.cycle}`
      _cycle.start = 1
      _cycle.end = 2
      workingDay.value = 1
      checkList.value = []
      break
    case 5:
      _value.value = `${workingDay.value}W`
      _cycle.start = 1
      _cycle.end = 2
      _initiationCycle.initiation = 1
      _initiationCycle.cycle = 1
      checkList.value = []
      break
    case 6:
      _value.value = `L`
      _cycle.start = 1
      _cycle.end = 2
      _initiationCycle.initiation = 1
      _initiationCycle.cycle = 1
      workingDay.value = 1
      checkList.value = []
      break
    case 7:
      _value.value = checkList.value.sort((a, b) => a - b).join(',')
      _cycle.start = 1
      _cycle.end = 2
      _initiationCycle.initiation = 1
      _initiationCycle.cycle = 1
      workingDay.value = 1
      break
  }
  emits('change', _value.value)
}
</script>

<template>
  <el-radio-group v-model="radio" @change="handleChange">
    <el-radio :value="1">{{ t('perDay') }}</el-radio>
    <el-radio :value="2">{{ t('unspecified') }}</el-radio>
    <el-radio :value="3">
      <el-space>
        <el-text>{{ t('period') }}</el-text>
        <el-input-number
          v-model="_cycle.start"
          :max="31"
          :min="1"
          controls-position="right"
          size="small"
          @change="handleChange(radio)"
        />
        <el-text>-</el-text>
        <el-input-number
          v-model="_cycle.end"
          :max="31"
          :min="2"
          controls-position="right"
          size="small"
          @change="handleChange(radio)"
        />
        <el-text>{{ t('day') }}</el-text>
      </el-space>
    </el-radio>
    <el-radio :value="4">
      <el-space>
        <el-text>{{ t('from') }}</el-text>
        <el-input-number
          v-model="_initiationCycle.initiation"
          :max="30"
          :min="1"
          controls-position="right"
          size="small"
          @change="handleChange(radio)"
        />
        <el-text>{{ t('every') }}</el-text>
        <el-input-number
          v-model="_initiationCycle.cycle"
          :max="31"
          :min="1"
          controls-position="right"
          size="small"
          @change="handleChange(radio)"
        />
        <el-text>{{ t('day') }} {{ t('executeOnce') }}</el-text>
      </el-space>
    </el-radio>
    <!-- <el-radio :value="5">
      <el-space>
        <el-text>{{ t('perDay') }}</el-text>
        <el-input-number
          v-model="workingDay"
          :max="31"
          :min="1"
          controls-position="right"
          size="small"
          @change="handleChange(radio)"
        />
        <el-text>号最近的那个工作日</el-text>
      </el-space>
    </el-radio> -->
    <!-- <el-radio :value="6">本月最后一天</el-radio> -->
    <el-radio :value="7">{{ t('designation') }}</el-radio>
    <el-checkbox-group v-model="checkList" @change="handleChange(7)">
      <el-checkbox v-for="index in 31" :key="index" :value="index">{{ index }}</el-checkbox>
    </el-checkbox-group>
  </el-radio-group>
</template>

<style lang="less" scoped>
.el-radio {
  width: 100%;
}

.el-input-number {
  width: 80px;
}

.el-checkbox {
  width: 40px;
  margin-right: 10px;
}
</style>

