import { IsArray } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { createPropertyOption } from 'src/util/swagger.util';

export class UpdateVideoRequest {
  @ApiProperty(createPropertyOption('example.mp4', '비디오 파일 이름', String))
  @IsString()
  @IsNotEmpty()
  videoName: string;

  @ApiProperty(createPropertyOption('PRIVATE', '비디오 공개 상태', String))
  @IsString()
  @IsNotEmpty()
  visibility: string;

  @ApiProperty(
    createPropertyOption([1, 4, 3, 2], '연관 비디오 id배열', [Number]),
  )
  @IsArray()
  relatedVideoIds: number[];

  @ApiProperty(
    createPropertyOption(
      'https://exmaple-thumnail.com',
      '비디오 썸네일 주소',
      String,
    ),
  )
  @IsString()
  thumbnail: string;

  @ApiProperty(
    createPropertyOption('예시 답변입니다.', '답변 스크립트', String),
  )
  @IsString()
  videoAnswer: string;

  constructor(
    videoName: string,
    visibility: string,
    relatedVideoIds: number[],
    thumbnail: string,
    videoAnswer: string,
  ) {
    this.videoName = videoName;
    this.visibility = visibility;
    this.relatedVideoIds = relatedVideoIds;
    this.thumbnail = thumbnail;
    this.videoAnswer = videoAnswer;
  }

  static of(
    videoName: string,
    visibility: string,
    relatedVideoIds: number[],
    thumbnail: string,
    videoAnswer: string,
  ) {
    return new UpdateVideoRequest(
      videoName,
      visibility,
      relatedVideoIds,
      thumbnail,
      videoAnswer,
    );
  }
}
