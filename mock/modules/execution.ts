// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.

import type { MockMethod } from 'vite-plugin-mock'

const commands = [{
  command_id: 'command-1',
  command_name: 'test',
  content: 'yum install -y --disablerepo=* --enablerepo=ILST_probe_gopher_repo gala-gopher',
  create_time: '2022-01-01 00:00:00',
  execution_user: 'root',
  timeout: '3600',
}, {
  command_id: 'command-2',
  command_name: 'test2',
  content: 'vim aaa.txt',
  create_time: '2022-01-01 00:00:00',
  execution_user: 'root',
  timeout: '3600',
}, {
  command_id: 'command-3',
  command_name: 'test3',
  content: 'rm -rf aaa.txt',
  create_time: '2022-01-01 00:00:00',
  execution_user: 'root',
  timeout: '3600',
}, {
  command_id: 'command-4',
  command_name: 'test4',
  content: 'yum install nodejs',
  create_time: '2022-01-01 00:00:00',
  execution_user: 'root',
  timeout: '3600',
}]

const commandTasks = [{
  task_id: 'task-1',
  task_name: 'task-test',
  status: 'running',
  start_time: '20240816145233',
  end_time: '20240816221726',
}, {
  task_id: 'task-2',
  task_name: 'task-test2',
  status: 'succeed',
  start_time: '20240816145233',
  end_time: '20240816149233',
}]

const scripts = [
  {
    script_id: 'script-1',
    script_name: 'script-test',
    type: 'shell',
    script_command: 'yum install -y --disablerepo=* --enablerepo=ILST_probe_gopher_repo gala-gopher',
    create_time: '2022-01-01 00:00:00',
  },
  {
    script_id: 'script-2',
    script_name: 'script-test2',
    type: 'shell',
    script_command: 'yum install -y --disablerepo=* --enablerepo=ILST_probe_gopher_repo gala-gopher',
    create_time: '2022-01-01 00:00:00',
  },
]

const queryCommands: MockMethod = {
  url: '/commands',
  timeout: 500,
  method: 'get',
  response: ({ query }) => {
    const { page, per_page } = query
    let data = commands
    if (page && per_page) {
      data = commands.slice((page - 1) * per_page, page * per_page)
    }

    return {
      code: 200,
      data: {
        commands_infos: data,
      },
      label: 'Succeed',
      message: 'operation succeed',
    }
  },
}

const getSpecificCommands: MockMethod = {
  url: '/commands/:command_id',
  method: 'get',
  response: ({ query }) => {
    const { command_id } = query

    const data = commands.find(item => item.command_id === command_id)!

    return {
      code: 200,
      data,
      label: 'Succeed',
      message: 'operation succeed',
    }
  },
}

const newCommand: MockMethod = {
  url: '/commands',
  method: 'post',
  response: ({ body }) => {
    const { command_name, content, execution_user, timeout } = body

    commands.push({
      command_id: `command-${commands.length + 1}`,
      command_name,
      content,
      create_time: '2022-01-01 00:00:00',
      execution_user,
      timeout,
    })

    return {
      code: 200,
      data: {},
      label: 'Succeed',
      message: 'operation succeed',
    }
  },
}

const updateCommand: MockMethod = {
  url: '/commands/:command_id',
  method: 'put',
  response: ({ body, query }) => {
    const { command_name, content, execution_user, timeout } = body
    const command = commands.find(item => item.command_id === query.command_id)

    if (command) {
      command.command_name = command_name
      command.content = content
      command.execution_user = execution_user
      command.timeout = timeout
    }

    return {
      code: 200,
      data: {},
      label: 'Succeed',
      message: 'operation succeed',
    }
  },
}

const deleteCommand: MockMethod = {
  url: '/commands/:command_id',
  method: 'delete',
  response: ({ query }) => {
    const commandId = query.command_id

    commands.splice(commands.findIndex(item => item.command_id === commandId), 1)
    return {
      code: 200,
      data: {},
      label: 'Succeed',
      message: 'operation succeed',
    }
  },
}

const queryCommandTasks: MockMethod = {
  url: '/tasks',
  method: 'get',
  response: ({ query }) => {
    const { page, per_page } = query
    const data = commandTasks.slice((page - 1) * per_page, page * per_page)

    return {
      code: 200,
      data: {
        tasks_infos: data,
      },
      label: 'Succeed',
      message: 'operation succeed',
    }
  },
}

const deleteCommandTasks: MockMethod = {
  url: '/tasks',
  method: 'delete',
  response: ({ body }) => {
    const taskIds = body.task_id
    commandTasks.splice(commandTasks.findIndex(item => item.task_id === taskIds), 1)
    return {
      code: 200,
      data: {},
      label: 'Succeed',
      message: 'operation succeed',
    }
  },
}

