// 获取常用时间
import dayjs from 'dayjs'

const today = dayjs().format('YYYY-MM-DD') // 今天
const currentJD = Math.ceil((dayjs().month() + 1) / 3) // 当前季度 1，2，3，4

/**
 * 今天
 */
export const TODAYS = [today, today]
/**
 * 最近3天
 */
export const LAST_3_DAYS = [dayjs().subtract(3, 'day').format('YYYY-MM-DD'), today]

/**
 * 最近7天
 */
export const LAST_7_DAYS = [dayjs().subtract(7, 'day').format('YYYY-MM-DD'), today]

/**
 * 最近30天
 */
export const LAST_30_DAYS = [dayjs().subtract(30, 'day').format('YYYY-MM-DD'), today]

/**
 * 格式化日期
 * @param {string|number} val 日期字符串,时间戳
 * @param {string} format 格式化字符串，默认：YYYY-MM-DD HH:mm:ss，格式标识参考：https://dayjs.fenxianglu.cn/category/display.html#%E6%A0%BC%E5%BC%8F%E5%8C%96
 * @returns 格式化后的日期字符串
 */
export function formatDate(val, format = 'YYYY-MM-DD HH:mm:ss') {
  return dayjs(val).format(format)
}

// 预设数据集1
export const PRE_SETS_1 = {
  今天: TODAYS,
  最近3天: LAST_3_DAYS,
  最近7天: LAST_7_DAYS,
  最近30天: LAST_30_DAYS,
}

// 预设数据集2
export const PRE_SETS_2 = {
  今天: TODAYS,
  本周: [dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD'), dayjs().endOf('week').add(1, 'day').format('YYYY-MM-DD')],
  本月: [dayjs().startOf('month').format('YYYY-MM-DD'), dayjs().endOf('month').format('YYYY-MM-DD')],
  本季: [
    dayjs()
      .month((currentJD - 1) * 3)
      .startOf('month')
      .format('YYYY-MM-DD'),
    dayjs()
      .month((currentJD - 1) * 3 + 2)
      .endOf('month')
      .format('YYYY-MM-DD'),
  ],
}
