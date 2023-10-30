<template>
  <div @click="showModal">
    <a-button type="primary">批量添加主机</a-button>
    <a-modal title="添加主机" :visible="visible" :footer="null" @cancel="closeModal" width="1668px">
      <div class="upload_head">
        <a-upload :file-list="fileDataList" :remove="removeFile" :before-upload="preUpload">
          <div style="display:flex;">
            <div style="flex">
              <a-button> <a-icon type="upload" /> 选择文件 </a-button>
            </div>
          </div>
        </a-upload>
        <span style="font-size: 15px;position: absolute;left: 147px;top: 84px;">
            <span>支持类型: xls、xlsx、csv，</span>
            <span class="upload_head_download" @click="goDownLoad">下载模版</span>
            <!-- <p>文件需小于20M、压缩包内文件数小于100</p> -->
        </span>
        <div style="display: flex;margin-top: 15px;">
            <div style="flex">
              <a-button style="margin-left: 20px" @click="handleAdd" v-if="tableVis"> 新增 </a-button>
            </div>
        </div>
      </div>
      <div class="upload-content" v-if="tableVis">
        <a-table
          :columns="columns"
          :data-source="tableData"
          :scroll="{ y: 400 }"
          bordered>
          <template slot="host_ip" slot-scope="text, record">
            <editable-cell
              ref="host_ip"
              formkey="host_ip"
              :record="record"
              :text="String(text)"
              @unSubmit="unSubmit()"
              @allowSub="allowSub()"
              @change="onCellChange(record.key, 'host_ip', $event)" />
          </template>
          <template slot="ssh_port" slot-scope="text, record">
            <editable-cell
              ref="ssh_port"
              formkey="ssh_port"
              :record="record"
              :text="String(text)"
              @unSubmit="unSubmit()"
              @allowSub="allowSub()"
              @change="onCellChange(record.key, 'ssh_port', $event)" />
          </template>
          <template slot="ssh_user" slot-scope="text, record">
            <editable-cell
              ref="ssh_user"
              formkey="ssh_user"
              :record="record"
              :text="String(text)"
              @unSubmit="unSubmit()"
              @allowSub="allowSub()"
              @change="onCellChange(record.key, 'ssh_user', $event)" />
          </template>
          <template slot="password" slot-scope="text, record">
            <editable-cell
              ref="password"
              formkey="password"
              :record="record"
              :text="String(text)"
              @unSubmit="unSubmit()"
              @allowSub="allowSub()"
              @change="onCellChange(record.key, 'password', $event)" />
          </template>
          <template slot="ssh_pkey" slot-scope="text, record">
            <editable-cell
              ref="ssh_pkey"
              formkey="ssh_pkey"
              :record="record"
              :text="String(text)"
              @unSubmit="unSubmit()"
              @allowSub="allowSub()"
              @change="onCellChange(record.key, 'ssh_pkey', $event)" />
          </template>
          <template slot="host_name" slot-scope="text, record">
            <editable-cell
              ref="host_name"
              formkey="host_name"
              :record="record"
              :text="String(text)"
              @unSubmit="unSubmit()"
              @allowSub="allowSub()"
              @change="onCellChange(record.key, 'host_name', $event)" />
          </template>
          <template slot="host_group_name" slot-scope="text, record">
            <editable-cell
              ref="host_group_name"
              formkey="host_group_name"
              :record="record"
              :text="String(text)"
              @unSubmit="unSubmit()"
              @allowSub="allowSub()"
              @change="onCellChange(record.key, 'host_group_name', $event)" />
          </template>
          <template slot="management" slot-scope="text, record">
            <editable-cell
              ref="management"
              formkey="management"
              :record="record"
              :text="String(text)"
              @unSubmit="unSubmit()"
              @allowSub="allowSub()"
              @change="onCellChange(record.key, 'management', $event)" />
          </template>
          <template slot="operation" slot-scope="text, record">
            <a-popconfirm
              v-if="tableData.length"
              title="确定删除此行数据吗?"
              @confirm="() => onDelete(record.key)"
            >
              <a href="javascript:;">删除</a>
            </a-popconfirm>
          </template>
          <template slot="result" slot-scope="text, record">
            <span>
              <a-icon v-if="record.result === '添加成功'" type="check-circle" theme="twoTone" two-tone-color="#52c41a" />
              <a-icon v-if="record.result === '添加失败'" type="close-circle" theme="twoTone" two-tone-color="#ff0033" />
              <a-icon v-if="record.result === ''" type="info-circle" theme="twoTone" two-tone-color="#CDCD00" />
            </span>
            <span style="margin-left: 10px;">{{ text || '暂未执行' }}</span>
          </template>
          <template v-if="record.reason" slot="expandedRowRender" slot-scope="record">
            {{ record.reason }}
          </template>
        </a-table>
      </div>
      <div style="display: flex;justify-content: flex-end;">
        <a-button
          type="primary"
          :disabled="fileDataList.length === 0 || tableData.length === 0 || isSubDisable"
          :loading="uploading"
          style="margin-top: 16px;width: 111px;"
          @click="goUpload">
          {{ uploading ? '提交中' : '提交' }}
        </a-button>
      </div>
    </a-modal>
  </div>
