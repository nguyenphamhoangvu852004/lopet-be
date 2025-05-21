import { Reports } from '~/entities/reports.entity'

export interface IReportRepo {
  create(report: Reports): Promise<Reports | null>
}
