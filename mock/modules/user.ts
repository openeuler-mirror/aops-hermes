import type { MockMethod } from 'vite-plugin-mock';
import { clusters } from '../contants';

const users: any[] = [
  {
    username: 'admin',
    role_type: 'administrator',
    email: '123456789@126.com',
    clusters_num: 3,
    clusters: [],
  },
  {
    username: 'user1',
    role_type: 'normal',
    email: '9876543221@126.com',
    clusters_num: 2,
    clusters: [
      {
        cluster_id: 'uuid4',
        cluster_name: 'uuid4',
        host_groups: [
          {
            host_group_id: 'group1',
            host_group_name: 'group1',
          },
          {
            host_group_id: 'group2',
            host_group_name: 'group2',
          },
        ],
      },
      {
        cluster_id: 'uuid5',
        cluster_name: 'uuid5',
        host_groups: [
          {
            host_group_id: 'group1',
            host_group_name: 'group1',
          },
          {
            host_group_id: 'group2',
            host_group_name: 'group2',
          },
        ],
      },
    ],
  },
];

const getUserAccounts: MockMethod = {
  url: '/api/accounts',
  method: 'get',
  timeout: 200,
  response: () => {
    return {
      code: 200,
      data: {
        result: users
          .filter((i) => i.role_type !== 'administrator')
          .map(({ username, role_type, email, clusters_num }) => ({
            username,
            role_type,
            email,
            clusters_num,
          })),
        total_count: users.length,
        total_page: Math.floor(users.length / 10),
      },
      label: 'Succeed',
      message: 'operation succeed',
    };
  },
};

const getAccountPermission: MockMethod = {
  url: '/api/accounts/permission',
  method: 'get',
  timeout: 200,
  response: ({ query }) => {
    const { username } = query;

    const item = users.find((item) => item.username === username);

    return {
      code: 200,
      data:
        username === 'admin'
          ? clusters.map((item) => ({
              cluster_id: item.cluster_id,
              cluster_name: item.cluster_name,
              host_groups: item.host_groups,
            }))
          : item.clusters,
      label: 'Succeed',
      message: 'operation succeed',
    };
  },
};

const registerPermission: MockMethod = {
  url: '/api/accounts/permission',
  method: 'post',
  response: ({ body }) => {
    console.log(body);

    const { username, permission } = body;
    const user = users.find((i) => i.username === username);
    if (user) {
      user.clusters = permission.map((i) => {
        return {
          cluster_id: i.cluster_id,
          cluster_name: clusters.find((t) => t.cluster_id === i.cluster_id).cluster_name,
          host_groups: i.host_group.map((t) => ({ host_group_id: t, host_group_name: t })),
        };
      });
    }

    return {
      code: 200,
      label: 'Succeed',
      message: 'operation succeed',
    };
  },
};

const getClusters: MockMethod = {
  url: '/api/accounts/cluster',
  method: 'get',
  timeout: 200,
  response: () => {
    return {
      code: 200,
      data: clusters.map(({ cluster_id, cluster_name, cluster_ip, description, subcluster }) => ({
        cluster_id,
        cluster_name,
        cluster_ip,
        description,
        subcluster,
      })),
      label: 'Succeed',
      message: 'operation succeed',
    };
  },
};

const deleteCluster: MockMethod = {
  url: '/api/accounts/cluster',
  method: 'delete',
  timeout: 200,
  response: ({ body }) => {
    const { cluster_id } = body;
    const ind = clusters.findIndex((item) => item.cluster_id === cluster_id);
    if (ind > -1) {
      clusters.splice(ind, 1);
    }
    return {
      code: 200,
      label: 'Succeed',
      message: 'operation succeed',
    };
  },
};

const registerCluster: MockMethod = {
  url: '/api/accounts/cluster/register',
  method: 'post',
  timeout: 200,
  response: ({ body }) => {
    const { cluster_id, cluster_ip, cluster_name, description } = body;

    clusters.unshift({
      cluster_id,
      cluster_ip,
      cluster_name,
      description,
      subcluster: false,
    });
    return {
      code: 200,
      label: 'Succeed',
      message: 'operation succeed',
    };
  },
};

const getClustersWithId: MockMethod = {
  url: '/api/accounts/cluster',
  method: 'get',
  response: ({ query }) => {
    const { cluster_ids } = query;

    return {
      code: 200,
      data: clusters
        .filter((item) => cluster_ids.split(',').includes(item.cluster_id))
        .map(({ cluster_id, cluster_ip, cluster_name, description }) => ({
          cluster_id,
          cluster_name,
          cluster_ip,
          description,
        })),
      label: 'Succeed',
      message: 'operation succeed',
    };
  },
};

const updateCluster: MockMethod = {
  url: '/api/accounts/cluster',
  method: 'put',
  timeout: 200,
  response: ({ body }) => {
    const clusterInd = clusters.findIndex((item) => item.cluster_id === body.cluster_id);
    if (clusterInd > -1) clusters.splice(clusterInd, 1, body as (typeof clusters)[0]);

    return {
      code: 200,
      label: 'Succeed',
      message: 'operation succeed',
    };
  },
};

export const userMock: Array<MockMethod> = [
  getUserAccounts,
  getClusters,
  deleteCluster,
  registerCluster,
  updateCluster,
  getClustersWithId,
  getAccountPermission,
  registerPermission,
];
