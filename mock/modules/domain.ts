import type { MockMethod } from 'vite-plugin-mock'

const CONFFILES = [
  {
    contents:
      '[\n    "root:x:0:0:root:/root:/bin/bash",\n    "bin:x:1:1:bin:/bin:/sbin/nologin",\n    "daemon:x:2:2:daemon:/sbin:/sbin/nologin",\n    "adm:x:3:4:adm:/var/adm:/sbin/nologin",\n    "lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin",\n    "sync:x:5:0:sync:/sbin:/bin/sync",\n    "shutdown:x:6:0:shutdown:/sbin:/sbin/shutdown",\n    "halt:x:7:0:halt:/sbin:/sbin/halt",\n    "mail:x:8:12:mail:/var/spool/mail:/sbin/nologin",\n    "operator:x:11:0:operator:/root:/sbin/nologin",\n    "games:x:12:100:games:/usr/games:/sbin/nologin",\n    "ftp:x:14:50:FTP User:/var/ftp:/sbin/nologin",\n    "nobody:x:65534:65534:Kernel Overflow User:/:/sbin/nologin",\n    "systemd-coredump:x:999:997:systemd Core Dumper:/:/sbin/nologin",\n    "saslauth:x:998:76:Saslauthd user:/run/saslauthd:/sbin/nologin",\n    "unbound:x:997:996:Unbound DNS resolver:/etc/unbound:/sbin/nologin",\n    "dhcpd:x:177:177:DHCP server:/:/sbin/nologin",\n    "pesign:x:996:995:Group for the pesign signing daemon:/var/run/pesign:/sbin/nologin",\n    "sshd:x:74:74:Privilege-separated SSH:/var/empty/sshd:/sbin/nologin",\n    "dbus:x:81:81:D-Bus:/var/run/dbus:/sbin/nologin",\n    "polkitd:x:995:993:User for polkitd:/:/sbin/nologin",\n    "tss:x:59:59:Account used by the trousers package to sandbox the tcsd daemon:/dev/null:/sbin/nologin",\n    "chrony:x:994:991::/var/lib/chrony:/sbin/nologin",\n    "systemd-network:x:989:989:systemd Network Management:/:/usr/sbin/nologin",\n    "systemd-resolve:x:988:988:systemd Resolver:/:/usr/sbin/nologin",\n    "systemd-timesync:x:987:987:systemd Time Synchronization:/:/usr/sbin/nologin",\n    "newusername:x:1000:1000::/home/newusername:/bin/bash",\n    "aops:x:1001:1001::/home/aops:/bin/bash"\n]\n',
    filePath: '/etc/passwd',
  },
  {
    contents:
      '[\n    "[aops-update]",\n    "name=update",\n    "baseurl=https://repo.openeuler.org/openEuler-22.03-LTS/update/$basearch/",\n    "enabled=1",\n    "gpgcheck=1",\n    "gpgkey=https://repo.openeuler.org/openEuler-22.03-LTS/OS/$basearch/RPM-GPG-KEY-openEuler"\n]\n',
    filePath: '/etc/shadow',
  },
  {
    contents:
      '[\n    "[aops-update]",\n    "name=update",\n    "baseurl=https://repo.openeuler.org/openEuler-22.03-LTS/update/$basearch/",\n    "enabled=1",\n    "gpgcheck=1",\n    "gpgkey=https://repo.openeuler.org/openEuler-22.03-LTS/OS/$basearch/RPM-GPG-KEY-openEuler"\n]\n',
    filePath: '/etc/rc.local',
  },
  {
    contents:
      '[\n    "Defaults   !visiblepw",\n    "Defaults    always_set_home",\n    "Defaults    match_group_by_gid",\n    "Defaults    always_query_group_plugin",\n    "Defaults    env_reset",\n    "Defaults    env_keep =  \\"COLORS DISPLAY HOSTNAME HISTSIZE KDEDIR LS_COLORS\\"",\n    "Defaults    env_keep += \\"MAIL PS1 PS2 QTDIR USERNAME LANG LC_ADDRESS LC_CTYPE\\"",\n    "Defaults    env_keep += \\"LC_COLLATE LC_IDENTIFICATION LC_MEASUREMENT LC_MESSAGES\\"",\n    "Defaults    env_keep += \\"LC_MONETARY LC_NAME LC_NUMERIC LC_PAPER LC_TELEPHONE\\"",\n    "Defaults    env_keep += \\"LC_TIME LC_ALL LANGUAGE LINGUAS _XKB_CHARSET XAUTHORITY\\"",\n    "Defaults    secure_path = /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",\n    "root ALL=(ALL)  ALL",\n    "aops    ALL=(ALL)       ALL",\n    "%wheel ALL=(ALL) ALL"\n]\n',
    filePath: '/etc/sudoers',
  },
  {
    contents:
      '{\n    "OS": {\n        "name": "OS",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/OS/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/OS/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "everything": {\n        "name": "everything",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/everything/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/everything/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "EPOL": {\n        "name": "EPOL",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/EPOL/main/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/OS/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "debuginfo": {\n        "name": "debuginfo",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/debuginfo/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/debuginfo/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "source": {\n        "name": "source",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/source/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/source/RPM-GPG-KEY-openEuler"\n    },\n    "update": {\n        "name": "update",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/update/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/OS/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "update-source": {\n        "name": "update-source",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/update/source/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/source/RPM-GPG-KEY-openEuler"\n    }\n}\n',
    filePath: '/etc/yum.repos.d/openEuler.repo',
  },
  {
    contents: '[\n    "openEuler"\n]\n',
    filePath: '/etc/hostname',
  },
]

