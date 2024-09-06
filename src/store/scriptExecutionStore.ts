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
import { ref } from 'vue'
import { api } from '@/api'
import type { ScriptOperationType } from '@/api'

export const useScriptExecutionStore = defineStore('scriptExecutionStore', () => {
  const operations = ref<ScriptOperationType[]>([])

  /**
   * Retrieves the script operation types from the API and updates the `operations` value.
   *
   * @return {Promise<void>} A Promise that resolves when the operation is complete.
   */
  async function getScriptOperations(): Promise<void> {
    const [_, res] = await api.queryOperationTypes()
    if (!_ && res) {
      operations.value = res.operate_infos
    }
  }

  // onMounted(() => {
  //   getScriptOperations()
  // })

  return {
    getScriptOperations,
    operations,
  }
})
