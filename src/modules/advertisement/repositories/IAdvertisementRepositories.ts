import { Advertisements } from '~/entities/advertisements.entity'

export interface IAdvertisementRepositories {
  findAll(accountId): Promise<Advertisements[]>
  findById(id: number): Promise<Advertisements | null>
  create(data: Advertisements): Promise<Advertisements | null>
  update(data: Advertisements): Promise<Advertisements | null>
  delete(data: Advertisements): Promise<Advertisements | null>
}
