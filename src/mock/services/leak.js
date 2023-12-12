import Mock from 'mockjs2';
import {builder} from '../util';

// cve修复任务详情
const getTaskCvefixInfo = () => {
  return builder(
    {
      data: {
        result: [
          {
            host_id: '1',
            host_name: 'fix_test1',
            host_ip: '172.11.11.555',
            cve_num: 3,
            status: 'succeed' // 可选fixed unfixed running None
          },
          {
            host_id: '2',
            host_name: 'fix_test2',
            host_ip: '172.11.11.666',
            cve_num: 3,
            status: 'succeed'
          }
        ],
        total_count: 2,
        total_page: 1
      }
    },
    '查询成功',
    '200'
  );
};
// cve回滚任务详情
const getCveRollbackTaskInfo = () => {
  return builder(
    {
      data: {
        result: [
          {
            host_id: '3',
            host_name: 'rollback_test1',
            host_ip: '172.11.11.121',
            cve_num: 1,
            status: 'succeed' // 可选fixed unfixed running None
          },
          {
            host_id: '4',
            host_name: 'rollback_test2',
            host_ip: '172.11.11.122',
            cve_num: 3,
            status: 'succeed'
          }
        ],
        total_count: 2,
        total_page: 1
      }
    },
    '查询成功'
  );
};
// 热补丁移除任务详情
const getHotPatchTaskInfo = () => {
  return builder({
    data: {
      result: [
        {
          cve_id: 'CVE-2023-1234',
          package: 'tensorflow',
          host_num: 3,
          status: 'succeed'
        },
        {
          cve_id: 'CVE-2023-1235',
          package: 'vim',
          host_num: 3,
          status: 'succeed'
        }
      ],
      total_count: 2,
      total_page: 1
    }
  });
};
// cve修复任务下rpm
const getTaskCveFixRpm = () => {
  return builder(
    {
      data: {
        result: [
          {
            id: 1,
            installed_rpm: 'fix_kernel-4-19-1',
            available_rpm: 'fix_kernel-4-19-2',
            cves: 'CVE-2023-3332,CVE-2023-23456',
            status: 'succeed'
          },
          {
            id: 2,
            installed_rpm: 'fix_vim-1-1',
            available_rpm: 'fix_vim-1-2',
            cves: 'CVE-2023-3332,CVE-2023-23456',
            status: 'succeed'
          },
          {
            id: 3,
            installed_rpm: 'fix_openssh-1-1',
            available_rpm: 'fix_openssh-1-2',
            cves: 'CVE-2023-3332,CVE-2023-23456',
            status: 'succeed'
          }
        ],
        total_count: 1,
        total_page: 1
      }
    },
    '查询成功',
    '200'
  );
};
// cve回滚任务下rpm
const getTaskRollbackRpm = (...args) => {
  return builder(
    {
      data: {
        result: [
          {
            id: 1,
            installed_rpm: 'rollback_kernel-4-19-1',
            available_rpm: 'rollback_kernel-4-19-2',
            cves: 'CVE-2023-3332,CVE-2023-23456',
            status: 'succeed'
          },
          {
            id: 2,
            installed_rpm: 'rollback_vim-1-1',
            available_rpm: 'rollback_vim-1-2',
            cves: 'CVE-2023-3332,CVE-2023-23456',
            status: 'succeed'
          },
          {
            id: 3,
            installed_rpm: 'rollback_openssh-1-1',
            available_rpm: 'rollback_openssh-1-2',
            cves: 'CVE-2023-3332,CVE-2023-23456',
            status: 'succeed'
          }
        ]
      }
    },
    'operation succeed'
  );
};

