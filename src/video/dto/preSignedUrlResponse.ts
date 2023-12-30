import { ApiProperty } from '@nestjs/swagger';
import { createPropertyOption } from 'src/util/swagger.util';
import { PreSignedInfo } from '../interface/video.interface';
import {
  thumbnailPreSignedInfoFixture,
  videoPreSignedInfoFixture,
} from '../fixture/video.fixture';

export class PreSignedUrlResponse {
  @ApiProperty(
    createPropertyOption(
      videoPreSignedInfoFixture,
      '비디오 업로드를 위한 Pre-Signed URL과 파일명',
      Object,
    ),
  )
  readonly video: PreSignedInfo;

  @ApiProperty(
    createPropertyOption(
      thumbnailPreSignedInfoFixture,
      '썸네일 업로드를 위한 Pre-Signed URL과 파일명',
      Object,
    ),
  )
  readonly thumbnail: PreSignedInfo;

  constructor(video: PreSignedInfo, thumbnail: PreSignedInfo) {
    this.video = video;
    this.thumbnail = thumbnail;
  }
}
