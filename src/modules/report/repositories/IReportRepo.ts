import { Reports } from '~/entities/reports.entity'
import { GetListReportInputDTO } from '~/modules/report/dto/Get'

export interface IReportRepo {
  create(report: Reports): Promise<Reports | null>
  find(data: GetListReportInputDTO): Promise<Reports[]>
}