// cve修复任务报告
const getCveFixTaskReport = () => {
  return builder({
    data: [
      {
        host_id: '1',
        host_ip: '172.11.11.555',
        host_name: 'fix_test1',
        latest_execute_time: '1691465474',
        task_type: 'cve fix',
        task_result: {
          check_items: [
            {
              item: 'network',
              result: true,
              log: 'xxxx'
            },
            {
              item: 'stable',
              result: false,
              log: 'xxxx'
            }
          ],
          rpms: [
            {
              installed_rpm: 'fix_kernel-4-19-1',
              available_rpm: 'fix_kernel-4-19-2',
              cves: 'CVE-2023-12,CVE-2022-4567',
              result: 'succeed',
              log: 'Last metadata expiration check: 0:37:35 ago on Wed 06 Dec 2023 03:29:44 PM CST.\nDependencies resolved.\n================================================================================\n Package      Architecture  Version                          Repository    Size\n================================================================================\nInstalling:\n kernel       aarch64       4.19.90-2311.5.0.0228.oe1        update        32 M\n\nTransaction Summary\n================================================================================\nInstall  1 Package\n\nTotal download size: 32 M\nInstalled size: 144 M\nDownloading Packages:\nkernel-4.19.90-2311.5.0.0228.oe1.aarch64.rpm    5.4 MB/s |  32 MB     00:05    \n--------------------------------------------------------------------------------\nTotal                                           5.4 MB/s |  32 MB     00:05     \nRunning transaction check\nTransaction check succeeded.\nRunning transaction test\nTransaction test succeeded.\nRunning transaction\n  Preparing        :                                                        1/1 \n  Installing       : kernel-4.19.90-2311.5.0.0228.oe1.aarch64               1/1 \n  Running scriptlet: kernel-4.19.90-2311.5.0.0228.oe1.aarch64               1/1 \n  Verifying        : kernel-4.19.90-2311.5.0.0228.oe1.aarch64               1/1 \n\nInstalled:\n  kernel-4.19.90-2311.5.0.0228.oe1.aarch64                                      \n\nComplete!'
            },
            {
              installed_rpm: 'fix_openssh-1-1',
              available_rpm: 'fix_openssh-1-2',
              cves: 'CVE-2023-12,CVE-2022-4567',
              result: 'succeed',
              log: 'Last metadata expiration check: 0:37:35 ago on Wed 06 Dec 2023 03:29:44 PM CST.\nDependencies resolved.\n================================================================================\n Package      Architecture  Version                          Repository    Size\n================================================================================\nInstalling:\n kernel       aarch64       4.19.90-2311.5.0.0228.oe1        update        32 M\n\nTransaction Summary\n================================================================================\nInstall  1 Package\n\nTotal download size: 32 M\nInstalled size: 144 M\nDownloading Packages:\nkernel-4.19.90-2311.5.0.0228.oe1.aarch64.rpm    5.4 MB/s |  32 MB     00:05    \n--------------------------------------------------------------------------------\nTotal                                           5.4 MB/s |  32 MB     00:05     \nRunning transaction check\nTransaction check succeeded.\nRunning transaction test\nTransaction test succeeded.\nRunning transaction\n  Preparing        :                                                        1/1 \n  Installing       : kernel-4.19.90-2311.5.0.0228.oe1.aarch64               1/1 \n  Running scriptlet: kernel-4.19.90-2311.5.0.0228.oe1.aarch64               1/1 \n  Verifying        : kernel-4.19.90-2311.5.0.0228.oe1.aarch64               1/1 \n\nInstalled:\n  kernel-4.19.90-2311.5.0.0228.oe1.aarch64                                      \n\nComplete!'
            },
            {
              installed_rpm: 'fix_vim-1-1',
              available_rpm: 'fix_vim-1-2',
              cves: 'CVE-2023-12,CVE-2022-4567',
              result: 'succeed',
              log: 'Last metadata expiration check: 0:37:35 ago on Wed 06 Dec 2023 03:29:44 PM CST.\nDependencies resolved.\n================================================================================\n Package      Architecture  Version                          Repository    Size\n================================================================================\nInstalling:\n kernel       aarch64       4.19.90-2311.5.0.0228.oe1        update        32 M\n\nTransaction Summary\n================================================================================\nInstall  1 Package\n\nTotal download size: 32 M\nInstalled size: 144 M\nDownloading Packages:\nkernel-4.19.90-2311.5.0.0228.oe1.aarch64.rpm    5.4 MB/s |  32 MB     00:05    \n--------------------------------------------------------------------------------\nTotal                                           5.4 MB/s |  32 MB     00:05     \nRunning transaction check\nTransaction check succeeded.\nRunning transaction test\nTransaction test succeeded.\nRunning transaction\n  Preparing        :                                                        1/1 \n  Installing       : kernel-4.19.90-2311.5.0.0228.oe1.aarch64               1/1 \n  Running scriptlet: kernel-4.19.90-2311.5.0.0228.oe1.aarch64               1/1 \n  Verifying        : kernel-4.19.90-2311.5.0.0228.oe1.aarch64               1/1 \n\nInstalled:\n  kernel-4.19.90-2311.5.0.0228.oe1.aarch64                                      \n\nComplete!'
            }
          ],
          status: 'succeed'
        }
      },
      {
        host_id: '2',
        host_ip: '172.11.11.666',
        host_name: 'fix_test2',
        latest_execute_time: '1691465474',
        task_type: 'cve fix',
        task_result: {
          check_items: [
            {
              item: 'network',
              result: true,
              log: 'xxxx'
            }
          ],
          rpms: [
            {
              installed_rpm: 'fix_kernel-4-19-1',
              available_rpm: 'fix_kernel-4-19-2',
              cves: 'CVE-2023-12,CVE-2022-4567',
              result: 'succeed',
              log: 'Last metadata expiration check: 0:37:35 ago on Wed 06 Dec 2023 03:29:44 PM CST.\nDependencies resolved.\n================================================================================\n Package      Architecture  Version                          Repository    Size\n================================================================================\nInstalling:\n kernel       aarch64       4.19.90-2311.5.0.0228.oe1        update        32 M\n\nTransaction Summary\n================================================================================\nInstall  1 Package\n\nTotal download size: 32 M\nInstalled size: 144 M\nDownloading Packages:\nkernel-4.19.90-2311.5.0.0228.oe1.aarch64.rpm    5.4 MB/s |  32 MB     00:05    \n--------------------------------------------------------------------------------\nTotal                                           5.4 MB/s |  32 MB     00:05     \nRunning transaction check\nTransaction check succeeded.\nRunning transaction test\nTransaction test succeeded.\nRunning transaction\n  Preparing        :                                                        1/1 \n  Installing       : kernel-4.19.90-2311.5.0.0228.oe1.aarch64               1/1 \n  Running scriptlet: kernel-4.19.90-2311.5.0.0228.oe1.aarch64               1/1 \n  Verifying        : kernel-4.19.90-2311.5.0.0228.oe1.aarch64               1/1 \n\nInstalled:\n  kernel-4.19.90-2311.5.0.0228.oe1.aarch64                                      \n\nComplete!'
            }
          ],
          status: 'success'
        }
      },
      {
        host_id: '3',
        host_ip: '172.11.11.777',
        host_name: 'fix_test2',
        latest_execute_time: '1691465474',
        task_type: 'cve fix',
        task_result: {
          check_items: [
            {
              item: 'network',
              result: true,
              log: 'xxxx'
            }
          ],
          rpms: [],
          log: 'xxxx',
          status: 'success'
        }
      }
    ]
  });
};
// cve回滚任务报告
const getCveRollbackTaskReport = () => {
  return builder({
    data: [
      {
        host_id: '3',
        host_ip: '172.11.11.121',
        host_name: 'rollback_test1',
        latest_execute_time: '1691465474',
        task_type: 'cve rollback',
        task_result: {
          check_items: [
            {
              item: 'network',
              result: true,
              log: 'xxxx'
            },
            {
              item: 'stable',
              result: false,
              log: 'xxxx'
            }
          ],
          rpms: [
            {
              installed_rpm: 'rollback_kernel-4-19-1',
              available_rpm: 'rollback_kernel-4-19-2',
              cves: 'CVE-2023-12,CVE-2022-4567',
              result: 'succeed',
              log: 'Last metadata expiration check: 0:37:35 ago on Wed 06 Dec 2023 03:29:44 PM CST.\nDependencies resolved.\n================================================================================\n Package      Architecture  Version                          Repository    Size\n================================================================================\nInstalling:\n kernel       aarch64       4.19.90-2311.5.0.0228.oe1        update        32 M\n\nTransaction Summary\n================================================================================\nInstall  1 Package\n\nTotal download size: 32 M\nInstalled size: 144 M\nDownloading Packages:\nkernel-4.19.90-2311.5.0.0228.oe1.aarch64.rpm    5.4 MB/s |  32 MB     00:05    \n--------------------------------------------------------------------------------\nTotal                                           5.4 MB/s |  32 MB     00:05     \nRunning transaction check\nTransaction check succeeded.\nRunning transaction test\nTransaction test succeeded.\nRunning transaction\n  Preparing        :                                                        1/1 \n  Installing       : kernel-4.19.90-2311.5.0.0228.oe1.aarch64               1/1 \n  Running scriptlet: kernel-4.19.90-2311.5.0.0228.oe1.aarch64               1/1 \n  Verifying        : kernel-4.19.90-2311.5.0.0228.oe1.aarch64               1/1 \n\nInstalled:\n  kernel-4.19.90-2311.5.0.0228.oe1.aarch64                                      \n\nComplete!'
            },
            {
              installed_rpm: 'rollback_openssh-1-1',
              available_rpm: 'rollback_openssh-1-2',
              cves: 'CVE-2023-12,CVE-2022-4567',
              result: 'succeed',
              log: 'Last metadata expiration check: 0:37:35 ago on Wed 06 Dec 2023 03:29:44 PM CST.\nDependencies resolved.\n================================================================================\n Package      Architecture  Version                          Repository    Size\n================================================================================\nInstalling:\n kernel       aarch64       4.19.90-2311.5.0.0228.oe1        update        32 M\n\nTransaction Summary\n================================================================================\nInstall  1 Package\n\nTotal download size: 32 M\nInstalled size: 144 M\nDownloading Packages:\nkernel-4.19.90-2311.5.0.0228.oe1.aarch64.rpm    5.4 MB/s |  32 MB     00:05    \n--------------------------------------------------------------------------------\nTotal                                           5.4 MB/s |  32 MB     00:05     \nRunning transaction check\nTransaction check succeeded.\nRunning transaction test\nTransaction test succeeded.\nRunning transaction\n  Preparing        :                                                        1/1 \n  Installing       : kernel-4.19.90-2311.5.0.0228.oe1.aarch64               1/1 \n  Running scriptlet: kernel-4.19.90-2311.5.0.0228.oe1.aarch64               1/1 \n  Verifying        : kernel-4.19.90-2311.5.0.0228.oe1.aarch64               1/1 \n\nInstalled:\n  kernel-4.19.90-2311.5.0.0228.oe1.aarch64                                      \n\nComplete!'
            },
            {
              installed_rpm: 'rollback_vim-1-1',
              available_rpm: 'rollback_vim-1-2',
              cves: 'CVE-2023-12,CVE-2022-4567',
              result: 'succeed',
              log: 'Last metadata expiration check: 0:37:35 ago on Wed 06 Dec 2023 03:29:44 PM CST.\nDependencies resolved.\n================================================================================\n Package      Architecture  Version                          Repository    Size\n================================================================================\nInstalling:\n kernel       aarch64       4.19.90-2311.5.0.0228.oe1        update        32 M\n\nTransaction Summary\n================================================================================\nInstall  1 Package\n\nTotal download size: 32 M\nInstalled size: 144 M\nDownloading Packages:\nkernel-4.19.90-2311.5.0.0228.oe1.aarch64.rpm    5.4 MB/s |  32 MB     00:05    \n--------------------------------------------------------------------------------\nTotal                                           5.4 MB/s |  32 MB     00:05     \nRunning transaction check\nTransaction check succeeded.\nRunning transaction test\nTransaction test succeeded.\nRunning transaction\n  Preparing        :                                                        1/1 \n  Installing       : kernel-4.19.90-2311.5.0.0228.oe1.aarch64               1/1 \n  Running scriptlet: kernel-4.19.90-2311.5.0.0228.oe1.aarch64               1/1 \n  Verifying        : kernel-4.19.90-2311.5.0.0228.oe1.aarch64               1/1 \n\nInstalled:\n  kernel-4.19.90-2311.5.0.0228.oe1.aarch64                                      \n\nComplete!'
            }
          ],
          status: 'succeed'
        }
      }
    ]
  });
};
// 热补丁移除任务报告
const getHotpatchRemoveTaskReport = () => {
  return builder({
    data: [
      {
        host_id: '3',
        host_ip: '172.11.11.121',
        host_name: 'hotpatchremove_test1',
        latest_execute_time: '1691465474',
        task_type: 'hotpatch remove',
        task_result: {
          host_id: 1,
          status: 'succeed',
          host_name: 'name',
          host_ip: '1.1.1.1',
          check_items: [
            {
              item: 'network',
              result: true,
              log: 'xxxx'
            },
            {
              item: 'stable',
              result: false,
              log: 'xxxx'
            }
          ],
          cves: [
            {
              cve_id: 'rollback_kernel-4-19-1',
              result: 'succeed',
              log: 'Last metadata expiration check: 0:37:35 ago on Wed 06 Dec 2023 03:29:44 PM CST.\nDependencies resolved.\n================================================================================\n Package      Architecture  Version                          Repository    Size\n================================================================================\nInstalling:\n kernel       aarch64       4.19.90-2311.5.0.0228.oe1        update        32 M\n\nTransaction Summary\n================================================================================\nInstall  1 Package\n\nTotal download size: 32 M\nInstalled size: 144 M\nDownloading Packages:\nkernel-4.19.90-2311.5.0.0228.oe1.aarch64.rpm    5.4 MB/s |  32 MB     00:05    \n--------------------------------------------------------------------------------\nTotal                                           5.4 MB/s |  32 MB     00:05     \nRunning transaction check\nTransaction check succeeded.\nRunning transaction test\nTransaction test succeeded.\nRunning transaction\n  Preparing        :                                                        1/1 \n  Installing       : kernel-4.19.90-2311.5.0.0228.oe1.aarch64               1/1 \n  Running scriptlet: kernel-4.19.90-2311.5.0.0228.oe1.aarch64               1/1 \n  Verifying        : kernel-4.19.90-2311.5.0.0228.oe1.aarch64               1/1 \n\nInstalled:\n  kernel-4.19.90-2311.5.0.0228.oe1.aarch64                                      \n\nComplete!'
            }
          ]
        }
      }
    ]
  });
};
// 热补丁移除
const generateHotPatchRemoveTask = () => {
  return builder(
    {
      message: Mock.mock('operation succeed'),
      data: {
        task_id: 'str'
      }
    },
    'operation succeed'
  );
};
// 创建CVE修复任务
const generateCvefixTask = () => {
  return builder(
    {
      message: Mock.mock('operation succeed'),
      data: [
        {
          task_id: '8878b35288df11eeb0815254001a9e0d',
          fix_way: 'coldpatch'
        },
        {
          task_id: '8878b35288df11eeb0815254001a9e0c',
          fix_way: 'hotpatch'
        }
      ]
    },
    '200'
  );
};
// 创建回滚任务
const generateRollbackTask = () => {
  return builder({
    code: '200',
    label: 'Succeed',
    data: '6a78aa82934e11eea6615254008925db',
    message: 'operation succeed'
  });
};
// 执行任务
const executeTask = () => {
  return builder(
    {
      message: Mock.mock('operation succeed'),
      data: {
        code: 200
      }
    },
    '200'
  );
};
// 获取任务列表
const getTaskList = () => {
  return builder({
    data: {
      result: [
        {
          create_time: 1701767549,
          description: '修复以下1个CVE：CVE-2022-20009',
          host_num: 1,
          task_id: '348d4d60931711eea6615254008925db',
          task_name: 'CVE修复任务',
          task_type: 'cve fix'
        },
        {
          create_time: 1701767559,
          description: '修复以下1个CVE：CVE-2022-20009',
          host_num: 1,
          task_id: 'c1acc058934a11eea6615254008925db',
          task_name: 'CVE修复任务',
          task_type: 'cve fix'
        },
        {
          create_time: 1701765559,
          description: '回滚以下1个CVE：CVE-2022-20009',
          host_num: 1,
          task_id: '6a78aa82934e11eea6615254008925db',
          task_name: 'CVE回滚任务',
          task_type: 'cve rollback'
        },
        {
          create_time: 1301765559,
          description: '移除以下1个CVE：CVE-2022-20009',
          host_num: 1,
          task_id: 'dfc21a2a934a11eea6615254008925db',
          task_name: '热补丁移除任务',
          task_type: 'hotpatch remove'
        }
      ],
      total_count: 10,
      total_page: 1
    }
  });
};
const getTaskInfo = (args) => {
  const taskId = args.url.split('task_id=')[1];
  if (taskId === '6a78aa82934e11eea6615254008925db') {
    return builder({
      data: {
        result: {
          accept: false,
          description: '回滚以下1个CVE：CVE-2022-20009',
          host_num: 1,
          latest_execute_time: 1701783239,
          takeover: false,
          task_name: 'CVE回滚任务'
        }
      }
    });
  } else if (taskId === 'dfc21a2a934a11eea6615254008925db') {
    return builder({
      data: {
        result: {
          accept: false,
          description: '移除以下1个CVE：CVE-2022-20009热补丁',
          host_num: 1,
          latest_execute_time: 1701783239,
          takeover: false,
          task_name: '热补丁移除任务'
        }
      }
    });
  }
  return builder({
    data: {
      result: {
        accept: false,
        description: '修复以下1个CVE：CVE-2022-20009',
        host_num: 1,
        latest_execute_time: 1701783239,
        takeover: false,
        task_name: 'CVE修复任务'
      }
    }
  });
};
const getHotpatchRemoveProgress = () => {
  return builder({
    data: {
      result: {
        'CVE-2023-1234': {
          progress: 1,
          status: 'succeed'
        },
        'CVE-2023-1235': {
          progress: 1,
          status: 'succeed'
        }
      }
    }
  });
};
// 热补丁移除任务详情页面中，查看特定cve影响的主机的状态
const getHostOfCve = () => {
  return builder({
    data: {
      result: {
        'CVE-2023-1234': [
          {
            host_id: 55,
            host_ip: '172.168.81.186',
            host_name: '172.168.81.186',
            status: 'succeed'
          }
        ]
      }
    }
  });
};
// 获取详情下的主机列表
const getHostList = () => {
  return builder({
    data: {
      host_list: ['172.1.1.22']
    }
  });
};
// cve修复任务详情
Mock.mock(/\/vulnerability\/task\/cve-fix\/info\/get/, 'post', getTaskCvefixInfo);
// cve回滚任务详情
Mock.mock(/\/vulnerability\/task\/rollback\/cve-info\/get/, 'post', getCveRollbackTaskInfo);
// cve热补丁回退详情
Mock.mock(/\/vulnerability\/task\/hotpatch-remove\/info\/get/, 'post', getHotPatchTaskInfo);
// cve修复任务下rpm
Mock.mock(/\/vulnerability\/task\/cve-fix\/rpm\/get/, 'post', getTaskCveFixRpm);
// cve回滚任务下rpm
Mock.mock(/\/vulnerability\/task\/rollback\/rpm\/get/, 'post', getTaskRollbackRpm);
// 获取cve修复任务报告
Mock.mock(/\/vulnerability\/task\/cve-fix\/result\/get/, 'post', getCveFixTaskReport);
// 获取cve回滚任务报告
Mock.mock(/\/vulnerability\/task\/cve-fix\/result\/get/, 'post', getCveRollbackTaskReport);
// 获取热补丁回退任务报告
Mock.mock(/\/vulnerability\/task\/hotpatch-remove\/result\/get/, 'post', getHotpatchRemoveTaskReport);
// 创建修复任务
Mock.mock(/\/vulnerability\/task\/cve-fix\/generate/, 'post', generateCvefixTask);
// 执行任务
Mock.mock(/\/vulnerability\/task\/execute/, 'post', executeTask);
// 创建热补丁移除任务
Mock.mock(/\/vulnerability\/task\/hotpatch-remove\/generate/, 'post', generateHotPatchRemoveTask);
// 获取任务列表
Mock.mock(/\/vulnerability\/task\/list\/get/, 'post', getTaskList);
// 获取任务信息
Mock.mock(/\/vulnerability\/task\/info\/get/, 'get', getTaskInfo);
// 创建回滚任务
Mock.mock(/\/vulnerability\/task\/cve-rollback\/generate/, 'post', generateRollbackTask);
// 获取热补丁回退进度
Mock.mock(/\/vulnerability\/task\/hotpatch-remove\/progress\/get/, 'post', getHotpatchRemoveProgress);
// 热补丁移除任务详情页面中，查看特定cve影响的主机的状态
Mock.mock(/\/vulnerability\/task\/hotpatch-remove\/status\/get/, 'post', getHostOfCve);
// 获取详情下的主机列表
Mock.mock(/\/vulnerability\/task\/host\/get/, 'post', getHostList);
