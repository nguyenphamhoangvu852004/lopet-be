import { In, Repository } from 'typeorm'
import { mySqlDataSource } from '~/config/appDataSource'
import { GroupMembers, GROUPMEMBERROLE } from '~/entities/groupMembers.entity'
import { Groups } from '~/entities/groups.entity'
import IGroupRepo from '~/modules/group/repositories/IGroupRepo'

/** Vai trò được phép quản trị group */
const MANAGER_ROLES = [GROUPMEMBERROLE.OWNER, GROUPMEMBERROLE.ADMIN]

export default class GroupRepoImpl implements IGroupRepo {
  private groupRepo: Repository<Groups>
  private memberRepo: Repository<GroupMembers>
  constructor() {
    this.groupRepo = mySqlDataSource.getRepository(Groups)
    this.memberRepo = mySqlDataSource.getRepository(GroupMembers)
  }

  async create(data: Groups): Promise<Groups | null> {
    const response = await this.groupRepo.save(data)
    if (!response) {
      return null
    }
    return response
  }

  /**
   * Cột groups.owner đã bị bỏ — quyền sở hữu giờ nằm ở group_members.role.
   * Chỉ đúng OWNER mới thoả, dùng cho thao tác xoá group.
   */
  async isOwned(groupId: number, accountId: number): Promise<boolean> {
    const count = await this.memberRepo.count({
      where: { groupId, accountId, role: GROUPMEMBERROLE.OWNER }
    })
    return count > 0
  }

  /** OWNER hoặc ADMIN — dùng cho mời/xoá thành viên, sửa thông tin group */
  async canManage(groupId: number, accountId: number): Promise<boolean> {
    const count = await this.memberRepo.count({
      where: { groupId, accountId, role: In(MANAGER_ROLES) }
    })
    return count > 0
  }

  async findMember(
    groupId: number,
    accountId: number
  ): Promise<GroupMembers | null> {
    return this.memberRepo.findOne({
      where: { groupId, accountId },
      relations: { account: true }
    })
  }

  async addMember(
    groupId: number,
    accountId: number,
    role: GROUPMEMBERROLE = GROUPMEMBERROLE.MEMBER
  ): Promise<GroupMembers> {
    return this.memberRepo.save(
      new GroupMembers({ groupId, accountId, role, joinedAt: new Date() })
    )
  }

  async removeMember(groupId: number, accountId: number): Promise<boolean> {
    const result = await this.memberRepo.delete({ groupId, accountId })
    return (result.affected ?? 0) > 0
  }

  async findById(id: number): Promise<Groups | null> {
    const response = await this.groupRepo.findOne({
      where: {
        id: id
      },
      relations: {
        members: { account: true }
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

  /**
   * Lọc theo group_members trước rồi mới nạp group theo id.
   * Không lọc trực tiếp trong `where` của groupRepo vì điều kiện đó sẽ cắt luôn
   * danh sách members được nạp kèm, làm totalMembers bị sai.
   */
  private async findManyByIds(ids: number[]): Promise<Groups[]> {
    if (ids.length === 0) return []
    return this.groupRepo.find({
      where: { id: In(ids) },
      relations: { members: { account: true } }
    })
  }

  async getListOwned(data: number): Promise<Groups[]> {
    const memberships = await this.memberRepo.find({
      where: { accountId: data, role: GROUPMEMBERROLE.OWNER }
    })
    return this.findManyByIds(memberships.map((item) => item.groupId))
  }

  async getListJoined(data: number): Promise<Groups[]> {
    const memberships = await this.memberRepo.find({
      where: { accountId: data }
    })
    return this.findManyByIds(memberships.map((item) => item.groupId))
  }

  async getListSuggest(): Promise<Groups[]> {
    const response = await this.groupRepo
      .createQueryBuilder('groups')
      .leftJoinAndSelect('groups.members', 'members')
      .leftJoinAndSelect('members.account', 'account')
      .orderBy('RAND()')
      .limit(10)
      .getMany()
    return response
  }
}
