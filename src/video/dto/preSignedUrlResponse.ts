import { ApiProperty } from '@nestjs/swagger';
import { createPropertyOption } from 'src/util/swagger.util';
import { PreSignedInfo } from '../interface/video.interface';

export class PreSignedUrlResponse {
  @ApiProperty(
    createPropertyOption(
      'https://example.com',
      '비디오 업로드를 위한 Pre-Signed URL',
      String,
    ),
  )
  readonly video: PreSignedInfo;

  @ApiProperty(createPropertyOption('example.webm', '저장할 파일 이름', String))
  readonly thumbnail: PreSignedInfo;

  constructor(video: PreSignedInfo, thumbnail: PreSignedInfo) {
    this.video = video;
    this.thumbnail = thumbnail;
  }
}
