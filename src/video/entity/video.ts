// video.entity.ts
import { Column, Entity, Index } from 'typeorm';
import { DefaultEntity } from 'src/app.entity';
import { Member } from 'src/member/entity/member';
import { CreateVideoRequest } from '../dto/createVideoRequest';
import {
  DEFAULT_THUMBNAIL,
  IDRIVE_THUMBNAIL_ENDPOINT,
} from 'src/constant/constant';
import { LINK_ONLY, PRIVATE, PUBLIC } from '../constant/videoVisibility';
import { UpdateVideoRequest } from '../dto/updateVideoRequest';
import { deleteObjectInIDrive } from 'src/util/idrive.util';

@Entity({ name: 'Video' })
@Index('idx_video_url', ['url'])
@Index('idx_video_myPageIndex', ['myPageIndex'])
@Index('idx_visibility', ['visibility'])
export class Video extends DefaultEntity {
  @Column({ nullable: true })
  memberId: number;

  @Column({ nullable: true })
  memberNickname: string;

  @Column({ nullable: true })
  memberProfileImg: string;

  @Column({ nullable: true })
  questionId: number;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column()
  thumbnail: string;

  @Column()
  videoLength: string;

  @Column({ default: 'PUBLIC' })
  visibility: string;

  @Column({ default: 0 })
  myPageIndex: number;

  @Column({ type: 'blob' })
  videoAnswer: string;

  constructor(
    id: number,
    memberId: number,
    memberNickname: string,
    memberProfileImg: string,
    questionId: number,
    name: string,
    url: string,
    thumbnail: string,
    videoLength: string,
    visibility: string,
    videoAnswer: string,
  ) {
    super(id, new Date());
    this.memberId = memberId;
    this.memberNickname = memberNickname;
    this.memberProfileImg = memberProfileImg;
    this.questionId = questionId;
    this.name = name;
    this.url = url;
    this.thumbnail = thumbnail;
    this.videoLength = videoLength;
    this.visibility = visibility;
    this.myPageIndex = 0;
    this.videoAnswer = videoAnswer;
  }

  static from(member: Member, createVideoRequest: CreateVideoRequest): Video {
    return new Video(
      null,
      member.id,
      member.nickname,
      member.profileImg,
      createVideoRequest.questionId,
      `${member.nickname}_${createVideoRequest.videoName}`,
      createVideoRequest.url,
      createVideoRequest.thumbnail || DEFAULT_THUMBNAIL,
      createVideoRequest.videoLength,
      PRIVATE,
      createVideoRequest.videoAnswer,
    );
  }

  public isOwnedBy(member?: Member) {
    return !!member && this.memberId === member.getId();
  }

  public isPublic() {
    return this.visibility === PUBLIC;
  }

  public isPrivate() {
    return this.visibility === PRIVATE;
  }

  public isLinkOnly() {
    return this.visibility === LINK_ONLY;
  }

  public updateVideoInfo(updateVideoRequest: UpdateVideoRequest) {
    this.visibility = updateVideoRequest.visibility;
    this.name = updateVideoRequest.videoName;
    if (updateVideoRequest.thumbnail === '') {
      this.thumbnail = DEFAULT_THUMBNAIL;
      deleteObjectInIDrive(
        this.thumbnail.replace(IDRIVE_THUMBNAIL_ENDPOINT, ''),
        false,
      );
    }
    this.videoAnswer = updateVideoRequest.videoAnswer;
  }

  public equals(video: Video) {
    return (
      Object.keys(video).filter(
        (videoKey) => video[videoKey] !== this[videoKey],
      ).length === 0
    );
  }
}
