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
