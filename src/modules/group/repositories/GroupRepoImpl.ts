import { Repository } from 'typeorm'
import { mySqlDataSource } from '~/config/appDataSource'
import { Groups } from '~/entities/groups.entity'
import IGroupRepo from '~/modules/group/repositories/IGroupRepo'

export default class GroupRepoImpl implements IGroupRepo {
  private groupRepo: Repository<Groups>
  constructor() {
    this.groupRepo = mySqlDataSource.getRepository(Groups)
  }
  async create(data: Groups): Promise<Groups | null> {
    const response = await this.groupRepo.save(data)
    if (!response) {
      return null
    }
    return response
  }

  async isOwned(groupId: number, accountId: number): Promise<boolean> {
    const response = await this.groupRepo.findOneBy({ id: groupId, owner: { id: accountId } })
    if (!response) return false
    return true
  }

  async findById(id: number): Promise<Groups | null> {
    const response = await this.groupRepo.findOne({
      where: {
        id: id
      },
      relations: {
        members: true,
        owner: true
      }
    })
    if (!response) return null
    return response
  }

  async update(data: Groups): Promise<Groups | null> {
    const response = await this.groupRepo.save(data)
    if (!response) return null
    return response
  }

  async delete(data: number): Promise<Groups | null> {
    const response = await this.findById(data)
    if (!response) {
      return null
    }
    const rs = await this.groupRepo.remove(response)
    if (!rs) return null
    return rs
  }

  async getListOwned(data: number): Promise<Groups[]> {
    const response = await this.groupRepo.find({
      where: {
        owner: {
          id: data
        }
      },
      relations: {
        owner: true,
        members: true
      }
    })
    return response
  }

  async getListJoined(data: number): Promise<Groups[]> {
    const response = await this.groupRepo.find({
      where: {
        members: {
          id: data
        }
      },
      relations: {
        owner: true,
        members: true
      }
    })
    return response
  }

  async getListSuggest(): Promise<Groups[]> {
    const response = await this.groupRepo
      .createQueryBuilder('groups')
      .leftJoinAndSelect('groups.members', 'members')
      .leftJoinAndSelect('groups.owner', 'owner')
      .orderBy('RAND()')
      .limit(10)
      .getMany()
    console.log(response)
    return response
  }
}
