<template>
  <div class="aops-add-domain" @click="showModal">
    <a-button type="primary">创建业务域</a-button>
    <a-modal
      title="创建业务域"
      :visible="visible"
      :confirm-loading="isLoading"
      @ok="handleOk"
      @cancel="handleCancel">
      <a-form :form="form" :label-col="{span: 5}" :wrapper-col="{span: 16}">
        <a-form-item label="业务域名称">
          <a-input
            :maxLength="26"
            placeholder="请输入业务域名称，26个字符以内"
            v-decorator="[
              'domainName',
              {rules: [{required: true, message: '请输入业务域名称'}, {validator: checkDomainName}]}
            ]">
          </a-input>
        </a-form-item>
        <a-form-item label="优先级">
          <a-input
            :disabled="true"
            placeholder="未开放设置"
            v-decorator="['priority', {rules: [{required: false, message: '请输入优先级'}]}]">
          </a-input>
        </a-form-item>
        <a-form-item label="监控开关">
          <a-switch v-model="traceIsActive" @change="handleTraceSwitchChange" checked-children="on" un-checked-children="off" />
        </a-form-item>
        <a-form-item label="告警开关">
          <a-switch v-model="warningIsActive" @change="handleWarningSwitchChange" checked-children="on" un-checked-children="off" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import {createDomain} from '@/api/configuration';
// 弹窗添加主机组
export default {
  name: 'AddHostGroupModal',
  props: {
    onSuccess: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      visible: false,
      isLoading: false,
      traceIsActive: false,
      warningIsActive: false,
      text: 'ON',
      form: this.$form.createForm(this, {name: 'addHostGroup'})
    };
  },
  methods: {
    showModal() {
      this.form.resetFields();
      this.visible = true;
    },
    handleCancel() {
      this.visible = false;
    },
    handleOk() {
      this.form.validateFields((err, values) => {
        if (!err) {
          const _this = this;
          this.isLoading = true;
          values.priority = 0;
          values.conf_change_flag = this.traceIsActive
          values.report_flag = this.warningIsActive
          createDomain(values)
            .then(function (res) {
              _this.$message.success(res.message);
              _this.onSuccess && _this.onSuccess();
              _this.visible = false;
              _this.form.resetFields();
            })
            .catch(function (err) {
              _this.$message.error(err.response.message || err.response.data.detail);
            })
            .finally(function () {
              _this.isLoading = false;
            });
        }
      });
    },
    checkDomainName(rule, value, cb) {
      if (value && value.length > 26) {
        /* eslint-disable */
        cb('名称长度不应超过26个字符');
        /* eslint-enable */
        return;
      }
      if (/[^0-9a-zA-Z_\-.]/.test(value)) {
        /* eslint-disable */
        cb('名称只能输入大小写字母、下划线、中划线和小数点');
        /* eslint-enable */
        return;
      }
      // 26个大小写字母。数字。下划线。底划线。小数点.
      cb();
    },
     handleTraceSwitchChange() {
      this.traceIsActive = !this.traceIsActive;
      if (this.traceIsActive) {
        this.traceIsActive = false
      } else {
        this.traceIsActive = true
      }
    },
    handleWarningSwitchChange() {
      this.warningIsActive = !this.warningIsActive;
      if (this.warningIsActive) {
        this.warningIsActive = false
      } else {
        this.warningIsActive = true
      }
    }
  }
};
</script>
<style lang="less" scoped>
.aops-add-domain {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 36px;
  cursor: pointer;
  border: 1px dashed #d9d9d9;
  &:hover {
    border-color: #3265f2;
  }
}
</style>
