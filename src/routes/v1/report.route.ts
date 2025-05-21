import { Router } from 'express'
import { ReportController } from '~/modules/report/controller'
import { ReportRepoImpl } from '~/modules/report/repositories/ReportRepoImpl'
import { ReportServiceImpl } from '~/modules/report/services/ReportServiceImpl'

export const reportRouter = Router()

const repo = new ReportRepoImpl()
const reportService = new ReportServiceImpl(repo)
const controller = new ReportController(reportService)

reportRouter.post('/', controller.create.bind(controller))