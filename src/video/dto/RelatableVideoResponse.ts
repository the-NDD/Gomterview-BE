import { ApiProperty } from '@nestjs/swagger';
import { Video } from '../entity/video';
import { createPropertyOption } from 'src/util/swagger.util';
import { parseDateToString } from 'src/util/util';

export class RelatableVideoResponse {
  @ApiProperty(createPropertyOption(1, '비디오 ID', Number))
  id: number;
  @ApiProperty(createPropertyOption(true, '이미 연관되어있는지 여부', Boolean))
  isRelated: boolean;
  @ApiProperty(createPropertyOption('PUBLIC', '공개여부', String))
  visibility: string;
  @ApiProperty(createPropertyOption('츄 직캠', '영상 이름', String))
  videoName: string;
  @ApiProperty(createPropertyOption(13213210, '생성일자', Number))
  createdAt: string;

  constructor(
    id: number,
    isRelated: boolean,
    visibility: string,
    videoName: string,
    createdAt: string,
  ) {
    this.id = id;
    this.isRelated = isRelated;
    this.visibility = visibility;
    this.videoName = videoName;
    this.createdAt = createdAt;
  }

  static from(video: Video, isRelated: boolean) {
    return new RelatableVideoResponse(
      video.id,
      isRelated,
      video.visibility,
      video.name,
      parseDateToString(video.createdAt),
    );
  }
}
