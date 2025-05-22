import express from 'express'
import { router } from '~/routes'
import request from 'supertest'
import { startMysql, startRedis, startServer, stopServer } from '~/server'

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(router)

beforeAll(async () => {
  await startMysql()
  await startRedis()
  await startServer()
})

afterAll(async () => {
  await stopServer()
})

it('send OTP to mail', async () => {
  jest.setTimeout(20000)
  const req = await request(app).post('/emails').send({ email: 'nguyenphamhoangvu852004@gmail.com' })
  expect(req.status).toBe(200)
  expect(req.body.message).toBe('Send email successfully')
})
