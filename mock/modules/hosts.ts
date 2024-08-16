import type { MockMethod } from 'vite-plugin-mock'
import dayjs from 'dayjs'
import { clusters, host_group_infos, host_infos } from '../contants'

/**
 * get host count request mock
 */
const getHostCount: MockMethod = {
  url: '/api/hosts/count',
  method: 'get',
  response: () => {
    return {
      code: 200,
      data: {
        host_count: 0,
      },
      label: 'Succeed',
      message: 'operation succeed',
    }
  },
}
/**
 * get host alarms count request mock
 */
const getHostAlarms: MockMethod = {
  url: '/api/check/result/total/count',
  method: 'get',
  response: () => {
    return {
      code: 200,
      data: {
        count: 0,
      },
      label: 'Succeed',
      message: 'operation succeed',
    }
  },
}
/**
 * get host list request mock
 */
const getHosts: MockMethod = {
  url: '/api/hosts',
  timeout: 200,
  method: 'get',
  response: ({ query }) => {
    const { page, per_page, search_key, management } = query
    const host_group_list = query.host_group_list
    const cluster_list = query.cluster_list
    let filteredList = host_infos.filter((item) => {
      if (!search_key)
        return true
      return item.host_name.includes(search_key) || item.host_ip.includes(search_key)
    })
    if (management !== undefined)
      filteredList = filteredList.filter(item => item.management === Boolean(management))

    if (host_group_list && host_group_list.length !== 0)
      filteredList = filteredList.filter(item => host_group_list.includes(item.host_group_id))

    if (cluster_list && cluster_list.length !== 0)
      filteredList = filteredList.filter(item => cluster_list.includes(item.cluster_id))

    const paginationHosts
      = !page || !per_page
        ? filteredList
        : filteredList.slice((page - 1) * per_page, page * per_page)
    return {
      code: 200,
      data: {
        host_infos: paginationHosts.map(
          ({
            host_id,
            host_ip,
            host_name,
            management,
            os_version,
            cluster_id,
            cluster_name,
            scene,
            ssh_port,
            host_group_name,
          }) => {
            return {
              host_id,
              host_ip,
              host_name,
              management,
              os_version,
              cluster_id,
              cluster_name,
              scene,
              ssh_port,
              host_group_name,
            }
          },
        ),
        total_count: filteredList.length,
        total_page: Math.ceil(filteredList.length / per_page),
      },
      label: 'Succeed',
      message: 'operation succeed',
    }
  },
}
const getHostById: MockMethod = {
  url: '/api/hosts/:host_id',
  timeout: 200,
  method: 'get',
  response: ({ query }) => {
    const { host_name, host_ip, cluster_id, host_group_name, ssh_port, ssh_user, management }
      = host_infos.find(h => h.host_id === query.host_id)!

    return {
      code: 200,
      data: {
        host_name,
        host_ip,
        cluster_id,
        host_group_id: host_group_infos.find(i => i.host_group_name === host_group_name)
          ?.host_group_id,
        ssh_port,
        ssh_user,
        management,
      },
      label: 'Succeed',
      message: 'operation succeed',
    }
  },
}
/**
 * get hosts status by host ids
 */
const getHostStatusByIds: MockMethod = {
  url: '/api/hosts/status',
  method: 'get',
  timeout: 1000,
  response: ({ query }) => {
    const { host_ids } = query

    return {
      code: 200,
      data: host_infos
        .filter(item => host_ids.includes(item.host_id))
        .map(item => ({
          host_id: item.host_id,
          status: item.status,
        })),
      label: 'Succeed',
      message: 'operation succeed',
    }
  },
}

/**
 * query host group request mock
 */
