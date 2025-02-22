// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.
import { http } from './request'
import type { RecordItem, RecordConversationItem, Plugin } from './types'


export async function queryHistoryConversation() {
  return http.get<{
    conversations: RecordItem[]
  }>('/api/conversation')
}

export async function newConversation() {
  return http.post<{ conversation_id: string }>('/api/conversation')
}

export async function queryRecordByConversationId(conversationId: string) {
  return http.get<{
    records: RecordConversationItem[]
  }>(`/api/record/${conversationId}`, )
}

export async function queryPlugins() {
  return http.get<{plugins: Plugin[]}>('/api/plugin')
}

export async function updateConversationTitle(conversationId: string, title: string) {
  return http.put('/api/conversation', { title }, { conversation_id: conversationId })
}

export async function deleteConversation(conversationIds: string[]) {
  return http.post<{
    conversation_id_list: string[]
  }>('/api/conversation/delete', { conversation_list: conversationIds })
}
