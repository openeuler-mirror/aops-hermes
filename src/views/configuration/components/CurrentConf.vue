<script setup lang='ts'>
import { onMounted, reactive, ref } from 'vue'
import * as Diff from 'diff'
import { CheckCircleTwoTone, CloseCircleTwoTone, ExclamationCircleTwoTone } from '@ant-design/icons-vue'
import CompareDiff from './CompareDiff.vue'
import type { ConfFile, HostInDomain, RealConfFile } from '@/api'
import { api } from '@/api'
import { checkIsDiff } from '@/utils'
import Drawer from '@/components/Drawer.vue'

interface Conf extends RealConfFile {
  syncStatus?: string
  diffResult?: Diff.Change[]
  rpmName?: string
  spacer?: string
  rpmVersion?: string
  rpmRelease?: string
}

const props = defineProps<{
  domainName: string
  hostInfo?: HostInDomain
  defaultConf: ConfFile[]
  clusterId: string
}>()

const realConf = ref<RealConfFile[]>([])
const allConfs = reactive<Record<'exitingConfs' | 'notExitingConf', Conf[]>>({
  exitingConfs: [],
  notExitingConf: [],
})

const isConfsLoading = ref(false)
async function queryRealConf() {
  if (!props.hostInfo)
    return
  isConfsLoading.value = true
  const params = {}
  params[props.clusterId] = {
    domainName: props.domainName,
    hostIds: [{ hostId: props.hostInfo.hostId }],
  }
  const [, res] = await api.getDomainRealConf(params)
  if (res) {
    realConf.value = res[props.clusterId].data[0].confBaseInfos
    const dConfs: Conf[] = props.defaultConf.map(d => ({
      fileAttr: '',
      fileOwner: '',
      filePath: d.filePath,
      confContents: d.contents,
      path: d.filePath,
    }))
    const { confs, notExitedConfs } = compareDiff(dConfs, realConf.value)
    allConfs.exitingConfs = confs
    allConfs.notExitingConf = notExitedConfs
  }
  isConfsLoading.value = false
}

function compareDiff(defaultConfs: Conf[], realConfs: Conf[]) {
  const confs: Conf[] = []
  const notExitedConfs: Conf[] = []
  defaultConfs.forEach((d) => {
    let result: Conf = d
    const confMatchd = realConfs.find(conf => conf.filePath === d.filePath.replace(/openEuler:/, ''))
    if (!confMatchd) {
      result.syncStatus = 'NOT IN HOST'
      notExitedConfs.push(result)
    }
    else {
      result = {
        ...result,
        ...confMatchd,
      }
      const diffLines = Diff.diffLines(d.confContents.replace(/\n$/, ''), confMatchd.confContents)
      if (checkIsDiff(diffLines)) {
        result.syncStatus = 'NOT SYNC'
        result.diffResult = diffLines
      }
      else {
        result.syncStatus = 'SYNC'
      }
      confs.push(result)
    }
  })
  return { confs, notExitedConfs }
}

const isCompareVisibale = ref(false)
const selectedCompareConf = ref<Diff.Change[]>([])

function showCompareDrawer(conf: Conf) {
  selectedCompareConf.value = conf.diffResult || []
  isCompareVisibale.value = true
}

onMounted(() => {
  queryRealConf()
})
</script>

<template>
  <a-spin :spinning="isConfsLoading">
    <div v-if="hostInfo" class="conf-section">
      <h1>{{ $t('conftrace.domainDetail.currentHostConf') }}</h1>
      <div>{{ $t('common.host', [hostInfo.hostId]) }}</div>
      <div style="margin-bottom: 5px">
        {{ $t('common.ip', [hostInfo.ip]) }}
      </div>

      <a-collapse>
        <a-collapse-panel v-for="item in allConfs.exitingConfs" :key="item.filePath" :header="`${$t('conftrace.domainConf.configurationItem')}：${item.filePath}`">
          <div class="conf-description">
            <a-descriptions :title="$t('conftrace.domainDetail.attributes')" :column="2">
              <a-descriptions-item label="fileAttr">
                {{ item.fileAttr }}
              </a-descriptions-item>
              <a-descriptions-item label="fileOwner">
                {{ item.fileOwner }}
              </a-descriptions-item>
              <a-descriptions-item label="rpmName">
                {{ item.rpmName }}
              </a-descriptions-item>
              <a-descriptions-item label="spacer">
                {{ item.spacer }}
              </a-descriptions-item>
              <a-descriptions-item label="rpmVersion">
                {{ item.rpmVersion }}
              </a-descriptions-item>
              <a-descriptions-item label="rpmRelease">
                {{ item.rpmRelease }}
              </a-descriptions-item>
            </a-descriptions>
          </div>
          <div class="conf-content">
            <a-row type="flex" justify="space-between" class="conf-content-header">
              <a-col>
                <h3 style="font-weight: bold;">
                  {{ $t('conftrace.domainDetail.confContent') }}
                </h3>
              </a-col>
              <a-col v-if="item.syncStatus === 'NOT SYNC'">
                <a-button type="primary" @click="showCompareDrawer(item)">
                  {{ $t('conftrace.domainDetail.differences') }}
                </a-button>
              </a-col>
            </a-row>
            <div class="text-container">
              {{ item.confContents }}
            </div>
          </div>
          <template #extra>
            <div v-if="item.syncStatus === 'NOT SYNC'">
              <CloseCircleTwoTone two-tone-color="#ff0000" />
              <span style="color: #ff0000">{{ $t('conftrace.domainDetail.sentence.inconsistency') }}</span>
            </div>
            <div v-if="item.syncStatus === 'SYNC'">
              <CheckCircleTwoTone two-tone-color="#52c41a" />
              <span>{{ $t('conftrace.domainDetail.sentence.same') }}</span>
            </div>
          </template>
        </a-collapse-panel>
      </a-collapse>
    </div>
    <div v-if="allConfs.notExitingConf.length" class="conf-section">
      <h1>{{ $t('conftrace.domainDetail.sentence.missing') }}</h1>
      <a-collapse>
        <a-collapse-panel v-for="item in allConfs.notExitingConf" :key="item.filePath" :header="`${$t('conftrace.domainConf.configurationItem')}:${item.filePath}`">
          <div class="conf-content">
            <a-row type="flex" justify="space-between" class="conf-content-header">
              <a-col>
                <div class="ant-descriptions-title">
                  {{ $t('conftrace.domainDetail.confContent') }}
                </div>
              </a-col>
            </a-row>
            <div class="text-container">
              {{ item.confContents }}
            </div>
          </div>
          <template #extra>
            <ExclamationCircleTwoTone two-tone-color="#f00" />
            <span style="color: #f00"> {{ $t('conftrace.domainDetail.sentence.noConf') }}</span>
          </template>
        </a-collapse-panel>
      </a-collapse>
    </div>
  </a-spin>

  <Drawer :key="$t('conftrace.domainDetail.differences')" v-model:visible="isCompareVisibale" :width="800">
    <template #content>
      <CompareDiff :diff-result="selectedCompareConf" />
    </template>
  </Drawer>
</template>

<style lang="less" scoped>
.conf-section:first-child {
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
}
.text-container {
  word-break: break-all;
  border: 1px solid #ccc;
  border-radius: 3px;
  padding: 10px;
  margin-top: 8px
}
.conf-description {
  border-bottom: 1px solid #ccc;
}
.conf-content {
  &-header {
    padding-top: 10px;
  }
}
</style>