const getHostGroups: MockMethod = {
  url: '/api/hosts/group',
  timeout: 400,
  method: 'get',
  response: ({ query }) => {
    const { page, per_page, cluster_ids } = query

    let filteredGroups = host_group_infos
    if (cluster_ids)
      filteredGroups = filteredGroups.filter(i => cluster_ids.includes(i.cluster_id))

    const paginationGroups
      = page && per_page
        ? filteredGroups.slice((page - 1) * per_page, page * per_page)
        : filteredGroups

    return {
      code: 200,
      data: {
        host_group_infos: paginationGroups,
        total_count: filteredGroups.length,
        total_page: Math.ceil(filteredGroups.length / per_page),
      },
      label: 'Succeed',
      message: 'operation succeed',
    }
  },
}

// #region -------------------------- < distribution > --------------------------
const deleteHostGroups: MockMethod = {
  url: '/api/distribute/hosts/group',
  method: 'delete',
  timeout: 300,
  response: ({ body }) => {
    const host_group_list = Object.values(body).flatMap(cluster => cluster.host_group_ids)

    host_group_list.forEach((name) => {
      const ind = host_group_infos.findIndex(item => item.host_group_name === name)
      if (ind !== -1)
        host_group_infos.splice(ind, 1)
    })

    return {
      code: 200,
      label: 'Succeed',
      message: 'operation succeed',
    }
  },
}
const addHostGroup: MockMethod = {
  url: '/api/distribute/hosts/group',
  method: 'post',
  timeout: 300,
  response: ({ body }) => {
    const { description, host_group_name, cluster_id } = Object.values(body)[0]

    host_group_infos.push({
      host_group_id: `group${host_group_infos.length}`,
      host_group_name,
      description,
      host_count: 0,
      cluster_id,
      cluster_name: cluster_id,
    })
    return {
      code: 200,
      label: 'Succeed',
      message: 'operation succeed',
    }
  },
}
/**
 * generate new host request mock
 */
const createNewHost: MockMethod = {
  url: '/api/distribute/hosts',
  method: 'post',
  response: ({ body }) => {
    const cluster_id = Object.keys(body)[0]
    const {
      host_group_id,
      host_ip,
      host_name,
      management,
      ssh_port,
      ssh_user,
      password,
      ssh_pkey,
    } = Object.values(body)[0]
    host_infos.push({
      host_id: `host${host_infos.length + 1}`,
      host_ip,
      host_name,
      management,
      os_version: null,
      cluster_id,
      cluster_name: clusters.find(i => i.cluster_id === cluster_id).cluster_name,
      scene: '',
      ssh_port,
      ssh_user,
      host_group_name: host_group_infos.find(item => item.host_group_id === host_group_id)!
        .host_group_name,
      host_group_id,
      status: 2,
      password,
      ssh_pkey,
      last_scan: dayjs().date(),
    })
    return {
      code: 200,
      label: 'Succeed',
      message: 'operation succeed',
    }
  },
}
/**
 * update host info
 */
const updateHost: MockMethod = {
  url: '/api/distribute/hosts/:host_id',
  method: 'put',
  timeout: 500,
  response: ({ query, body }) => {
    const ind = host_infos.findIndex(i => i.host_id === query.host_id)!
    host_infos[ind] = { ...host_infos[ind], ...body[Object.keys(body)[0]] }

    return {
      code: 200,
      label: 'Succeed',
      message: 'operation succeed',
    }
  },
}
/**
 * delete host
 */
const deleteHost: MockMethod = {
  url: '/api/distribute/hosts',
  method: 'delete',
  timeout: 500,
  response: ({ body }) => {
    const host_list = Object.values(body).flatMap(host => host.host_id)

    host_list.forEach((name) => {
      const ind = host_infos.findIndex(item => item.host_id === name)
      if (ind !== -1)
        host_infos.splice(ind, 1)
    })
    return {
      code: 200,
      label: 'Succeed',
      message: 'operation succeed',
    }
  },
}
//#

export const hostMock: Array<MockMethod> = [
  getHostCount,
  getHosts,
  getHostStatusByIds,
  getHostAlarms,
  createNewHost,
  getHostGroups,
  deleteHostGroups,
  addHostGroup,
  getHostById,
  updateHost,
  deleteHost,
]