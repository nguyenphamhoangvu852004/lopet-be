export class GetListReportInputDTO {
  accountId?: number
  type?: string
  targetId?: number
  constructor(data?: Partial<GetListReportInputDTO>) {
    Object.assign(this, data)
  }
}
export class GetListReportOutputDTO {
  constructor(data?: Partial<GetListReportOutputDTO>) {
    Object.assign(this, data)
  }
}
