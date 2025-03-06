<script setup lang="ts">
import { queryTaskResult } from '@aops-assistant/apis/host'
import { ref, watch } from 'vue'
import { ElDialog, ElIcon, ElDescriptions, ElDescriptionsItem, dayjs, ElCollapse, ElCollapseItem } from 'element-plus'
import { CircleCheckFilled, CircleCloseFilled, Close } from '@element-plus/icons-vue'
import type { CveTaskReport } from '@aops-assistant/apis/types'

const CveStatus = {
  succeed: '修复成功',
  fail: '修复失败',
  unknown: '未知',
}

const cveStatusColorMap = {
  succeed: '#24ab36',
  fail: '#E4211F',
  unknown: '#E4211F',
}

const props = defineProps<{
  visible: boolean
  taskId: string
}>()

const emits = defineEmits(['update:visible'])

const cveTaskResult = ref<CveTaskReport[]>([])
async function getTaskResult(taskId: string) {
  const [, res] = await queryTaskResult(taskId)
  if (res) {
    cveTaskResult.value = res
    activeNames.value = [`${cveTaskResult.value[0] ? cveTaskResult.value[0].host_id : ''}`]
  }
}

watch(
  () => props.visible,
  () => {
    if (!props.visible) {
      cveTaskResult.value = []
      activeNames.value = []
      return
    }
    getTaskResult(props.taskId)
  },
)

const activeNames = ref<string[]>([])

function logFormat(str: string) {
  if (str && str !== '') return str.replace(/\n/g, '<br>')
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    class="dialog-container"
    destroy-on-close
    align-center
    :show-close="false"
    @close="emits('update:visible', false)"
  >
    <template #header>
      <div class="flex justify-between items-center dialog-header">
        <h1 class="font-bold px-[24px] py-[16px]">任务报告</h1>
        <div class="cursor-pointer">
          <el-icon @click="() => emits('update:visible', false)"><Close /></el-icon>
        </div>
      </div>
    </template>
    <template #default>
      <div class="h-[45vh] px-[24px] overflow-y-scroll">
        <el-descriptions v-if="cveTaskResult?.length" :column="1" border :label-width="120">
          <el-descriptions-item label="任务类型">{{ cveTaskResult[0].task_type }}</el-descriptions-item>
          <el-descriptions-item label="上次执行时间">{{
            dayjs(cveTaskResult[0].latest_execute_time * 1000).format('YYYY-MM-DD HH:mm:ss')
          }}</el-descriptions-item>
          <el-descriptions-item label-class-name="report-td" label="任务结果">
            <el-collapse v-model="activeNames" accordion>
              <el-collapse-item
                v-for="(item, idx) in cveTaskResult"
                :key="idx"
                :title="`主机：${item.host_name}`"
                :name="item.host_id"
              >
                <el-descriptions border :column="2">
                  <el-descriptions-item label="主机地址：">
                    {{ item.host_ip }}
                  </el-descriptions-item>
                  <el-descriptions-item label="状态：">
                    <div class="text-[#fff] text-[12px]">
                      <span class="px-[8px] rounded-[2px]" :class="`bg-[${cveStatusColorMap[item.status]}]`">{{
                        CveStatus[item.status]
                      }}</span>
                    </div>
                  </el-descriptions-item>
                </el-descriptions>

                <h4 style="margin-top: 15px">RPM修复情况：</h4>
                <el-collapse>
                  <el-collapse-item
                    v-for="(rpm, rpmIndex) in item.task_result.rpms"
                    :key="rpmIndex"
                    :name="rpm.available_rpm"
                  >
                    <template #title>
                      <div class="flex items-center justify-between">
                        <span class="mr-2">{{ `RPM：${rpm.available_rpm}` }}</span>
                        <el-icon v-if="rpm.result === 'succeed'" color="#52c41a"><CircleCheckFilled /></el-icon>
                        <el-icon v-else color="#ff0000"><CircleCloseFilled /></el-icon>
                      </div>
                    </template>
                    <h1>结果: {{ CveStatus[rpm.result] }}</h1>
                    <h1>Log:</h1>
                    <div class="log-container" v-html="logFormat(rpm.log)" />
                  </el-collapse-item>
                </el-collapse>
              </el-collapse-item>
            </el-collapse>
          </el-descriptions-item>
        </el-descriptions>

        <!-- <template #footer>
      <div class="dialog-footer">
        <el-button @click="emits('update:visible', false)">Cancel</el-button>
      </div>
    </template> -->
      </div>
    </template>
  </el-dialog>
</template>

<style>
.dialog-container {
  padding: 0;
  border-radius: 4px;
}
</style>

<style scoped>
.log-container {
  border: 1px solid #eee;
  padding: 10px 5px;
}

.dialog-header {
  border-bottom: 1px solid #eee;
}
</style>
