import { REPORTTYPE } from '~/entities/reports.entity'

export class CreateReportInputDTO {
  accountId!: number
  targetId!: number
  type!: REPORTTYPE
  reason!: string
  constructor(data?: Partial<CreateReportInputDTO>) {
    Object.assign(this, data)
  }
}
export class CreateReportOutputDTO {
  accountId!: number
  targetId!: number
  type!: string
  reason!: string
  message!: string
  constructor(data?: Partial<CreateReportOutputDTO>) {
    Object.assign(this, data)
  }
}
