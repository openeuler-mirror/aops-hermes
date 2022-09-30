<template>
  <div>
    <a-row type="flex" justify="space-between">
      <a-col :span="11"><h3>主机端（实际配置）</h3></a-col>
      <a-col :span="11"><h3>业务域（默认配置）</h3></a-col>
    </a-row>
    <div class="diff-content">
      <div
        v-for="(part, index) in diffPartList"
        :key="index"
      >
        <a-row type="flex" justify="space-between">
          <a-col :span="11" class="diff-line" :class="[setDiffClass(part.added, part.removed, true)]">
            {{ !part.added ? part.value : '' }}
          </a-col>
          <a-col :span="11" class="diff-line" :class="[setDiffClass(part.added, part.removed)]">
            {{ !part.removed ? part.value: '' }}
          </a-col>
        </a-row>
      </div>
    </div>
  </div>
</template>

<script>
import { PageHeaderWrapper } from '@ant-design-vue/pro-layout'

export default {
    name: 'CompareDiffView',
    components: {
        PageHeaderWrapper
    },
    props: {
      comparedConf: {
        type: Object,
        default: () => {}
      }
    },
    data () {
      return {}
    },
    computed: {
      diffByLine () {
        return this.comparedConf.diffResult || []
      },
      diffPartList () {
        return this.diffByLine.map((part) => {
          return part
        })
      }
    },
    methods: {
      setDiffClass (isAdd, isRemoved, isOrigin) {
        if (isOrigin) {
          if (isAdd) {
            return 'diff-add-blank'
          }
          if (isRemoved) {
            return 'diff-remove'
          }
        } else {
          if (isAdd) {
            return 'diff-add'
          }
          if (isRemoved) {
            return 'diff-remove-blank'
          }
        }
        return ''
      }
    }
}
</script>

<style lang="less" scoped>
  .diff-content {
    border: 1px solid #ccc;
    padding: 24px;
  }
  .diff-line {
    word-break: break-all;
    white-space: pre-wrap;
  }
  .diff-add {
    background: rgb(236, 253, 240);
    &-blank {
      background: rgb(236, 253, 240);
      color: rgb(236, 253, 240);
    }
  }
  .diff-remove {
    background: rgb(251,233,235);
    &-blank {
      background: rgb(251,233,235);
      color: rgb(251,233,235);
    }
  }
</style>
