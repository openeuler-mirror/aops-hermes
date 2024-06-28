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
