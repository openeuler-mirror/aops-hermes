%define debug_package %{nil}

Name:		aops-hermes
Version:	v2.0.0
Release:	1
Summary:	Web for an intelligent diagnose frame
License:	MulanPSL2
URL:		https://gitee.com/openeuler/%{name}
Source0:	%{name}-%{version}.tar.gz
Source1:	node-modules.tar.gz


BuildRequires: nodejs node-gyp nodejs-yarn
Requires:   nginx


%description
Web for an intelligent diagnose frame


%prep
%autosetup -n %{name}-%{version}
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
%attr(0755, root, root) %{_unitdir}/aops-hermes.service


%changelog
* Fri Sep 30 2022 lostway<luoshengwei@huawei.com> - 2.0.0-1
- Package init