const generateTask: MockMethod = {
  url: '/tasks',
  method: 'post',
  response: ({ body }) => {
    const { name } = body
    commandTasks.unshift({
      task_id: `task-${commandTasks.length + 1}`,
      task_name: name,
      status: 'running',
      start_time: '2024-08-13 00:00:00',
      end_time: '2024-08-13 01:12:00',
    })

    return {
      code: 200,
      data: {},
      label: 'Succeed',
      message: 'operation succeed',
    }
  },
}

const deleteTask: MockMethod = {
  url: '/tasks/:task_id',
  method: 'delete',
  response: ({ query }) => {
    const taskId = query.task_id
    commandTasks.splice(commandTasks.findIndex(item => item.task_id === taskId), 1)
    return {
      code: 200,
      data: {},
      label: 'Succeed',
      message: 'operation succeed',
    }
  },
}

const queryHostByTaskId: MockMethod = {
  url: '/tasks/:task_id',
  method: 'get',
  response: () => {
    return {
      code: 200,
      data: {
        host_groups: {
          host_group_1: ['host_1', 'host_2'],
        },
        host_assets: {
          host_1: {
            node_index: 0,
          },
          host_2: {
            node_index: 0,
          },
        },
      },
      label: 'Succeed',
      message: 'operation succeed',
    }
  },
}

const queryTaskExectionResult: MockMethod = {
  url: '/tasks/host_items_result',
  method: 'post',
  timeout: 1000,
  response: () => {
    return {
      code: 200,
      data: [
        '[2024-08-14 16:19:50]: ls\n',
        'aops-zeus-master aops-zeus-master.zip bak flowtracer gala-gopher\n',
        'aops-zeus-master aops-zeus-master.zip bak flowtracer gala-gopher\n',
        'aops-zeus-master aops-zeus-master.zip bak flowtracer gala-gopher\n',
        'aops-zeus-master aops-zeus-master.zip bak flowtracer gala-gopher\n',
        'aops-zeus-master aops-zeus-master.zip bak flowtracer gala-gopher\n',
        'aops-zeus-master aops-zeus-master.zip bak flowtracer gala-gopher\n',
        'aops-zeus-master aops-zeus-master.zip bak flowtracer gala-gopher\n',
        'aops-zeus-master aops-zeus-master.zip bak flowtracer gala-gopher\n',
        'aops-zeus-master aops-zeus-master.zip bak flowtracer gala-gopher\n',
        'aops-zeus-master aops-zeus-master.zip bak flowtracer gala-gopher\n',
        'aops-zeus-master aops-zeus-master.zip bak flowtracer gala-gopher\n',
        'aops-zeus-master aops-zeus-master.zip bak flowtracer gala-gopher\n',
        'aops-zeus-master aops-zeus-master.zip bak flowtracer gala-gopher\n',
        'aops-zeus-master aops-zeus-master.zip bak flowtracer gala-gopher\n',
        'aops-zeus-master aops-zeus-master.zip bak flowtracer gala-gopher\n',
        'aops-zeus-master aops-zeus-master.zip bak flowtracer gala-gopher\n',
        'aops-zeus-master aops-zeus-master.zip bak flowtracer gala-gopher\n',
        'aops-zeus-master aops-zeus-master.zip bak flowtracer gala-gopher\n',
        'aops-zeus-master aops-zeus-master.zip bak flowtracer gala-gopher\n',
        'aops-zeus-master aops-zeus-master.zip bak flowtracer gala-gopher\n',
        'aops-zeus-master aops-zeus-master.zip bak flowtracer gala-gopher\n',
      ],
      label: 'Succeed',
      message: 'operation succeed',
    }
  },
}

// const executeTask: MockMethod = {
//   url: '/tasks/:task_id',
//   method: 'post',
//   response: () => {
//     return {
//       code: 200,
//       data: {},
//       label: 'Succeed',
//       message: 'operation succeed',
//     }
//   },
// }

const queryScripts: MockMethod = {
  url: '/scripts',
  method: 'get',
  response: ({ query }) => {
    const { page, per_page } = query
    let data = scripts
    if (page && per_page) {
      data = scripts.slice((page - 1) * per_page, page * per_page)
    }

    return {
      code: 200,
      data: {
        script_infos: data,
      },
      label: 'Succeed',
      message: 'operation succeed',
    }
  },
}

const deleteScripts: MockMethod = {
  url: '/scripts',
  method: 'delete',
  response: ({ body }) => {
    const scriptIds = body.script_id
    scripts.splice(scripts.findIndex(item => item.script_id === scriptIds), 1)
    return {
      code: 200,
      data: {},
      label: 'Succeed',
      message: 'operation succeed',
    }
  },
}

export const executionMock: Array<MockMethod> = [
  queryCommands,
  newCommand,
  updateCommand,
  deleteCommand,
  deleteCommandTasks,
  getSpecificCommands,
  queryScripts,
  queryCommandTasks,
  deleteScripts,
  generateTask,
  deleteTask,
  queryHostByTaskId,
  queryTaskExectionResult,
]
