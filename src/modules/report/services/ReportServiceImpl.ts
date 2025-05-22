import { CreateReportInputDTO, CreateReportOutputDTO } from '~/modules/report/dto/Create'
import { IReportRepo } from '~/modules/report/repositories/IReportRepo'
import { IReportService } from '~/modules/report/services/IReportService'
import { handleThrowError } from '~/utils/handle.util'

export class ReportServiceImpl implements IReportService {
  constructor(private reportRepo: IReportRepo) {
    this.reportRepo = reportRepo
  }
  async create(report: CreateReportInputDTO): Promise<CreateReportOutputDTO | null> {
    try {
    //   const result = await this.reportRepo.create(report)
    //   if (!result) return null
     return new CreateReportOutputDTO();
    } catch (error) {
      handleThrowError(error)
    }
  }
}
