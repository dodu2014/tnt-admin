/**
 * 净化 object，过滤掉 null undefined 和 对象(包含数组)
 * @param {object} json json对象
 * @returns {object} json对象
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
export function purifyObject(json: object): any {
  return JSON.parse(JSON.stringify(json, (key, value) => ((key && typeof value === 'object') || (!value && value !== 0) ? undefined : value)))
}

/**
 * 转化枚举类型的 entries 为对象数组，过滤掉数字枚举中数字为 key 的项
 * @param entries 枚举成员的 entries
 * @returns {Array<{ label: string, value: string|number }>} 净化后的 json 对象 { label: string, value: string|number } 数组
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
export const convertEnumEntriesToArray = (entries: [string, any][]): Array<{ label: string; value: string | number }> => {
  const result = entries.map(([key, value]) => ({ label: key, value }))
  if (result.find(i => typeof i.value === 'number')) return result.filter(i => typeof i.value === 'number')
  return result
}
