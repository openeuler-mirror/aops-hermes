<script lang="ts" setup>
import { DownOutlined } from '@ant-design/icons-vue'
import { onMounted, ref } from 'vue'
import AddDomainModal from './components/AddDomainModal.vue'
import PageWrapper from '@/components/PageWrapper.vue'
import type { Domain } from '@/api'
import { api } from '@/api'

const domains = ref<Domain[]>([])

async function queryDomains() {
  const [, res] = await api.getDomains()
  if (res)
    domains.value = [...[{ domainName: 'add' }], ...res]
}
onMounted(() => {
  queryDomains()
})
</script>

<template>
  <PageWrapper>
    <a-card>
      <div>
        <h3 class="card-title">
          业务域列表
        </h3>
        <span>共有业务域{{ 1 }}个</span>
      </div>
      <a-list
        :grid="{ gutter: 24, xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }"
        :data-source="domains"
      >
        <template #renderItem="{ item, index }">
          <a-list-item style="padding: 0">
            <a-card :body-style="{ padding: 0 }" class="domain-card">
              <template v-if="index === 0">
                <AddDomainModal />
              </template>
              <div v-else>
                <router-link :to="`/configuration/domain-management/detail/${item.domainName}`">
                  <div class="domain-card-title">
                    <h3>{{ `业务域 ${item.domainName}` }}</h3>
                  </div>
                </router-link>
                <a-row
                  type="flex"
                  justify="space-between"
                  align="middle"
                  class="domain-card-operate"
                >
                  <a-col> priority </a-col>
                  <a-col>
                    <a-space style="font-size: 12px">
                      <router-link :to="`/configuration/domain-configurations/${item.domainName}`">
                        查看域内配置
                      </router-link>
                      <a-divider type="vertical" />
                      <a-dropdown>
                        <a @click.prevent>
                          更多
                          <DownOutlined />
                        </a>
                        <template #overlay>
                          <a-menu>
                            <a-menu-item>
                              <a>添加主机</a>
                            </a-menu-item>
                            <a-menu-item>
                              <a>删除</a>
                            </a-menu-item>
                          </a-menu>
                        </template>
                      </a-dropdown>
                    </a-space>
                  </a-col>
                </a-row>
              </div>
            </a-card>
          </a-list-item>
        </template>
      </a-list>
    </a-card>
  </PageWrapper>
</template>

<style lang="less" scoped>
.card-title {
  display: inline-block;
  margin-right: 10px;
}
.domain-card {
  border-radius: 4px;
  height: 140px;
  &:hover {
    box-shadow: 0px 0px 10px rgba(87, 113, 219, 0.45);
  }
  &-title {
    color: #000000;
    height: 100px;
    border-bottom: 1px solid #eee;
    padding: 12px;
  }
  &-operate {
    height: 40px;
    padding: 0 12px;
    font-size: 8px;
  }
}
</style>
