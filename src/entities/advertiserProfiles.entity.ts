import 'reflect-metadata'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import { Accounts } from '~/entities/accounts.entity'
import { Advertisements } from '~/entities/advertisements.entity'
import { BaseEntity } from '~/entities/base.entity'

export enum ADVERTISERSTATUS {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SUSPENDED = 'SUSPENDED'
}

/** decimal của driver mysql trả về string — ép về number ngay ở tầng entity */
const decimalToNumber = {
  to: (value: number) => value,
  from: (value: string | null) => (value === null ? null : Number(value))
}

/**
 * Tư cách nhà quảng cáo — thay thế cho role 'ADS' cũ.
 *
 * Đây là account capability chứ không phải role bảo mật: nó mang trạng thái
 * duyệt, số dư và hạn mức chi tiêu — những thứ bảng roles không chứa được.
 * Advertiser vẫn giữ nguyên toàn bộ quyền của user thường.
 */
@Entity({ name: 'advertiser_profiles' })
export class AdvertiserProfiles extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @OneToOne(() => Accounts, (account) => account.advertiserProfile, {
    onDelete: 'CASCADE',
    nullable: false
  })
  @JoinColumn({ name: 'account_id' })
  account!: Accounts

  @Column({
    type: 'enum',
    enum: ADVERTISERSTATUS,
    default: ADVERTISERSTATUS.PENDING,
    comment: 'Chỉ APPROVED mới được tạo/chạy quảng cáo'
  })
  status!: ADVERTISERSTATUS

  @Column({ name: 'company_name', type: 'varchar', nullable: true })
  companyName!: string | null

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalToNumber
  })
  balance!: number

  @Column({
    name: 'daily_limit',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: decimalToNumber
  })
  dailyLimit!: number | null

  @ManyToOne(() => Accounts, (account) => account.approvedAdvertisers, {
    onDelete: 'SET NULL',
    nullable: true
  })
  @JoinColumn({ name: 'approved_by' })
  approvedBy!: Accounts | null

  @Column({ name: 'approved_at', type: 'datetime', nullable: true })
  approvedAt!: Date | null

  @OneToMany(() => Advertisements, (advertisement) => advertisement.advertiser)
  advertisements!: Advertisements[]

  constructor(data?: Partial<AdvertiserProfiles>) {
    super()
    Object.assign(this, data)
  }
}
