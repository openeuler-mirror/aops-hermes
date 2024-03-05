<template>
  <div>
    <a-row type="flex" justify="space-between">
      <a-col :span="22">
        <div style="float: left; margin-bottom: 10px">
          <span>主机：{{ host.host_id }}</span>
          <span class="ip-left">{{ host.host_ip }}</span>
        </div>
        <div style="float: right; margin-bottom: 10px">
          <a-popconfirm
            title="您确定要将当前业务域的配置同步到这台主机吗?"
            ok-text="确认"
            cancel-text="取消"
            @confirm="confirm"
            @cancel="cancel"
          >
            <a-button type="primary" size="small"> <a-icon type="sync" />全部同步 </a-button>
          </a-popconfirm>
        </div>
      </a-col>
    </a-row>
    <a-row type="flex" justify="space-between">
      <a-col :span="22">
        <a-table
          rowKey="file_path"
          :columns="columns"
          :data-source="syncStatusList"
          :pagination="false"
          size="small"
          :loading="domainStatusIsLoading"
        >
          <span slot="isSynced" slot-scope="isSynced">
            <span>
              <a-icon
                v-if="isSynced === statusEnum.sync"
                type="check-circle"
                theme="twoTone"
                two-tone-color="#52c41a"
              />
              <a-icon
                v-if="isSynced === statusEnum.notSync"
                type="close-circle"
                theme="twoTone"
                two-tone-color="#f00"
              />
              <a-icon
                v-if="isSynced === statusEnum.notFound"
                type="question-circle"
                theme="twoTone"
                two-tone-color="#ccc"
              />
              {{ statusTitleEnum[isSynced] }}
            </span>
          </span>
          <span slot="action" slot-scope="record">
            <a-popconfirm
              title="您确定要同步该配置到这台主机吗?"
              ok-text="确认"
              cancel-text="取消"
              @confirm="syncConfigConfirm(record)"
              :disabled="record.isSynced !== 'NOT SYNCHRONIZE'">
              <a-button type="link" :disabled="record.isSynced !== 'NOT SYNCHRONIZE'">同步</a-button>
            </a-popconfirm>
          </span>
        </a-table>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import {STATUS_ENUM} from '../utils/statusCheckTools';
import {domainStatus, syncConf} from '@/api/configuration';

const STATUS_TITLE_ENUM = {};
STATUS_TITLE_ENUM[STATUS_ENUM.sync] = '已同步';
STATUS_TITLE_ENUM[STATUS_ENUM.notSync] = '未同步';
STATUS_TITLE_ENUM[STATUS_ENUM.notFound] = '未找到';

export default {
  name: 'GetDomainStatusDrawer',
  inject: ['onload'], // 来自祖辈们provide中声明的参数、方法
  components: {},
  data() {
    return {
      host: {},
      columns: [
        {
          title: '配置文件',
          dataIndex: 'file_path'
        },
        {
          title: '同步状态',
          dataIndex: 'isSynced',
          scopedSlots: {customRender: 'isSynced'}
        },
        {
          key: 'operation',
          title: '操作',
          scopedSlots: {customRender: 'action'}
        }
      ],
      statusEnum: STATUS_ENUM,
      statusTitleEnum: STATUS_TITLE_ENUM,
      statusData: []
    };
  },
  props: {
    domainStatusIsLoading: {
      type: Boolean,
      default: false
    },
    domainName: {
      type: String,
      default: ''
    }
  },
  computed: {
    syncStatusList() {
      return this.statusData;
    }
  },
  methods: {
    confirm(e) {
      const _this = this;
      const syncConfigs = [];
      for (const obj of _this.syncStatusList) {
        if (obj.isSynced === 'NOT SYNCHRONIZE') {
          syncConfigs.push(obj.file_path);
        }
      }
      this.syncConf(syncConfigs);
    },
    cancel(e) {},
    syncConf(syncConfigs) {
      const _this = this;
      if (syncConfigs.length === 0) {
        _this.$message.error('没有需要同步的配置文件，无需同步！');
        return;
      }
      syncConf({
        domainName: this.domainName,
        syncList: [
          {
            hostId: this.host.host_id,
            syncConfigs: syncConfigs
          }
        ]
      })
        .then((res) => {
          let message = '';
          for (const item of res) {
            const hostId = item.host_id;
            let success = '';
            let fail = '';
            const syncResult = item.syncResult;
            for (const val of syncResult) {
              if (val.result === 'SUCCESS') {
                success += val.filePath + ';' + '\xa0\xa0';
              } else {
                fail += val.filePath + ';' + '\xa0\xa0';
              }
            }
            if (success.length === 0 && fail.length !== 0) {
              message += '主机' + hostId + '\xa0\xa0\xa0' + '同步失败：' + fail;
            } else if (success.length !== 0 && fail.length === 0) {
              message += '主机' + hostId + '\xa0\xa0\xa0' + '同步成功：' + success;
            } else if (success.length !== 0 && fail.length !== 0) {
              message += '主机' + hostId + '\xa0\xa0\xa0' + '同步成功：' + success + '\xa0\xa0\xa0' + '同步失败：' + fail;
            }
          }
          if (message.includes('同步失败') && message.includes('同步成功')) {
            _this.$message.info(message);
          } else if (message.includes('同步失败') && !message.includes('同步成功')) {
            _this.$message.error(message);
          } else {
            _this.$message.success(message);
          }
          _this.getDomainStatus(this.host.host_ip);
        })
        .catch((err) => {
          _this.$message.error(err.response.message || err.response.data.detail || err.response.data.msg);
        });
    },
    syncConfigConfirm(record) {
      const syncConfigs = [];
      syncConfigs.push(record.file_path);
      this.syncConf(syncConfigs);
    },
    // 获取业务域主机同步状态
    getDomainStatus(hostIp) {
      const _this = this;
      this.domainStatusIsLoading = true;
      domainStatus(_this.domainName, hostIp)
        .then(function (res) {
          _this.statusData = res.hostStatus[0].syncStatus || [];
        })
        .catch(function (err) {
          if (err.response.code !== '404' && err.code !== 'ERR_BAD_REQUEST') {
            _this.$message.error(err.response.message || err.response.data.detail || err.message);
          }
        })
        .finally(function () {
          _this.domainStatusIsLoading = false;
        });
    }
  },
  mounted: function () {
    const _this = this;
    this.onload(function (host) {
      _this.host = host;
    });
    this.getDomainStatus(_this.host.host_ip);
  }
};
</script>

<style>
.ip-left {
  margin-left: 10px;
}
</style>
