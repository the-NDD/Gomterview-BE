import { Injectable } from '@nestjs/common';
import { VideoRepository } from '../repository/video.repository';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { DeleteMemberInfoEvent } from 'src/member/event/delete.member.info.event';
import { DeleteQuestionEvent } from 'src/question/event/delete.question.event';

@Injectable()
export class VideoEventHandler {
  constructor(
    private videoRepository: VideoRepository,
    private emitter: EventEmitter2,
  ) {}

  @OnEvent(DeleteMemberInfoEvent.MESSAGE)
  async nullifyMemberInfo(event: DeleteMemberInfoEvent) {
    const videos = await this.videoRepository.findAllVideosByMemberId(
      event.memberId,
    );
    await this.videoRepository.clearMemberInfo(videos.map((each) => each.id));
  }

  @OnEvent(DeleteQuestionEvent.MESSAGE)
  async nullifyQuestionInfo(event: DeleteQuestionEvent) {
    const videos = await this.videoRepository.findAllVideosByQuestionId(
      event.questionId,
    );
    await this.videoRepository.clearQuestionInfo(videos.map((each) => each.id));
  }
}