const hostList = [
  {
    hostId: 'id1',
    ip: '172.168.68.2231',
    ipv6: 'ipv4',
  },
  {
    hostId: 'id2',
    ip: '172.168.175.194',
    ipv6: 'ipv4',
  },
  {
    hostId: 'id3',
    ip: '172.168.115.178',
    ipv6: 'ipv4',
  },
]

const getDomains: MockMethod = {
  url: '/conftrace/domain/queryDomain',
  method: 'post',
  timeout: 200,
  response: () => {
    return {
      domain_infos: [
        {
          cluster_id: '74a74289-67d2-412f-8e52-61b9cacde1cf',
          cluster_name: 'local',
          domain_id: 'id1',
          domain_name: 'aops1',
          priority: 0,
        },
        {
          cluster_id: '74a74289-67d2-412f-8e52-61b9cacde1cf',
          cluster_name: 'local',
          domain_id: 'id2',
          domain_name: 'aops',
          priority: 0,
        },
      ],
      total_count: 2,
      total_page: 1,
    }
  },
}
const getHostsInDomain: MockMethod = {
  url: '/conftrace/host/getHost',
  method: 'post',
  timeout: 200,
  response: () => {
    return {
      hostList,
      total_count: hostList.length,
      total_page: Math.floor(hostList.length / 10) + 1,
    }
  },
}

const getDomainStatus: MockMethod = {
  url: '/distribute/conftrace/confs/getDomainStatus',
  method: 'post',
  timeout: 1200,
  response: ({ body }) => {
    const clusterId = Object.keys(body)[0]
    const result = {}
    result[clusterId] = {
      data: {
        domainName: 'aops',
        hostStatus: [
          {
            hostId: 'id1',
            syncStatus: [
              {
                file_path: '/etc/shadow',
                isSynced: 'NOT SYNCHRONIZE',
              },
              {
                file_path: '/etc/rc.local',
                isSynced: 'NOT SYNCHRONIZE',
              },
              {
                file_path: '/etc/passwd',
                isSynced: 'NOT SYNCHRONIZE',
              },
              {
                file_path: '/etc/passwds',
                isSynced: 'SYNCHRONIZED',
              },
            ],
          },
          {
            hostId: 'id2',
            syncStatus: [
              {
                file_path: '/etc/shadow',
                isSynced: 'NOT SYNCHRONIZE',
              },
              {
                file_path: '/etc/rc.local',
                isSynced: 'SYNCHRONIZED',
              },
              {
                file_path: '/etc/passwd',
                isSynced: 'NOT FOUND',
              },
              {
                file_path: '/etc/passwds',
                isSynced: 'SYNCHRONIZED',
              },
            ],
          },
        ],
      },
    }
    return result
  },
}

const getDomainConf: MockMethod = {
  url: '/conftrace/management/getManagementConf',
  method: 'post',
  timeout: 200,
  response: body => {
    return {
      domainName: body.query.domainName,
      confFiles: CONFFILES,
    }
  },
}

