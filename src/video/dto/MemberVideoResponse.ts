import { Video } from '../entity/video';

export class MemberVideoResponse {
  id: number;
  videoThumbnail: string;
  videoName: string;
  videoLength: string;
  createdAt: number;
  nickname: string;
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
