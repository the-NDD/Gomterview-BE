import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../entity/video';

@Injectable()
export class VideoRepository {
  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
  ) {}

  async save(video: Video) {
    return await this.videoRepository.save(video);
  }

  async findAllVideosByMemberId(memberId: number) {
    return this.videoRepository
      .createQueryBuilder('video')
      .where('video.memberId = :memberId', { memberId })
      .orderBy('video.myPageIndex', 'ASC')
      .getMany();
  }

  async findById(id: number) {
    return await this.videoRepository.findOneBy({ id: Number(id) });
  }

  async findByUrl(url: string) {
    return await this.videoRepository.findOneBy({ url });
  }

  async toggleVideoStatus(videoId: number) {
    this.videoRepository
      .createQueryBuilder()
      .update(Video)
      .set({ isPublic: () => 'NOT isPublic' })
      .where('id = :id', { id: Number(videoId) })
      .execute();
  }

  async updateVideoName(videoId: number, name: string) {
    return await this.videoRepository
      .createQueryBuilder()
      .update(Video)
      .set({ name })
      .where('id = :id', { id: Number(videoId) })
      .execute();
  }

  async updateIndex(ids: number[]) {
    const caseStatements = ids.map(
      (id) => `WHEN id = ${id} THEN ${ids.indexOf(id)}`,
    );

    const updateQuery = `
      UPDATE video
      SET myPageIndex = CASE ${caseStatements.join(' ')} END
      WHERE id IN (${ids.join(', ')})
    `;

    await this.videoRepository.query(updateQuery);
  }

  async remove(video: Video) {
    await this.videoRepository.remove(video);
  }
}
