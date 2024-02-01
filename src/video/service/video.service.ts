import { Injectable } from '@nestjs/common';
import { Member } from 'src/member/entity/member';
import { Video } from '../entity/video';
import { VideoRepository } from '../repository/video.repository';
import { v4 as uuidv4 } from 'uuid';
import { PreSignedUrlResponse } from '../dto/preSignedUrlResponse';
import {
  DeleteObjectFailedException,
  IDriveException,
  InvalidHashException,
  Md5HashException,
  VideoAccessForbiddenException,
  VideoLackException,
  VideoNotFoundException,
  VideoNotFoundWithHashException,
  VideoOfWithdrawnMemberException,
} from '../exception/video.exception';
import { CreateVideoRequest } from '../dto/createVideoRequest';
import { validateManipulatedToken } from 'src/util/token.util';
import { isEmpty, notEquals } from 'class-validator';
import { VideoDetailResponse } from '../dto/videoDetailResponse';
import * as crypto from 'crypto';
import 'dotenv/config';
import { MemberRepository } from 'src/member/repository/member.repository';
import {
  deleteFromRedis,
  getValueFromRedis,
  saveToRedis,
} from 'src/util/redis.util';
import { SingleVideoResponse } from '../dto/singleVideoResponse';
import { MemberNotFoundException } from 'src/member/exception/member.exception';
import {
  deleteObjectInIDrive,
  getSignedUrlWithKey,
} from 'src/util/idrive.util';
import { PreSignedInfo } from '../interface/video.interface';
import { UpdateVideoIndexRequest } from '../dto/updateVideoIndexRequest';
import { VideoRelationRepository } from '../repository/videoRelation.repository';
import { UpdateVideoRequest } from '../dto/updateVideoRequest';
import { VideoRelation } from '../entity/videoRelation';
import { MemberVideoResponse } from '../dto/MemberVideoResponse';
import { RelatableVideoResponse } from '../dto/RelatableVideoResponse';
import {
  IDRIVE_THUMBNAIL_ENDPOINT,
  IDRIVE_VIDEO_ENDPOINT,
} from 'src/constant/constant';

@Injectable()
export class VideoService {
  constructor(
    private videoRepository: VideoRepository,
    private memberRepository: MemberRepository,
    private videoRelationRepository: VideoRelationRepository,
  ) {}

  // async saveVideoOnCloud(
  //   uploadVideoRequest: UploadVideoRequest,
  //   member: Member,
  //   file: Express.Multer.File,
  // ) {
  //   await this.uploadVideo(file);
  //   const videoUrl = await this.sendToBucket(file.originalname, '.mp4');
  //   const thumbnail = await this.sendToBucket(file.originalname, '.png');
  //   const videoTitle = await this.createVideoTitle(
  //     member,
  //     Number(uploadVideoRequest.questionId),
  //   );
  //   await this.createVideo(
  //     member,
  //     new CreateVideoRequest(
  //       Number(uploadVideoRequest.questionId),
  //       videoTitle,
  //       videoUrl,
  //       thumbnail,
  //       uploadVideoRequest.videoLength,
  //     ),
  //   );
  // }

  // async uploadVideo(file: Express.Multer.File) {
  //   logUploadStart(file.originalname);
  //   await createDirectoryIfNotExist();
  //   await saveVideoIfNotExists(file);
  //   await encodeToUpload(file.originalname);
  // }

  // async sendToBucket(name: string, ext: string) {
  //   const key = `${uuidv4()}${ext}`;
  //   const s3 = new S3(IDRIVE_CONFIG);
  //   const contentType = ext === '.mp4' ? 'video/mp4' : 'image/png';
  //   const params = {
  //     Bucket: ext === '.mp4' ? 'videos' : 'thumbnail',
  //     ACL: 'public',
  //     Key: key,
  //     Body: await readFileAsBuffer(name.replace('.webm', ext)),
  //     ContentType: contentType,
  //   };
  //   await new Promise((resolve, reject) => {
  //     s3.putObject(params as PutObjectCommandInput, (err, data) => {
  //       if (err) reject(err);
  //       console.log(data);
  //       resolve(key);
  //     });
  //   });
  //   await deleteFile(name.replace('.webm', ext));
  //   return `${process.env.IDRIVE_READ_URL}/${
  //     ext === '.mp4' ? 'videos' : 'thumbnail'
  //   }/${key}`;
  // }

  async createVideo(member: Member, createVideoRequest: CreateVideoRequest) {
    validateManipulatedToken(member);

    const newVideo = Video.from(member, createVideoRequest);
    await this.videoRepository.save(newVideo);
  }

