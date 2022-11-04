export interface UserOperateLogEntity {
  id: string
  requestUrl: string
  requestMethod: string
  requestBody: string
  requestMilliseconds: number
  type: UserOperateLogType
  content: string
  userId: string
  userName: string
  ipAddress: string
  ipInfo: string
  adCode: string
  ipLocation: string
  os: string
  ua: string
  creationDate: string
}

export enum UserOperateLogTypeEnum {
  操作 = 1,
  登录 = 2,
  异常 = 3,
  其他 = 9,
}
