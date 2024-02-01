import { ApiProperty } from '@nestjs/swagger';
import { Video } from '../entity/video';
import { createPropertyOption } from 'src/util/swagger.util';

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
  videoThumbnail: string;

  @ApiProperty(
    createPropertyOption('RESTful하다는 것은 무엇일까요?', '영상 이름', String),
  )
  videoName: string;

  @ApiProperty(createPropertyOption('03:00', '영상 길이', String))
  videoLength: string;

  @ApiProperty(createPropertyOption(154515362, '영상 생성 일자', Number))
  createdAt: number;

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
    createdAt: number,
    nickname: string,
    userThumbnail: string,
  ) {
    this.id = id;
    this.videoThumbnail = videoThumbnail;
    this.videoName = videoName;
    this.videoLength = videoLength;
    this.createdAt = createdAt;
    this.nickname = nickname;
    this.userThumbnail = userThumbnail;
  }

  public static from(video: Video) {
    const member = video.member;
    return new MemberVideoResponse(
      video.id,
      video.thumbnail,
      video.name,
      video.videoLength,
      video.createdAt.getTime(),
      member.nickname,
      member.profileImg,
    );
  }
}
