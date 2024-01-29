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

  async insert(videoRelation: VideoRelation) {
    await this.repository.insert(videoRelation);
  }

  async delete(videoRelation: VideoRelation) {
    await this.repository.delete({ id: videoRelation.id });
  }

  async findChildrenByParentId(parentId: number) {
    const relations = await this.repository
      .createQueryBuilder('VideoRelation')
      .leftJoinAndSelect('VideoRelation.parent', 'parent')
      .leftJoinAndSelect('VideoRelation.child', 'child')
      .leftJoinAndSelect('child.memberId', 'memberId')
      .where('parent.id = :parentId', { parentId })
      .getMany();
    return relations.map((relation) => relation.child);
  }
}
