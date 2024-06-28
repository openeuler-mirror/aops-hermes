import type { MockMethod } from 'vite-plugin-mock';

const getDomains: MockMethod = {
  url: '/api/domain/queryDomain',
  method: 'post',
  timeout: 200,
  response: () => {
    return [
      {
        domainName: '12',
      },
      {
        domainName: 'aops',
      },
    ];
  },
};
const getHostsInDomain: MockMethod = {
  url: '/api/host/getHost',
  method: 'post',
  timeout: 200,
  response: () => [
    {
      hostId: 5,
      ip: '172.168.45.177',
      ipv6: 'ipv4',
    },
  ],
};

const getDomainConf: MockMethod = {
  url: '/api/management/getManagementConf',
  method: 'post',
  timeout: 200,
  response: (body) => {
    return {
      domainName: body.query.domainName,
      confFiles: [
        {
          contents:
            '[\n    "root:x:0:0:root:/root:/bin/bash",\n    "bin:x:1:1:bin:/bin:/sbin/nologin",\n    "daemon:x:2:2:daemon:/sbin:/sbin/nologin",\n    "adm:x:3:4:adm:/var/adm:/sbin/nologin",\n    "lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin",\n    "sync:x:5:0:sync:/sbin:/bin/sync",\n    "shutdown:x:6:0:shutdown:/sbin:/sbin/shutdown",\n    "halt:x:7:0:halt:/sbin:/sbin/halt",\n    "mail:x:8:12:mail:/var/spool/mail:/sbin/nologin",\n    "operator:x:11:0:operator:/root:/sbin/nologin",\n    "games:x:12:100:games:/usr/games:/sbin/nologin",\n    "ftp:x:14:50:FTP User:/var/ftp:/sbin/nologin",\n    "nobody:x:65534:65534:Kernel Overflow User:/:/sbin/nologin",\n    "systemd-coredump:x:999:997:systemd Core Dumper:/:/sbin/nologin",\n    "saslauth:x:998:76:Saslauthd user:/run/saslauthd:/sbin/nologin",\n    "unbound:x:997:996:Unbound DNS resolver:/etc/unbound:/sbin/nologin",\n    "dhcpd:x:177:177:DHCP server:/:/sbin/nologin",\n    "pesign:x:996:995:Group for the pesign signing daemon:/var/run/pesign:/sbin/nologin",\n    "sshd:x:74:74:Privilege-separated SSH:/var/empty/sshd:/sbin/nologin",\n    "dbus:x:81:81:D-Bus:/var/run/dbus:/sbin/nologin",\n    "polkitd:x:995:993:User for polkitd:/:/sbin/nologin",\n    "tss:x:59:59:Account used by the trousers package to sandbox the tcsd daemon:/dev/null:/sbin/nologin",\n    "chrony:x:994:991::/var/lib/chrony:/sbin/nologin",\n    "systemd-network:x:989:989:systemd Network Management:/:/usr/sbin/nologin",\n    "systemd-resolve:x:988:988:systemd Resolver:/:/usr/sbin/nologin",\n    "systemd-timesync:x:987:987:systemd Time Synchronization:/:/usr/sbin/nologin",\n    "newusername:x:1000:1000::/home/newusername:/bin/bash",\n    "aops:x:1001:1001::/home/aops:/bin/bash"\n]\n',
          filePath: '/etc/passwd',
        },
        {
          contents:
            '[\n    "root:x:0:0:root:/root:/bin/bash",\n    "bin:x:1:1:bin:/bin:/sbin/nologin",\n    "daemon:x:2:2:daemon:/sbin:/sbin/nologin",\n    "adm:x:3:4:adm:/var/adm:/sbin/nologin",\n    "lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin",\n    "sync:x:5:0:sync:/sbin:/bin/sync",\n    "shutdown:x:6:0:shutdown:/sbin:/sbin/shutdown",\n    "halt:x:7:0:halt:/sbin:/sbin/halt",\n    "mail:x:8:12:mail:/var/spool/mail:/sbin/nologin",\n    "operator:x:11:0:operator:/root:/sbin/nologin",\n    "games:x:12:100:games:/usr/games:/sbin/nologin",\n    "ftp:x:14:50:FTP User:/var/ftp:/sbin/nologin",\n    "nobody:x:65534:65534:Kernel Overflow User:/:/sbin/nologin",\n    "systemd-coredump:x:999:997:systemd Core Dumper:/:/sbin/nologin",\n    "saslauth:x:998:76:Saslauthd user:/run/saslauthd:/sbin/nologin",\n    "unbound:x:997:996:Unbound DNS resolver:/etc/unbound:/sbin/nologin",\n    "dhcpd:x:177:177:DHCP server:/:/sbin/nologin",\n    "pesign:x:996:995:Group for the pesign signing daemon:/var/run/pesign:/sbin/nologin",\n    "sshd:x:74:74:Privilege-separated SSH:/var/empty/sshd:/sbin/nologin",\n    "dbus:x:81:81:D-Bus:/var/run/dbus:/sbin/nologin",\n    "polkitd:x:995:993:User for polkitd:/:/sbin/nologin",\n    "tss:x:59:59:Account used by the trousers package to sandbox the tcsd daemon:/dev/null:/sbin/nologin",\n    "chrony:x:994:991::/var/lib/chrony:/sbin/nologin",\n    "systemd-network:x:989:989:systemd Network Management:/:/usr/sbin/nologin",\n    "systemd-resolve:x:988:988:systemd Resolver:/:/usr/sbin/nologin",\n    "systemd-timesync:x:987:987:systemd Time Synchronization:/:/usr/sbin/nologin",\n    "newusername:x:1000:1000::/home/newusername:/bin/bash",\n    "aops:x:1001:1001::/home/aops:/bin/bash"\n]\n',
          filePath: '/etc/sudoers',
        },
        {
          contents:
            '[\n    "root:x:0:0:root:/root:/bin/bash",\n    "bin:x:1:1:bin:/bin:/sbin/nologin",\n    "daemon:x:2:2:daemon:/sbin:/sbin/nologin",\n    "adm:x:3:4:adm:/var/adm:/sbin/nologin",\n    "lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin",\n    "sync:x:5:0:sync:/sbin:/bin/sync",\n    "shutdown:x:6:0:shutdown:/sbin:/sbin/shutdown",\n    "halt:x:7:0:halt:/sbin:/sbin/halt",\n    "mail:x:8:12:mail:/var/spool/mail:/sbin/nologin",\n    "operator:x:11:0:operator:/root:/sbin/nologin",\n    "games:x:12:100:games:/usr/games:/sbin/nologin",\n    "ftp:x:14:50:FTP User:/var/ftp:/sbin/nologin",\n    "nobody:x:65534:65534:Kernel Overflow User:/:/sbin/nologin",\n    "systemd-coredump:x:999:997:systemd Core Dumper:/:/sbin/nologin",\n    "saslauth:x:998:76:Saslauthd user:/run/saslauthd:/sbin/nologin",\n    "unbound:x:997:996:Unbound DNS resolver:/etc/unbound:/sbin/nologin",\n    "dhcpd:x:177:177:DHCP server:/:/sbin/nologin",\n    "pesign:x:996:995:Group for the pesign signing daemon:/var/run/pesign:/sbin/nologin",\n    "sshd:x:74:74:Privilege-separated SSH:/var/empty/sshd:/sbin/nologin",\n    "dbus:x:81:81:D-Bus:/var/run/dbus:/sbin/nologin",\n    "polkitd:x:995:993:User for polkitd:/:/sbin/nologin",\n    "tss:x:59:59:Account used by the trousers package to sandbox the tcsd daemon:/dev/null:/sbin/nologin",\n    "chrony:x:994:991::/var/lib/chrony:/sbin/nologin",\n    "systemd-network:x:989:989:systemd Network Management:/:/usr/sbin/nologin",\n    "systemd-resolve:x:988:988:systemd Resolver:/:/usr/sbin/nologin",\n    "systemd-timesync:x:987:987:systemd Time Synchronization:/:/usr/sbin/nologin",\n    "newusername:x:1000:1000::/home/newusername:/bin/bash",\n    "aops:x:1001:1001::/home/aops:/bin/bash"\n]\n',
          filePath: '/etc/yum.repos.d/openEuler.repo',
        },
        {
          contents:
            '[\n    "root:x:0:0:root:/root:/bin/bash",\n    "bin:x:1:1:bin:/bin:/sbin/nologin",\n    "daemon:x:2:2:daemon:/sbin:/sbin/nologin",\n    "adm:x:3:4:adm:/var/adm:/sbin/nologin",\n    "lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin",\n    "sync:x:5:0:sync:/sbin:/bin/sync",\n    "shutdown:x:6:0:shutdown:/sbin:/sbin/shutdown",\n    "halt:x:7:0:halt:/sbin:/sbin/halt",\n    "mail:x:8:12:mail:/var/spool/mail:/sbin/nologin",\n    "operator:x:11:0:operator:/root:/sbin/nologin",\n    "games:x:12:100:games:/usr/games:/sbin/nologin",\n    "ftp:x:14:50:FTP User:/var/ftp:/sbin/nologin",\n    "nobody:x:65534:65534:Kernel Overflow User:/:/sbin/nologin",\n    "systemd-coredump:x:999:997:systemd Core Dumper:/:/sbin/nologin",\n    "saslauth:x:998:76:Saslauthd user:/run/saslauthd:/sbin/nologin",\n    "unbound:x:997:996:Unbound DNS resolver:/etc/unbound:/sbin/nologin",\n    "dhcpd:x:177:177:DHCP server:/:/sbin/nologin",\n    "pesign:x:996:995:Group for the pesign signing daemon:/var/run/pesign:/sbin/nologin",\n    "sshd:x:74:74:Privilege-separated SSH:/var/empty/sshd:/sbin/nologin",\n    "dbus:x:81:81:D-Bus:/var/run/dbus:/sbin/nologin",\n    "polkitd:x:995:993:User for polkitd:/:/sbin/nologin",\n    "tss:x:59:59:Account used by the trousers package to sandbox the tcsd daemon:/dev/null:/sbin/nologin",\n    "chrony:x:994:991::/var/lib/chrony:/sbin/nologin",\n    "systemd-network:x:989:989:systemd Network Management:/:/usr/sbin/nologin",\n    "systemd-resolve:x:988:988:systemd Resolver:/:/usr/sbin/nologin",\n    "systemd-timesync:x:987:987:systemd Time Synchronization:/:/usr/sbin/nologin",\n    "newusername:x:1000:1000::/home/newusername:/bin/bash",\n    "aops:x:1001:1001::/home/aops:/bin/bash"\n]\n',
          filePath: '/etc/hostname',
        },
        {
          contents:
            '[\n    "root:x:0:0:root:/root:/bin/bash",\n    "bin:x:1:1:bin:/bin:/sbin/nologin",\n    "daemon:x:2:2:daemon:/sbin:/sbin/nologin",\n    "adm:x:3:4:adm:/var/adm:/sbin/nologin",\n    "lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin",\n    "sync:x:5:0:sync:/sbin:/bin/sync",\n    "shutdown:x:6:0:shutdown:/sbin:/sbin/shutdown",\n    "halt:x:7:0:halt:/sbin:/sbin/halt",\n    "mail:x:8:12:mail:/var/spool/mail:/sbin/nologin",\n    "operator:x:11:0:operator:/root:/sbin/nologin",\n    "games:x:12:100:games:/usr/games:/sbin/nologin",\n    "ftp:x:14:50:FTP User:/var/ftp:/sbin/nologin",\n    "nobody:x:65534:65534:Kernel Overflow User:/:/sbin/nologin",\n    "systemd-coredump:x:999:997:systemd Core Dumper:/:/sbin/nologin",\n    "saslauth:x:998:76:Saslauthd user:/run/saslauthd:/sbin/nologin",\n    "unbound:x:997:996:Unbound DNS resolver:/etc/unbound:/sbin/nologin",\n    "dhcpd:x:177:177:DHCP server:/:/sbin/nologin",\n    "pesign:x:996:995:Group for the pesign signing daemon:/var/run/pesign:/sbin/nologin",\n    "sshd:x:74:74:Privilege-separated SSH:/var/empty/sshd:/sbin/nologin",\n    "dbus:x:81:81:D-Bus:/var/run/dbus:/sbin/nologin",\n    "polkitd:x:995:993:User for polkitd:/:/sbin/nologin",\n    "tss:x:59:59:Account used by the trousers package to sandbox the tcsd daemon:/dev/null:/sbin/nologin",\n    "chrony:x:994:991::/var/lib/chrony:/sbin/nologin",\n    "systemd-network:x:989:989:systemd Network Management:/:/usr/sbin/nologin",\n    "systemd-resolve:x:988:988:systemd Resolver:/:/usr/sbin/nologin",\n    "systemd-timesync:x:987:987:systemd Time Synchronization:/:/usr/sbin/nologin",\n    "newusername:x:1000:1000::/home/newusername:/bin/bash",\n    "aops:x:1001:1001::/home/aops:/bin/bash"\n]\n',
          filePath: '/etc/hosts',
        },
      ],
    };
  },
};

