// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.
export interface Domain {
  domainName: string;
}
export interface HostInDomain {
  hostId: number;
  ip: string;
  ipv6: string;
  syncStatus?: boolean;
}
export interface ConfFile {
  contents: string;
  filePath: string;
}
export interface ChangeLog {
  author: string;
  changeId: string;
  changeReason: string;
  date: string;
  postValue: string;
  preValue: string;
}
export interface ConfBaseInfo {
  expectedContents: string;
  filePath: string;
  changeLog: ChangeLog[];
}