</template>

<script>
import {addMoreHost, downLoadtemplate} from '@/api/assest';
import {downloadBlobFile} from '@/views/utils/downloadBlobFile';
import EditableCell from './EditableCell.vue';
import * as XLSX from 'xlsx/xlsx.mjs';

export default {
  name: 'AddMoreHost',
  components: {
    EditableCell
  },
  props: {},
  data() {
    return {
      editNum: 0,
      dataAllow: true,
      count: '',
      rowKey: 'ip',
      colList: ['host_ip', 'ssh_port', 'ssh_user', 'password', 'ssh_pkey', 'host_name', 'host_group_name', 'management'],
      tableVis: false,
      fileDataList: [],
      visible: false,
      uploading: false,
      tableData: [],
      editingKey: '',
      cacheData: [],
      rules: {
        host_ip: [{required: true, message: 'Please select Activity zone', trigger: 'blur'}],
        ssh_port: [{required: true, message: 'Please select Activity zone', trigger: 'blur'}],
        ssh_user: [{required: true, message: 'Please select Activity zone', trigger: 'blur'}],
        password: [{required: true, message: 'Please select Activity zone', trigger: 'blur'}],
        ssh_pkey: [{required: true, message: 'Please select Activity zone', trigger: 'blur'}],
        host_name: [{required: true, message: 'Please select Activity zone', trigger: 'blur'}],
        host_group_name: [{required: true, message: 'Please select Activity zone', trigger: 'blur'}],
        management: [{required: true, message: 'Please select Activity zone', trigger: 'blur'}]
      }
    };
  },
  computed: {
    isSubDisable() {
      if (this.editNum > 0) {
        return true
      } else {
        return false
      }
    },
    columns() {
      return [
        {
          dataIndex: 'host_ip',
          width: 150,
          key: 'host_ip',
          title: '主机IP',
          scopedSlots: {customRender: 'host_ip'}
        },
        {
          dataIndex: 'ssh_port',
          width: 150,
          key: 'ssh_port',
          title: 'SSH登录端口',
          scopedSlots: {customRender: 'ssh_port'}
        },
        {
          dataIndex: 'ssh_user',
          width: 150,
          key: 'ssh_user',
          title: '主机用户名',
          scopedSlots: {customRender: 'ssh_user'}
        },
        {
          dataIndex: 'password',
          width: 200,
          key: 'password',
          title: '登录密码',
          scopedSlots: {customRender: 'password'}
        },
        {
          dataIndex: 'ssh_pkey',
          width: 200,
          key: 'ssh_pkey',
          title: '登录密钥',
          scopedSlots: {customRender: 'ssh_pkey'}
        },
        {
          dataIndex: 'host_name',
          width: 150,
          key: 'host_name',
          title: '主机名称',
          // customRender: (hostName) => String(hostName),
          scopedSlots: {customRender: 'host_name'}
        },
        {
          dataIndex: 'host_group_name',
          width: 150,
          key: 'host_group_name',
          title: '所属主机组',
          scopedSlots: {customRender: 'host_group_name'}
        },
        {
          dataIndex: 'management',
          width: 150,
          key: 'management',
          title: '管理/监控节点',
          scopedSlots: {customRender: 'management'}
        },
        {
          title: '操作',
          width: 100,
          dataIndex: 'operation',
          scopedSlots: { customRender: 'operation' }
        },
        {
          title: '添加结果',
          width: 150,
          dataIndex: 'result',
          scopedSlots: { customRender: 'result' }
        }
      ];
    }
  },
  methods: {
    unSubmit() {
      this.editNum++;
    },
    allowSub() {
      this.editNum--;
    },
    onCellChange(key, dataIndex, value) {
      const dataSource = [...this.tableData];
      const target = dataSource.find((item) => item.key === key);
      if (target) {
        target[dataIndex] = value;
        this.tableData = dataSource;
      }
    },
    handleAdd() {
      const { count, tableData } = this;
      const newData = {
        host_ip: '',
        ssh_port: '',
        ssh_user: '',
        password: '',
        ssh_pkey: '',
        host_name: '',
        host_group_name: '',
        management: '',
        key: count,
        result: ''
      };
      this.tableData = [...tableData, newData];
      this.count = count + 1
      this.cacheData = this.tableData.map((item) => ({...item}));
    },
    showModal() {
      this.visible = true;
    },
    closeModal() {
      this.visible = false;
      this.fileDataList = [];
      this.tableData = [];
      this.tableVis = false;
    },
    goDownLoad() {
      const _this = this;
      downLoadtemplate()
        .then(function (res) {
          // download files
          downloadBlobFile(res.data, res.fileName);
          // _this.$message.success(res.message);
        })
        .catch(function (err) {
          _this.$message.error(err.response.message);
        })
        .finally(function () {
        });
    },
    onDelete(key) {
      this.tableData = [...this.tableData.filter(item => item.key !== key)];
    },
    removeFile(file) {
      const index = this.fileDataList.indexOf(file);
      const newfileDataList = this.fileDataList.slice();
      newfileDataList.splice(index, 1);
      this.fileDataList = newfileDataList;
      this.tableData = [];
      this.tableVis = false;
    },
    readFile(file) {
      // 文件读取
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsBinaryString(file); // 以二进制的方式读取
        reader.onload = (ev) => {
          resolve(ev.target.result);
        };
      });
    },
    async preUpload(file) {
      return new Promise(async (resolve, reject) => {
        this.dataAllow = true
        this.fileDataList = [file];
        // 文件类型
        var suffix = file.name.substring(file.name.lastIndexOf('.') + 1);
        var arr = ['xlsx', 'xls', 'csv'];
        if (!arr.includes(suffix)) {
          this.$message.error('文件类型不符合规定!');
          this.removeFile(file);
        } else {
          // 处理文件数据
          const data = await this.readFile(file);
          const workbook = XLSX.read(data, {type: 'binary'}); //  解析二进制格式数据
          const worksheet = workbook.Sheets[workbook.SheetNames[0]]; // 获取第一个Sheet
          const result = XLSX.utils.sheet_to_json(worksheet); // 将数据json数据格式
          result.forEach((item) => {
            const arr = Object.keys(item)
            if (!arr.includes('host_ip') || !arr.includes('ssh_port') || !arr.includes('ssh_user') || (!arr.includes('password') && !arr.includes('ssh_pkey')) || !arr.includes('host_name') || !arr.includes('host_group_name') || !arr.includes('management')) {
              this.removeFile(file);
              this.dataAllow = false;
            }
          })
          setTimeout(() => {
            if (this.dataAllow) {
              this.tableData = result;
              this.count = this.tableData.length
              for (let i = 0; i < this.tableData.length; i++) {
                this.tableData[i]['key'] = i.toString();
                this.tableData[i]['result'] = '';
              }
              this.cacheData = this.tableData.map((item) => ({...item}));
              this.tableVis = true;
            } else {
              this.$message.error('文件参数不符合规定!');
            }
          }, 1)
        }
        //  eslint-disable-next-line prefer-promise-reject-errors
        return reject(false)
        //  reject阻止默认上传
      })
    },
    goUpload() {
      const {fileDataList} = this;
      const formData = new FormData();
      fileDataList.forEach(file => {
        formData.append('file', file);
      });
      const tableParams = JSON.parse(JSON.stringify(this.tableData));
      tableParams.forEach((item) => {
        this.$set(item, 'host_name', String(item.host_name))
        item.management = Boolean(item.management)
        item.password = String(item.password)
        item.ssh_pkey = String(item.ssh_pkey)
        if (item.password === 'undefined') {
          item.password = ''
        }
        if (item.ssh_pkey === 'undefined') {
          item.ssh_pkey = ''
        }
        delete item.key;
        delete item.editable;
        delete item.result;
        delete item.reason;
      });
      this.uploading = true;
      const _this = this;
      addMoreHost(tableParams)
        .then(function (res) {
          if (res.code === '200') {
            // 全部添加成功
            const successArr = []
            res.data.forEach((item) => {
              successArr.push(item.host_ip)
            });
            _this.tableData.forEach((item) => {
              if (successArr.includes(item.host_ip)) {
                item.result = '添加成功'
              }
            })
            _this.$message.success('全部主机添加成功!')
            _this.$emit('addSuccess');
          } else {
            // 部分添加成功
            const successArr = [];
            const failData = {};
            res.data.forEach((item) => {
              if (item.result === 'succeed') {
                successArr.push(item.host_ip)
              } else {
                failData[item.host_ip] = item.reason
              }
            });
            _this.tableData.forEach((item) => {
              if (successArr.includes(item.host_ip)) {
                item.result = '添加成功'
              } else {
                item.result = '添加失败'
              }
              if (Object.keys(failData).includes(item.host_ip)) {
                item.reason = failData[item.host_ip]
              }
            })
            _this.$message.success('部分主机添加成功!')
            _this.$emit('addSuccess');
          }
        })
        .catch(function (err) {
          if (err.response.code === '1801') {
            // 全部主机添加失败
            const errorList = [];
            const errorData = {};
            err.response.data.forEach((item) => {
              errorList.push(item.host_ip);
              errorData[item.host_ip] = item.reason
            });
            _this.tableData.forEach((item) => {
              if (errorList.includes(item.host_ip)) {
                item.result = '添加失败'
              }
              if (Object.keys(errorData).includes(item.host_ip)) {
                item.reason = errorData[item.host_ip]
              }
            })
            _this.$message.error('全部主机添加失败!')
          } else {
            if (err.response.code === '1000') {
              const errorList = [];
              const errorData = {};
              err.response.data.forEach((item) => {
                errorList.push(item.host_ip);
                errorData[item.host_ip] = item.reason
              });
              _this.tableData.forEach((item) => {
                if (errorList.includes(item.host_ip)) {
                  item.result = '添加失败'
                }
                if (Object.keys(errorData).includes(item.host_ip)) {
                  item.reason = errorData[item.host_ip]
                }
              })
            }
            _this.$message.error(err.response.message || err.response.data.detail);
          }
        })
        .finally(function () {
          _this.uploading = false;
          // _this.visible = false;
          // _this.fileDataList = [];
          // _this.tableData = [];
          // _this.tableVis = false;
        });
    }
  }
};
</script>
<style scoped>
.tableHiddle {
  display: none;
}
.tableShow{
  display: revert;
}
/* /deep/ .editable-cell-text-wrapper {
  height: 32px!important;
} */
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
</style>
<style lang="less" scoped>
.upload-row {
  /deep/ .ant-form-item-label {
    line-height: 22px;
  }
  /deep/ .ant-form-item-control {
    line-height: 16px;
  }
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

.influnceIcon {
  margin-right: 10px;
}
</style>