  async getPreSignedUrl(member: Member) {
    validateManipulatedToken(member);
    const videoKey = `${uuidv4()}.mp4`;
    const thumbnailKey = `${uuidv4()}.png`;
    try {
      return new PreSignedUrlResponse(
        await this.getPreSignedUrlResponse(videoKey, true),
        await this.getPreSignedUrlResponse(thumbnailKey, false),
      );
    } catch (error) {
      throw new IDriveException();
    }
  }

  async getVideoDetail(videoId: number, member: Member) {
    const video = await this.videoRepository.findById(videoId);
    if (!video) throw new VideoNotFoundException();

    if (video.isPublic()) {
      return VideoDetailResponse.from(video, video.member, null);
    }

    if (!member) throw new VideoAccessForbiddenException();
    this.validateVideoOwnership(video, member.id);

    const hash = video.isLinkOnly() ? this.getHashedUrl(video.url) : null;
    return VideoDetailResponse.from(video, video.member, hash);
  }

  async getVideoDetailByHash(hash: string) {
    if (hash.length != 32) throw new InvalidHashException();

    const originUrl = await getValueFromRedis(hash);
    if (isEmpty(originUrl)) throw new VideoNotFoundWithHashException();

    const video = await this.videoRepository.findByUrl(originUrl);
    if (isEmpty(video)) throw new VideoNotFoundException();
    if (video.isPrivate()) throw new VideoAccessForbiddenException();
    if (isEmpty(video.memberId)) throw new VideoOfWithdrawnMemberException();

    const videoOwner = await this.memberRepository.findById(video.memberId);
    if (isEmpty(videoOwner)) throw new MemberNotFoundException();

    return VideoDetailResponse.from(video, videoOwner, hash);
  }

  async getAllVideosByMemberId(member: Member) {
    validateManipulatedToken(member);
    const videoList = await this.videoRepository.findAllVideosByMemberId(
      member.id,
    );

    return videoList.map(SingleVideoResponse.from);
  }

  async findAllRelatedVideoById(videoId: number, member: Member) {
    const video = await this.videoRepository.findById(videoId);
    if (!video) throw new VideoNotFoundException();
    const children =
      await this.videoRelationRepository.findChildrenByParentId(videoId);

    return children
      .filter((each) => each.isPublic() || each.isOwnedBy(member))
      .map(SingleVideoResponse.from);
  }

  async findPublicVideos() {
    return (await this.videoRepository.findAllPublicVideos()).map((video) =>
      MemberVideoResponse.from(video),
    );
  }

  async findRelatableVideos(videoId: number, member: Member) {
    validateManipulatedToken(member);
    const video = await this.videoRepository.findById(videoId);
    this.validateVideoOwnership(video, member.id);

    const otherVideos = await this.findMyVideoOtherThan(video, member.id);
    const videosChild =
      await this.videoRelationRepository.findChildrenByParentId(videoId);
    console.log(otherVideos);
    console.log(videosChild);
    return otherVideos.map((video) =>
      RelatableVideoResponse.from(
        video,
        this.containsChild(videosChild, video),
      ),
    );
  }

  private containsChild(videosChild: Video[], video: Video) {
    return videosChild.map((each) => each.url).includes(video.url);
  }

  async updateVideo(
    updateVideoRequest: UpdateVideoRequest,
    member: Member,
    videoId: number,
  ) {
    validateManipulatedToken(member);
    const video = await this.videoRepository.findById(videoId);
    this.validateVideoOwnership(video, member.id);
    video.updateVideoInfo(updateVideoRequest);

    // 비디오 엔티티 변경사항 저장
    await this.updateRelatedVideos(updateVideoRequest.relatedVideoIds, video);
    await this.videoRepository.save(video);
    await this.updateVideoHashInRedis(video);
  }

  async updateIndex(
    updateVideoIndexRequest: UpdateVideoIndexRequest,
    member: Member,
  ) {
    validateManipulatedToken(member);
    await this.validateMembersVideos(updateVideoIndexRequest, member);
    await this.videoRepository.updateIndex(updateVideoIndexRequest.ids);
  }

  async deleteVideo(videoId: number, member: Member) {
    validateManipulatedToken(member);
    const memberId = member.id;
    const video = await this.videoRepository.findById(videoId);
    this.validateVideoOwnership(video, memberId);

    await this.deleteVideoAndThumbnailInIDrive(video.url, video.thumbnail);
    await this.videoRepository.remove(video);
  }