const getDomainConfLog: MockMethod = {
  url: '/api/management/queryManageConfChange',
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
              changeReason:
                '    Add the conf in aops domian, the path including : /etc/yum.repos.d/openEuler.repo',
              date: 'Tue Apr 16 19:30:24 2024 +0800',
              postValue:
                '{\n    "OS": {\n        "name": "OS",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/OS/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/OS/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "everything": {\n        "name": "everything",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/everything/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/everything/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "EPOL": {\n        "name": "EPOL",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/EPOL/main/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/OS/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "debuginfo": {\n        "name": "debuginfo",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/debuginfo/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/debuginfo/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "source": {\n        "name": "source",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/source/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/source/RPM-GPG-KEY-openEuler"\n    },\n    "update": {\n        "name": "update",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/update/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/OS/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "update-source": {\n        "name": "update-source",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/update/source/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/source/RPM-GPG-KEY-openEuler"\n    }\n}\n',
              preValue: '',
            },
            {
              author: 'user_name <user_email>',
              changeId: '24d6ea11ae9d81c566075021e28814dd0f0b585d',
              changeReason:
                '    Add the conf in aops domian, the path including : /etc/yum.repos.d/openEuler.repo',
              date: 'Sat Apr 13 15:20:01 2024 +0800',
              postValue: '',
              preValue:
                '{\n    "OS": {\n        "name": "OS",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/OS/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/OS/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "everything": {\n        "name": "everything",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/everything/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/everything/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "EPOL": {\n        "name": "EPOL",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/EPOL/main/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/OS/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "debuginfo": {\n        "name": "debuginfo",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/debuginfo/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/debuginfo/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "source": {\n        "name": "source",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/source/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/source/RPM-GPG-KEY-openEuler"\n    },\n    "update": {\n        "name": "update",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/update/$basearch/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/OS/$basearch/RPM-GPG-KEY-openEuler"\n    },\n    "update-source": {\n        "name": "update-source",\n        "baseurl": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/update/source/",\n        "enabled": "1",\n        "gpgcheck": "1",\n        "gpgkey": "http://repo.huaweicloud.com/openeuler/openEuler-22.03-LTS-SP2/source/RPM-GPG-KEY-openEuler"\n    }\n}\n',
            },
          ],
        },
      ],
    };
  },
};

const addDomainConfig: MockMethod = {
  url: '/api/management/addManagementConf',
  method: 'post',
  timeout: 200,
  response: () => {
    return {
      code: 200,
      msg: 'All confs add management conf successfully, 1 confs in total.',
    };
  },
};

const deleteDomainConfig: MockMethod = {
  url: '/api/management/deleteManagementConf',
  method: 'delete',
  timeout: 200,
  response: () => {
    return {
      code: 200,
      msg: 'All confs delete  management conf successfully, 1 confs in total.',
    };
  },
};

const getDomainSupportConfs: MockMethod = {
  url: '/api/confs/querySupportedConfs',
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
    ];
  },
};

export const domainMock: Array<MockMethod> = [
  getDomains,
  getHostsInDomain,
  getDomainConf,
  getDomainConfLog,
  addDomainConfig,
  deleteDomainConfig,
];
