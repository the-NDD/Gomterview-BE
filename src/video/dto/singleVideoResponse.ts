import { ApiProperty } from '@nestjs/swagger';
import { createPropertyOption } from 'src/util/swagger.util';
import { Video } from '../entity/video';
import { parseDateToString } from 'src/util/util';

export class SingleVideoResponse {
  @ApiProperty(createPropertyOption(1, '비디오 ID', Number))
  readonly id: number;

  @ApiProperty(
    createPropertyOption(
      'https://thumbnail.com',
      '비디오 썸네일 이미지',
      String,
    ),
  )
  readonly thumbnail: string;

  @ApiProperty(createPropertyOption('test.webm', '비디오 이름', String))
  readonly videoName: string;

  @ApiProperty(createPropertyOption('03:29', '비디오 길이', String))
  readonly videoLength: string;

  @ApiProperty(
    createPropertyOption(
      'PUBLIC / PRIVATE / LINK_ONLY',
      '비디오 공개 여부',
      String,
    ),
  )
  readonly visibility: string;

  @ApiProperty(createPropertyOption('1998.09.05', '영상 생성 일자', Number))
  readonly createdAt: string;

  constructor(
    id: number,
    thumbnail: string,
    videoName: string,
    videoLength: string,
    visibility: string,
    createdAt: string,
  ) {
    this.id = id;
    this.thumbnail = thumbnail;
    this.videoName = videoName;
    this.videoLength = videoLength;
    this.visibility = visibility;
    this.createdAt = createdAt;
  }

  static from(video: Video) {
    return new SingleVideoResponse(
      video.id,
      video.thumbnail,
      video.name,
      video.videoLength,
      video.visibility,
      parseDateToString(video.createdAt),
    );
  }
}
