import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoRelation } from '../entity/videoRelation';

@Injectable()
export class VideoRelationRepository {
  constructor(
    @InjectRepository(VideoRelation)
    private repository: Repository<VideoRelation>,
  ) {}

  async insert(videoRelation: VideoRelation | VideoRelation[]) {
    await this.repository.insert(videoRelation);
  }

  async delete(videoRelation: VideoRelation) {
    await this.repository.delete({ id: videoRelation.id });
  }

  async deleteAll(relations: VideoRelation[]) {
    await this.repository.remove(relations);
  }

  async findChildrenByParentId(parentId: number) {
    return (await this.findAllByParentId(parentId)).map(
      (relation) => relation.child,
    );
  }

  async findAllByParentId(parentId: number) {
    return await this.repository
      .createQueryBuilder('VideoRelation')
      .leftJoinAndSelect('VideoRelation.parent', 'parent')
      .leftJoinAndSelect('VideoRelation.child', 'child')
      .leftJoinAndSelect('child.member', 'member')
      .where('parent.id = :parentId', { parentId })
      .getMany();
  }
}
