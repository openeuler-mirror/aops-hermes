// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.

import type { PageNation, Sort } from '../types'
import type { Command, CommandTask, Operation, Script, ScriptOperationType, OperationTask } from './types'
import { http } from '@/api/request'

/**
 * Queries commands from the server based on the provided parameters.
 *
 * @param {Partial<PageNation> & Partial<Sort>} [params] - Optional parameters for pagination and sorting.
 * @return {Promise<{ command_info: Command[], total_count: number, total_page: number }>} - A promise that resolves to an object containing the queried commands.
 */
function queryCommands(params?: Partial<PageNation> & Partial<Sort>): Promise<[any, { command_infos: Command[], total_count: number, total_page: number } | undefined]> {
  return http.get<{
    command_infos: Command[],
    total_count: number,
    total_page: number
  }>('/operations/commands', { params })
}

/**
 * Queries a specific command from the server based on the provided command ID.
 *
 * @param {string} command_id - The ID of the command to query.
 * @return {Promise<Command>} A promise that resolves to the queried command.
 */
function querySpecificCommand(command_id: string): Promise<[any, Command | undefined]> {
  return http.get<Command>(`/operations/commands/${command_id}`)
}

/**
 * Creates a new command by sending a POST request to the '/commands' endpoint with the provided parameters.
 *
 * @param {object} params - The parameters for creating a new command.
 * @param {string} params.command_name - The name of the command.
 * @param {string} params.content - The content of the command.
 * @param {string} params.execution_user - The user who will execute the command.
 * @param {string} params.timeout - The timeout for the command execution.
 * @param {string} [params.lang] - The language of the command (optional).
 * @return {Promise} A promise that resolves to the response from the server.
 */
function createNewCommand(params: {
  command_name: string
  content: string
  execution_user?: string
  timeout: string
  lang?: string
}): Promise<[any, any]> {
  return http.post('/operations/commands', params)
}

/**
 * Updates a command by sending a PUT request to the '/commands/:command_id' endpoint with the provided parameters.
 *
 * @param {string} command_id - The ID of the command to update.
 * @param {Partial<Command>} params - The parameters for updating the command.
 * @return {Promise} A promise that resolves to the response from the server.
 */
function updateCommand(command_id: string, params: Partial<Command>): Promise<[any, unknown]> {
  return http.put(`/operations/commands/${command_id}`, params)
}

/**
 * Deletes a command by sending a DELETE request to the '/commands/:command_id' endpoint.
 *
 * @param {string} commandIds - The ID of the command to delete.
 * @return {Promise} A promise that resolves to the response from the server.
 */
function deleteCommands(commandIds: string[]): Promise<[any, unknown]> {
  return http.delete(`/operations/commands`, { command_ids: commandIds })
}

/**
 * Queries operations from the server based on the provided parameters.
 *
 * @param {Partial<PageNation> & Partial<Sort>} [params] - Optional parameters for pagination and sorting.
 * @return {Promise<{ operate_infos: Operation[]; total_count: number; total_page: number; }>} - A promise that resolves to an object containing the queried operations, total count, and total page.
 */
function queryOperations(params?: Partial<PageNation> & Partial<Sort>): Promise<[any, { operate_infos: Operation[], total_count: number, total_page: number } | undefined]> {
  return http.get<{
    operate_infos: Operation[]
    total_count: number
    total_page: number
  }>('/operations/operate', { params })
}

/**
 * Creates a new operation by sending a POST request to the '/operate' endpoint.
 *
 * @param {{operate_name: string}} params - The parameters for creating a new operation, including the operation name.
 * @return {Promise} A promise that resolves to the response from the server.
 */
function createNewOperation(params: { operate_name: string }): Promise<[any, unknown]> {
  return http.post('/operations/operate', params)
}

/**
 * Deletes operations based on the provided operate IDs.
 *
 * @param {string[]} operateIds - An array of operate IDs.
 * @return {Promise<[any, unknown]>} A promise that resolves to an array containing the response and the result.
 */
function deleteOperations(operateIds: string[]): Promise<[any, unknown]> {
  return http.delete('/operations/operate', { operate_ids: operateIds })
}

/**
 * Queries a specific operation from the server based on the provided operate ID.
 *
 * @param {string} operateId - The ID of the operation to query.
 * @return {Promise<[any, Operation | undefined]>} A promise that resolves to an array containing the response and the queried operation, or undefined if not found.
 */
function querySpecificOperate(operateId: string): Promise<[any, Operation | undefined]> {
  return http.get<Operation>(`/operations/operate/${operateId}`)
}

/**
 * Updates an existing operation by sending a PUT request to the '/operations/operate/{operateId}' endpoint.
 *
 * @param {string} operateId - The ID of the operation to update.
 * @param {{operate_name: string}} params - The parameters for updating the operation, including the operation name.
 * @return {Promise<[any, unknown]>} A promise that resolves to an array containing the response and the result.
 */
