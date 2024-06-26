import { Video } from '../entity/video';
import { ApiProperty } from '@nestjs/swagger';
import { Member } from 'src/member/entity/member';
import { createPropertyOption } from 'src/util/swagger.util';
import { parseDateToString } from 'src/util/util';
import { parseThumbnail } from '../util/video.util';

export class VideoDetailResponse {
  @ApiProperty(createPropertyOption(1, '비디오의 ID', Number))
  readonly id: number;

  @ApiProperty(createPropertyOption(1, '회원의 ID', Number))
  readonly memberId: number;

  @ApiProperty(createPropertyOption('foobar', '회원의 닉네임', String))
  readonly nickname: string;

  @ApiProperty(
    createPropertyOption('https://example-video.com', '비디오의 URL', String),
  )
  readonly url: string;

  @ApiProperty(
    createPropertyOption('example-video.webm', '비디오 파일의 이름', String),
  )
  readonly videoName: string;

  @ApiProperty(
    createPropertyOption(
      '65f031b26799cc74755bdd3ef4a304eaec197e402582ef4a834edb58e71261a0',
      '비디오의 URL 해시값',
      String,
    ),
  )
  @ApiProperty({ nullable: true })
  readonly hash: string;

  @ApiProperty(createPropertyOption('1998.09.05', '영상 생성 일자', Number))
  readonly createdAt: string;

  @ApiProperty(createPropertyOption('PUBLIC', '영상 공개여부', String))
  readonly visibility: string;

  @ApiProperty(
    createPropertyOption('https://example.com', '비디오 썸네일', String),
  )
  thumbnail: string;

  @ApiProperty(
    createPropertyOption('예시 답변입니다.', '답변 스크립트', String),
  )
  videoAnswer: string;

  constructor(
    id: number,
    memberId: number,
    nickname: string,
    url: string,
    videoName: string,
    hash: string,
    createdAt: string,
    visibility: string,
    thumbnail: string,
    videoAnswer: string,
  ) {
    this.id = id;
    this.memberId = memberId;
    this.nickname = nickname;
    this.url = url;
    this.videoName = videoName;
    this.hash = hash;
    this.createdAt = createdAt;
    this.visibility = visibility;
    this.thumbnail = thumbnail;
    this.videoAnswer = videoAnswer;
  }

  static from(video: Video, hash: string | null) {
    return new VideoDetailResponse(
      video.id,
      video.memberId,
      video.memberNickname,
      video.url,
      video.name,
      hash,
      parseDateToString(video.createdAt),
      video.visibility,
      parseThumbnail(video.thumbnail),
      video.videoAnswer.toString(),
    );
  }
}
