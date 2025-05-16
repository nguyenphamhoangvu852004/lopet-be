import 'reflect-metadata'
import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm'

export class BaseEntity {
  @CreateDateColumn({
    comment: 'Thời gian tạo hàng dữ liệu'
  })
  createdAt!: Date

  @UpdateDateColumn({
    nullable: true,
    comment: 'Thời gian cập nhật hàng dữ liệu'
  })
  updatedAt!: Date | null

  @DeleteDateColumn({
    nullable: true,
    comment: 'Thời gian xoá mềm hàng dữ liệu'
  })
  deletedAt!: Date | null

  constructor(data?: Partial<BaseEntity>) {
    Object.assign(this, data)
  }
}
