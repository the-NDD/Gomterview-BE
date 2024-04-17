import { ApiProperty } from '@nestjs/swagger';
import { Video } from '../entity/video';
import { createPropertyOption } from 'src/util/swagger.util';
import { parseDateToString } from 'src/util/util';
import { parseThumbnail } from '../util/video.util';

export class MemberVideoResponse {
  @ApiProperty(createPropertyOption(1, '비디오 ID', Number))
  id: number;

  @ApiProperty(
    createPropertyOption(
      'https://jangsarchive.tistory.com',
      '영상 썸네일',
      String,
    ),
  )
  thumbnail: string;

  @ApiProperty(
    createPropertyOption('RESTful하다는 것은 무엇일까요?', '영상 이름', String),
  )
  videoName: string;

  @ApiProperty(createPropertyOption('03:00', '영상 길이', String))
  videoLength: string;

  @ApiProperty(createPropertyOption('1998.09.05', '영상 생성 일자', Number))
  createdAt: string;

  @ApiProperty(createPropertyOption('장아장', '회원 닉네임', String))
  nickname: string;

  @ApiProperty(
    createPropertyOption(
      'https://jangsarchive.tistory.com',
      '회원 프로필',
      String,
    ),
  )
  userThumbnail: string;

  constructor(
    id: number,
    videoThumbnail: string,
    videoName: string,
    videoLength: string,
    createdAt: string,
    nickname: string,
    userThumbnail: string,
  ) {
    this.id = id;
    this.thumbnail = videoThumbnail;
    this.videoName = videoName;
    this.videoLength = videoLength;
    this.createdAt = createdAt;
    this.nickname = nickname;
    this.userThumbnail = userThumbnail;
  }

  public static from(video: Video) {
    return new MemberVideoResponse(
      video.id,
      parseThumbnail(video.thumbnail),
      video.name,
      video.videoLength,
      parseDateToString(video.createdAt),
      video.memberNickname,
      video.memberProfileImg,
    );
  }
}
