<template>
  <div @click="showModal">
    <a-button type="primary">批量添加主机</a-button>
    <a-modal title="添加主机" :visible="visible" :footer="null" @cancel="closeModal" width="1200px"
      :maskClosable="false">
      <div class="upload_head">
        <a-upload :file-list="fileDataList" :remove="removeFile" :before-upload="preUpload">
          <div style="display:flex;">
            <div>
              <a-button> <a-icon type="upload" /> 选择文件 </a-button>
            </div>
          </div>
        </a-upload>
        <span class="upload-tip">
            <span>支持类型: xls、xlsx、csv，批量添加主机个数不超过100个</span>
            <span class="upload_head_download" @click="downLoadTemplate">下载模版</span>
        </span>
      </div>
      <div class="upload-content" v-if="tableVis">
        <a-table
          :rowKey="(record,index)=>{return index}"
          :columns="columns"
          :data-source="tableData"
          :scroll="{ y: 400 }"
          bordered>
          <template slot="host_name" slot-scope="text, record">
            {{ record.host_name }}
          </template>
          <template slot="host_mac" slot-scope="text, record">
            {{ record.host_mac }}
          </template>
          <template slot="bmc_ip" slot-scope="text, record">
            {{ record.bmc_ip }}
          </template>
          <template slot="bmc_user_name" slot-scope="text, record">
            {{ record.bmc_user_name }}
          </template>
          <template slot="bmc_passwd" slot-scope="text, record">
            {{ record.bmc_passwd }}
          </template>
          <template slot="result" slot-scope="text, record">
            <span>
              <a-icon v-if="record.result === 'succeed'" type="check-circle" theme="twoTone" two-tone-color="#52c41a" />
              <a-icon v-if="record.result === 'failed'" type="close-circle" theme="twoTone" two-tone-color="#ff0033" />
              <a-icon v-if="record.result === ''" type="info-circle" theme="twoTone" two-tone-color="#CDCD00" />
            </span>
            <span class="result-tip" v-if="record.result === 'failed'">
              {{ '添加失败' }}
            </span>
            <span class="result-tip" v-if="record.result === 'succeed'">
              {{ '添加成功' }}
            </span>
            <span class="result-tip" v-if="record.result === ''">
              {{ '暂未执行' }}
            </span>
          </template>
          <template slot="reason" slot-scope="text, record">
            <span>{{ record.reason }}</span>
          </template>
        </a-table>
      </div>
      <div class="btn-class">
        <a-button @click="closeModal">取消</a-button>
        <a-button
          type="primary"
          :disabled="fileDataList.length === 0 || tableData.length === 0 || isSubmit"
          :loading="uploading"
          class="result-tip"
          @click="goUpload">
          {{ uploading ? '提交中' : '提交' }}
        </a-button>
      </div>
    </a-modal>
  </div>
</template>

<script>
import {batchAddHost, downLoadTemplate} from '@/api/hostManagement'
import {downloadBlobFile} from '@/views/utils/downloadBlobFile';
import * as XLSX from 'xlsx/xlsx.mjs';

