import { Reports } from '~/entities/reports.entity'
import { CreateReportInputDTO, CreateReportOutputDTO } from '~/modules/report/dto/Create'
import { GetListReportInputDTO } from '~/modules/report/dto/Get'

export interface IReportService {
  create(report: CreateReportInputDTO): Promise<CreateReportOutputDTO | null>
  getList(data: GetListReportInputDTO): Promise<Reports[]>
}
