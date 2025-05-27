import { Reports } from '~/entities/reports.entity'
import { ChangeStatusReportInputDTO, ChangeStatusReportOutputDTO } from '~/modules/report/dto/ChangeStatusReportDTO'
import { CreateReportInputDTO, CreateReportOutputDTO } from '~/modules/report/dto/Create'
import { GetListReportInputDTO } from '~/modules/report/dto/Get'

export interface IReportService {
  create(report: CreateReportInputDTO): Promise<CreateReportOutputDTO | null>
  getList(data: GetListReportInputDTO): Promise<Reports[]>
  update(data: ChangeStatusReportInputDTO): Promise<ChangeStatusReportOutputDTO | null>
}