export default {
  name: 'AddBatchHost',
  props: {},
  data() {
    return {
      editNum: 0,
      count: '',
      tableVis: false,
      fileDataList: [],
      visible: false,
      uploading: false,
      tableData: [],
      cacheData: [],
      isSubmit: false
    };
  },
  computed: {
    columns() {
      return [
        {
          dataIndex: 'host_name',
          width: '15%',
          key: 'host_name',
          title: '主机名称',
          scopedSlots: {customRender: 'host_name'},
          ellipsis: true,
          customRender: (text, record) => <a-tooltip placement="topLeft"
                                                     title={record.host_name}>{record.host_name}</a-tooltip>
        },
        {
          dataIndex: 'host_mac',
          width: '15%',
          key: 'host_mac',
          title: 'Mac地址',
          scopedSlots: {customRender: 'host_mac'}
        },
        {
          dataIndex: 'bmc_ip',
          width: '10%',
          key: 'bmc_ip',
          title: 'bmc管理IP',
          scopedSlots: {customRender: 'bmc_ip'}
        },
        {
          dataIndex: 'bmc_user_name',
          width: '15%',
          key: 'bmc_user_name',
          title: 'bmc登录用户名',
          scopedSlots: {customRender: 'bmc_user_name'},
          ellipsis: true,
          customRender: (text, record) => <a-tooltip placement="topLeft"
                                                     title={record.bmc_user_name}>{record.bmc_user_name}</a-tooltip>
        },
        {
          dataIndex: 'bmc_passwd',
          width: '15%',
          key: 'bmc_passwd',
          title: 'bmc登录密码',
          scopedSlots: {customRender: 'bmc_passwd'}
        },
        {
          title: '添加结果',
          width: '10%',
          dataIndex: 'result',
          scopedSlots: { customRender: 'result' }
        },
        {
          title: '失败原因',
          width: '25%',
          dataIndex: 'reason',
          scopedSlots: { customRender: 'reason' },
          ellipsis: true,
          customRender: (text, record) => <a-tooltip placement="topLeft"
                                                     title={record.reason}>{record.reason}</a-tooltip>
        }
      ];
    }
  },
  methods: {
    showModal() {
      this.visible = true;
    },
    closeModal() {
      this.visible = false;
      this.fileDataList = [];
      this.tableData = [];
      this.tableVis = false;
    },
    downLoadTemplate() {
      const _this = this;
      downLoadTemplate()
        .then(function (res) {
          downloadBlobFile(res.data, res.fileName);
        })
        .catch(function (err) {
          _this.$message.error(err.message);
        })
        .finally(function () {
        });
    },
    removeFile(file) {
      const index = this.fileDataList.indexOf(file);
      const newFileDataList = this.fileDataList.slice();
      newFileDataList.splice(index, 1);
      this.fileDataList = newFileDataList;
      this.tableData = [];
      this.tableVis = false;
    },
    readFile(file) {
      // 文件读取
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsText(file, 'GB2312');
        reader.onload = (ev) => {
          resolve(ev.target.result);
        };
      });
    },
    isEmpty(value) {
      if (value == null) {
        return true
      }
      value = value + ''
      return value.trim() === ''
    },
    async preUpload(file) {
      return new Promise(async (resolve, reject) => {
        this.fileDataList = [file];
        // 文件类型
        const suffix = file.name.substring(file.name.lastIndexOf('.') + 1);
        const arr = ['xlsx', 'xls', 'csv'];
        if (!arr.includes(suffix)) {
          this.$message.error('文件类型不符合规定!');
          this.removeFile(file);
        } else {
          // 处理文件数据
          const data = await this.readFile(file);
          const workbook = XLSX.read(data, {type: 'binary'}); //  解析二进制格式数据
          const worksheet = workbook.Sheets[workbook.SheetNames[0]]; // 获取第一个Sheet
          const result = XLSX.utils.sheet_to_json(worksheet); // 将数据json数据格式
          if (result.length > 100) {
            this.$message.error('主机个数不能超过100个，请重新修改并上传!');
            this.removeFile(file);
            return
          }
          const len = result.length
          if (this.isEmpty(result[len - 1]?.host_name)
            && this.isEmpty(result[len - 1]?.host_mac)
            && this.isEmpty(result[len - 1]?.bmc_ip)
            && this.isEmpty(result[len - 1]?.bmc_user_name)
            && this.isEmpty(result[len - 1]?.bmc_passwd)) {
            result.pop()
          }
          for (let i = 0; i < result.length; i++) {
            const arr = Object.keys(result[i])
            if (!arr.includes('host_name') || !arr.includes('host_mac') || !arr.includes('bmc_ip') || !arr.includes('bmc_user_name') || !arr.includes('bmc_passwd')) {
              this.removeFile(file)
              this.$message.error('文件参数不能为空!')
              return
            }
          }
          setTimeout(() => {
            this.isSubmit = false
            this.tableData = result
            this.count = this.tableData.length
            for (let i = 0; i < this.tableData.length; i++) {
              this.tableData[i].host_name = this.tableData[i].host_name.toString().trim()
              this.tableData[i].host_mac = this.tableData[i].host_mac.toString().trim()
              this.tableData[i].bmc_ip = this.tableData[i].bmc_ip.toString().trim()
              this.tableData[i].bmc_user_name = this.tableData[i].bmc_user_name.toString().trim()
              this.tableData[i].bmc_passwd = this.tableData[i].bmc_passwd.toString().trim()
              this.tableData[i]['key'] = i.toString()
              this.tableData[i]['result'] = ''
            }
            this.cacheData = this.tableData.map((item) => ({...item}));
            this.tableVis = true;
          }, 1)
        }
        //  reject阻止默认上传
        const flag = false
        return reject(flag)
      })
    },
    goUpload() {
      this.isSubmit = true
      const {fileDataList} = this;
      const formData = new FormData();
      fileDataList.forEach(file => {
        formData.append('file', file);
      });
      const tableParams = JSON.parse(JSON.stringify(this.tableData));
      tableParams.forEach((item) => {
        this.$set(item, 'host_name', String(item.host_name))
        delete item.key;
        delete item.result;
        delete item.reason;
      });
      this.uploading = true;
      const _this = this;
      batchAddHost(tableParams)
        .then(function (res) {
          if (res.code === 200) {
            _this.tableData = []
            _this.tableData = res.data.result
            _this.$message.success('批量添加操作成功，添加结果请查看列表中添加结果列!')
            _this.$emit('addSuccess');
          } else {
            _this.$message.error('批量添加操作失败！')
          }
        })
        .catch(function (err) {
          _this.$message.error(err.response.message || err.message)
        })
        .finally(function () {
          _this.uploading = false;
        });
    }
  }
};
</script>
<style lang="less" scoped>
::v-deep .ant-form-item {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  font-variant: tabular-nums;
  line-height: 1.5;
  list-style: none;
  -webkit-font-feature-settings: 'tnum';
  font-feature-settings: 'tnum';
  margin-bottom: 0!important;
  vertical-align: top;
}

.upload-row {
  /deep/ .ant-form-item-label {
    line-height: 22px;
  }
  /deep/ .ant-form-item-control {
    line-height: 16px;
  }
}

.upload-tip {
  font-size: 15px;
  position: absolute;
  left: 147px;
  top: 84px;
}

.upload_head {
  .upload_head_download {
    margin-top: 3px;
    font-size:15px;
    cursor:pointer;
    color: blue;
    text-decoration:underline!important;
  }
}

.upload-content {
  margin-top: 16px;
  & /deep/ .ant-table-tbody > tr > td {
    padding: 8px 8px;
    overflow-wrap: break-word;
  }
  & /deep/ .ant-table-tbody .ant-table-row td {
    padding-top: 8px;
    padding-bottom: 8px;
  }
}

.result-tip {
  margin-left: 10px;
}

.btn-class {
  display: flex;
  justify-content: flex-end;
}
</style>
