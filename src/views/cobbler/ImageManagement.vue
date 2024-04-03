<template>
  <my-page-header-wrapper>
    <a-card :bordered="false" class="aops-theme">
      <div class="imagebox">
        <a-row class="aops-app-table-control-row">
          <a-col class="btn-class">
            <a-row type="flex" :gutter="16">
              <a-col>
                <image-upload :onSuccess="handleAddImageSuccess">
                  <a-button type="primary" slot="button"> <a-icon type="plus" />添加镜像</a-button>
                </image-upload>
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
            <a @click="deleteImage(record)">删除</a>
          </span>
        </a-table>
      </div>
    </a-card>
  </my-page-header-wrapper>
</template>

<script>
import MyPageHeaderWrapper from '@/views/utils/MyPageHeaderWrapper';
import {imageList, deleteImage} from '@/api/imageManagement';
import ImageUpload from '@/views/cobbler/ImageUpload'

export default {
  name: 'ImageManagement',
  components: {
    MyPageHeaderWrapper,
    ImageUpload
  },
  data() {
    return {
      rowKey: 'iso_name',
      tableData: [],
      tableIsLoading: false
    };
  },
  computed: {
    columns() {
      return [
        {
          dataIndex: 'iso_name',
          width: '20%',
          key: 'iso_name',
          title: '镜像文件名称',
          ellipsis: true,
          customRender: (text, record) => <a-tooltip placement="topLeft"
                                                     title={record.iso_name}>{record.iso_name}</a-tooltip>
        },
        {
          dataIndex: 'arch',
          width: '12%',
          key: 'arch',
          title: '镜像架构'
        },
        {
          dataIndex: 'iso_size',
          width: '14%',
          key: 'iso_size',
          title: '镜像文件大小'
        },
        {
          dataIndex: 'iso_sha256_value',
          width: '45%',
          key: 'iso_sha256_value',
          title: 'sha256值',
          ellipsis: true,
          customRender: (text, record) => <a-tooltip placement="topLeft"
                                                     title={record.iso_sha256_value}>{record.iso_sha256_value}</a-tooltip>
        },
        {
          key: 'operation',
          width: '9%',
          title: '操作',
          scopedSlots: {customRender: 'action'}
        }
      ];
    }
  },
  methods: {
    handleTableChange() {
      // 重新请求镜像列表
      this.getImageList();
    },
    handleAddImageSuccess() {
      this.getImageList();
    },
    // 获取镜像列表数据
    getImageList() {
      const _this = this;
      this.tableIsLoading = true;
      imageList()
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
    deleteImage(record) {
      const _this = this;
      const ISOName = record.iso_name
      let newISOName = ''
      if (ISOName.endsWith('.iso')) {
        newISOName = ISOName.substring(0, ISOName.indexOf('.iso'))
      }
      const imageList = {
        iso_name: newISOName,
        arch: record.arch
      }
      this.$confirm({
        title: (
          <div>
            <p>删除后无法恢复</p>
            <p>请确认删除以下镜像:</p>
          </div>
        ),
        content: <span>{record.iso_name}</span>,
        icon: () => <a-icon type="exclamation-circle" />,
        okType: 'danger',
        okText: '删除',
        onOk: function () {
          return _this.handleDelete(imageList);
        },
        onCancel() {}
      });
    },
    handleDelete(imageList) {
      const _this = this;
      return new Promise((resolve, reject) => {
        deleteImage(imageList)
          .then((res) => {
            if (res.code === 200) {
              _this.$message.success(res.msg);
              // 删除镜像后重置,重新请求镜像列表
              _this.getImageList();
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
      this.getImageList();
    },
    getEmpty() {
      return (
        <div class="aops-app-table-empty">
          <a-empty description="暂无镜像数据" image={require('@/assets/empty.svg')} />
        </div>
      );
    }
  },
  mounted: function () {
    this.getImageList();
  }
};
</script>

<style lang="less" scoped>
.ant-lert {
  line-height: 14px;
}
.btn-class{
  float: right;
}
</style>
