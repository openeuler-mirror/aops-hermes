<template>
  <my-page-header-wrapper>
    <a-card :bordered="false" class="aops-theme">
      <div>
        <a-row class="aops-app-table-control-row" type="flex" justify="space-between">
          <a-col>
            <a-input-search placeholder="按脚本文件名称搜索" :maxLength="128" style="width: 200px" @search="onSearch" />
          </a-col>
          <a-col class="btn-class">
            <a-row type="flex" :gutter="16">
              <a-col>
                <script-upload :onSuccess="handleAddScriptSuccess">
                  <a-button type="primary">
                    <a-icon type="plus"/>
                    添加脚本
                  </a-button>
                </script-upload>
              </a-col>
              <a-col>
                <a-button @click="handleRefresh">
                  <a-icon type="redo"/>
                  刷新
                </a-button>
              </a-col>
            </a-row>
          </a-col>
        </a-row>
        <a-table
          :rowKey="rowKey"
          :columns="columns"
          :data-source="tableData"
          @change="handleTableChange"
          :loading="tableIsLoading"
          :locale="{emptyText: getEmpty}"
          :pagination="false">
          <span slot="action" slot-scope="record">
            <a @click="deleteScript(record)">删除</a>
          </span>
        </a-table>
      </div>
    </a-card>
  </my-page-header-wrapper>
</template>

<script>
import MyPageHeaderWrapper from '@/views/utils/MyPageHeaderWrapper';
import {scriptList, deleteScript} from '@/api/scriptManagement';
import ScriptUpload from '@/views/cobbler/ScriptUpload'

export default {
  name: 'ScriptManagement',
  components: {
    MyPageHeaderWrapper,
    ScriptUpload
  },
  data() {
    return {
      rowKey: 'script_name',
      tableData: [],
      tableIsLoading: false
    };
  },
  computed: {
    columns() {
      return [
        {
          dataIndex: 'script_name',
          width: '25%',
          key: 'script_name',
          title: '脚本文件名称',
          ellipsis: true,
          customRender: (text, record) => <a-tooltip placement="topLeft"
                                                     title={record.script_name}>{record.script_name}</a-tooltip>
        },
        {
          dataIndex: 'script_content',
          width: '65%',
          key: 'script_content',
          title: '脚本内容',
          ellipsis: true,
          customRender: (text, record) => <a-tooltip placement="topLeft"
                                                     title={record.script_content}>{record.script_content}</a-tooltip>
        },
        {
          key: 'operation',
          width: '10%',
          title: '操作',
          scopedSlots: {customRender: 'action'}
        }
      ];
    }
  },
  methods: {
    handleTableChange() {
      // 重新请求脚本文件列表
      this.getScriptList();
    },
    onSearch(text) {
      this.getScriptList(text);
    },
    handleAddScriptSuccess() {
      this.getScriptList();
    },
    // 获取脚本文件列表数据
    getScriptList(text) {
      const _this = this;
      this.tableIsLoading = true;
      const param = {
        script_name: text || ''
      }
      scriptList(param)
        .then(function (res) {
          _this.tableData = res || []
        })
        .catch(function (err) {
          _this.$message.error(err.response.message || err.message);
        })
        .finally(function () {
          _this.tableIsLoading = false;
        });
    },
    deleteScript(record) {
      const _this = this;
      let scriptName = record.script_name
      if (scriptName.endsWith('.sh')) {
        scriptName = scriptName.substring(0, scriptName.indexOf('.sh'))
      }

      this.$confirm({
        title: (
          <div>
            <p>删除后无法恢复</p>
            <p>请确认删除以下脚本文件:</p>
          </div>
        ),
        content: <span>{record.script_name}</span>,
        icon: () => <a-icon type="exclamation-circle"/>,
        okType: 'danger',
        okText: '删除',
        onOk: function () {
          return _this.handleDelete(scriptName);
        },
        onCancel() {
        }
      });
    },
    handleDelete(scriptName) {
      const _this = this;
      return new Promise((resolve, reject) => {
        deleteScript(scriptName)
          .then((res) => {
            if (res.code === 200) {
              _this.$message.success(res.msg);
              // 删除脚本文件后重置,重新请求脚本文件列表
              _this.getScriptList();
            } else {
              _this.$message.error(res.msg);
            }
            resolve();
          })
          .catch((err) => {
            _this.$message.error(err.response.message || err.message);
            // 业务逻辑，报错时依然关闭弹窗。因此触发resolve()
            resolve();
          });
      });
    },
    handleRefresh() {
      this.getScriptList();
    },
    getEmpty() {
      return (
        <div class="aops-app-table-empty">
          <a-empty description="暂无脚本数据" image={require('@/assets/empty.svg')}/>
        </div>
      );
    }
  },
  mounted: function () {
    this.getScriptList();
  }
};
</script>

<style lang="less" scoped>
.ant-lert {
  line-height: 14px;
}

.btn-class {
  float: right;
}
</style>
