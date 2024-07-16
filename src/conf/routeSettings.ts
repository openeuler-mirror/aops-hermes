// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.
import type { RouteRecordRaw } from 'vue-router'
import { RouterView } from 'vue-router'
import { h } from 'vue'
import {
  ApartmentOutlined,
  BugOutlined,
  DashboardOutlined,
  FormOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import Index from '@/views/Index.vue'

export const dynamicRoutes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'index',
    meta: { title: '主页', hidden: true },
    component: Index,
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: {
          title: '工作台',
          icon: h(DashboardOutlined),
        },
      },

      {
        path: '/assests',
        name: 'assests',
        redirect: '/assests/hosts',
        meta: {
          title: '资产管理',
          icon: h(FormOutlined),
        },
        children: [
          {
            path: '/assests/hosts',
            name: 'hosts',
            redirect: '/assests/hosts/hosts-management',
            meta: {
              title: '主机管理',
              desc: '对已纳管的主机进行管理。',
              hiddenChildren: true,
            },
            children: [
              {
                path: '/assests/hosts/hosts-management',
                name: 'hostManagement',
                component: () => import('@/views/assests/HostManagement.vue'),
                meta: {
                  title: '主机管理',
                  hidden: true,
                },
              },
              {
                path: '/assests/hosts/host-create',
                name: 'hostCreate',
                component: () => import('@/views/assests/HostEdition.vue'),
                meta: {
                  title: '创建主机',
                  hidden: true,
                  diyBreadcrumb: [
                    {
                      breadcrumbName: '主页',
                      path: '/',
                    },
                    {
                      breadcrumbName: '资产管理',
                      path: '/assests',
                    },
                    {
                      breadcrumbName: '主机管理',
                      path: '/assests/hosts/hosts-management',
                    },
                    {
                      breadcrumbName: '创建主机',
                      path: '/assests/hosts/host-management/host-create',
                    },
                  ],
                },
              },
              {
                path: '/assests/hosts/host-edit',
                name: 'hostEdit',
                component: () => import('@/views/assests/HostEdition.vue'),
                meta: {
                  title: '编辑主机',
                  hidden: true,
                  diyBreadcrumb: [
                    {
                      breadcrumbName: '主页',
                      path: '/',
                    },
                    {
                      breadcrumbName: '资产管理',
                      path: '/assests',
                    },
                    {
                      breadcrumbName: '主机管理',
                      path: '/assests/hosts/hosts-management',
                    },
                    {
                      breadcrumbName: '编辑主机',
                      path: '/assests/hosts/host-edit',
                    },
                  ],
                },
              },
              {
                path: '/assests/hosts/host-detail/:id',
                name: 'hostDetail',
                component: () => import('@/views/assests/HostDetail.vue'),
                meta: {
                  title: '主机详情',
                  hidden: true,
                  diyBreadcrumb: [
                    {
                      breadcrumbName: '主页',
                      path: '/',
                    },
                    {
                      breadcrumbName: '资产管理',
                      path: '/assests',
                    },
                    {
                      breadcrumbName: '主机管理',
                      path: '/assests/hosts/hosts-management',
                    },
                    {
                      breadcrumbName: '主机详情',
                      path: '/assests/hosts/host-detail/:id',
                    },
                  ],
                },
              },
            ],
          },
          {
            path: '/assests/host-group',
            name: 'hostGroup',
            redirect: '/assests/host-group/host-group-management',
            meta: {
              title: '主机组管理',
              desc: '对建立的主机组进行管理。',
              hiddenChildren: true,
            },
            children: [
              {
                path: '/assests/host-group/host-group-management',
                name: 'hostGroupManagement',
                component: () => import('@/views/assests/HostGroupManagement.vue'),
                meta: {
                  title: '主机组管理',
                  hidden: true,
                  desc: '对建立的主机组进行管理。',
                },
              },
            ],
          },
        ],
      },
      {
        path: '/vulnerability',
        name: 'vulnerability',
        redirect: '/vulnerability/cves',
        meta: {
          title: '漏洞管理',
          icon: h(BugOutlined),
        },
        children: [
          {
            path: '/vulnerability/cves',
            name: 'cves',
            redirect: '/vulnerability/cves/cves-management',
            meta: {
              title: 'CVEs',
              hiddenChildren: true,
            },
            children: [
              {
                path: '/vulnerability/cves/cves-management',
                name: 'cvesManagement',
                component: () => import('@/views/vulnerability/CVEsManagement.vue'),
                meta: {
                  title: 'CVEs',
                  hidden: true,
                },
              },
              {
                path: '/vulnerability/cves/cve-detail/:cve_id',
                name: 'cveDetail',
                component: () => import('@/views/vulnerability/CveDetail.vue'),
                meta: {
                  title: '主机详情',
                  hidden: true,
                  diyBreadcrumb: [
                    {
                      breadcrumbName: '主页',
                      path: '/',
                    },
                    {
                      breadcrumbName: '漏洞管理',
                      path: '/vulnerability/cves',
                    },
                    {
                      breadcrumbName: 'CVEs',
                      path: '/vulnerability/cves',
                    },
                    {
                      breadcrumbName: 'CVE 详情',
                      path: '/vulnerability/cves/cve-detail/:cve_id',
                      dynamic: 'cve_id',
                    },
                  ],
                },
              },
            ],
          },
          {
            path: '/vulnerability/hosts',
            name: 'vulnerabilityHosts',
            redirect: '/vulnerability/hosts/hosts-list',
            meta: {
              title: '主机列表',
              hiddenChildren: true,
            },
            children: [
              {
                path: '/vulnerability/hosts/hosts-list',
                name: 'hostsListInVulnerability',
                component: () => import('@/views/vulnerability/HostList.vue'),
                meta: {
                  title: '主机列表',
                  hidden: true,
                },
              },
              {
                path: '/vulnerability/hosts/host-detail/:host_id',
                name: 'hostsDetail',
                component: () => import('@/views/vulnerability/HostDetail.vue'),
                meta: {
                  title: '主机详情',
                  hidden: true,
                  diyBreadcrumb: [
                    {
                      breadcrumbName: '主页',
                      path: '/',
                    },
                    {
                      breadcrumbName: '漏洞管理',
                      path: '/vulnerability/cves',
                    },
                    {
                      breadcrumbName: '主机列表',
                      path: '/vulnerability/hosts',
                    },
                    {
                      breadcrumbName: '主机详情',
                      path: '/vulnerability/hosts/host-detail/:host_id',
                      dynamic: 'host_name',
                    },
                  ],
                },
              },
            ],
          },

          {
            path: '/vulnerability/tasks',
            name: 'tasks',
            component: RouterView,
            redirect: '/vulnerability/tasks/tasks-list',
            meta: {
              title: '任务',
              hiddenChildren: true,
            },
            children: [
              {
                path: '/vulnerability/tasks/tasks-list',
                name: 'tasksList',
                component: () => import('@/views/vulnerability/Tasks.vue'),
                meta: {
                  title: '任务',
                  hidden: true,
                },
              },
              {
                path: '/vulnerability/tasks/task-detail',
                name: 'tasksDetail',
                component: () => import('@/views/vulnerability/TaskDetail.vue'),
                meta: {
                  title: '任务详情',
                  hidden: true,
                  diyBreadcrumb: [
                    {
                      breadcrumbName: '主页',
                      path: '/',
                    },
                    {
                      breadcrumbName: '漏洞管理',
                      path: '/vulnerability',
                    },
                    {
                      breadcrumbName: '任务',
                      path: '/vulnerability/tasks',
                    },
                    {
                      breadcrumbName: '任务详情',
                      path: '/vulnerability/tasks/task-detail',
                    },
                  ],
                },
              },
              {
                path: '/vulnerability/tasks/task-report',
                name: 'taskReport',
                component: () => import('@/views/vulnerability/TaskReport.vue'),
                meta: {
                  title: '任务报告 ',
                  hidden: true,
                  diyBreadcrumb: [
                    {
                      breadcrumbName: '主页',
                      path: '/',
                    },
                    {
                      breadcrumbName: '漏洞管理',
                      path: '/vulnerability',
                    },
                    {
                      breadcrumbName: '任务',
                      path: '/vulnerability/tasks',
                    },
                    {
                      breadcrumbName: '任务详情',
                      path: `/vulnerability/tasks/task-detail`,
                    },
                    {
                      breadcrumbName: '任务报告',
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
      // {
      //   path: '/diagnosis',
      //   name: 'diagnosis',
      //   redirect: '/diagnosis/workflow',
      //   meta: {
      //     title: '智能诊断',
      //     icon: h(MedicineBoxOutlined),
      //   },
      //   children: [
      //     {
      //       path: '/diagnosis/workflow',
      //       name: '工作流',
      //       component: () => import('@/views/diagnosis/Workflow.vue'),
      //       meta: {
      //         title: '工作流',
      //       },
      //     },
      //     {
      //       path: '/diagnosis/alarm',
      //       name: '告警',
      //       component: () => import('@/views/diagnosis/Alarm.vue'),
      //       meta: {
      //         title: '告警',
      //       },
      //     },
      //   ],
      // },
      {
        path: '/configuration',
        name: 'configuration',
        redirect: '/configuration/domain-management',
        meta: {
          title: '配置溯源',
          icon: h(ApartmentOutlined),
        },
        children: [
          {
            path: '/configuration/domain-management',
            name: 'domain',
            redirect: '/configuration/domain-management/list',
            meta: {
              hiddenChildren: true,
              title: '业务域管理',
            },
            children: [
              {
                path: '/configuration/domain-management/list',
                name: 'domainManagement',
                component: () => import('@/views/configuration/DomainManagement.vue'),
                meta: {
                  hidden: true,
                  title: '业务域管理',
                },
              },
              {
                path: '/configuration/domain-management/detail/:domainId/:domainName/:clusterId',
                name: 'domainDetail',
                component: () => import('@/views/configuration/DomainDetail.vue'),
                meta: {
                  hidden: true,
                  title: '业务域详情',
                  diyBreadcrumb: [
                    {
                      breadcrumbName: '主页',
                      path: '/',
                    },
                    {
                      breadcrumbName: '配置溯源',
                      path: '/configuration',
                    },
                    {
                      breadcrumbName: '业务域管理',
                      path: '/configuration/domain-management',
                    },
                    {
                      breadcrumbName: '业务域详情',
                    },
                  ],
                },
              },
              {
                path: '/configuration/domain-management/conf-list/:domainId/:domainName/:clusterId',
                name: 'configurationManagement',
                component: () => import('@/views/configuration/DominConfigurations.vue'),
                meta: {
                  hidden: true,
                  title: '业务域配置管理',
                  diyBreadcrumb: [
                    {
                      breadcrumbName: '主页',
                      path: '/',
                    },
                    {
                      breadcrumbName: '配置溯源',
                      path: '/configuration',
                    },
                    {
                      breadcrumbName: '业务域管理',
                      path: '/configuration/domain-management',
                    },
                    {
                      breadcrumbName: '业务域配置管理',
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
      {
        path: '/user',
        name: 'user',
        redirect: '/user/users',
        meta: {
          title: '用户管理',
          icon: h(UserOutlined),
          permission: 'administrator',
        },
        children: [
          {
            path: '/user/users',
            name: 'users',
            redirect: '/user/users/user-management',
            meta: {
              hiddenChildren: true,
              title: '用户列表',
            },
            children: [
              {
                path: '/user/users/user-management',
                name: 'userManagement',
                component: () => import('@/views/user/UserManagement.vue'),
                meta: {
                  hidden: true,
                  title: '用户列表',
                  diyBreadcrumb: [
                    {
                      breadcrumbName: '主页',
                      path: '/',
                    },
                    {
                      breadcrumbName: '用户管理',
                      path: '/user/users',
                    },
                    {
                      breadcrumbName: '用户列表',
                      path: '/user/users',
                    },
                  ],
                },
              },
              {
                path: '/user/users/user-permission/:username',
                name: 'userPermission',
                component: () => import('@/views/user/UserPermission.vue'),
                meta: {
                  hidden: true,
                  title: '权限分配',
                  diyBreadcrumb: [
                    {
                      breadcrumbName: '主页',
                      path: '/',
                    },
                    {
                      breadcrumbName: '用户管理',
                      path: '/user/users',
                    },
                    {
                      breadcrumbName: '用户列表',
                      path: '/user/users',
                    },
                    {
                      breadcrumbName: '权限分配',
                    },
                  ],
                },
              },
            ],
          },
          {
            path: '/user/cluster',
            name: 'cluster',
            redirect: '/user/cluster/cluster-management',
            meta: {
              hiddenChildren: true,
              title: '集群列表',
            },
            children: [
              {
                path: '/user/cluster/cluster-management',
                name: 'clusterManagement',
                component: () => import('@/views/user/ClusterManagement.vue'),
                meta: {
                  hidden: true,
                  title: '集群管理',
                  diyBreadcrumb: [
                    {
                      breadcrumbName: '主页',
                      path: '/',
                    },
                    {
                      breadcrumbName: '用户管理',
                      path: '/user/users',
                    },
                    {
                      breadcrumbName: '集群管理',
                      path: '/user/cluster',
                    },

                  ],
                },
              },
              {
                path: '/user/cluster/register-cluster',
                name: 'registerCluster',
                component: () => import('@/views/user/EditCluster.vue'),
                meta: {
                  hidden: true,
                  title: '添加集群',
                  diyBreadcrumb: [
                    {
                      breadcrumbName: '主页',
                      path: '/',
                    },
                    {
                      breadcrumbName: '用户管理',
                      path: '/user/users',
                    },
                    {
                      breadcrumbName: '集群管理',
                      path: '/user/cluster',
                    },
                    {
                      breadcrumbName: '添加集群',
                    },
                  ],
                },
              },
              {
                path: '/user/cluster/edit-cluster/:clusterId',
                name: 'editCluster',
                component: () => import('@/views/user/EditCluster.vue'),
                meta: {
                  hidden: true,
                  title: '修改集群',
                  diyBreadcrumb: [
                    {
                      breadcrumbName: '主页',
                      path: '/',
                    },
                    {
                      breadcrumbName: '用户管理',
                      path: '/user/users',
                    },
                    {
                      breadcrumbName: '集群管理',
                      path: '/user/cluster',
                    },
                    {
                      breadcrumbName: '修改集群',
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  },
]

export const staticRoutes: Array<RouteRecordRaw> = [
  {
    path: '/user',
    component: () => import('@/layouts/UserLayout.vue'),
    redirect: '/user/login',
    meta: {
      title: '用户',
      hidden: true,
    },
    children: [
      {
        path: '/user/login',
        name: 'login',
        component: () => import('@/views/account/Login.vue'),
      },
      {
        path: '/user/register',
        name: 'register',
        component: () => import('@/views/account/Register.vue'),
      },
      {
        path: '/user/account',
        name: 'account',
        component: () => import('@/views/account/Account.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)',
    component: () => import('@/views/exception/404.vue'),
    meta: {
      hidden: true,
    },
  },
  {
    path: '/403',
    meta: {
      title: '403',
      hidden: true,
    },
    component: () => import('@/views/exception/403.vue'),
  },
  {
    path: '/500',
    meta: {
      title: '500',
      hidden: true,
    },
    component: () => import('@/views/exception/500.vue'),
  },
]
