<template>
  <a-tooltip placement="bottomLeft" overlayClassName="desc-tooltip" arrowPointAtCenter>
    <template slot="title">
      <slot></slot>
    </template>
    <a-icon type="question-circle" />
  </a-tooltip>
</template>

<script>
export default {
  name: 'DescriptionTips'
};
</script>

<style lang="less">
// global style. Since the elements of tooltip are created and attached on body, not current componet.
.anticon-question-circle {
  cursor: pointer;
  font-size: 14px;
}

.desc-tooltip {
  max-width: 600px;
  .ant-tooltip-inner {
    background: #fff;
    color: #333;
    padding: 8px 18px;
  }
  .ant-tooltip-arrow:before {
    background: #fff;
  }
}
</style>
