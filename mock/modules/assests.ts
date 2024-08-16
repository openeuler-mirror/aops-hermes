import type { MockMethod } from 'vite-plugin-mock'
import { host_infos } from '../contants'

export const assestsMock: Array<MockMethod> = [
  {
    url: '/api/manage/host/info/query',
    timeout: 200,
    method: 'post',
    response: ({ body }) => {
      const hostInfo = body.basic
        ? host_infos.filter(item => body.host_list.includes(item.host_id))
        : [
            {
              host_id: 1,
              status: 0,
              host_info: {
                cpu: {
                  architecture: 'aarch64',
                  core_count: '2',
                  l1d_cache: null,
                  l1i_cache: null,
                  l2_cache: null,
                  l3_cache: null,
                  model_name: 'Kunpeng-920',
                  vendor_id: 'HiSilicon',
                },
                disk: [
                  {
                    capacity: '50.0 GB',
                    model: 'Virtual I/O device',
                  },
                  {
                    capacity: '50.0 GB',
                    model: 'Virtual I/O device',
                  },
                  {
                    capacity: '50.0 GB',
                    model: 'Virtual I/O device',
                  },
                ],
                memory: {
                  info: [
                    {
                      manufacturer: 'QEMU',
                      size: '16 GB',
                      speed: 'Unknown',
                      type: 'RAM',
                    },
                  ],
                  size: '16G',
                  total: 1,
                },
                os: {
                  bios_version: '0.0.0',
                  kernel: '5.10.0-182.0.0.95',
                  os_version: 'openEuler-22.03-(LTS-SP3)',
                },
              },
            },
          ]
      return {
        code: 200,
        data: {
          host_infos: hostInfo,
        },
        label: 'Succeed',
        message: 'operation succeed',
      }
    },
  },
  {
    url: '/api/manage/agent/plugin/info',
    timeout: 1000,
    method: 'get',
    response: () => {
      return {
        code: 200,
        data: {
          info: [
            {
              plugin_name: 'gala-gopher',
              is_installed: true,
              status: 'active',
              resource: [
                {
                  current_value: '0.9%',
                  limit_value: null,
                  name: 'cpu',
                },
                {
                  current_value: '18148 kB',
                  limit_value: null,
                  name: 'memory',
                },
              ],
              collect_items: [
                {
                  probe_name: 'example',
                  probe_status: 'off',
                  support_auto: false,
                },
                {
                  probe_name: 'system_infos',
                  probe_status: 'on',
                  support_auto: false,
                },
                {
                  probe_name: 'virtualized_infos',
                  probe_status: 'off',
                  support_auto: false,
                },
                {
                  probe_name: 'event',
                  probe_status: 'off',
                  support_auto: false,
                },
                {
                  probe_name: 'pg_stat_probe',
                  probe_status: 'auto',
                  support_auto: true,
                },
                {
                  probe_name: 'cadvisor',
                  probe_status: 'auto',
                  support_auto: true,
                },
                {
                  probe_name: 'redis',
                  probe_status: 'off',
                  support_auto: false,
                },
                {
                  probe_name: 'tcp',
                  probe_status: 'on',
                  support_auto: false,
                },
                {
                  probe_name: 'dnsmasq',
                  probe_status: 'off',
                  support_auto: false,
                },
                {
                  probe_name: 'nginx',
                  probe_status: 'off',
                  support_auto: false,
                },
                {
                  probe_name: 'lvs',
                  probe_status: 'auto',
                  support_auto: true,
                },
                {
                  probe_name: 'task',
                  probe_status: 'on',
                  support_auto: false,
                },
                {
                  probe_name: 'ioprobe',
                  probe_status: 'on',
                  support_auto: false,
                },
                {
                  probe_name: 'ksliprobe',
                  probe_status: 'auto',
                  support_auto: true,
                },
                {
                  probe_name: 'pgsliprobe',
                  probe_status: 'off',
                  support_auto: true,
                },
                {
                  probe_name: 'redis_client',
                  probe_status: 'off',
                  support_auto: false,
                },
                {
                  probe_name: 'cgprobe',
                  probe_status: 'off',
                  support_auto: false,
                },
                {
                  probe_name: 'httpprobe',
                  probe_status: 'off',
                  support_auto: false,
                },
                {
                  probe_name: 'jvmprobe',
                  probe_status: 'off',
                  support_auto: false,
                },
                {
                  probe_name: 'stackprobe',
                  probe_status: 'off',
                  support_auto: false,
                },
                {
                  probe_name: 'kafkaprobe',
                  probe_status: 'off',
                  support_auto: false,
                },
              ],
            },
          ],
        },
        label: 'Succeed',
        message: 'operation succeed',
      }
    },
  },
  {
    url: '/api/manage/host/scene/get',
    timeout: 800,
    method: 'get',
    response: () => {
      return {
        code: 200,
        data: {
          collect_items: ['redis', 'virtualized_infos'],
          scene: 'big_data',
        },
        label: 'Succeed',
        message: 'operation succeed',
      }
    },
  },
]
