%define debug_package %{nil}

Name:		aops-hermes
Version:	v2.0.0
Release:	1
Summary:	Web for an intelligent diagnose frame
License:	MulanPSL2
URL:		https://gitee.com/openeuler/%{name}
Source:	%{name}-%{version}.tar.gz


BuildRequires: nodejs
Requires:   nginx


%description
Web for an intelligent diagnose frame


%prep
%autosetup -n %{name}-%{version}

%build
npm install -g pnpm@6
pnpm install 

pnpm build


%install
mkdir -p %{buildroot}/opt/aops/web
cp -r dist %{buildroot}/opt/aops/web/
mkdir -p %{buildroot}/usr/lib/systemd/system
cp -r deploy/aops-hermes.service %{buildroot}/usr/lib/systemd/system/

%files
%attr(0755, root, root) /opt/aops/web/dist/*
%attr(0755, root, root) /usr/lib/systemd/system/aops-hermes.service


%changelog
* Tue May 28 2024 Hugang<18768366022@163.com> - v2.0.0-1
- Refactor Aops-hermes

* Wed Jan 17 2024 Hu gang<18768366022@163.com> - v1.4.0-7
- Modify the task description copy of the create hot patch removal task
- remove create rollback button in cve detail,add hotpatch button in cve detail

* Wed Dec 27 2023 Hu gang<18768366022@163.com> - v1.4.0-6
- Fix hot patch prompts are only executed ifexecuted

* Fri Dec 22 2023 Hu gang<18768366022@163.com> - v1.4.0-5
- Fix diagnosis

* Fri Dec 22 2023 Hu gang<18768366022@163.com> - v1.4.0-4
- Added an interface adaptation for host status
- Added a field to determine whether the kernel changes after the host is restarted
- Added a new hot patch prompt for creating a repair task
- Fix some bug

* Tue Dec 19 2023 Hu gang<18768366022@163.com> - v1.4.0-3
- Add imput text limit

* Mon Dec 18 2023 Hu gang<18768366022@163.com> - v1.4.0-2
- Added keyword search for host list
- Fixed the problem of abnormal list rendering in task details task running state
- Optimize some page copywriting
- Adaptation rollback task related (creation, execution, detailed viewing, task report viewing, etc.)
- Solve the problem of hot and cold patch execution tasks failing when creating a repair task.
- Fix hotpatch remove list filter failed

* Tue Dec 12 2023 Hu gang<18768366022@163.com> - v1.4.0-1
- adapt to NewRepair Tasks Including DetailsCreation TaskReports And TaskExecution
- Modify the original rollback task to hot patch rollback
- Added related rollback tasks

* Mon Nov 27 2023 Hu gang<18768366022@163.com> - v1.3.5-2
- Resolve the problem of host display of the expanded menu in the host management batch adding host interface
- Optimize the logic of adding hosts in batches under different circumstances

* Fri Nov 24 2023 Hu gang<18768366022@163.com> - v1.3.5-1
- Update the master branch code to the 1.3.5

* Tue Nov 14 2023 wangkunlong<505997900@qq.com> - v1.3.4-1
- Update the master branch code to the 1.3.4

* Wed Oct 18 2023 wangkunlong<505997900@qq.com> - v1.3.3-4
- Update the master branch code to the latest version

* Wed Sep 20 2023 wangkunlong<505997900@qq.com> - v1.3.3-3
- Change params in rpms under host
- Change hotpatch rpms show way

* Wed Sep 20 2023 wangkunlong<505997900@qq.com> - v1.3.3-2
- Resolve the issue of abnormal display of paginated data after expanding the rpm list when setting multiple data pagination settings
- Resolve the issue of abnormal upload security announcement parameters

* Tue Sep 19 2023 wangkunlong<505997900@qq.com> - v1.3.3-1
- Fix parameter passing when expanding a secondary list of unselectable items in the CVE list
- Fix the issue of abnormal repo settings during deployment and adjust the parameters for rollback tasks

* Tue Sep 19 2023 wangkunlong<505997900@qq.com> - v1.3.2-1
- Resolve the issue of abnormal data deletion on the host management page
- Resolve the issue of undefined related fields in the host details interface during CVE scanning
- Resolve the issue of generating task pages with option buttons not cleared
- Resolve the issue of abnormal hot patch data when multiple hot patches are selected for repair on the CVE details page
- Resolve CVE repair details page: issues with installed rpm and affected rpm errors associated with CVE
- Resolve the issue of installed rpm and affected rpm errors associated with the host on the CVE details page
- Resolve the issue of page page number jumping and abnormal page display on the front-end page
- Solve vulnerability scanning, and identify requirements that users are not aware of after scanning
- Resolve the issue of requesting page failure and reporting 400 errors after refreshtoken failure
- Resolve the issue of incorrect email specifications on the registered user page
- Solve the issue of inconsistency between the actual repair task and the displayed one on the CVE detail page and generate a repair task

* Wed Sep 13 2023 wangkunlong<505997900@qq.com> - v1.3.1-5
- Add a configuration synchronization interface on the interface to support configuration synchronization of configuration files

* Wed Sep 13 2023 wangkunlong<505997900@qq.com> - v1.3.1-4
- The current Aops integration configuration file traceability function has added a large number of configuration file processing
- Add processing on the interface, allowing users to select supported configuration file objects

* Wed Sep 13 2023 wangkunlong<505997900@qq.com> - v1.3.1-3
- Modify generation repair tasks and set repo task parameters
- Solve task description font issues in task details
- Resolve the issue of page request failure after refreshtoken failure
- Add front-end description to the takeover filter item

* Mon Sep 11 2023 wangkunlong<505997900@qq.com> - v1.3.1-2
- Resolve the issue of fixing RPMS
- Solve the problem of format verification when registering hosts
- Resolve the issue of generating incorrect repair task information
- Resolve the issue of abnormal display in the task management section

* Tue Sep 5 2023 wangkunlong<505997900@qq.com> - v1.3.1-1
- fix cve rollback task params problems
- cancel rpms selection under fixed cves

* Tue Sep 5 2023 wangkunlong<505997900@qq.com> - v1.3.0-1
- Updata to 23.09 rc3

* Fri Jul 28 2023 wangkunlong<505997900@qq.com> - v1.2.2-2
- Fixed an issue where deleting some hosts after bulk uploading resulted in incorrect display of the current host list
- Fix an issue where a batch upload host failed due to field restrictions
- Fixed the issue of incorrect display of host information after entering a part of the host list without CVE hosts

* Tue Jul 18 2023 wangkunlong<505997900@qq.com> - v1.2.2-1
- Solved the problem of nodejs being unable to build successfully in the 23.03 environment on the master branch
- Modify the front-end tab icon to the openeuler icon
- Fix the issue of selecting a fixed cold patch for rollback operation, with incorrect prompts in the previous paragraph

* Wed Jun 14 2023 wangkunlong<505997900@qq.com> - v1.2.1-7
- The host list under cve has been fixed and the hot patch repair column has been changed to support hot patches
- The CVE list under the host list has-not been fixed and the hot patch support has been changed-to support hot patches
- Generate support for hot patches in the CVE repair task and add tooltip help text after accepting or not

* Fri Jun 9 2023 wangkunlong<505997900@qq.com> - v1.2.1-6
- Fix-token-refresh-issue
- Solve-the-issue-of-unreasonable-layout-in-the-CVE-detail-interface
- Resolve-the-issue-of-incorrect-task-list-filtering

* Fri Jun 2 2023 wangkunlong<505997900@qq.com> - v1.2.1-5
- Add host under cve hotpatch Filtering function

* Fri Jun 2 2023 wangkunlong<505997900@qq.com> - v1.2.1-4
- Add Hot patch Filtering function

* Fri Jun 2 2023 wangkunlong<505997900@qq.com> - v1.2.1-3
- Add the 'accepted' parameter to the interface for creating cve repair tasks
- Modify the cve list under the host and the hot patch support in the affected host list under cve to display two fields: hot patch repair and status
- Modify the display of host status in the host management interface

* Thu Jun 1 2023 wangkunlong<505997900@qq.com> - v1.2.1-2
- Resolve the issue of abnormal page display when switching host details
- Resolve the issue of host details and hot patch support column filtering failure
- Resolve the issue of incorrect filtering conditions in the "Rollback Status" column of the CVE list for task details
- Resolve the issue of incorrect display of the latest status of the host on the task details pag

* Tue May 23 2023 wangkunlong<505997900@qq.com> - v1.2.1-1
- Vulnerability Management Part Code Hot Update Function Update

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