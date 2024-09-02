// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.
// #region ---------------------------------------------< user request params >---------------------------------------------
export interface ScriptOperationType {
  operate_id: string
  create_time: string
  operate_name: string
}

export interface Script {
  arch: string
  command: string
  create_time: string
  execution_user: string
  os_name: string
  script_id: string
  script_name: string
  timeout: string
  operate_id: string
}

export interface Command {
  command_id: string
  content: string
  command_name: string
  create_time: string
  timeout: string
  execution_user: string
  lang?: string
}

export interface Operation {
  operate_id: string
  operate_name: string
  create_time: string
}

export interface OperationTask {
  task_id: string
  task_name: string
  task_type: string
  start_time: string
  end_time: string
  status?: string
  task_detail: string
  host_ids: string[]
}

export interface CommandTask {
  task_id: string
  task_name: string
  start_time: string
  status?: string
  duration?: number
}
