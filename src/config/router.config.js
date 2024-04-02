// eslint-disable-next-line
import {UserLayout, BasicLayout} from '@/vendor/ant-design-pro/layouts';

const RouteView = {
  name: 'RouteView',
  render: (h) => h('router-view')
};

const routeMap = {
  /**
   *  @title: 路由名称。通过i18nRender转换成不同语种
   *  @path: 路由链接
   */
  index: {
    title: 'menu.home',
    path: '/'
  },
  assests: {
    title: 'menu.assests',
    path: '/assests',
    children: {
      hostView: {
        title: 'menu.assests.hosts-management',
        path: '/assests/hosts-management',
        children: {
          HostsManagement: {
            title: 'menu.assests.hosts-management',
            path: '/assests/hosts-management'
          },
          CreateHost: {
            title: 'menu.assests.create-host',
            path: '/assests/hosts-management/host-create'
          },
          EditHost: {
            title: 'menu.assests.edit-host',
            path: '/assests/hosts-management/host-edit'
          }
        }
      },
      hostgroupView: {
        title: 'menu.assests.host-group-management',
        path: '/assests/host-group-management'
      }
    }
  },
  diagnosis: {
    title: 'menu.diagnosis',
    path: '/diagnosis',
    children: {
      DiagnosisWorkflow: {
        title: 'menu.diagnosis.diagnosis-workflow',
        path: '/diagnosis/workflow/redirect',
        children: {
          MainView: {
            title: 'menu.diagnosis.diagnosis-workflow',
            path: '/diagnosis/workflow'
          },
          workflowDetail: {
            title: 'menu.diagnosis.diagnosis-workflow.detail',
            path: '/diagnosis/workflow/:workflowId'
          },
          appTemplate: {
            title: 'menu.diagonsis.app-template',
            path: '/diagnosis/app/:appId'
          }
        }
      },
      AbnormalAlert: {
        title: 'menu.diagnosis.abnormal-alert',
        path: '/diagnosis/alert'
      }
    }
  },
  configuration: {
    title: 'menu.configuration',
    path: '/configuration',
    children: {
      TranscationDomainView: {
        title: 'menu.configuration.transcation-domain-view',
        path: '/configuration/transcation-domain-management',
        children: {
          TranscationDomainManagement: {
            title: 'menu.configuration.transcation-domain-management',
            path: '/configuration/transcation-domain-management/list'
          },
          TranscationDomainDetail: {
            title: 'menu.configuration.transcation-domain-management.detail',
            path: '/configuration/transcation-domain-management/:domainName'
          }
        }
      },
      TranscationDomainConfigurations: {
        title: 'menu.configuration.transcation-domain-configurations',
        path: '/configuration/transcation-domain-configurations'
      },
      TranscationDomainConfigurationsDetail: {
        title: 'menu.configuration.transcation-domain-configurations',
        path: '/configuration/transcation-domain-configurations/:domainName'
      }
    }
  },
  cobblerManagement: {
    title: 'menu.cobblerManagement',
    path: '/cobblerManagement',
    children: {
      imageView: {
        title: 'menu.cobblerManagement.images-management',
        path: '/cobbler/images-management',
        children: {
          ImagesManagement: {
            title: 'menu.cobblerManagement.images-management',
            path: '/cobbler/images-management'
          }
        }
      },
      ksFileView: {
        title: 'menu.cobblerManagement.kickstart-management',
        path: '/cobbler/kickstart-management',
        children: {
          KickstartsManagement: {
            title: 'menu.cobblerManagement.kickstart-management',
            path: '/cobbler/kickstart-management'
          },
          CreateKickstart: {
            title: 'menu.cobblerManagement.create-kickstart',
            path: '/cobbler/kickstart-management/kickstart-create'
          },
          EditKickstart: {
            title: 'menu.cobblerManagement.edit-kickstart',
            path: '/cobbler/kickstart-management/kickstart-edit'
          }
        }
      },
      scriptView: {
        title: 'menu.cobblerManagement.script-management',
        path: '/cobbler/script-management',
        children: {
          ScriptManagement: {
            title: 'menu.cobblerManagement.script-management',
            path: '/cobbler/script-management'
          }
        }
      },
      cobblerHostView: {
        title: 'menu.cobblerManagement.host-management',
        path: '/cobbler/host-management',
        children: {
          HostManagement: {
            title: 'menu.cobblerManagement.host-management',
            path: '/cobbler/host-management'
          },
          CobblerCreateHost: {
            title: 'menu.cobblerManagement.create-host',
            path: '/cobbler/host-management/host-create'
          },
          CobblerEditHost: {
            title: 'menu.cobblerManagement.edit-host',
            path: '/cobbler/host-management/host-edit'
          },
          HostInfoManage: {
            title: 'menu.cobblerManagement.manage-host',
            path: '/cobbler/host-management/host-info-manage'
          }
        }
      }
    }
  },
  task: {
    title: 'menu.task',
    path: '/task',
    children: {
      TaskManagement: {
        title: 'menu.task.task-management',
        path: '/task/task-management'
      }
    }
  },
  leaks: {
    title: 'menu.leaks',
    path: '/leaks',
    children: {
      CVEsView: {
        title: 'menu.leaks.cves-management',
        path: '/leaks/cves-views',
        children: {
          CVEsManagement: {
            title: 'menu.leaks.cves-management',
            path: '/leaks/cves-management'
          },
          CVEsDetail: {
            title: 'menu.leaks.cves-detail',
            path: '/leaks/cves-management/:cve_id'
          }
        }
      },
      HostView: {
        title: 'menu.leaks.host-leak-list',
        path: '/leaks.host-view',
        children: {
          HostLeakList: {
            title: 'menu.leaks.host-leak-list',
            path: '/leaks/host-leak-list'
          },
          HostLeakDetail: {
            title: 'menu.leaks.host-detail',
            path: '/leaks/host-leak-list/:host_id'
          }
        }
      },
      leakTaskView: {
        title: 'menu.leaks.leak-task',
        path: '/leaks/task',
        children: {
          leakTaskList: {
            title: 'menu.leaks.leak-task-list',
            path: '/leaks/task-list'
          },
          leakTaskDetail: {
            title: 'menu.leaks.leak-task-detail',
            path: '/leaks/task/:taskType/:taskId'
          },
          taskResultReport: {
            title: 'menu.leaks.leak-task-report',
            path: '/leaks/task-report/:taskType/:taskId'
          }
        }
      }
    }
  },
  networkTopo: {
    title: 'menu.networkTopo',
    path: '/networkTopo'
  }
};

