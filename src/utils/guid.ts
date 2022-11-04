/**
 * Guid API
 */
export const guid = {
  /**
   * 空Guid值
   */
  empty: '00000000-0000-0000-0000-000000000000',
  /**
   * 新的Guid值
   * @returns {String} 新的 Guid 值, 类似 .net 下的 Guid.NewGuid()
   */
  new(): string {
    const S4 = () => {
      // eslint-disable-next-line no-bitwise
      return (((Math.random() + 1) * 0x10000) | 0).toString(16).substring(1)
    }
    return `${S4()}${S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`
  },

  /**
   * 转换为guid格式字符串
   * @param {string} str 需要转换的字符串, 一般32位或36位
   */
  parse(str: string) {
    if (str.length === 32) {
      const result = []
      for (let i = 0; i < 32; i += 4) {
        console.log(str.substr(i, 4))
        result.push(str.substr(i, 4))
      }
      return `${result[0]}${result[1]}-${result[2]}-${result[3]}-${result[4]}-${result[5]}${result[6]}${result[7]}`
    }
    if (str.length === 36) {
      return str
    }
    throw new Error('格式无效')
  },
}
