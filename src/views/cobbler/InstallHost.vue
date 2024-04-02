<template>
  <div>
    <div @click="showModal">
      <slot name="button">
        <a-button type="primary">一键装机</a-button>
      </slot>
    </div>
    <a-modal title="一键装机" :visible="visible" :confirm-loading="isLoading" @ok="handleOk"
             :maskClosable="false" @cancel="handleCancel">
      <a-form :form="form" :label-col="{span: 7}" :wrapper-col="{span: 16}">
        <a-form-item label="ISO文件名">
          <a-select placeholder="请选择ISO文件名"
                    v-decorator="['ISOName', {rules: [{required: true, message: '请选择ISO文件名'}]}]">
            <a-select-option v-for="iso in isoList" :value="iso.iso_name" :key="iso.iso_name">
              {{ iso.iso_name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="镜像架构">
          <a-select placeholder="请选择镜像架构"
                    v-decorator="['arch', {rules: [{required: true, message: '请选择镜像架构'}]}]">
            <a-select-option v-for="arch in archList" :value="arch.value" :key="arch.value">
              {{ arch.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="kickstart文件名">
          <a-select placeholder="请选择kickstart文件名"
                    v-decorator="['ksName', {rules: [{required: true, message: '请选择kickstart文件名'}]}]">
            <a-select-option v-for="ks in ksList" :value="ks.ks_name" :key="ks.ks_name">
              {{ ks.ks_name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="自定义安装软件">
          <a-textarea :rows="4"
            v-decorator="['installRpm', {rules: [{validator: checkInstallRpmInput, validateTrigger: 'blur'}]}]"
            placeholder="请输入rpm包主软件名称，如安装docker相关服务，只需要填写docker即可，需要安装多个rpm包时请用英文逗号进行分割">
          </a-textarea>
        </a-form-item>
        <a-form-item label="自定义脚本文件名">
          <a-select placeholder="请选择脚本文件名"
                    v-decorator="['scriptName', {rules: [{required: false, message: '请选择脚本文件名'}]}]">
            <a-select-option v-for="script in scriptList" :value="script.script_name" :key="script.script_name">
              {{ script.script_name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" :loading="isLoading" @click="handleOk">确定</a-button>
      </template>
    </a-modal>
    <!--  一键装机结果详情弹框  -->
    <template v-if="resultListVisible">
      <a-modal :visible="resultListVisible" :maskClosable="false"
               @cancel="handleResultCancel" width="1000px">
        <template slot="title">
          <a-space>
            <span style="font-weight: bold">系统安装指令下发结果详情</span>
          </a-space>
        </template>
        <a-table
          :columns="columns"
          :rowKey="(record,index)=>{return index}"
          :data-source="hostResultList"
          :locale="{emptyText: getEmpty}"
          :pagination="false">
        </a-table>
        <template #footer>
          <a-button @click="handleResultCancel">关闭</a-button>
        </template>
      </a-modal>
    </template>
  </div>
</template>

<script>
import {queryKickstartList} from '@/api/ksManagement';
import {scriptList} from '@/api/scriptManagement';
import {autoInstall} from '@/api/hostManagement';
import {imageList} from '@/api/imageManagement';

export default {
  name: 'InstallHost',
  props: {
    onSuccess: {
      type: Function,
      default: null
    },
    hostList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      visible: false,
      isLoading: false,
      form: this.$form.createForm(this, {name: 'autoInstall'}),
      archList: [
        {
          label: 'x86_64',
          value: 'x86_64'
        },
        {
          label: 'aarch64',
          value: 'aarch64'
        }
      ],
      ksList: [],
      isoList: [],
      scriptList: [],
      hostResultList: [],
      resultListVisible: false
    };
  },
  computed: {
    columns() {
      return [
        {
          dataIndex: 'bmc_ip',
          width: '15%',
          key: 'bmc_ip',
          title: 'bmc管理IP'
        },
        {
          dataIndex: 'bmc_user_name',
          width: '15%',
          key: 'bmc_user_name',
          title: 'bmc用户名',
          ellipsis: true,
          customRender: (text, record) => <a-tooltip placement="topLeft" title={record.bmc_user_name}>{record.bmc_user_name}</a-tooltip>
        },
        {
          dataIndex: 'host_name',
          width: '15%',
          key: 'host_name',
          title: '主机名称',
          ellipsis: true,
          customRender: (text, record) => <a-tooltip placement="topLeft" title={record.host_name}>{record.host_name}</a-tooltip>
        },
        {
          dataIndex: 'host_mac',
          width: '15%',
          key: 'host_mac',
          title: 'Mac地址',
          ellipsis: true,
          customRender: (text, record) => <a-tooltip placement="topLeft" title={record.host_mac}>{record.host_mac}</a-tooltip>
        },
        {
          dataIndex: 'result',
          width: '10%',
          key: 'result',
          title: '下发结果'
        },
        {
          dataIndex: 'reason',
          width: '30%',
          key: 'reason',
          title: '原因',
          ellipsis: true,
          customRender: (text, record) => <a-tooltip placement="topLeft" title={record.reason}>{record.reason}</a-tooltip>
        }
      ];
    }
  },
  methods: {
    showModal() {
      this.form.resetFields();
      this.getKickstartList()
      this.getImageList()
      this.getScriptList()
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
          let ksName = values.ksName
          if (ksName.endsWith('.ks')) {
            ksName = ksName.substring(0, ksName.indexOf('.ks'))
          }
          let ISOName = values.ISOName
          if (ISOName.endsWith('.iso')) {
            ISOName = ISOName.substring(0, ISOName.indexOf('.iso'))
          }
          let scriptName = values.scriptName
          if (scriptName === undefined || scriptName === null) {
            scriptName = ''
          } else if (scriptName.endsWith('.sh')) {
            scriptName = scriptName.substring(0, scriptName.indexOf('.sh'))
          }
          const param = {
            hostList: this.hostList,
            ksName: ksName,
            ISOName: ISOName,
            scriptName: scriptName,
            installRpm: values.installRpm,
            arch: values.arch
          }
          autoInstall(param)
            .then(function (res) {
              if (res.code === 200) {
                _this.hostResultList = res.data
                _this.$message.success('操作成功，系统安装指令下发结果请查看详情页')
                _this.onSuccess && _this.onSuccess()
                _this.visible = false
                _this.form.resetFields()
                _this.showResultModal()
              } else {
                _this.$message.error(res.msg)
              }
            })
            .catch(function (err) {
              _this.$message.error(err.response.message || err.message);
            })
            .finally(function () {
              _this.isLoading = false;
            });
        }
      });
    },
    // 获取ks文件列表数据
    getKickstartList(argment) {
      const _this = this;
      const param = {
        ks_name: argment || ''
      }
      queryKickstartList(param)
        .then(function (res) {
          _this.ksList = res || []
        })
        .catch(function (err) {
          _this.$message.error(err.response.message || err.message);
        })
        .finally(function () {
        });
    },
    // 获取镜像列表数据
    getImageList() {
      const _this = this;
      imageList()
        .then(function (res) {
          _this.isoList = res || []
        })
        .catch(function (err) {
          _this.$message.error(err.response.message || err.message);
        })
        .finally(function () {
        });
    },
    // 获取脚本文件列表数据
    getScriptList() {
      const _this = this;
      scriptList({script_name: ''})
        .then(function (res) {
          _this.scriptList = res || []
        })
        .catch(function (err) {
          _this.$message.error(err.response.message || err.message);
        })
        .finally(function () {
        });
    },
    showResultModal() {
      this.resultListVisible = true
    },
    handleResultCancel() {
      this.resultListVisible = false
    },
    getEmpty() {
      return (
        <div class="aops-app-table-empty">
          <a-empty description="暂无数据" image={require('@/assets/empty.svg')} />
        </div>
      );
    },
    checkInstallRpmInput(rule, value, cb) {
      cb();
    }
  }
};
</script>
