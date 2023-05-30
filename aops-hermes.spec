%define debug_package %{nil}

Name:		aops-hermes
Version:	v1.2.0
Release:	1
Summary:	Web for an intelligent diagnose frame
License:	MulanPSL2
URL:		https://gitee.com/openeuler/%{name}
Source0:	%{name}-%{version}.tar.gz
Source1:	node-modules.tar.gz
Patch0001:      0001-optimize-page-loading-and-routing.patch
Patch0002:      0002-fix-verify-the-host-name-field-issue.patchcd
Patch0003:      0003-add-token-exit-interface-and-optimize-Gitee-authorization.patch
Patch0004:      0004-Vulnerability-management-and-token-legacy-issues-resolution.patch
Patch0005:      0005-Host-Management-Host-User-Name-Addition-Field-Length-Limits.patch
Patch0006:      0006-Modify-token-settings-in-the-configuration-file.patch


BuildRequires: nodejs node-gyp nodejs-yarn
Requires:   nginx


%description
Web for an intelligent diagnose frame


%prep
%autosetup -n %{name}-%{version} -p1
%setup -T -D -a 1


%build
yarn build


%install
mkdir -p %{buildroot}/opt/aops/web
cp -r dist %{buildroot}/opt/aops/web/
mkdir -p %{buildroot}/%{_sysconfdir}/nginx
cp -r deploy/aops-nginx.conf %{buildroot}/%{_sysconfdir}/nginx/
mkdir -p %{buildroot}/usr/lib/systemd/system
cp -r deploy/aops-hermes.service %{buildroot}/usr/lib/systemd/system/


%files
%attr(0755, root, root) /opt/aops/web/dist/*
%attr(0755, root, root) %{_sysconfdir}/nginx/aops-nginx.conf
%attr(0755, root, root) /usr/lib/systemd/system/aops-hermes.service


%changelog
* Wed May 10 2023 wangkunlong<505997900@qq.com> - v1.2.0-4
- Modify token settings in the configuration file

* Tue May 9 2023 wangkunlong<505997900@qq.com> - v1.2.0-3
- Resolve token failure issues
- Resolve the issue of switching menu data not being refreshed
- Resolve issues where the cve repair task was not transferred to hotpatch
- Modify cve repair task hot update text prompt
- Modify the Generate CVE Repair Task button to be grayed out by default
- Host Management Host User Name Addition Field Length Limit

* Fri Apr 28 2023 wangkunlong<505997900@qq.com> - v1.2.0-2
- Optimize page loading speed
- Optimize routing
- Optimize login and exit interface
- Solve the inconsistency in verifying the host name field between the front and back ends when adding hosts in a single and batch manner
- Optimize login interface UI display
- Resolve the display of registration interface icons and text
- Solve legacy issues with batch adding hosts and editing host interfaces
- Optimize CVE list refresh logic
- Add exit interface
- Optimize Gitee authorization login jump logic

* Mon Apr 17 2023 wangkunlong<505997900@qq.com> - v1.2.0-1
- add host interfaces, optimize the display effect of some interfaces

* Mon Dec 19 2022 wenxin<shusheng.wen@outlook.com> - v1.1.2-4
- Fix the bugs that are found

* Tue Dec 13 2022 wenxin<shusheng.wen@outlook.com> - v1.1.2-3
- Fix the bug that the total number of alarms is not synchronously refreshed

* Mon Dec 12 2022 zhuyuncheng<zhuyuncheng@huawei.com> - v1.1.2-2
- fix some bugs in diana website

* Wed Dec 07 2022 wenxin<shusheng.wen@outlook.com> - v1.1.2-1
- fix some bugs

* Fri Dec 02 2022 wenxin<shusheng.wen@outlook.com> - v1.1.1-1
- fix some bugs

* Sat Nov 26 2022 gongzhengtang<gong_zhengtang@163.com> - v1.1.0-3
- Fix param error and input limit of length

* Fri Nov 25 2022 wenxin<shusheng.wen@outlook.com> - v1.1.0-2
- Adjust the code style

* Fri Nov 25 2022 wenxin<shusheng.wen@outlook.com> - v1.1.0-1
- Fix the bug of cve vulnerability management module

* Tue Nov 22 2022 zhuyuncheng<zhuyuncheng@huawei.com> - v1.0.0-1
- Package init
