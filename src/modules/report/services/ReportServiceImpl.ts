import { Accounts } from '~/entities/accounts.entity'
import { Reports } from '~/entities/reports.entity'
import { BadRequest } from '~/error/error.custom'
import IAccountRepo from '~/modules/account/repositories/IAccountRepo'
import IGroupRepo from '~/modules/group/repositories/IGroupRepo'
import IPostRepo from '~/modules/post/repositories/IPostRepo'
import {
  ChangeStatusReportInputDTO,
  ChangeStatusReportOutputDTO
} from '~/modules/report/dto/ChangeStatusReportDTO'
import {
  CreateReportInputDTO,
  CreateReportOutputDTO
} from '~/modules/report/dto/Create'
import { GetListReportInputDTO } from '~/modules/report/dto/Get'
import { IReportRepo } from '~/modules/report/repositories/IReportRepo'
import { IReportService } from '~/modules/report/services/IReportService'

export class ReportServiceImpl implements IReportService {
  constructor(
    private reportRepo: IReportRepo,
    private accountRepo: IAccountRepo,
    private groupRepo: IGroupRepo,
    private postRepo: IPostRepo
  ) {
    this.reportRepo = reportRepo
    this.accountRepo = accountRepo
    this.groupRepo = groupRepo
    this.postRepo = postRepo
  }
  async update(
    data: ChangeStatusReportInputDTO
  ): Promise<ChangeStatusReportOutputDTO | null> {
    const listEntity: Reports[] = await this.reportRepo.find(
      new GetListReportInputDTO({
        targetId: data.targetId,
        type: data.type
      })
    )
    for (const entity of listEntity) {
      entity.action = data.action
      // Ghi lại staff nào đã xử lý báo cáo — bắt buộc với hành động kiểm duyệt
      if (data.resolvedBy) {
        entity.resolvedBy = { id: data.resolvedBy } as Accounts
        entity.resolvedAt = new Date()
      }
      const response = await this.reportRepo.update(entity)
      if (!response) throw new BadRequest()
    }
    const dto = new ChangeStatusReportOutputDTO({
      id: data.targetId
    })
    return dto
  }
  async getList(data: GetListReportInputDTO): Promise<Reports[]> {
    const repos = await this.reportRepo.find(data)
    return repos
  }
  async create(
    report: CreateReportInputDTO
  ): Promise<CreateReportOutputDTO | null> {
    const account = await this.accountRepo.findById(report.accountId)
    if (!account) throw new BadRequest()
    const entity = new Reports({
      reporter: account,
      reason: report.reason,
      targetType: report.type,
      targetId: report.targetId
    })
    const result = await this.reportRepo.create(entity)
    if (!result) throw new BadRequest()
    return new CreateReportOutputDTO({
      accountId: result.reporter.id,
      targetId: result.targetId,
      type: result.targetType,
      reason: result.reason,
      message: 'Created Success'
    })
  }
}
