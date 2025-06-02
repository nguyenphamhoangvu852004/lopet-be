/* eslint-disable @typescript-eslint/no-explicit-any */
import { log } from 'console'
import { ILike, Repository } from 'typeorm'
import { mySqlDataSource } from '~/config/appDataSource'
import { Posts } from '~/entities/posts.entity'
import { GetPostListInputDTO } from '~/modules/post/dto/Get'
import IPostRepo from '~/modules/post/repositories/IPostRepo'

export default class PostRepoImpl implements IPostRepo {
  private postRepo: Repository<Posts>

  constructor() {
    this.postRepo = mySqlDataSource.getRepository(Posts)
  }
  async update(data: Posts): Promise<Posts | null> {
    const updatedPost = await this.postRepo.save(data)
    console.log('Updated post:', updatedPost)
    if (!updatedPost) {
      return null
    }
    return updatedPost
  }
  async getSuggestList(): Promise<Posts[]> {
    const list: Posts[] = await this.postRepo.find({
      relations: {
        accounts: true,
        postMedias: true,
        group: true,
        postLikes: {
          account: true,
          post: true
        }
      },
      order: {
        createdAt: 'DESC'
      },
      take: 10
    })
    log('Suggest posts list:', list)
    return list
  }
  async getAll(data: GetPostListInputDTO): Promise<Posts[]> {
    const { content, groupId } = data
    const whereClause: any = {}
    if (content) {
      whereClause.content = ILike(`%${content}%`)
    }
    if (groupId) {
      whereClause.group = { id: groupId }
    }
    console.log(whereClause)
    const list: Posts[] = await this.postRepo.find({
      where: whereClause,
      relations: {
        accounts: true,
        postMedias: true,
        group: true,
        postLikes: {
          account: true,
          post: true
        }
      }
    })
    return list
  }

  async getOne(id): Promise<Posts | null> {
    const post = await this.postRepo.findOne({
      where: {
        id: id
      },
      relations: {
        accounts: true,
        postMedias: true,
        group: true,
        postLikes: true,
        comments: true,
      }
    })
    if (!post) {
      return null
    }
    return post
  }

  async getByAccountId(id: number): Promise<Posts[]> {
    const list = await this.postRepo.find({
      where: {
        accounts: {
          id: id
        }
      },
      relations: {
        accounts: true,
        postMedias: true,
        group: true,
        postLikes: true
      }
    })
    return list
  }
  async create(data: Posts): Promise<Posts | null> {
    const post = await this.postRepo.save(data)
    if (!post) {
      return null
    }
    return post
  }

  async delete(id: number): Promise<Posts | null> {
    const post = await this.postRepo.findOne({ where: { id } })
    if (!post) {
      return null
    }
    await this.postRepo.delete(id)
    return post
  }
}
