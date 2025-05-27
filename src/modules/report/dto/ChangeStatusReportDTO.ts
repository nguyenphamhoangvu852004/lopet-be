import { ACTION, REPORTTYPE } from '~/entities/reports.entity'

export class ChangeStatusReportInputDTO {
  targetId!: number
  type!: REPORTTYPE
  action!: ACTION // 0: pending, 1: approved, 2: rejected
  constructor(data?: Partial<ChangeStatusReportInputDTO>) {
    Object.assign(this, data)
  }
}

export class ChangeStatusReportOutputDTO {
  id!: number
  constructor(data?: Partial<ChangeStatusReportOutputDTO>) {
    Object.assign(this, data)
  }
}
