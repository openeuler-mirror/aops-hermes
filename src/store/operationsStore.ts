// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.

import { defineStore } from 'pinia'
import { onMounted, ref } from 'vue'
import type { Operation } from '@/api'
import { api } from '@/api'

export const useOperationsStore = defineStore('operationsStore', () => {
  const operations = ref<Operation[]>([])

  async function queryOperations() {
    const [_, res] = await api.queryOperations()
    if (res) {
      operations.value = res.operate_infos
    }
  }

  onMounted(() => {
    queryOperations()
  })

  return { operations, queryOperations }
})
