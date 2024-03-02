import { Injectable } from '@nestjs/common';
import { VideoRepository } from '../repository/video.repository';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { DeleteMemberInfoEvent } from 'src/member/event/delete.member.info.event';

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
}
