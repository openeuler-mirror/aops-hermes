// Copyright (c) Huawei Technologies Co., Ltd. 2023-2024. All rights reserved.
// licensed under the Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//      http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN 'AS IS' BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
// PURPOSE.
// See the Mulan PSL v2 for more details.
export * from './dom'

export function deepClone(arr: Array<any>) {
  const clone = Array.isArray(arr) ? [] : {}
  for (const item in arr) {
    if (Object.prototype.hasOwnProperty.call(arr, item)) {
      if (typeof arr[item] === 'object' && arr[item] !== null)
        clone[item] = deepClone(arr[item])
      else
        clone[item] = arr[item]
    }
  }
  return clone
}

export function hasIntersection(arr1: string[], arr2: string[]) {
  const set1 = new Set(arr1)
  for (const item of arr2) {
    if (set1.has(item))
      return true
  }
  return false
}

export function isArrayOrObject(value: any) {
  if (Array.isArray(value))
    return true

  if (typeof value === 'object' && value !== null)
    return true

  return false
}

export function isObject(value: any) {
  return !!(typeof value === 'object' && value !== null)
}


/**
 * Checks if there are any added or removed items in the given diff result array.
 *
 * @param {Diff.Change[]} diffResult - The diff result array to check.
 * @return {boolean} Returns `true` if there are any added or removed items,
 *                   `false` otherwise.
 */
export function checkIsDiff(diffResult: Diff.Change[]): boolean {
  for (let i = 0; i < diffResult.length; i++) {
    if (diffResult[i].added || diffResult[i].removed)
      return true
  }
  return false
}
