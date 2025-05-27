/* eslint-disable @typescript-eslint/no-explicit-any */
import { Repository } from 'typeorm'
import { mySqlDataSource } from '~/config/appDataSource'
import { Reports } from '~/entities/reports.entity'
import { GetListReportInputDTO } from '~/modules/report/dto/Get'
import { IReportRepo } from '~/modules/report/repositories/IReportRepo'

export class ReportRepoImpl implements IReportRepo {
  private reportRepo: Repository<Reports>
  constructor() {
    this.reportRepo = mySqlDataSource.getRepository(Reports)
  }

  async find(filters: GetListReportInputDTO): Promise<Reports[]> {
    const whereClause: any = {
      ...(filters.accountId ? { accounts: { id: filters.accountId } } : {}),
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.targetId !== undefined ? { targetId: filters.targetId } : {})
    }

    return this.reportRepo.find({
      where: whereClause
    })
  }

  async create(report: Reports): Promise<Reports | null> {
    const result = await this.reportRepo.save(report)
    if (!result) return null
    return result
  }
  async update(data: Reports): Promise<Reports | null> {
    const result = await this.reportRepo.save(data)
    if (!result) return null
    return result
  }
}
