%define debug_package %{nil}

Name:		aops-hermes
Version:	v1.0.0
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
mkdir -p %{buildroot}/%{_sysconfdir}/nginx
cp -r deploy/aops-hermes-nginx.conf %{buildroot}/%{_sysconfdir}/nginx/
mkdir -p %{buildroot}/usr/lib/systemd/system
cp -r deploy/aops-hermes.service %{buildroot}/usr/lib/systemd/system/

%files
%attr(0755, root, root) /opt/aops/web/dist/*
%attr(0755, root, root) %{_sysconfdir}/nginx/aops-hermes-nginx.conf
%attr(0755, root, root) /usr/lib/systemd/system/aops-hermes.service


%changelog
* Tue May 28 2024 Hugang<18768366022@163.com> - v1.0.0-1
- Refactor Aops-hermes