const getRealConf: MockMethod = {
  url: '/distribute/conftrace/confs/queryRealConfs',
  method: 'post',
  timeout: 200,
  response: ({ body }) => {
    const clusterId = Object.keys(body)[0]
    const requestBody = Object.values(body)[0]

    const result = {}
    result[clusterId] = {
      data: [
        {
          domainName: requestBody.domainName,
          hostID: requestBody.hostIds[0].hostId,
          confBaseInfos: [
            {
              confContents:
                '[\n    "root:$6$sNp4Eeut01k2a2f0$.oiozUhW/B1VLdGCG4Qb2iDuZaQOfJ9H474LBAXNDililnrqOgGQnWKZCvCbibDgLIUaQ4KRDu02qE/9O1XrI/::0:99999:7:::",\n    "bin:*:19527:0:99999:7:::",\n    "daemon:*:19527:0:99999:7:::",\n    "adm:*:19527:0:99999:7:::",\n    "lp:*:19527:0:99999:7:::",\n    "sync:*:19527:0:99999:7:::",\n    "shutdown:*:19527:0:99999:7:::",\n    "halt:*:19527:0:99999:7:::",\n    "mail:*:19527:0:99999:7:::",\n    "operator:*:19527:0:99999:7:::",\n    "games:*:19527:0:99999:7:::",\n    "ftp:*:19527:0:99999:7:::",\n    "nobody:*:19527:0:99999:7:::",\n    "systemd-coredump:!:19543::::::",\n    "saslauth:!:19543::::::",\n    "unbound:!:19543::::::",\n    "dhcpd:!:19543::::::",\n    "sshd:!:19543::::::",\n    "dbus:!:19543::::::",\n    "polkitd:!:19543::::::",\n    "tss:!:19543::::::",\n    "chrony:!:19543::::::",\n    "systemd-network:!*:19543::::::",\n    "systemd-resolve:!*:19543::::::",\n    "systemd-timesync:!*:19543::::::"\n]',
              fileAttr: '0000',
              fileOwner: '(root, root)',
              filePath: '/etc/shadow',
              path: '/etc/shadow',
            },
            {
              confContents:
                '[\n    "root:x:0:0:root:/root:/bin/bash",\n    "bin:x:1:1:bin:/bin:/sbin/nologin",\n    "daemon:x:2:2:daemon:/sbin:/sbin/nologin",\n    "adm:x:3:4:adm:/var/adm:/sbin/nologin",\n    "lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin",\n    "sync:x:5:0:sync:/sbin:/bin/sync",\n    "shutdown:x:6:0:shutdown:/sbin:/sbin/shutdown",\n    "halt:x:7:0:halt:/sbin:/sbin/halt",\n    "mail:x:8:12:mail:/var/spool/mail:/sbin/nologin",\n    "operator:x:11:0:operator:/root:/sbin/nologin",\n    "games:x:12:100:games:/usr/games:/sbin/nologin",\n    "ftp:x:14:50:FTP User:/var/ftp:/sbin/nologin",\n    "nobody:x:65534:65534:Kernel Overflow User:/:/sbin/nologin",\n    "systemd-coredump:x:999:997:systemd Core Dumper:/:/sbin/nologin",\n    "saslauth:x:998:76:Saslauthd user:/run/saslauthd:/sbin/nologin",\n    "unbound:x:997:996:Unbound DNS resolver:/etc/unbound:/sbin/nologin",\n    "dhcpd:x:177:177:DHCP server:/:/sbin/nologin",\n    "sshd:x:74:74:Privilege-separated SSH:/var/empty/sshd:/sbin/nologin",\n    "dbus:x:81:81:D-Bus:/var/run/dbus:/sbin/nologin",\n    "polkitd:x:996:994:User for polkitd:/:/sbin/nologin",\n    "tss:x:59:59:Account used by the trousers package to sandbox the tcsd daemon:/dev/null:/sbin/nologin",\n    "chrony:x:995:992::/var/lib/chrony:/sbin/nologin",\n    "systemd-network:x:990:990:systemd Network Management:/:/usr/sbin/nologin",\n    "systemd-resolve:x:989:989:systemd Resolver:/:/usr/sbin/nologin",\n    "systemd-timesync:x:988:988:systemd Time Synchronization:/:/usr/sbin/nologin"\n]',
              fileAttr: '0644',
              fileOwner: '(root, root)',
              filePath: '/etc/passwd',
              path: '/etc/passwd',
            },
            {
              confContents: '[\n    "openEuler"\n]',
              fileAttr: '0644',
              fileOwner: '(root, root)',
              filePath: '/etc/hostname',
              path: '/etc/hostname',
            },
          ],
        },
      ],
    }
    return result
  },
}

