import { PostMedias } from '~/entities/postMedias.entity'

export interface IPostMediaRepositories {
  create(data: PostMedias): Promise<PostMedias | null>
}
