import { FindOptionsWhere, Repository } from 'typeorm'
import { mySqlDataSource } from '~/config/appDataSource'
import { REPORTTYPE, Reports } from '~/entities/reports.entity'
import { GetListReportInputDTO } from '~/modules/report/dto/Get'
import { IReportRepo } from '~/modules/report/repositories/IReportRepo'

export class ReportRepoImpl implements IReportRepo {
  private reportRepo: Repository<Reports>
  constructor() {
    this.reportRepo = mySqlDataSource.getRepository(Reports)
  }

  async find(filters: GetListReportInputDTO): Promise<Reports[]> {
    // Dùng FindOptionsWhere thay cho `any`: trước đây where được ép any nên khi
    // entity đổi tên cột (accounts -> reporter, type -> targetType) typecheck
    // không hề báo, lỗi chỉ lộ ra lúc chạy thật.
    const whereClause: FindOptionsWhere<Reports> = {
      ...(filters.accountId ? { reporter: { id: filters.accountId } } : {}),
      ...(filters.type ? { targetType: filters.type as REPORTTYPE } : {}),
      ...(filters.targetId !== undefined ? { targetId: filters.targetId } : {})
    }

    return this.reportRepo.find({
      where: whereClause,
      relations: { reporter: true, resolvedBy: true }
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
