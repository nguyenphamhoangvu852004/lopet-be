import { Repository } from 'typeorm'
import { appDataSource } from '~/config/appDataSource'
import { Reports } from '~/entities/reports.entity'
import { IReportRepo } from '~/modules/report/repositories/IReportRepo'

export class ReportRepoImpl implements IReportRepo {
  private reportRepo: Repository<Reports>
  constructor() {
    this.reportRepo = appDataSource.getRepository(Reports)
  }
  async create(report: Reports): Promise<Reports | null> {
    const result = await this.reportRepo.save(report)
    if (!result) return null
    return result
  }
}