const getDomainConfLog: MockMethod = {
  url: '/conftrace/management/queryManageConfChange',
  method: 'post',
  timeout: 200,
  response: () => {
    return {
      domainName: 'aops',
      confBaseInfos: [
        {
          expectedContents:
            '{\n    "OS": {\n        "name": "OS",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/OS/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/OS/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "everything": {\n        "name": "everything",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/everything/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/everything/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "EPOL": {\n        "name": "EPOL",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/EPOL/main/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/OS/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "debuginfo": {\n        "name": "debuginfo",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/debuginfo/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/debuginfo/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "source": {\n        "name": "source",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/source/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/source/RPM-GPG-KEY-openEuler"\n    },\n    "update": {\n        "name": "update",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/update/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/OS/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "update-source": {\n        "name": "update-source",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/update/source/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/source/RPM-GPG-KEY-openEuler"\n    }\n}\n',
          filePath: '/etc/yum.repos.d/openEuler.repo',
          changeLog: [
            {
              author: 'user_name <user_email>',
              changeId: 'ce523b2abc06fb9d4319d95b89d329257bb5169e',
              changeReason: '    Add the conf in aops domian, the path including : /etc/yum.repos.d/openEuler.repo',
              date: 'Tue Apr 16 19:30:24 2024 +0800',
              postValue:
                '{\n    "OS": {\n        "name": "OS",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/OS/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/OS/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "everything": {\n        "name": "everything",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/everything/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/everything/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "EPOL": {\n        "name": "EPOL",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/EPOL/main/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/OS/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "debuginfo": {\n        "name": "debuginfo",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/debuginfo/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/debuginfo/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "source": {\n        "name": "source",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/source/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/source/RPM-GPG-KEY-openEuler"\n    },\n    "update": {\n        "name": "update",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/update/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/OS/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "update-source": {\n        "name": "update-source",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/update/source/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/source/RPM-GPG-KEY-openEuler"\n    }\n}\n',
              preValue: '',
            },
            {
              author: 'user_name <user_email>',
              changeId: '24d6ea11ae9d81c566075021e28814dd0f0b585d',
              changeReason: '    Add the conf in aops domian, the path including : /etc/yum.repos.d/openEuler.repo',
              date: 'Sat Apr 13 15:20:01 2024 +0800',
              postValue: '',
              preValue:
                '{\n    "OS": {\n        "name": "OS",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/OS/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/OS/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "everything": {\n        "name": "everything",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/everything/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/everything/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "EPOL": {\n        "name": "EPOL",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/EPOL/main/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/OS/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "debuginfo": {\n        "name": "debuginfo",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/debuginfo/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/debuginfo/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "source": {\n        "name": "source",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/source/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/source/RPM-GPG-KEY-openEuler"\n    },\n    "update": {\n        "name": "update",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/update/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/OS/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "update-source": {\n        "name": "update-source",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/update/source/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/source/RPM-GPG-KEY-openEuler"\n    }\n}\n',
            },
          ],
        },
      ],
    }
  },
}

const addDomainConfig: MockMethod = {
  url: '/distribute/conftrace/management/addManagementConf',
  method: 'post',
  timeout: 200,
  response: ({ body }) => {
    const clusterId = Object.keys(body)[0]
    Object.values(body).forEach(item => {
      CONFFILES.push(...item.confFiles)
    })

    const result = {}
    result[clusterId] = {
      data: null,
      label: 'Success',
    }
    return {
      code: 200,
      data: result,
    }
  },
}

const deleteDomainConfig: MockMethod = {
  url: '/distribute/conftrace/management/deleteManagementConf',
  method: 'delete',
  timeout: 200,
  response: ({ body }) => {
    const clusterId = Object.keys(body)[0]
    Object.values(body).forEach(item => {
      const path = item.confFiles[0].filePath
      const idx = CONFFILES.findIndex(item => item.filePath === path)!
      CONFFILES.splice(idx, 1)
    })

    const result = {}
    result[clusterId] = {
      data: null,
      label: 'Success',
    }
    return {
      code: 200,
      data: result,
    }
  },
}

const getDomainSupportConfs: MockMethod = {
  url: '/conftrace/confs/querySupportedConfs',
  method: 'post',
  timeout: 200,
  response: () => {
    return [
      '/etc/security/limits.conf',
      '/etc/ssh/sshd_config',
      '/etc/fstab',
      '/etc/sysctl.conf',
      '/etc/rc.local',
      '/etc/profile',
      '/etc/ssh/ssh_config',
      '/etc/coremail/coremail.conf',
      '/etc/group',
      '/etc/pam.d',
      '/etc/bashrc',
      '/etc/shadow',
      '/etc/resolv.conf',
      '/etc/ntp.conf',
      '/etc/ld.so.conf',
    ]
  },
}

const getConfsOperationTrace: MockMethod = {
  url: '/conftrace/host/aa',
  method: 'post',
  timeout: 200,
  response: () => {
    return {
      conf_trace_infos: [
        {
          UUID: 'b0851744-3732-49f6-b689-243dea38422c',
          domain_name: 'aops',
          host_id: 'b0851744-3732-49f6-b689-243dea384cdc',
          conf_name: '/etc/hostname',
          info: '进程:vim 修改了文件:/etc/hostname',
          create_time: '2024-12-13 10:32:31',
          ptrace: 'bash => sshd sshd: xxxxxxxx',
        },
      ],
      total_count: 1,
      total_page: 1,
    }
  },
}

export const domainMock: Array<MockMethod> = [
  getDomains,
  getHostsInDomain,
  getDomainConf,
  getDomainConfLog,
  addDomainConfig,
  deleteDomainConfig,
  getDomainSupportConfs,
  getDomainStatus,
  getRealConf,
  getConfsOperationTrace,
]
