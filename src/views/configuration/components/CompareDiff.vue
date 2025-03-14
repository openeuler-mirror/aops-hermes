<script setup lang="ts">
import type * as Diff from 'diff'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    diffResult: Diff.Change[]
  }>(),
  {
    diffResult: () => [],
  },
)

const diffPartList = computed(() => props.diffResult.map(part => part))

function setDiffClass(isAdd?: boolean, isRemoved?: boolean, isOrigin?: boolean) {
  if (isOrigin) {
    if (isAdd) return 'diff-add-blank'

    if (isRemoved) return 'diff-remove'
  } else {
    if (isAdd) return 'diff-add'

    if (isRemoved) return 'diff-remove-blank'
  }
  return ''
}
</script>

<template>
  <a-row type="flex" justify="space-between">
    <a-col :span="11">
      <h3>{{ $t('conftrace.domainConf.hostSide') }}</h3>
    </a-col>
    <a-col :span="11">
      <h3>{{ $t('conftrace.domainDetail.domainSide') }}</h3>
    </a-col>
  </a-row>
  <div class="diff-content">
    <div v-for="(part, index) in diffPartList" :key="index">
      <a-row type="flex" justify="space-between">
        <a-col :span="11" class="diff-line" :class="[setDiffClass(part.added, part.removed)]">
          {{ !part.removed ? part.value : '' }}
        </a-col>
        <a-col :span="11" class="diff-line" :class="[setDiffClass(part.added, part.removed, true)]">
          {{ !part.added ? part.value : '' }}
        </a-col>
      </a-row>
    </div>
  </div>
</template>

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
  background: var(--codediff-bg__t);
  &-blank {
    background: var(--codediff-bg__t);
    color: var(--codediff-bg__t);
  }
}
.diff-remove {
  background: var(--codediff-bg__f);
  &-blank {
    background: var(--codediff-bg__f);
    color: var(--codediff-bg__f);
  }
}
</style>