function updateOperate(operateId: string, params: { operate_name: string }): Promise<[any, unknown]> {
  return http.put(`/operations/operate/${operateId}`, params)
}

/**
 * Generates a new task by sending a POST request to the '/tasks' endpoint with the provided parameters.
 *
 * @param {object} params - The parameters for creating a new task.
 * @param {string} params.name - The name of the task.
 * @param {string[]} params.hosts - The hosts associated with the task.
 * @param {string[]} params.operates - The operations associated with the task.
 * @param {string} params.task_type - The type of the task.
 * @return {Promise} A promise that resolves to the response from the server, containing the created task's details.
 */
function generateTask(params: {
  task_name: string,
  host_ids: string[],
  action_ids: string[],
  task_type: string,
  only_push?: boolean,
  remote_path?: string,
  scheduler_info?: {
    type: 'cron' | 'single'
    params: {
      run_date: string
    } | Partial<Record<string, string>>
  }
}): Promise<[any, unknown]> {
  return http.post<{
    id: number
    name: string
    progress: number
    start_name: string
    status: number
    end_name: string
    task_type: string
    task_uuid: string
  }>('/operations/tasks', params)
}

/**
 * Deletes a task by sending a DELETE request to the '/tasks/:task_id' endpoint.
 *
 * @param {string} task_id - The ID of the task to delete.
 * @return {Promise} A promise that resolves to the response from the server.
 */
function deleteTask(task_id: string): Promise<[any, unknown]> {
  return http.delete(`/operations/tasks/${task_id}`)
}

/**
 * Retrieves host information associated with a task by sending a GET request to the '/tasks/:task_id' endpoint.
 *
 * @param {string} task_id - The ID of the task for which to retrieve host information.
 * @return {Promise} A promise that resolves to an object containing the host groups and host assets associated with the task.
 */
function queryHostByTaskId(task_id: string): Promise<[any, OperationTask | undefined]> {
  return http.get<OperationTask>(`/operations/tasks/${task_id}`)
}

/**
 * Retrieves the execution result of a task by sending a POST request to the '/operations/tasks/host_items_result' endpoint.
 *
 * @param {Object} params - An object containing the following properties:
 *   - `taskId` (string): The ID of the task.
 *   - `nodeIndex` (number, optional): The index of the node.
 *   - `caseIndex` (number, optional): The index of the case.
 *   - `taskType` (string, optional): The type of the task.
 * @return {Promise} A promise that resolves to an array of strings containing the execution result.
 */
function queryTaskExectionResult(params: { taskId: string, nodeIndex?: number, caseIndex?: number, taskType?: string }): Promise<[any, string[] | undefined]> {
  const { taskId, nodeIndex, caseIndex, taskType } = params
  return http.post<string[]>('/operations/tasks/host_items_result', { task_id: taskId, node_index: nodeIndex, case_index: caseIndex, task_type: taskType })
}
/**
 * Executes a task by sending a POST request to the '/tasks/:task_id' endpoint with the provided action.
 *
 * @param {string} task_id - The ID of the task to execute.
 * @param {string} [action] - The action to perform on the task.
 * @return {Promise} A promise that resolves to the response from the server, containing the task's details.
 */
function executeOperationTask(task_id: string, action?: 'start' | 'retry' | 'cancel'): Promise<[any, unknown]> {
  return http.post(`/operations/tasks/${task_id}`, {}, { params: { action } })
}

/**
 * Queries scripts from the server based on the provided parameters.
 *
 * @param {Partial<PageNation> & Partial<Sort>} [params] - Optional parameters for pagination and sorting.
 * @return {Promise<{ script_infos: Script[]; total_count: number; total_page: number; }>} - A promise that resolves to an object containing the queried scripts, total count, and total page.
 */
function queryScripts(params?: Partial<PageNation> & Partial<Sort>): Promise<[any, { script_infos: Script[], total_count: number, total_page: number } | undefined]> {
  return http.get<{
    script_infos: Script[]
    total_count: number
    total_page: number
  }>('/operations/scripts', { params })
}

/**
 * Creates a new script by sending a POST request to the '/operations/scripts' endpoint with the provided parameters.
 *
 * @param {object} params - An object containing the script's details, including script_name, command, timeout, execution_user, arch, os_name, and operate_id.
 * @return {Promise<string>} A promise that resolves to the response from the server.
 */
function createNewScript(params: {
  script_name: string
  command: string
  timeout: string
  execution_user?: string
  arch: string | undefined
  os_name: string | undefined
  operate_id: string | undefined
}): Promise<[any, string | undefined]> {
  return http.post<string>('/operations/scripts', params)
}

/**
 * Uploads a script file to the server.
 *
 * @param {string} scriptId - The ID of the script to upload the file to.
 * @param {FormData} files - The file to upload.
 * @return {Promise<string>} A Promise that resolves to the response from the server.
 */