export const asyncRouterMap = [
  {
    path: routeMap.index.path,
    name: 'index',
    component: BasicLayout,
    meta: {title: routeMap.index.title},
    redirect: '/dashboard',
    children: [
      // dashboard
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard'),
        meta: {
          title: 'menu.dashboard.workplace',
          icon: 'dashboard',
          permission: ['dashboard']
        }
      },
      {
        path: routeMap.assests.path,
        name: 'assests',
        redirect: '/assests/hosts-management',
        component: RouteView,
        meta: {
          title: routeMap.assests.title,
          icon: 'form',
          permission: ['assests']
        },
        children: [
          {
            path: routeMap.assests.children.hostView.path,
            name: 'hostView',
            redirect: routeMap.assests.children.hostView.children.HostsManagement.path,
            component: RouteView,
            hideChildrenInMenu: true,
            meta: {
              title: routeMap.assests.children.hostView.children.HostsManagement.title,
              permission: ['assests']
            },
            children: [
              {
                path: routeMap.assests.children.hostView.children.HostsManagement.path,
                name: 'HostsManagement',
                hidden: true,
                component: () => import('@/views/assests/HostManagement'),
                meta: {
                  title: routeMap.assests.children.hostView.children.HostsManagement.title,
                  permission: ['assests'],
                  diyBreadcrumb: [
                    {
                      breadcrumbName: routeMap.index.title,
                      path: routeMap.index.path
                    },
                    {
                      breadcrumbName: routeMap.assests.title,
                      path: routeMap.assests.path
                    },
                    {
                      breadcrumbName: routeMap.assests.children.hostView.children.HostsManagement.title,
                      path: routeMap.assests.children.hostView.children.HostsManagement.path
                    }
                  ]
                }
              },
              {
                path: '/assests/host/detail/:hostId',
                name: 'hostDetail',
                hidden: true,
                component: () => import('@/views/assests/HostDetail'),
                meta: {
                  title: 'menu.assests.host-detail',
                  permission: ['assests']
                }
              },
              {
                path: routeMap.assests.children.hostView.children.CreateHost.path,
                name: 'CreateHost',
                hidden: true,
                component: () => import('@/views/assests/HostEdition'),
                meta: {
                  title: routeMap.assests.children.hostView.children.CreateHost.title,
                  permission: ['assests'],
                  diyBreadcrumb: [
                    {
                      breadcrumbName: routeMap.index.title,
                      path: routeMap.index.path
                    },
                    {
                      breadcrumbName: routeMap.assests.title,
                      path: routeMap.assests.path
                    },
                    {
                      breadcrumbName: routeMap.assests.children.hostView.children.HostsManagement.title,
                      path: routeMap.assests.children.hostView.children.HostsManagement.path
                    },
                    {
                      breadcrumbName: routeMap.assests.children.hostView.children.CreateHost.title,
                      path: routeMap.assests.children.hostView.children.CreateHost.path
                    }
                  ]
                }
              },
              {
                path: routeMap.assests.children.hostView.children.EditHost.path,
                name: 'EditHost',
                hidden: true,
                component: () => import('@/views/assests/HostEdition'),
                meta: {
                  title: routeMap.assests.children.hostView.children.EditHost.title,
                  permission: ['assests'],
                  diyBreadcrumb: [
                    {
                      breadcrumbName: routeMap.index.title,
                      path: routeMap.index.path
                    },
                    {
                      breadcrumbName: routeMap.assests.title,
                      path: routeMap.assests.path
                    },
                    {
                      breadcrumbName: routeMap.assests.children.hostView.children.HostsManagement.title,
                      path: routeMap.assests.children.hostView.children.HostsManagement.path
                    },
                    {
                      breadcrumbName: routeMap.assests.children.hostView.children.EditHost.title,
                      path: routeMap.assests.children.hostView.children.EditHost.path
                    }
                  ]
                }
              }
            ]
          },
          {
            path: '/assests/host-group-management',
            name: 'HostGroupManagement',
            component: () => import('@/views/assests/HostGroupManagement'),
            meta: {
              title: 'menu.assests.host-group-management',
              permission: ['assests'],
              diyBreadcrumb: [
                {
                  breadcrumbName: routeMap.index.title,
                  path: routeMap.index.path
                },
                {
                  breadcrumbName: routeMap.assests.title,
                  path: routeMap.assests.path
                },
                {
                  breadcrumbName: routeMap.assests.children.hostgroupView.title,
                  path: routeMap.assests.children.hostgroupView.path
                }
              ]
            }
          }
        ]
      },

      /* 部署管理模块隐藏
       *    {
       *        path: routeMap.task.path,
       *        name: 'task',
       *        redirect: routeMap.task.children.TaskManagement.path,
       *        component: RouteView,
       *        meta: {
       *            title: routeMap.task.title,
       *            icon: 'robot',
       *            permission: ['task']
       *        },
       *        children: [
       *            {
       *                path: routeMap.task.children.TaskManagement.path,
       *                name: 'TaskManagement',
       *                component: () => import('@/views/task/TaskManagement'),
       *                meta: {
       *                    title: routeMap.task.children.TaskManagement.title,
       *                    permission: ['task']
       *                }
       *            }
       *        ]
       *    },
       */
      {
        path: routeMap.leaks.path,
        name: 'leaks',
        redirect: routeMap.leaks.children.CVEsView.children.CVEsManagement.path,
        component: RouteView,
        meta: {
          title: routeMap.leaks.title,
          icon: 'bug',
          permission: ['leaks']
        },
        children: [
          {
            path: routeMap.leaks.children.CVEsView.path,
            name: 'CVEsView',
            redirect: routeMap.leaks.children.CVEsView.children.CVEsManagement.path,
            component: RouteView,
            hideChildrenInMenu: true,
            meta: {
              title: routeMap.leaks.children.CVEsView.title,
              permission: ['leaks']
            },
            children: [
              {
                path: routeMap.leaks.children.CVEsView.children.CVEsManagement.path,
                name: 'CVEsManagement',
                hidden: true,
                component: () => import('@/views/leaks/CVEsManagement'),
                meta: {
                  title: routeMap.leaks.children.CVEsView.children.CVEsManagement.title,
                  permission: ['leaks'],
                  diyBreadcrumb: [
                    {
                      breadcrumbName: routeMap.index.title,
                      path: routeMap.index.path
                    },
                    {
                      breadcrumbName: routeMap.leaks.title,
                      path: routeMap.leaks.path
                    },
                    {
                      breadcrumbName: routeMap.leaks.children.CVEsView.children.CVEsManagement.title,
                      path: routeMap.leaks.children.CVEsView.children.CVEsManagement.path
                    }
                  ]
                }
              },
              {
                path: routeMap.leaks.children.CVEsView.children.CVEsDetail.path,
                name: 'CVEsDetail',
                hidden: true,
                component: () => import('@/views/leaks/CVEsDetail'),
                meta: {
                  title: routeMap.leaks.children.CVEsView.children.CVEsDetail.title,
                  permission: ['leaks'],
                  diyBreadcrumb: [
                    {
                      breadcrumbName: routeMap.index.title,
                      path: routeMap.index.path
                    },
                    {
                      breadcrumbName: routeMap.leaks.title,
                      path: routeMap.leaks.path
                    },
                    {
                      breadcrumbName: routeMap.leaks.children.CVEsView.children.CVEsManagement.title,
                      path: routeMap.leaks.children.CVEsView.children.CVEsManagement.path
                    },
                    {
                      breadcrumbName: routeMap.leaks.children.CVEsView.children.CVEsDetail.title,
                      path: routeMap.leaks.children.CVEsView.children.CVEsDetail.path
                    }
                  ]
                }
              }
            ]
          },
          {
            path: routeMap.leaks.children.HostView.path,
            name: 'HostView',
            redirect: routeMap.leaks.children.HostView.children.HostLeakList.path,
            component: RouteView,
            hideChildrenInMenu: true,
            meta: {
              title: routeMap.leaks.children.HostView.title,
              permission: ['leaks']
            },
            children: [
              {
                path: routeMap.leaks.children.HostView.children.HostLeakList.path,
                name: 'HostLeakList',
                hidden: true,
                component: () => import('@/views/leaks/HostLeakList'),
                meta: {
                  title: routeMap.leaks.children.HostView.children.HostLeakList.title,
                  permission: ['leaks'],
                  diyBreadcrumb: [
                    {
                      breadcrumbName: routeMap.index.title,
                      path: routeMap.index.path
                    },
                    {
                      breadcrumbName: routeMap.leaks.title,
                      path: routeMap.leaks.path
                    },
                    {
                      breadcrumbName: routeMap.leaks.children.HostView.children.HostLeakList.title,
                      path: routeMap.leaks.children.HostView.children.HostLeakList.path
                    }
                  ]
                }
              },
              {
                path: routeMap.leaks.children.HostView.children.HostLeakDetail.path,
                name: 'HostLeakDetail',
                hidden: true,
                component: () => import('@/views/leaks/HostLeakDetail'),
                meta: {
                  title: routeMap.leaks.children.HostView.children.HostLeakDetail.title,
                  permission: ['leaks'],
                  diyBreadcrumb: [
                    {
                      breadcrumbName: routeMap.index.title,
                      path: routeMap.index.path
                    },
                    {
                      breadcrumbName: routeMap.leaks.title,
                      path: routeMap.leaks.path
                    },
                    {
                      breadcrumbName: routeMap.leaks.children.HostView.children.HostLeakList.title,
                      path: routeMap.leaks.children.HostView.children.HostLeakList.path
                    },
                    {
                      breadcrumbName: routeMap.leaks.children.HostView.children.HostLeakDetail.title,
                      path: routeMap.leaks.children.HostView.children.HostLeakDetail.path
                    }
                  ]
                }
              }
            ]
          },
          {
            path: routeMap.leaks.children.leakTaskView.path,
            name: 'LeakTask',
            redirect: routeMap.leaks.children.leakTaskView.children.leakTaskList.path,
            component: RouteView,
            hideChildrenInMenu: true,
            meta: {
              title: routeMap.leaks.children.leakTaskView.title,
              permission: ['leaks']
            },
            children: [
              {
                path: routeMap.leaks.children.leakTaskView.children.leakTaskList.path,
                name: 'LeakTaskList',
                hidden: true,
                component: () => import('@/views/leaks/LeakTaskList'),
                meta: {
                  title: routeMap.leaks.children.leakTaskView.children.leakTaskList.title,
                  permission: ['leaks'],
                  diyBreadcrumb: [
                    {
                      breadcrumbName: routeMap.index.title,
                      path: routeMap.index.path
                    },
                    {
                      breadcrumbName: routeMap.leaks.title,
                      path: routeMap.leaks.path
                    },
                    {
                      breadcrumbName: routeMap.leaks.children.leakTaskView.children.leakTaskList.title,
                      path: routeMap.leaks.children.leakTaskView.children.leakTaskList.path
                    }
                  ]
                }
              },
              {
                path: routeMap.leaks.children.leakTaskView.children.leakTaskDetail.path,
                name: 'LeakTaskDetail',
                hidden: true,
                component: () => import('@/views/leaks/LeakTaskDetail'),
                meta: {
                  title: routeMap.leaks.children.leakTaskView.children.leakTaskDetail.title,
                  permission: ['leaks'],
                  diyBreadcrumb: [
                    {
                      breadcrumbName: routeMap.index.title,
                      path: routeMap.index.path
                    },
                    {
                      breadcrumbName: routeMap.leaks.title,
                      path: routeMap.leaks.path
                    },
                    {
                      breadcrumbName: routeMap.leaks.children.leakTaskView.children.leakTaskList.title,
                      path: routeMap.leaks.children.leakTaskView.children.leakTaskList.path
                    },
                    {
                      breadcrumbName: routeMap.leaks.children.leakTaskView.children.leakTaskDetail.title,
                      path: routeMap.leaks.children.leakTaskView.children.leakTaskDetail.path
                    }
                  ]
                }
              },
              {
                path: routeMap.leaks.children.leakTaskView.children.taskResultReport.path,
                name: 'TaskResultReport',
                hidden: true,
                component: () => import('@/views/leaks/TaskResultReport'),
                meta: {
                  title: routeMap.leaks.children.leakTaskView.children.taskResultReport.title,
                  permission: ['leaks'],
                  diyBreadcrumb: [
                    {
                      breadcrumbName: routeMap.index.title,
                      path: routeMap.index.path
                    },
                    {
                      breadcrumbName: routeMap.leaks.title,
                      path: routeMap.leaks.path
                    },
                    {
                      breadcrumbName: routeMap.leaks.children.leakTaskView.children.leakTaskList.title,
                      path: routeMap.leaks.children.leakTaskView.children.leakTaskList.path
                    },
                    {
                      breadcrumbName: routeMap.leaks.children.leakTaskView.children.leakTaskDetail.title,
                      path: routeMap.leaks.children.leakTaskView.children.leakTaskDetail.path
                    },
                    {
                      breadcrumbName: routeMap.leaks.children.leakTaskView.children.taskResultReport.title,
                      path: routeMap.leaks.children.leakTaskView.children.taskResultReport.path
                    }
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        path: routeMap.diagnosis.path,
        name: 'diagnosis',
        redirect: '/diagnosis/workflow',
        component: RouteView,
        meta: {
          title: routeMap.diagnosis.title,
          icon: 'medicine-box',
          permission: ['diagnosis']
        },
        children: [
          {
            path: routeMap.diagnosis.children.DiagnosisWorkflow.path,
            name: 'DiagnosisWorkflow',
            component: RouteView,
            redirect: routeMap.diagnosis.children.DiagnosisWorkflow.children.MainView.path,
            meta: {
              title: routeMap.diagnosis.children.DiagnosisWorkflow.title,
              permission: ['diagnosis']
            },
            hideChildrenInMenu: true,
            children: [
              {
                path: routeMap.diagnosis.children.DiagnosisWorkflow.children.MainView.path,
                name: 'DiagnosisWorkflowMainView',
                component: () => import('@/views/diagnosis/Workflow'),
                meta: {
                  title: routeMap.diagnosis.children.DiagnosisWorkflow.children.MainView.title,
                  permission: ['diagnosis'],
                  diyBreadcrumb: [
                    {
                      breadcrumbName: routeMap.index.title,
                      path: routeMap.index.path
                    },
                    {
                      breadcrumbName: routeMap.diagnosis.title,
                      path: routeMap.diagnosis.path
                    },
                    {
                      breadcrumbName: routeMap.diagnosis.children.DiagnosisWorkflow.children.MainView.title,
                      path: routeMap.diagnosis.children.DiagnosisWorkflow.children.MainView.path
                    }
                  ]
                }
              },
              {
                path: routeMap.diagnosis.children.DiagnosisWorkflow.children.workflowDetail.path,
                name: 'WorkflowDetail',
                component: () => import('@/views/diagnosis/WorkflowDetail'),
                meta: {
                  title: routeMap.diagnosis.children.DiagnosisWorkflow.children.workflowDetail.title,
                  permission: ['diagnosis'],
                  diyBreadcrumb: [
                    {
                      breadcrumbName: routeMap.index.title,
                      path: routeMap.index.path
                    },
                    {
                      breadcrumbName: routeMap.diagnosis.title,
                      path: routeMap.diagnosis.path
                    },
                    {
                      breadcrumbName: routeMap.diagnosis.children.DiagnosisWorkflow.children.MainView.title,
                      path: routeMap.diagnosis.children.DiagnosisWorkflow.children.MainView.path
                    },
                    {
                      breadcrumbName: routeMap.diagnosis.children.DiagnosisWorkflow.children.workflowDetail.title,
                      path: routeMap.diagnosis.children.DiagnosisWorkflow.children.workflowDetail.path
                    }
                  ]
                }
              },
              {
                path: routeMap.diagnosis.children.DiagnosisWorkflow.children.appTemplate.path,
                name: 'AppTemplateInfo',
                component: () => import('@/views/diagnosis/AppTemplateInfo'),
                meta: {
                  title: routeMap.diagnosis.children.DiagnosisWorkflow.children.appTemplate.title,
                  permission: ['diagnosis'],
                  diyBreadcrumb: [
                    {
                      breadcrumbName: routeMap.index.title,
                      path: routeMap.index.path
                    },
                    {
                      breadcrumbName: routeMap.diagnosis.title,
                      path: routeMap.diagnosis.path
                    },
                    {
                      breadcrumbName: routeMap.diagnosis.children.DiagnosisWorkflow.children.MainView.title,
                      path: routeMap.diagnosis.children.DiagnosisWorkflow.children.MainView.path
                    },
                    {
                      breadcrumbName: routeMap.diagnosis.children.DiagnosisWorkflow.children.appTemplate.title,
                      path: routeMap.diagnosis.children.DiagnosisWorkflow.children.appTemplate.path
                    }
                  ]
                }
              }
            ]
          },
          {
            path: routeMap.diagnosis.children.AbnormalAlert.path,
            name: 'AbnormalAlert',
            component: () => import('@/views/diagnosis/AbnormalAlert'),
            meta: {
              title: routeMap.diagnosis.children.AbnormalAlert.title,
              permission: ['diagnosis']
            },
            hideChildrenInMenu: true
          }
        ]
      },
      {
        path: routeMap.configuration.path,
        name: 'configuration',
        redirect: routeMap.configuration.children.TranscationDomainView.path,
        component: RouteView,
        meta: {
          title: routeMap.configuration.title,
          icon: 'apartment',
          permission: ['configuration']
        },
        children: [
          {
            path: routeMap.configuration.children.TranscationDomainView.path,
            name: 'transationDomainView',
            redirect: routeMap.configuration.children.TranscationDomainView.children.TranscationDomainManagement.path,
            component: RouteView,
            hideChildrenInMenu: true,
            meta: {
              title: routeMap.configuration.children.TranscationDomainView.children.TranscationDomainManagement.title,
              permission: ['configuration']
            },
            children: [
              {
                path: routeMap.configuration.children.TranscationDomainView.children.TranscationDomainManagement.path,
                name: 'transcationDomainManagement',
                component: () => import('@/views/configuration/TranscationDomainManagement'),
                meta: {
                  title:
                    routeMap.configuration.children.TranscationDomainView.children.TranscationDomainManagement.title,
                  permission: ['configuration'],
                  diyBreadcrumb: [
                    {
                      breadcrumbName: routeMap.index.title,
                      path: routeMap.index.path
                    },
                    {
                      breadcrumbName: routeMap.configuration.title,
                      path: routeMap.configuration.path
                    },
                    {
                      breadcrumbName:
                        routeMap.configuration.children.TranscationDomainView.children.TranscationDomainManagement
                          .title,
                      path: routeMap.configuration.children.TranscationDomainView.children.TranscationDomainManagement
                        .path
                    }
                  ]
                }
              },
              {
                path: routeMap.configuration.children.TranscationDomainView.children.TranscationDomainDetail.path,
                name: 'TranscationDomainDetail',
                hidden: true,
                component: () => import('@/views/configuration/TranscationDomainDetail'),
                meta: {
                  title: routeMap.configuration.children.TranscationDomainView.children.TranscationDomainDetail.title,
                  permission: ['configuration'],
                  diyBreadcrumb: [
                    {
                      breadcrumbName: routeMap.index.title,
                      path: routeMap.index.path
                    },
                    {
                      breadcrumbName: routeMap.configuration.title,
                      path: routeMap.configuration.path
                    },
                    {
                      breadcrumbName:
                        routeMap.configuration.children.TranscationDomainView.children.TranscationDomainManagement
                          .title,
                      path: routeMap.configuration.children.TranscationDomainView.children.TranscationDomainManagement
                        .path
                    },
                    {
                      breadcrumbName:
                        routeMap.configuration.children.TranscationDomainView.children.TranscationDomainDetail.title,
                      path: routeMap.configuration.children.TranscationDomainView.children.TranscationDomainDetail.path
                    }
                  ]
                }
              }
            ]
          },
          {
            path: routeMap.configuration.children.TranscationDomainConfigurations.path,
            name: 'transcationDomainConfigurations',
            component: RouteView,
            hideChildrenInMenu: true,
            // $noDomain is used for the case where domain are not selected.
            redirect: routeMap.configuration.children.TranscationDomainConfigurations.path + '/$noDomain',
            meta: {
              title: routeMap.configuration.children.TranscationDomainConfigurations.title,
              permission: ['configuration']
            },
            children: [
              {
                path: routeMap.configuration.children.TranscationDomainConfigurationsDetail.path,
                name: 'transcationDomainConfigurationsDetail',
                hidden: true,
                component: () => import('@/views/configuration/TranscationDomainConfigurations'),
                meta: {
                  title: routeMap.configuration.children.TranscationDomainConfigurationsDetail.title,
                  permission: ['configuration'],
                  diyBreadcrumb: [
                    {
                      breadcrumbName: routeMap.index.title,
                      path: routeMap.index.path
                    },
                    {
                      breadcrumbName: routeMap.configuration.title,
                      path: routeMap.configuration.path
                    },
                    {
                      breadcrumbName: routeMap.configuration.children.TranscationDomainConfigurationsDetail.title,
                      path: routeMap.configuration.children.TranscationDomainConfigurationsDetail.path
                    }
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        path: routeMap.cobblerManagement.path,
        name: 'cobblerManagement',
        redirect: '/cobbler/images-management',
        component: RouteView,
        meta: {
          title: routeMap.cobblerManagement.title,
          icon: 'robot',
          permission: ['cobblerManagement']
        },
        children: [
          {
            path: routeMap.cobblerManagement.children.imageView.path,
            name: 'imageView',
            redirect: routeMap.cobblerManagement.children.imageView.children.ImagesManagement.path,
            component: RouteView,
            hideChildrenInMenu: true,
            meta: {
              title: routeMap.cobblerManagement.children.imageView.children.ImagesManagement.title,
              permission: ['cobblerManagement']
            },
            children: [
              {
                path: routeMap.cobblerManagement.children.imageView.children.ImagesManagement.path,
                name: 'ImagesManagement',
                hidden: true,
                component: () => import('@/views/cobbler/ImageManagement'),
                meta: {
                  title: routeMap.cobblerManagement.children.imageView.children.ImagesManagement.title,
                  permission: ['cobblerManagement'],
                  diyBreadcrumb: [
                    {
                      breadcrumbName: routeMap.index.title,
                      path: routeMap.index.path
                    },
                    {
                      breadcrumbName: routeMap.cobblerManagement.title,
                      path: routeMap.cobblerManagement.path
                    },
                    {
                      breadcrumbName: routeMap.cobblerManagement.children.imageView.children.ImagesManagement.title,
                      path: routeMap.cobblerManagement.children.imageView.children.ImagesManagement.path
                    }
                  ]
                }
              }
            ]
          },
          {
            path: routeMap.cobblerManagement.children.ksFileView.path,
            name: 'ksFileView',
            redirect: routeMap.cobblerManagement.children.ksFileView.children.KickstartsManagement.path,
            component: RouteView,
            hideChildrenInMenu: true,
            meta: {
              title: routeMap.cobblerManagement.children.ksFileView.children.KickstartsManagement.title,
              permission: ['cobblerManagement']
            },
            children: [
              {
                path: routeMap.cobblerManagement.children.ksFileView.children.KickstartsManagement.path,
                name: 'KickstartsManagement',
                hidden: true,
                component: () => import('@/views/cobbler/KickstartManagement'),
                meta: {
                  title: routeMap.cobblerManagement.children.ksFileView.children.KickstartsManagement.title,
                  permission: ['cobblerManagement'],
                  diyBreadcrumb: [
                    {
                      breadcrumbName: routeMap.index.title,
                      path: routeMap.index.path
                    },
                    {
                      breadcrumbName: routeMap.cobblerManagement.title,
                      path: routeMap.cobblerManagement.path
                    },
                    {
                      breadcrumbName: routeMap.cobblerManagement.children.ksFileView.children.KickstartsManagement.title,
                      path: routeMap.cobblerManagement.children.ksFileView.children.KickstartsManagement.path
                    }
                  ]
                }
              },
              {
                path: routeMap.cobblerManagement.children.ksFileView.children.CreateKickstart.path,
                name: 'CreateKickstart',
                hidden: true,
                component: () => import('@/views/cobbler/KickstartEdition'),
                meta: {
                  title: routeMap.cobblerManagement.children.ksFileView.children.CreateKickstart.title,
                  permission: ['cobblerManagement'],
                  diyBreadcrumb: [
                    {
                      breadcrumbName: routeMap.index.title,
                      path: routeMap.index.path
                    },
                    {
                      breadcrumbName: routeMap.cobblerManagement.title,
                      path: routeMap.cobblerManagement.path
                    },
                    {
                      breadcrumbName: routeMap.cobblerManagement.children.ksFileView.children.KickstartsManagement.title,
                      path: routeMap.cobblerManagement.children.ksFileView.children.KickstartsManagement.path
                    },
                    {
                      breadcrumbName: routeMap.cobblerManagement.children.ksFileView.children.CreateKickstart.title,
                      path: routeMap.cobblerManagement.children.ksFileView.children.CreateKickstart.path
                    }
                  ]
                }
              },
              {
                path: routeMap.cobblerManagement.children.ksFileView.children.EditKickstart.path,
                name: 'EditKickstart',
                hidden: true,
                component: () => import('@/views/cobbler/KickstartEdition'),
                meta: {
                  title: routeMap.cobblerManagement.children.ksFileView.children.EditKickstart.title,
                  permission: ['cobblerManagement'],
                  diyBreadcrumb: [
                    {
                      breadcrumbName: routeMap.index.title,
                      path: routeMap.index.path
                    },
                    {
                      breadcrumbName: routeMap.cobblerManagement.title,
                      path: routeMap.cobblerManagement.path
                    },
                    {
                      breadcrumbName: routeMap.cobblerManagement.children.ksFileView.children.KickstartsManagement.title,
                      path: routeMap.cobblerManagement.children.ksFileView.children.KickstartsManagement.path
                    },
                    {
                      breadcrumbName: routeMap.cobblerManagement.children.ksFileView.children.EditKickstart.title,
                      path: routeMap.cobblerManagement.children.ksFileView.children.EditKickstart.path
                    }
                  ]
                }
              }
            ]
          },
          {
            path: routeMap.cobblerManagement.children.scriptView.path,
            name: 'scriptView',
            redirect: routeMap.cobblerManagement.children.scriptView.children.ScriptManagement.path,
            component: RouteView,
            hideChildrenInMenu: true,
            meta: {
              title: routeMap.cobblerManagement.children.scriptView.children.ScriptManagement.title,
              permission: ['cobblerManagement']
            },
            children: [
              {
                path: routeMap.cobblerManagement.children.scriptView.children.ScriptManagement.path,
                name: 'ScriptManagement',
                hidden: true,
                component: () => import('@/views/cobbler/ScriptManagement'),
                meta: {
                  title: routeMap.cobblerManagement.children.scriptView.children.ScriptManagement.title,
                  permission: ['cobblerManagement'],
                  diyBreadcrumb: [
                    {
                      breadcrumbName: routeMap.index.title,
                      path: routeMap.index.path
                    },
                    {
                      breadcrumbName: routeMap.cobblerManagement.title,
                      path: routeMap.cobblerManagement.path
                    },
                    {
                      breadcrumbName: routeMap.cobblerManagement.children.scriptView.children.ScriptManagement.title,
                      path: routeMap.cobblerManagement.children.scriptView.children.ScriptManagement.path
                    }
                  ]
                }
              }
            ]
          },
          {
            path: routeMap.cobblerManagement.children.cobblerHostView.path,
            name: 'cobblerHostView',
            redirect: routeMap.cobblerManagement.children.cobblerHostView.children.HostManagement.path,
            component: RouteView,
            hideChildrenInMenu: true,
            meta: {
              title: routeMap.cobblerManagement.children.cobblerHostView.children.HostManagement.title,
              permission: ['cobblerManagement']
            },
            children: [
              {
                path: routeMap.cobblerManagement.children.cobblerHostView.children.HostManagement.path,
                name: 'HostManagement',
                hidden: true,
                component: () => import('@/views/cobbler/HostManagement.vue'),
                meta: {
                  title: routeMap.cobblerManagement.children.cobblerHostView.children.HostManagement.title,
                  permission: ['cobblerManagement'],
                  diyBreadcrumb: [
                    {
                      breadcrumbName: routeMap.index.title,
                      path: routeMap.index.path
                    },
                    {
                      breadcrumbName: routeMap.cobblerManagement.title,
                      path: routeMap.cobblerManagement.path
                    },
                    {
                      breadcrumbName: routeMap.cobblerManagement.children.cobblerHostView.children.HostManagement.title,
                      path: routeMap.cobblerManagement.children.cobblerHostView.children.HostManagement.path
                    }
                  ]
                }
              },
              {
                path: routeMap.cobblerManagement.children.cobblerHostView.children.CobblerCreateHost.path,
                name: 'CobblerCreateHost',
                hidden: true,
                component: () => import('@/views/cobbler/HostEdition.vue'),
                meta: {
                  title: routeMap.cobblerManagement.children.cobblerHostView.children.CobblerCreateHost.title,
                  permission: ['cobblerManagement'],
                  diyBreadcrumb: [
                    {
                      breadcrumbName: routeMap.index.title,
                      path: routeMap.index.path
                    },
                    {
                      breadcrumbName: routeMap.cobblerManagement.title,
                      path: routeMap.cobblerManagement.path
                    },
                    {
                      breadcrumbName: routeMap.cobblerManagement.children.cobblerHostView.children.HostManagement.title,
                      path: routeMap.cobblerManagement.children.cobblerHostView.children.HostManagement.path
                    },
                    {
                      breadcrumbName: routeMap.cobblerManagement.children.cobblerHostView.children.CobblerCreateHost.title,
                      path: routeMap.cobblerManagement.children.cobblerHostView.children.CobblerCreateHost.path
                    }
                  ]
                }
              },
              {
                path: routeMap.cobblerManagement.children.cobblerHostView.children.CobblerEditHost.path,
                name: 'CobblerEditHost',
                hidden: true,
                component: () => import('@/views/cobbler/HostEdition.vue'),
                meta: {
                  title: routeMap.cobblerManagement.children.cobblerHostView.children.CobblerEditHost.title,
                  permission: ['cobblerManagement'],
                  diyBreadcrumb: [
                    {
                      breadcrumbName: routeMap.index.title,
                      path: routeMap.index.path
                    },
                    {
                      breadcrumbName: routeMap.cobblerManagement.title,
                      path: routeMap.cobblerManagement.path
                    },
                    {
                      breadcrumbName: routeMap.cobblerManagement.children.cobblerHostView.children.HostManagement.title,
                      path: routeMap.cobblerManagement.children.cobblerHostView.children.HostManagement.path
                    },
                    {
                      breadcrumbName: routeMap.cobblerManagement.children.cobblerHostView.children.CobblerEditHost.title,
                      path: routeMap.cobblerManagement.children.cobblerHostView.children.CobblerEditHost.path
                    }
                  ]
                }
              },
              {
                path: routeMap.cobblerManagement.children.cobblerHostView.children.HostInfoManage.path,
                name: 'HostInfoManage',
                hidden: true,
                component: () => import('@/views/cobbler/HostNanotube.vue'),
                meta: {
                  title: routeMap.cobblerManagement.children.cobblerHostView.children.HostInfoManage.title,
                  permission: ['cobblerManagement'],
                  diyBreadcrumb: [
                    {
                      breadcrumbName: routeMap.index.title,
                      path: routeMap.index.path
                    },
                    {
                      breadcrumbName: routeMap.cobblerManagement.title,
                      path: routeMap.cobblerManagement.path
                    },
                    {
                      breadcrumbName: routeMap.cobblerManagement.children.cobblerHostView.children.HostManagement.title,
                      path: routeMap.cobblerManagement.children.cobblerHostView.children.HostManagement.path
                    },
                    {
                      breadcrumbName: routeMap.cobblerManagement.children.cobblerHostView.children.HostInfoManage.title,
                      path: routeMap.cobblerManagement.children.cobblerHostView.children.HostInfoManage.path
                    }
                  ]
                }
              }
            ]
          }
        ]
      }

      /* 暂时先隐去架构感知模块
            {
                path: routeMap.networkTopo.path,
                name: 'networkTopo',
                component: () => import('@/views/networkTopo/NetworkTopo'),
                meta: {
                    title: routeMap.networkTopo.title,
                    icon: 'deployment-unit',
                    permission: ['networkTopo']
                }
            }
            */
    ]
  },
  {
    path: '*',
    redirect: '/404',
    hidden: true
  }
];

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Register')
      },
      {
        path: 'account',
        name: 'account',
        component: () => import(/* webpackChunkName: "fail" */ '@/views/user/Account')
      }
    ]
  },

  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/vendor/ant-design-pro/views/exception/404')
  }
];
