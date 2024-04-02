<template>
  <my-page-header-wrapper>
    <a-card :bordered="false" class="aops-theme">
      <div class="ksbox">
        <a-row class="aops-app-table-control-row" type="flex" justify="space-between">
          <a-col>
            <a-input-search placeholder="按ks文件名称搜索" :maxLength="20" style="width: 200px" @search="onSearch" />
          </a-col>
          <a-col>
            <a-row type="flex" :gutter="16">
              <a-col>
                <router-link :to="{path: `kickstart-management/kickstart-create`}">
                  <a-button type="primary"> <a-icon type="plus" />添加kickstart文件 </a-button>
                </router-link>
              </a-col>
              <a-col>
                <a-button @click="handleRefresh"> <a-icon type="redo" />刷新 </a-button>
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
            <router-link :to="{name:'EditKickstart', params: { pageType: 'edit',ksInfo: record }}">编辑</router-link>
            <span> | </span>
            <a @click="deleteKs(record)">删除</a>
          </span>
        </a-table>
      </div>
    </a-card>
  </my-page-header-wrapper>
</template>

<script>
import MyPageHeaderWrapper from '@/views/utils/MyPageHeaderWrapper';
import {queryKickstartList, deleteKickstart} from '@/api/ksManagement';

export default {
  name: 'KickstartManagement',
  components: {
    MyPageHeaderWrapper
  },
  data() {
    return {
      rowKey: 'ks_name',
      tableData: [],
      tableIsLoading: false
    };
  },
  computed: {
    columns() {
      return [
        {
          dataIndex: 'ks_name',
          width: '20%',
          key: 'ks_name',
          title: '文件名称',
          ellipsis: true,
          customRender: (text, record) => <a-tooltip placement="topLeft"
                                                     title={record.ks_name}>{record.ks_name}</a-tooltip>
        },
        {
          dataIndex: 'ks_address',
          width: '25%',
          key: 'ks_address',
          title: '访问地址',
          ellipsis: true,
          customRender: (text, record) => <a-tooltip placement="topLeft"
                                                     title={record.ks_address}>{record.ks_address}</a-tooltip>
        },
        {
          dataIndex: 'ks_content',
          width: '45%',
          scopedSlots: {customRender: 'ks_content'},
          key: 'ks_content',
          title: '文件内容',
          ellipsis: true,
          customRender: (text, record) => <a-tooltip placement="topLeft"
                                                     title={record.ks_content}>{record.ks_content}</a-tooltip>
        },
        {
          key: 'operation',
          width: '10%',
          title: '操作',
          scopedSlots: {customRender: 'action'},
          align: 'center'
        }
      ];
    }
  },
  methods: {
    handleTableChange() {
      // 重新请求ks文件列表
      this.getKickstartList();
    },
    onSearch(text) {
      this.getKickstartList(text);
    },
    handleAddImageSuccess() {
      this.getKickstartList();
    },
    // 获取ks文件列表数据
    getKickstartList(argment) {
      const _this = this;
      this.tableIsLoading = true;
      const param = {
        ks_name: argment || ''
      }
      queryKickstartList(param)
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
    deleteKs(record) {
      const _this = this;
      let newKsName = ''
      const ksName = record.ks_name
      if (ksName.endsWith('.ks')) {
        newKsName = ksName.substring(0, ksName.indexOf('.ks'))
      }
      const ksList = {
        ks_name: newKsName
      }
      this.$confirm({
        title: (
          <div>
            <p>删除后无法恢复</p>
            <p>请确认删除以下kickstart文件:</p>
          </div>
        ),
        content: <span>{record.ks_name}</span>,
        icon: () => <a-icon type="exclamation-circle" />,
        okType: 'danger',
        okText: '删除',
        onOk: function () {
          return _this.handleDelete(ksList);
        },
        onCancel() {}
      });
    },
    handleDelete(ksList) {
      const _this = this;
      return new Promise((resolve, reject) => {
        deleteKickstart(ksList)
          .then((res) => {
            if (res.code === 200) {
              _this.$message.success(res.msg);
              // 删除ks文件后重置,重新请求ks文件列表
              _this.getKickstartList();
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
      this.getKickstartList();
    },
    getEmpty() {
      return (
        <div class="aops-app-table-empty">
          <a-empty description="暂无kickstart文件数据" image={require('@/assets/empty.svg')} />
        </div>
      );
    }
  },
  mounted() {
    this.getKickstartList();
  }
};
</script>

<style lang="less" scoped>
.ant-lert {
  line-height: 14px;
}
</style>