function uploadScriptFile(scriptId: string, files: FormData): Promise<[any, string | undefined]> {
  return http.post<string>(`/operations/scripts/${scriptId}`, files, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
}

/**
 * Updates a script on the server with the provided parameters.
 *
 * @param {string} script_id - The ID of the script to update.
 * @param {Partial<Script>} params - An object containing the updated script details.
 * @return {Promise<string>} A promise that resolves to the response from the server.
 */
function updateScript(script_id: string, params: Partial<Script>): Promise<[any, string | undefined]> {
  return http.put(`/operations/scripts/${script_id}`, params)
}

/**
 * Queries a specific script from the server based on the provided script ID.
 *
 * @param {string} scriptId - The ID of the script to query.
 * @return {[any, Script | undefined]} The queried script.
 */
function querySpecificScript(scriptId: string): Promise<[any, Script | undefined]> {
  return http.get<Script>(`/operations/scripts/${scriptId}`)
}

/**
 * Deletes a script from the server.
 *
 * @param {string} scriptIds - The ID of the script to delete.
 * @return {Promise<any>} A promise that resolves when the script is deleted successfully.
 */
function deleteScript(scriptIds: string[]): Promise<[any, any | undefined]> {
  return http.delete(`/operations/scripts`, { script_ids: scriptIds })
}

/**
 * Queries operation types from the server based on the provided parameters.
 *
 * @param {Partial<PageNation> & Partial<Sort>} [params] - Optional parameters for pagination and sorting.
 * @return {Promise<{ operate_infos: ScriptOperationType[]; total_count: number; total_page: number; }>} - A promise that resolves to an object containing the queried operation types, total count, and total page.
 */
function queryOperationTypes(params?: Partial<PageNation> & Partial<Sort>): Promise<[any, { operate_infos: ScriptOperationType[], total_count: number, total_page: number } | undefined]> {
  return http.get<{
    operate_infos: ScriptOperationType[]
    total_count: number
    total_page: number
  }>('/operations/operate', { params })
}

/**
 * Queries command tasks from the server based on the provided parameters.
 *
 * @param {object} params - An object containing optional parameters for filtering and sorting.
 * @param {string} params.task_type - The type of the task to query.
 * @param {Partial<PageNation>} params - An object containing optional parameters for pagination.
 * @param {Partial<Sort>} params - An object containing optional parameters for sorting.
 * @return {Promise<{ task_infos: CommandTask[]; total_count: number; total_page: number; }>} - A promise that resolves to an object containing the queried command tasks, total count, and total page.
 */
function queryCommandTasks(params: { task_type?: string } & Partial<PageNation> & Partial<Sort>): Promise<[any, { task_infos: CommandTask[], total_count: number, total_page: number } | undefined]> {
  return http.get<{
    task_infos: CommandTask[]
    total_count: number
    total_page: number
  }>('/operations/tasks', { params })
}

/**
 * Deletes command tasks by sending a DELETE request to the '/operations/tasks' endpoint.
 *
 * @param {string[]} taskIds - An array of task IDs to delete.
 * @return {Promise} A promise that resolves to the response from the server.
 */
function deleteCommandTasks(taskIds: string[]): Promise<[any, any | undefined]> {
  return http.delete('/operations/tasks', { task_ids: taskIds })
}


/**
 * Query the system information from the server.
 *
 * @return {Promise<{ os_aarch: string[]; os_name: string[]; }>} - A promise that resolves to an object containing the supported architectures and operating systems.
 */
function querySystemInfo(): Promise<[any, { os_aarch: string[], os_name: string[] } | undefined]> {
  return http.get<{
    os_aarch: string[]
    os_name: string[]
  }>('/operations/scripts/support_info')
}

function quyerTaskInfoByTaskId(taskId: string): Promise<[any, any | undefined]> {
  return http.get(`/operations/tasks/${taskId}`)
}

function updateOperateTask(taskId: string, schedulerInfo?: {
  type: 'cron' | 'single'
  params: {
    run_date: string
  } | Partial<Record<string, string>>
}) {
  return http.patch(`/operations/tasks`, { task_id: taskId, scheduler_info: schedulerInfo })
}

export * from './types'
export const exectionApi = {
  queryScripts,
  updateScript,
  deleteScript,
  queryCommands,
  querySpecificCommand,
  createNewCommand,
  updateCommand,
  deleteCommands,
  deleteCommandTasks,
  queryCommandTasks,
  generateTask,
  queryOperationTypes,
  deleteTask,
  executeOperationTask,
  queryHostByTaskId,
  queryTaskExectionResult,
  queryOperations,
  createNewOperation,
  deleteOperations,
  querySpecificOperate,
  updateOperate,
  createNewScript,
  uploadScriptFile,
  querySpecificScript,
  querySystemInfo,
  quyerTaskInfoByTaskId,
  updateOperateTask
}
