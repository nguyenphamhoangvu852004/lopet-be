import { CreateReportInputDTO, CreateReportOutputDTO } from "~/modules/report/dto/Create";

export interface IReportService {
  create(report: CreateReportInputDTO): Promise<CreateReportOutputDTO | null>
}
