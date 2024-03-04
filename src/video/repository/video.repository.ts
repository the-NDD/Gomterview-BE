import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../entity/video';
import { UpdateVideoRequest } from '../dto/updateVideoRequest';
import { PUBLIC } from '../constant/videoVisibility';

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
      .where('video.member = :memberId', { memberId })
      .orderBy('video.myPageIndex', 'ASC')
      .getMany();
  }

  async findAllVideosByQuestionId(questionId: number) {
    return this.videoRepository
      .createQueryBuilder('video')
      .where('video.question = :questionId', { questionId })
      .getMany();
  }

  async findAllByIds(ids: number[]) {
    return await this.videoRepository
      .createQueryBuilder('video')
      .where('video.id IN (:...ids)', { ids })
      .getMany();
  }

  async findAllPublicVideos() {
    return await this.videoRepository
      .createQueryBuilder('video')
      .where('video.visibility =:visibility', { visibility: PUBLIC })
      .orderBy('video.createdAt', 'DESC')
      .getMany();
  }

  async findById(id: number) {
    return await this.videoRepository
      .createQueryBuilder('video')
      .andWhere('video.id = :id', { id })
      .getOne();
  }

  async findByUrl(url: string) {
    return await this.videoRepository.findOneBy({ url });
  }

  async toggleVideoStatus(videoId: number) {
    this.videoRepository
      .createQueryBuilder()
      .update(Video)
      .set({ isPublic: () => 'NOT isPublic' })
      .where('video.id = :id', { id: Number(videoId) })
      .execute();
  }

  async clearMemberInfo(ids: number[]) {
    return await this.videoRepository
      .createQueryBuilder()
      .update(Video)
      .set({
        memberId: null,
        memberNickname: null,
        memberProfileImg: null,
      })
      .where('video.id IN (:...ids)', { ids })
      .execute();
  }

  async clearQuestionInfo(ids: number[]) {
    return await this.videoRepository
      .createQueryBuilder()
      .update(Video)
      .set({
        questionId: null,
      })
      .where('video.id IN (:...ids)', { ids })
      .execute();
  }

  async updateVideoInfo(video: Video) {
    return await this.videoRepository.update(video.id, {
      name: video.name,
      visibility: video.visibility,
      thumbnail: video.thumbnail,
      videoAnswer: video.videoAnswer,
    });
  }

  async updateVideo(updateRequest: UpdateVideoRequest, videoId: number) {
    return await this.videoRepository
      .createQueryBuilder()
      .update(Video)
      .set({
        name: updateRequest.videoName,
        visibility: updateRequest.visibility,
      })
      .where('video.id= :id', { id: Number(videoId) })
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
