// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.
export interface HostParams {
  host_name: string;
  host_group_name: string;
  host_ip: string;
  management: boolean;
  ssh_user: string;
  ssh_port: number;
  ssh_pkey: string;
  password: string;
}

export interface HostItem {
  key?: string | number;
  host_ip: string;
  host_group_name: string;
  host_name: string;
  management: boolean;
  ssh_pkey: string;
  ssh_port: number;
  ssh_user: string;
  password: string;
  reason?: string;
  result?: string;
}
