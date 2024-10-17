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
  MessageOutlined,
  PlaySquareOutlined,
} from '@ant-design/icons-vue'
import Index from '@/views/Index.vue'
import Copilot from '@/views/Copilot.vue'

export const dynamicRoutes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'index',
    meta: { title: 'router.index', hidden: true },
    component: Index,
    redirect: '/dashboard',
    children: [
      // {
      //   path: '/eulercopilot',
      //   name: 'eulercopilot',
      //   component: Copilot,
      //   meta: {
      //     title: 'router.copilot',
      //     icon: h(MessageOutlined),
      //   },
      // },
      {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: {
          title: 'router.dashboard',
          icon: h(DashboardOutlined),
        },
      },
      {
        path: '/assests',
        name: 'assests',
        redirect: '/assests/hosts',
        meta: {
          title: 'router.assests.self',
          icon: h(FormOutlined),
        },
        children: [
          {
            path: '/assests/hosts',
            name: 'hosts',
            redirect: '/assests/hosts/hosts-management',
            meta: {
              title: 'router.assests.hostsManagement',
              hiddenChildren: true,
            },
            children: [
              {
                path: '/assests/hosts/hosts-management',
                name: 'hostManagement',
                component: () => import('@/views/assests/HostManagement.vue'),
                meta: {
                  title: 'router.assests.hostsManagement',
                  desc: 'router.assests.sentence.hostManagement',
                  hidden: true,
                },
              },
              {
                path: '/assests/hosts/host-create',
                name: 'hostCreate',
                component: () => import('@/views/assests/HostEdition.vue'),
                meta: {
                  title: 'router.assests.createHost',
                  hidden: true,
                  diyBreadcrumb: [
                    {
                      breadcrumbName: 'router.index',
                      path: '/',
                    },
                    {
                      breadcrumbName: 'router.assests.self',
                      path: '/assests',
                    },
                    {
                      breadcrumbName: 'router.assests.hostsManagement',
                      path: '/assests/hosts/hosts-management',
                    },
                    {
                      breadcrumbName: 'router.assests.createHost',
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
                  title: 'router.assests.editHost',
                  hidden: true,
                  diyBreadcrumb: [
                    {
                      breadcrumbName: 'router.index',
                      path: '/',
                    },
                    {
                      breadcrumbName: 'router.assests.self',
                      path: '/assests',
                    },
                    {
                      breadcrumbName: 'router.assests.hostsManagement',
                      path: '/assests/hosts/hosts-management',
                    },
                    {
                      breadcrumbName: 'router.assests.editHost',
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
                  title: 'router.assests.hostDetail',
                  hidden: true,
                  diyBreadcrumb: [
                    {
                      breadcrumbName: 'router.index',
                      path: '/',
                    },
                    {
                      breadcrumbName: 'router.assests.self',
                      path: '/assests',
                    },
                    {
                      breadcrumbName: 'router.assests.hostsManagement',
                      path: '/assests/hosts/hosts-management',
                    },
                    {
                      breadcrumbName: 'router.assests.hostDetail',
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
              title: 'router.assests.hostGroupManagement',
              hiddenChildren: true,
            },
            children: [
              {
                path: '/assests/host-group/host-group-management',
                name: 'hostGroupManagement',
                component: () => import('@/views/assests/HostGroupManagement.vue'),
                meta: {
                  title: 'router.assests.hostGroupManagement',
                  hidden: true,
                  desc: 'router.assests.sentence.hostGroupManagement',
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
          title: 'router.vulnerability.self',
          icon: h(BugOutlined),
        },
        children: [
          {
            path: '/vulnerability/cves',
            name: 'cves',
            redirect: '/vulnerability/cves/cves-management',
            meta: {
              title: 'router.vulnerability.cves',
              hiddenChildren: true,
            },
            children: [
              {
                path: '/vulnerability/cves/cves-management',
                name: 'cvesManagement',
                component: () => import('@/views/vulnerability/CVEsManagement.vue'),
                meta: {
                  title: 'router.vulnerability.cves',
                  hidden: true,
                },
              },
              {
                path: '/vulnerability/cves/cve-detail/:cve_id',
                name: 'cveDetail',
                component: () => import('@/views/vulnerability/CveDetail.vue'),
                meta: {
                  title: 'router.vulnerability.hostDetail',
                  hidden: true,
                  diyBreadcrumb: [
                    {
                      breadcrumbName: 'router.index',
                      path: '/',
                    },
                    {
                      breadcrumbName: 'router.vulnerability.self',
                      path: '/vulnerability/cves',
                    },
                    {
                      breadcrumbName: 'router.vulnerability.cves',
                      path: '/vulnerability/cves',
                    },
                    {
                      breadcrumbName: 'router.vulnerability.cveDetail',
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
              title: 'router.vulnerability.host',
              hiddenChildren: true,
            },
            children: [
              {
                path: '/vulnerability/hosts/hosts-list',
                name: 'hostsListInVulnerability',
                component: () => import('@/views/vulnerability/HostList.vue'),
                meta: {
                  title: 'router.vulnerability.host',
                  hidden: true,
                },
              },
              {
                path: '/vulnerability/hosts/host-detail/:host_id',
                name: 'hostsDetail',
                component: () => import('@/views/vulnerability/HostDetail.vue'),
                meta: {
                  title: 'router.vulnerability.hostDetail',
                  hidden: true,
                  diyBreadcrumb: [
                    {
                      breadcrumbName: 'router.index',
                      path: '/',
                    },
                    {
                      breadcrumbName: 'router.vulnerability.self',
                      path: '/vulnerability/cves',
                    },
                    {
                      breadcrumbName: 'router.vulnerability.host',
                      path: '/vulnerability/hosts',
                    },
                    {
                      breadcrumbName: 'router.vulnerability.hostDetail',
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
              title: 'router.vulnerability.task',
              hiddenChildren: true,
            },
            children: [
              {
                path: '/vulnerability/tasks/tasks-list',
                name: 'tasksList',
                component: () => import('@/views/vulnerability/Tasks.vue'),
                meta: {
                  title: 'router.vulnerability.task',
                  hidden: true,
                },
              },
              {
                path: '/vulnerability/tasks/task-detail',
                name: 'tasksDetail',
                component: () => import('@/views/vulnerability/TaskDetail.vue'),
                meta: {
                  title: 'router.vulnerability.taskDetail',
                  hidden: true,
                  diyBreadcrumb: [
                    {
                      breadcrumbName: 'router.index',
                      path: '/',
                    },
                    {
                      breadcrumbName: 'router.vulnerability.self',
                      path: '/vulnerability',
                    },
                    {
                      breadcrumbName: 'router.vulnerability.task',
                      path: '/vulnerability/tasks',
                    },
                    {
                      breadcrumbName: 'router.vulnerability.taskDetail',
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
                  title: 'router.vulnerability.taskReport',
                  hidden: true,
                  diyBreadcrumb: [
                    {
                      breadcrumbName: 'router.index',
                      path: '/',
                    },
                    {
                      breadcrumbName: 'router.vulnerability.self',
                      path: '/vulnerability',
                    },
                    {
                      breadcrumbName: 'router.vulnerability.task',
                      path: '/vulnerability/tasks',
                    },
                    {
                      breadcrumbName: 'router.vulnerability.taskDetail',
                      path: `/vulnerability/tasks/task-detail`,
                    },
                    {
                      breadcrumbName: 'router.vulnerability.taskReport',
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
          title: 'router.configuration.self',
          icon: h(ApartmentOutlined),
        },
        children: [
          {
            path: '/configuration/domain-management',
            name: 'domain',
            redirect: '/configuration/domain-management/list',
            meta: {
              hiddenChildren: true,
              title: 'router.configuration.domain',
            },
            children: [
              {
                path: '/configuration/domain-management/list',
                name: 'domainManagement',
                component: () => import('@/views/configuration/DomainManagement.vue'),
                meta: {
                  hidden: true,
                  title: 'router.configuration.domain',
                },
              },
              {
                path: '/configuration/domain-management/detail/:domainId/:domainName/:clusterId',
                name: 'domainDetail',
                component: () => import('@/views/configuration/DomainDetail.vue'),
                meta: {
                  hidden: true,
                  title: 'router.configuration.domainDetail',
                  diyBreadcrumb: [
                    {
                      breadcrumbName: 'router.index',
                      path: '/',
                    },
                    {
                      breadcrumbName: 'router.configuration.self',
                      path: '/configuration',
                    },
                    {
                      breadcrumbName: 'router.configuration.domain',
                      path: '/configuration/domain-management',
                    },
                    {
                      breadcrumbName: 'router.configuration.domainDetail',
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
                  title: 'router.configuration.configurationManagement',
                  diyBreadcrumb: [
                    {
                      breadcrumbName: 'router.index',
                      path: '/',
                    },
                    {
                      breadcrumbName: 'router.configuration.self',
                      path: '/configuration',
                    },
                    {
                      breadcrumbName: 'router.configuration.domain',
                      path: '/configuration/domain-management',
                    },
                    {
                      breadcrumbName: 'router.configuration.configurationManagement',
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
      {
        path: '/execution',
        name: 'execution',
        redirect: '/execution/command-management',
        meta: {
          title: 'router.execution.self',
          icon: h(PlaySquareOutlined),
        },
        children: [
          {
            path: '/execution/command-management',
            name: 'commandManagement',
            component: () => import('@/views/execution/CommandManagement.vue'),
            meta: {
              title: 'router.execution.commamdManagement',
            },
          },
          {
            path: '/execution/script-management',
            name: 'scriptManagement',
            component: () => import('@/views/execution/ScriptManagement.vue'),
            meta: {
              title: 'router.execution.scriptManagement',
            },
          },
        ],
      },
      {
        path: '/user',
        name: 'user',
        redirect: '/user/users',
        meta: {
          title: 'router.user.self',
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
              title: 'router.user.users',
            },
            children: [
              {
                path: '/user/users/user-management',
                name: 'userManagement',
                component: () => import('@/views/user/UserManagement.vue'),
                meta: {
                  hidden: true,
                  title: 'router.user.users',
                  diyBreadcrumb: [
                    {
                      breadcrumbName: 'router.index',
                      path: '/',
                    },
                    {
                      breadcrumbName: 'router.user.self',
                      path: '/user/users',
                    },
                    {
                      breadcrumbName: 'router.user.users',
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
                  title: 'router.user.userPermission',
                  diyBreadcrumb: [
                    {
                      breadcrumbName: 'router.index',
                      path: '/',
                    },
                    {
                      breadcrumbName: 'router.user.self',
                      path: '/user/users',
                    },
                    {
                      breadcrumbName: 'router.user.users',
                      path: '/user/users',
                    },
                    {
                      breadcrumbName: 'router.user.userPermission',
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
              title: 'router.user.cluster',
            },
            children: [
              {
                path: '/user/cluster/cluster-management',
                name: 'clusterManagement',
                component: () => import('@/views/user/ClusterManagement.vue'),
                meta: {
                  hidden: true,
                  title: 'router.user.clusterManagement',
                  diyBreadcrumb: [
                    {
                      breadcrumbName: 'router.index',
                      path: '/',
                    },
                    {
                      breadcrumbName: 'router.user.self',
                      path: '/user/users',
                    },
                    {
                      breadcrumbName: 'router.user.clusterManagement',
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
                  title: 'router.user.registerCluster',
                  diyBreadcrumb: [
                    {
                      breadcrumbName: 'router.index',
                      path: '/',
                    },
                    {
                      breadcrumbName: 'router.user.self',
                      path: '/user/users',
                    },
                    {
                      breadcrumbName: 'router.user.clusterManagement',
                      path: '/user/cluster',
                    },
                    {
                      breadcrumbName: 'router.user.registerCluster',
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
                  title: 'router.user.editCluster',
                  diyBreadcrumb: [
                    {
                      breadcrumbName: 'router.index',
                      path: '/',
                    },
                    {
                      breadcrumbName: 'router.user.self',
                      path: '/user/users',
                    },
                    {
                      breadcrumbName: 'router.user.clusterManagement',
                      path: '/user/cluster',
                    },
                    {
                      breadcrumbName: 'router.user.editCluster',
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
      title: 'router.account.self',
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
      {
        path: '/user/auth',
        name: 'auth',
        component: () => import('@/views/account/Auth.vue'),
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
    path: '/error',
    meta: {
      title: '500',
      hidden: true,
    },
    component: () => import('@/views/exception/500.vue'),
  },
]
