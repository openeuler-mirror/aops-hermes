export const host_infos = [
  {
    host_id: 'host1',
    host_ip: '172.168.45.177',
    host_name: '172.168.45.177(22.03SP2)',
    host_group_name: 'aops1',
    host_group_id: 'group1',
    management: true,
    os_version: null,
    cluster_id: 'cluster1',
    cluster_name: '集群1',
    scene: 'normal',
    ssh_port: 22,
    ssh_user: 'root',
    status: 0,
    password: 123456,
    ssh_pkey: 123456,
    last_scan: 1267398172,
  },
  {
    host_id: 'host2',
    host_ip: '172.168.45.178',
    host_name: '172.168.45.178(22.03SP2)',
    management: false,
    os_version: null,
    cluster_id: 'cluster2',
    cluster_name: '集群2',
    scene: 'web',
    ssh_port: 22,
    ssh_user: 'root',
    host_group_name: 'aops2',
    host_group_id: 'group2',
    status: 2,
    password: 123456,
    ssh_pkey: 123456,
    last_scan: 1267398172,
  },
];

export const host_group_infos = [
  {
    host_group_id: 'group1',
    host_group_name: 'aops1',
    description: 'aops1',
    host_count: 2,
    cluster_id: 'cluster1',
    cluster_name: '集群1',
  },
  {
    host_group_id: 'group2',
    host_group_name: 'aops2',
    description: 'aops2',
    host_count: 0,
    cluster_id: 'cluster2',
    cluster_name: '集群2',
  },
];

export const clusters: any[] = [];

Array.from({ length: 2 }, (_, index) => index + 1).forEach((num) => {
  clusters.push({
    cluster_id: `cluster${num}`,
    cluster_name: `集群${num}`,
    cluster_ip: `127.0.0.${num}`,
    description: 'waaahahaha',
    subcluster: true,
    host_groups: [
      {
        host_group_id: 'group1',
        host_group_name: 'aops1',
      },
      {
        host_group_id: 'group2',
        host_group_name: 'aops2',
      },
    ],
  });
});

export const cve_list: {
  cve_id: string;
  cvss_score: string;
  description: string;
  host_num: number;
  package: string;
  publish_time: string;
  severity: string;
}[] = [];

const severityMap = {
  Critical: '严重',
  High: '高风险',
  Medium: '中风险',
  Low: '低风险',
  Unknown: '未知',
};

Array.from({ length: 11 }, (_, index) => index + 1).forEach((num) => {
  cve_list.push({
    cve_id: `CVE-2021-3363${num}`,
    cvss_score: '5.5',
    description: `openeuler-linux-kernel-5.10.149-ext4_write_inline_data-kernel_bug-3650${num}0`,
    host_num: 1,
    package: 'kernel',
    publish_time: '2024-04-19',
    severity:
      severityMap[
        Object.keys(severityMap)[Math.floor(Math.random() * Object.keys(severityMap).length)]
      ],
  });
});

const taskTypes = ['cve fix', 'cve rollback', 'repo set', 'hotpatch remove'];
const taskTypeMap = {
  'cve fix': 'cve修复',
  'repo set': 'REPO设置',
  'cve rollback': 'cve回滚',
  'hotpatch remove': '热补丁移除',
};

export const tasks: {
  task_id: string;
  task_name: string;
  task_type: string;
  host_num: number;
  description: string;
  create_time: number;
  cluster_id: string;
  cluster_name: string;
  status: {
    fail: number;
    running: number;
    succeed: number;
    unknown: number;
  };
}[] = [];

Array.from({ length: 11 }, (_, index) => index + 1).forEach((num) => {
  tasks.push({
    task_id: `${num}785c98fb2611ee823f52540031faec`,
    task_name: `${taskTypeMap[taskTypes[num % 4]]}：${num}`,
    host_num: 1,
    task_type: taskTypes[num % 4],
    description: `${taskTypeMap[taskTypes[num % 4]]}阿巴阿巴阿巴阿巴`,
    create_time: 1712914114,
    cluster_id: 'cluster1',
    cluster_name: '集群1',
    status: {
      fail: 0,
      succeed: 1,
      unknown: 0,
      running: 0,
    },
  });
});

export const host_list_in_vul = [
  {
    host_group: 'aops',
    host_id: 'host1',
    host_ip: '172.168.45.177',
    host_name: '172.168.45.177(22.03SP2)',
    last_scan: 1713985200,
    repo: '22.03SP2update',
    fixed_cve_num: 1,
    unfixed_cve_num: 5,
    cluster_id: 'cluster1',
    cluster_name: '集群1',
  },
  {
    fixed_cve_num: 1,
    host_group: 'aops',
    host_id: 'host2',
    host_ip: '172.168.45.234',
    host_name: '172.168.45.234',
    last_scan: 1713985200,
    repo: '22.04SP2',
    unfixed_cve_num: 120,
    cluster_id: 'cluster2',
    cluster_name: '集群2',
  },
];

export const repos: {
  repo_id: string;
  repo_name: string;
  cluster_id: string;
  cluster_name: string;
  repo_attr: string;
  repo_data: string;
}[] = [];

Array.from({ length: 11 }, (_, index) => index + 1).forEach((num) => {
  repos.push({
    repo_attr: '',
    repo_data:
      '[hotpatch]\nname=hotpatch\nbaseurl=http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/hotpatch_update/$basearch/\n# metalink=https://mirrors.openeuler.org/metalink?repo=$releasever/everything&arch=$basearch\n# metadata_expire=1h\nenabled=1\ngpgcheck=0\ngpgkey=http://repo.openeuler.org/openEuler-22.03-LTS-SP2/everything/$basearch/RPM-GPG-KEY-openEuler\n',
    repo_id: `repo${num}`,
    repo_name: `repo${num}`,
    cluster_id: clusters[num % 2].cluster_id,
    cluster_name: clusters[num % 2].cluster_name,
  });
});
