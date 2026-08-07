import 'reflect-metadata'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import { AdvertiserProfiles } from '~/entities/advertiserProfiles.entity'
import { BaseEntity } from '~/entities/base.entity'

export enum ADSTATUS {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED'
}

@Entity({ name: 'advertisements' })
export class Advertisements extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  /**
   * Chủ sở hữu quảng cáo — trỏ tới advertiser_profiles chứ không phải accounts,
   * vì quyền tạo/sửa quảng cáo phụ thuộc trạng thái duyệt của profile đó.
   * Đây là cột mà tầng ownership sẽ đối chiếu ở mọi thao tác update/delete.
   */
  @ManyToOne(
    () => AdvertiserProfiles,
    (advertiserProfile) => advertiserProfile.advertisements,
    {
      nullable: false,
      onDelete: 'CASCADE'
    }
  )
  @JoinColumn({ name: 'advertiser_id' })
  advertiser!: AdvertiserProfiles

  @Column({ type: 'varchar', nullable: false })
  title!: string

  @Column({ type: 'text', nullable: false })
  description!: string

  @Column({ name: 'image_url', type: 'text', nullable: false })
  imageUrl!: string

  @Column({ name: 'link_reference', type: 'text', nullable: false })
  linkReference!: string

  @Column({
    type: 'enum',
    enum: ADSTATUS,
    default: ADSTATUS.DRAFT
  })
  status!: ADSTATUS

  constructor(data?: Partial<Advertisements>) {
    super()
    Object.assign(this, data)
  }
}