  // private async createVideoTitle(member: Member, questionId: number) {
  //   const question = await this.questionRepository.findById(questionId);

  //   return `${member.nickname}_${
  //     question ? question.content : '삭제된 질문입니다'
  //   }_${uuidv4().split('-').pop()}`;
  // }

  private async getPreSignedUrlResponse(
    key: string,
    isVideo: boolean,
  ): Promise<PreSignedInfo> {
    return {
      preSignedUrl: await getSignedUrlWithKey(key, isVideo),
      key,
    } as PreSignedInfo;
  }

  private validateVideoOwnership(video: Video, memberId: number) {
    if (isEmpty(video)) throw new VideoNotFoundException();
    if (notEquals(memberId, video.memberId))
      throw new VideoAccessForbiddenException();
  }

  private getHashedUrl(url: string): string {
    try {
      const hash = crypto.createHash('md5').update(url).digest('hex');
      return hash;
    } catch (error) {
      throw new Md5HashException();
    }
  }

  private async updateVideoHashInRedis(video: Video) {
    const hash = this.getHashedUrl(video.url);

    if (!video.isLinkOnly()) {
      // 현재가 private이 아니면 토글 후 private이 되기에 redis에서 해시값 삭제 후 null 반환
      try {
        await deleteFromRedis(hash);
        return;
      } catch (e) {
        return;
      }
    }

    await saveToRedis(hash, video.url);
  }

  private async validateMembersVideos(
    updateVideoIndexRequest: UpdateVideoIndexRequest,
    member: Member,
  ) {
    const videos = await this.videoRepository.findAllVideosByMemberId(
      member.id,
    );

    if (videos.length !== updateVideoIndexRequest.ids.length) {
      throw new VideoLackException();
    }

    if (!(await this.isMembersVideos(videos, updateVideoIndexRequest.ids))) {
      throw new VideoAccessForbiddenException();
    }
  }

  private async isMembersVideos(videos: Video[], ids: number[]) {
    const videoIds = videos.map((video) => video.id).sort();
    const sortedIds = [...ids].sort();
    return this.compareIds(videoIds, sortedIds);
  }

  private async updateRelatedVideos(relatedVideoIds: number[], video: Video) {
    const relations = await this.videoRelationRepository.findAllByParentId(
      video.id,
    );
    await this.deleteByChildId(relations, relatedVideoIds);
    await this.addNewRelations(relations, relatedVideoIds, video);
  }

  private async addNewRelations(
    relations: VideoRelation[],
    relatedVideoIds: number[],
    video: Video,
  ) {
    const relationsIds = relations.map((each) => each.id);
    const newIds = relatedVideoIds.filter((id) => !relationsIds.includes(id));
    const foundVideos = await this.videoRepository.findAllByIds(newIds);

    if (foundVideos.length !== newIds.length)
      throw new VideoNotFoundException();

    await this.videoRelationRepository.insert(
      foundVideos.map((child) => VideoRelation.of(video, child)),
    );
  }

  private async findMyVideoOtherThan(video: Video, memberId: number) {
    return (
      await this.videoRepository.findAllVideosByMemberId(memberId)
    ).filter((each) => each.id !== video.id);
  }

  private async deleteByChildId(
    relations: VideoRelation[],
    relatedVideoIds: number[],
  ) {
    await this.videoRelationRepository.deleteAll(
      relations.filter(
        (relation) => !relatedVideoIds.includes(relation.child.id),
      ),
    );
  }

  private compareIds(videoIds: number[], sortedIds: number[]) {
    if (videoIds.length !== sortedIds.length) {
      return false;
    }

    for (let index = 0; index < videoIds.length; index++) {
      if (videoIds[index] !== sortedIds[index]) {
        return false;
      }
    }

    return true;
  }

  private async deleteVideoAndThumbnailInIDrive(
    videoUrl: string,
    thumbnailUrl: string,
  ) {
    const videoKey = videoUrl.split(IDRIVE_VIDEO_ENDPOINT)[1];
    const thumbnailKey = thumbnailUrl.split(IDRIVE_THUMBNAIL_ENDPOINT)[1];
    try {
      await deleteObjectInIDrive(videoKey, true);
    } catch (error) {
      throw new DeleteObjectFailedException('비디오');
    }

    try {
      await deleteObjectInIDrive(thumbnailKey, false);
    } catch (error) {
      throw new DeleteObjectFailedException('썸네일 이미지');
    }
  }
}
