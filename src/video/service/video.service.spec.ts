import { Test, TestingModule } from '@nestjs/testing';
import { VideoService } from './video.service';
import { VideoRepository } from '../repository/video.repository';
import {
  memberFixture,
  otherMemberFixture,
} from 'src/member/fixture/member.fixture';
import { QuestionRepository } from 'src/question/repository/question.repository';
import { MemberRepository } from 'src/member/repository/member.repository';
import {
  createVideoRequestFixture,
  linkOnlyVideoFixture,
  privateVideoFixture,
  updateVideoRequestFixture,
  videoFixture,
  videoListExample,
  videoListFixture,
  videoOfOtherFixture,
  videoOfWithdrawnMemberFixture,
} from '../fixture/video.fixture';
import { ManipulatedTokenNotFiltered } from 'src/token/exception/token.exception';
import { PreSignedUrlResponse } from '../dto/preSignedUrlResponse';
import {
  IDriveException,
  InvalidHashException,
  RedisRetrieveException,
  VideoAccessForbiddenException,
  VideoLackException,
  VideoNotFoundException,
  VideoNotFoundWithHashException,
  VideoOfWithdrawnMemberException,
} from '../exception/video.exception';
import { VideoDetailResponse } from '../dto/videoDetailResponse';
import * as crypto from 'crypto';
import { SingleVideoResponse } from '../dto/singleVideoResponse';
import * as redisUtil from 'src/util/redis.util';
import { MemberNotFoundException } from 'src/member/exception/member.exception';
import { VideoModule } from '../video.module';
import { Video } from '../entity/video';
import { addAppModules, createIntegrationTestModule } from 'src/util/test.util';
import { INestApplication } from '@nestjs/common';
import { CategoryRepository } from 'src/category/repository/category.repository';
import { WorkbookRepository } from 'src/workbook/repository/workbook.repository';
import { categoryFixtureWithId } from 'src/category/fixture/category.fixture';
import { workbookFixtureWithId } from 'src/workbook/fixture/workbook.fixture';
import {
  questionFixture,
  questionListFixture,
} from 'src/question/fixture/question.fixture';
import { QuestionModule } from 'src/question/question.module';
import { CreateVideoRequest } from '../dto/createVideoRequest';
import { DEFAULT_THUMBNAIL } from '../../constant/constant';
import * as idriveUtil from 'src/util/idrive.util';
import { UpdateVideoIndexRequest } from '../dto/updateVideoIndexRequest';
import { VideoRelationRepository } from '../repository/videoRelation.repository';
import { VideoRelation } from '../entity/videoRelation';
import { MemberVideoResponse } from '../dto/MemberVideoResponse';
import { RelatableVideoResponse } from '../dto/RelatableVideoResponse';
import { UpdateVideoRequest } from '../dto/updateVideoRequest';
import { CategoryModule } from 'src/category/category.module';
import { WorkbookModule } from 'src/workbook/workbook.module';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { VideoEventHandler } from './video.event.handler';
import { MemberService } from 'src/member/service/member.service';
import { MemberModule } from 'src/member/member.module';
import { QuestionService } from 'src/question/service/question.service';

describe('VideoService 단위 테스트', () => {
  let videoService: VideoService;

  const mockVideoRepository = {
    save: jest.fn(),
    findById: jest.fn(),
    findByUrl: jest.fn(),
    findAllVideosByMemberId: jest.fn(),
    toggleVideoStatus: jest.fn(),
    updateVideo: jest.fn(),
    remove: jest.fn(),
    updateIndex: jest.fn(),
    findAllByIds: jest.fn(),
    updateVideoInfo: jest.fn(),
  };

  const mockVideoRelationRepository = {
    findAllByParentId: jest.fn(),
    deleteAll: jest.fn(),
    insert: jest.fn(),
    findChildrenByParentId: jest.fn(),
    save: jest.fn(),
  };

  const mockEmitter = {
    emitAsync: jest.fn(),
  };

  // jest.mock('typeorm-transactional', () => ({
  //   Transactional: () => () => ({}),
  // }));

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoService,
        VideoRepository,
        VideoRelationRepository,
        EventEmitter2,
        VideoEventHandler,
      ],
    })
      .overrideProvider(VideoRepository)
      .useValue(mockVideoRepository)
      .overrideProvider(VideoRelationRepository)
      .useValue(mockVideoRelationRepository)
      .overrideProvider(EventEmitter2)
      .useValue(mockEmitter)
      .compile();

    videoService = module.get<VideoService>(VideoService);
  });

  it('should be defined', () => {
    expect(videoService).toBeDefined();
  });

  describe('createVideo', () => {
    const request = createVideoRequestFixture;

    it('비디오 저장 성공 시 undefined로 반환된다.', () => {
      // given
      const member = memberFixture;

      // when
      mockVideoRepository.save.mockResolvedValue(undefined);

      // then
      expect(
        videoService.createVideo(member, request),
      ).resolves.toBeUndefined();
    });

    it('비디오 저장 시 member가 없으면 ManipulatedTokenNotFiltered를 반환한다.', () => {
      // given
      const member = undefined;

      // when

      // then
      expect(videoService.createVideo(member, request)).rejects.toThrow(
        ManipulatedTokenNotFiltered,
      );
    });
  });

  describe('getPreSignedUrl', () => {
    it('preSigned URL 얻기 성공 시 PreSignedUrlResponse 형식으로 반환된다.', async () => {
      // given
      const member = memberFixture;
      const url = 'fakeUrl';

      // when
      const getSignedUrlWithKeySpy = jest.spyOn(
        idriveUtil,
        'getSignedUrlWithKey',
      );
      getSignedUrlWithKeySpy.mockResolvedValue(url);

      const response = await videoService.getPreSignedUrl(member);

      // then
      expect(response).toBeInstanceOf(PreSignedUrlResponse);
      expect(response.video.key.endsWith('.mp4')).toBeTruthy(); // 비디오 파일 확장자는 반드시 mp4이어야 함
      expect(response.video.preSignedUrl).toBe(url);
      expect(response.thumbnail.key.endsWith('.png')).toBeTruthy(); // 썸네일 파일 확장자는 반드시 png이어야 함
      expect(response.thumbnail.preSignedUrl).toBe(url);

      getSignedUrlWithKeySpy.mockRestore();
    });

    it('prSigned URL 얻기 성공 시 member가 없으면 ManipulatedTokenNotFiltered을 반환한다.', () => {
      // given
      const member = undefined;

      // when

      // then
      expect(videoService.getPreSignedUrl(member)).rejects.toThrow(
        ManipulatedTokenNotFiltered,
      );
    });

    it('preSigned URL 얻기 시 IDrive Client가 Pre-Signed URL 발급에 실패하면 IDriveException을 반환한다.', async () => {
      // given
      const member = memberFixture;

      // when
      const getSignedUrlWithKeySpy = jest.spyOn(
        idriveUtil,
        'getSignedUrlWithKey',
      );
      getSignedUrlWithKeySpy.mockRejectedValueOnce(new IDriveException());

      // then
      await expect(videoService.getPreSignedUrl(member)).rejects.toThrow(
        IDriveException,
      );
    });
  });

  describe('getVideoDetail', () => {
    const member = memberFixture;
    const videoId = 1;

    it('비디오 상세 정보 조회 성공 시 VideoDetailResponse 형식으로 반환된다.', async () => {
      // given
      const video = videoFixture;

      // when
      mockVideoRepository.findById.mockResolvedValue(video);
      const response = await videoService.getVideoDetail(videoId, member);

      // then
      expect(response).toBeInstanceOf(VideoDetailResponse);
      expect(response.id).toBe(video.getId());
      expect(response.nickname).toBe(member.nickname);
      expect(response.url).toBe(video.url);
      expect(response.hash).toBe(null);
      expect(response.videoName).toBe(video.name);
    });

    it('비디오 상세 정보 조회 성공 시 비디오가 private이면 해시값으로 null을 반환한다.', async () => {
      // given
      const video = privateVideoFixture;

      // when
      mockVideoRepository.findById.mockResolvedValue(video);
      const response = await videoService.getVideoDetail(videoId, member);

      // then
      expect(response).toBeInstanceOf(VideoDetailResponse);
      expect(response.id).toBe(video.getId());
      expect(response.nickname).toBe(member.nickname);
      expect(response.url).toBe(video.url);
      expect(response.hash).toBeNull();
      expect(response.videoName).toBe(video.name);
    });

    it('비디오 상세 정보 조회 시 member가 없으면 ManipulatedTokenNotFiltered을 반환한다.', () => {
      // given
      const member = undefined;

      // when

      // then
      expect(videoService.getVideoDetail(videoId, member)).rejects.toThrow(
        VideoAccessForbiddenException,
      );
    });

    it('비디오 상세 정보 조회 시 이미 삭제된 비디오를 조회하려고 하면 VideoNotFoundException을 반환한다.', () => {
      // given

      // when
      mockVideoRepository.findById.mockResolvedValue(undefined);

      // then
      expect(videoService.getVideoDetail(videoId, member)).rejects.toThrow(
        VideoNotFoundException,
      );
    });

    it('비디오 상세 정보 조회 시 자신의 것이 아닌 비디오를 조회하려고 하면 VideoAccessForbiddenException을 반환한다.', () => {
      // given

      // when
      mockVideoRepository.findById.mockResolvedValue(videoOfOtherFixture);

      // then
      expect(videoService.getVideoDetail(videoId, member)).rejects.toThrow(
        VideoAccessForbiddenException,
      );
    });
  });

  describe('getVideoDetailByHash', () => {
    const hash = 'fakeHashfakeHashfakeHashfakeHash'; // 32자
    const url = 'fakeUrl';
    const member = memberFixture;

    it('해시로 비디오 상세 정보 조회 성공 시 VideoDetailResponse 형식으로 반환된다.', async () => {
      // given
      const video = videoFixture;
      const getValueFromRedisSpy = jest.spyOn(redisUtil, 'getValueFromRedis');

      // when
      getValueFromRedisSpy.mockResolvedValue(url);

      mockVideoRepository.findByUrl.mockResolvedValue(video);
      mockEmitter.emitAsync.mockResolvedValue(undefined);
      const response = await videoService.getVideoDetailByHash(hash);

      // then
      expect(response).toBeInstanceOf(VideoDetailResponse);
      expect(response.id).toBe(video.getId());
      expect(response.nickname).toBe(member.nickname);
      expect(response.url).toBe(video.url);
      expect(response.videoName).toBe(video.name);
      expect(response.hash).toBe(hash);

      getValueFromRedisSpy.mockRestore();
    });

    it('해시로 비디오 상세 정보 조회 시 해시가 유효하지 않은 형태라면 InvalidHashExceptino을 반환한다.', async () => {
      // given
      const hash = 'fakeHash';
      // when

      // then
      await expect(videoService.getVideoDetailByHash(hash)).rejects.toThrow(
        InvalidHashException,
      );
    });

    it('해시로 비디오 상세 정보 조회 시 비디오가 공개 상태가 아니라면 VideoAccessForbiddenException을 반환한다.', async () => {
      // given
      const video = privateVideoFixture;
      const getValueFromRedisSpy = jest.spyOn(redisUtil, 'getValueFromRedis');

      // when
      getValueFromRedisSpy.mockResolvedValue(url);
      mockVideoRepository.findByUrl.mockResolvedValue(video);
      mockEmitter.emitAsync.mockResolvedValue(undefined);

      // then
      await expect(videoService.getVideoDetailByHash(hash)).rejects.toThrow(
        VideoAccessForbiddenException,
      );
      getValueFromRedisSpy.mockRestore();
    });

    it('해시로 비디오 상세 정보 조회 시 Redis에서 얻어낸 URL로 조회되는 비디오가 없을 경우 VideoNotFoundException을 반환한다.', async () => {
      // given
      const getValueFromRedisSpy = jest.spyOn(redisUtil, 'getValueFromRedis');

      // when
      getValueFromRedisSpy.mockResolvedValue(url);
      mockVideoRepository.findByUrl.mockResolvedValue(null);
      mockEmitter.emitAsync.mockResolvedValue(undefined);

      // then
      await expect(videoService.getVideoDetailByHash(hash)).rejects.toThrow(
        VideoNotFoundException,
      );
      getValueFromRedisSpy.mockRestore();
    });

    it('해시로 비디오 상세 정보 조회 시 비디오가 삭제된 회원의 비디오라면 VideoOfWithdrawnMemberException을 반환한다.', async () => {
      // given
      const video = videoOfWithdrawnMemberFixture;
      const getValueFromRedisSpy = jest.spyOn(redisUtil, 'getValueFromRedis');

      // when
      getValueFromRedisSpy.mockResolvedValue(url);
      mockVideoRepository.findByUrl.mockResolvedValue(video);
      mockEmitter.emitAsync.mockResolvedValue(undefined);

      // then
      await expect(videoService.getVideoDetailByHash(hash)).rejects.toThrow(
        VideoOfWithdrawnMemberException,
      );
      getValueFromRedisSpy.mockRestore();
    });

    it('해시로 비디오 상세 정보 조회 시 해시로 조회되는 비디오가 없다면 VideoNotFoundWithHashException을 반환한다.', async () => {
      // given
      const getValueFromRedisSpy = jest.spyOn(redisUtil, 'getValueFromRedis');

      // when
      getValueFromRedisSpy.mockResolvedValue(null);

      // then
      await expect(videoService.getVideoDetailByHash(hash)).rejects.toThrow(
        VideoNotFoundWithHashException,
      );
      getValueFromRedisSpy.mockRestore();
    });

    it('해시로 비디오 상세 정보 조회 시 비디오가 삭제된 회원의 비디오라면 MemberNotFoundException을 반환한다.', async () => {
      // given
      const video = videoFixture;
      const getValueFromRedisSpy = jest.spyOn(redisUtil, 'getValueFromRedis');

      // when
      getValueFromRedisSpy.mockResolvedValue(url);
      mockVideoRepository.findByUrl.mockResolvedValue(video);
      mockEmitter.emitAsync.mockRejectedValue(new MemberNotFoundException());

      // then
      await expect(videoService.getVideoDetailByHash(hash)).rejects.toThrow(
        MemberNotFoundException,
      );
      getValueFromRedisSpy.mockRestore();
    });

    it('해시로 비디오 상세 정보 조회 시 redis에서 오류가 발생하면 RedisRetrieveException을 반환한다.', async () => {
      // given
      const getValueFromRedisSpy = jest.spyOn(redisUtil, 'getValueFromRedis');

      // when
      getValueFromRedisSpy.mockRejectedValue(new RedisRetrieveException());

      // then
      await expect(videoService.getVideoDetailByHash(hash)).rejects.toThrow(
        RedisRetrieveException,
      );
      getValueFromRedisSpy.mockRestore();
    });
  });

  describe('getAllVideosByMemberId', () => {
    const member = memberFixture;

    it('비디오 전체 조회 성공 시 SingleVideoResponse의 배열의 형태로 반환된다.', async () => {
      // give
      const mockVideoList = videoListFixture;

      // when
      mockVideoRepository.findAllVideosByMemberId.mockResolvedValue(
        mockVideoList,
      );

      // then
      const result = await videoService.getAllVideosByMemberId(member);

      expect(result).toHaveLength(mockVideoList.length);
      expect(result).toEqual(mockVideoList.map(SingleVideoResponse.from));
      result.forEach((element) => {
        expect(element).toBeInstanceOf(SingleVideoResponse);
      });
    });

    it('비디오 전체 조회 성공 시 SingleVideoResponse의 배열의 형태로 반환된다. 생성 요청에서 썸네일을 주지 않은 경우에는 기본 썸네일로 반환된다', async () => {
      // give
      const mockVideoList = videoListFixture;
      mockVideoList.unshift(
        Video.from(
          member,
          new CreateVideoRequest(
            1,
            'test',
            'http://localhost:8080',
            null,
            '01:00',
            '예시 답변입니다.',
          ),
        ),
      );

      // when
      mockVideoRepository.findAllVideosByMemberId.mockResolvedValue(
        mockVideoList,
      );

      // then
      const result = await videoService.getAllVideosByMemberId(member);

      expect(result).toHaveLength(mockVideoList.length);
      expect(result).toEqual(mockVideoList.map(SingleVideoResponse.from));
      result.forEach((element) => {
        expect(element).toBeInstanceOf(SingleVideoResponse);
      });
      expect(result[0].thumbnail).toBe('');
    });

    it('비디오 전체 조회 시 저장된 비디오가 없으면 빈 배열이 반환된다.', async () => {
      // give
      const emptyList = [];

      // when
      mockVideoRepository.findAllVideosByMemberId.mockResolvedValue(emptyList);

      // then
      const result = await videoService.getAllVideosByMemberId(member);

      expect(result).toHaveLength(0);
      expect(result).toEqual(emptyList);
    });

    it('비디오 전체 조회 시 member가 없으면 ManipulatedTokenNotFiltered을 반환한다.', () => {
      // given
      const member = undefined;

      // when

      // then
      expect(videoService.getAllVideosByMemberId(member)).rejects.toThrow(
        ManipulatedTokenNotFiltered,
      );
    });
  });

  describe('findAllRelatedVideoById', () => {
    const member = memberFixture;
    const videos = videoListExample;

    it('연관된 영상을 조회하면, 이미 연관된 영상은 isRelated가 true, 아니면 false로 반환된다.', async () => {
      // given
      mockVideoRelationRepository.findChildrenByParentId.mockResolvedValue(
        videos,
      );

      // when

      // then
      await expect(
        videoService.findAllRelatedVideoById(1, member),
      ).resolves.toEqual(videos.map(SingleVideoResponse.from));
    });

    it('video id가 존재하지 않는다면, VideoNotFoundException을 던진다.', async () => {
      // given
      mockVideoRelationRepository.findChildrenByParentId.mockResolvedValue(
        videos,
      );
      mockVideoRepository.findById.mockResolvedValue(undefined);

      // when

      // then
      await expect(
        videoService.findAllRelatedVideoById(12345, member),
      ).rejects.toThrow(VideoNotFoundException);
    });
  });

  describe('findRelatableVideos', () => {
    it('연관 가능 영상 전체를 조회할 때, 성공한다면 relatedVideo는 isRelated가 true로, videos는 false로 나온다.', async () => {
      // given
      const member = memberFixture;
      const requestVideo = videoFixture;
      const videos = [...videoListExample, ...videoListFixture];
      const relatedVideos = videoListFixture;
      mockVideoRepository.findById.mockResolvedValue(requestVideo);
      mockVideoRelationRepository.findChildrenByParentId.mockResolvedValue(
        relatedVideos,
      );
      mockVideoRepository.findAllVideosByMemberId.mockResolvedValue(videos);

      // when
      const response = await videoService.findRelatableVideos(
        requestVideo.id,
        member,
      );

      // then
      expect(response.length).toBe(videos.length);
      expect(response[0]).toBeInstanceOf(RelatableVideoResponse);
      expect(response.filter((each) => each.isRelated).length).toBe(
        relatedVideos.length,
      );
    });

    it('Member 없이 요청을 할 경우 ManipulatedTokenNotFilteredException을 던진다.', async () => {
      // given
      const requestVideo = videoFixture;
      const videos = [...videoListExample, ...videoListFixture];
      const relatedVideos = videoListFixture;
      mockVideoRepository.findById.mockResolvedValue(requestVideo);
      mockVideoRelationRepository.findChildrenByParentId.mockResolvedValue(
        relatedVideos,
      );
      mockVideoRepository.findAllVideosByMemberId.mockResolvedValue(videos);

      // when

      // then
      await expect(
        videoService.findRelatableVideos(requestVideo.id, null),
      ).rejects.toThrow(ManipulatedTokenNotFiltered);
    });

    it('다른 회원이 요청을 할 경우 VideoAccessForbiddenException을 던진다.', async () => {
      // given
      const member = otherMemberFixture;
      const requestVideo = videoFixture;
      const videos = [...videoListExample, ...videoListFixture];
      const relatedVideos = videoListFixture;
      mockVideoRepository.findById.mockResolvedValue(requestVideo);
      mockVideoRelationRepository.findChildrenByParentId.mockResolvedValue(
        relatedVideos,
      );
      mockVideoRepository.findAllVideosByMemberId.mockResolvedValue(videos);

      // when

      // then
      await expect(
        videoService.findRelatableVideos(requestVideo.id, member),
      ).rejects.toThrow(VideoAccessForbiddenException);
    });

    it('없는 영상의 id로 요청한 경우 VideoNotFoundException을 던진다.', async () => {
      // given
      const member = otherMemberFixture;
      const videos = [...videoListExample, ...videoListFixture];
      const relatedVideos = videoListFixture;
      mockVideoRepository.findById.mockResolvedValue(undefined);
      mockVideoRelationRepository.findChildrenByParentId.mockResolvedValue(
        relatedVideos,
      );
      mockVideoRepository.findAllVideosByMemberId.mockResolvedValue(videos);

      // when

      // then
      await expect(
        videoService.findRelatableVideos(100000, member),
      ).rejects.toThrow(VideoNotFoundException);
    });
  });

  describe('updateVideo', () => {
    const member = memberFixture;

    it('비디오 이름 변경 성공 시 undefined로 반환된다.', async () => {
      // given
      const video = videoFixture;

      // when
      mockVideoRepository.findById.mockResolvedValue(video);
      mockVideoRepository.updateVideo.mockResolvedValue(undefined);
      mockVideoRepository.findAllByIds.mockResolvedValue([]);
      mockVideoRelationRepository.findAllByParentId.mockResolvedValue([]);
      mockVideoRelationRepository.deleteAll.mockResolvedValue(undefined);
      mockVideoRelationRepository.insert.mockResolvedValue(undefined);
      mockVideoRelationRepository.save.mockResolvedValue(undefined);
      mockVideoRepository.updateVideoInfo.mockResolvedValue(undefined);

      // then
      expect(
        videoService.updateVideo(updateVideoRequestFixture, member, video.id),
      ).resolves.toBeUndefined();
    });

    it('비디오 이름 변경 시 member가 없으면 ManipulatedTokenNotFiltered을 반환한다.', () => {
      // given
      const video = videoFixture;
      const member = undefined;

      // when

      // then
      expect(
        videoService.updateVideo(updateVideoRequestFixture, member, video.id),
      ).rejects.toThrow(ManipulatedTokenNotFiltered);
    });

    it('비디오 이름 변경 시 이미 삭제된 비디오의 이름을 변경하려고 하면 VideoNotFoundException을 반환한다.', () => {
      // given
      const video = videoFixture;

      // when
      mockVideoRepository.findById.mockResolvedValue(undefined);

      // then
      expect(
        videoService.updateVideo(updateVideoRequestFixture, member, video.id),
      ).rejects.toThrow(VideoNotFoundException);
    });

    it('비디오 이름 변경 시 자신의 것이 아닌 비디오의 이름을 변경하려고 하면 VideoAccessForbiddenException을 반환한다.', () => {
      // given
      const video = videoOfOtherFixture;

      // when
      mockVideoRepository.findById.mockResolvedValue(video);

      // then
      expect(
        videoService.updateVideo(updateVideoRequestFixture, member, video.id),
      ).rejects.toThrow(VideoAccessForbiddenException);
    });
  });

  describe('updateIndex', () => {
    it('배열에 회원의 소유인 영상의 id들이 있으면 아무것도 반환하지 않는다.', async () => {
      // given
      const ids = videoListExample.map((each) => each.id);

      // when
      mockEmitter.emitAsync.mockResolvedValue(undefined);
      mockVideoRepository.findAllVideosByMemberId.mockResolvedValue(
        videoListExample,
      );
      mockVideoRepository.updateIndex.mockResolvedValue(undefined);

      // then
      await expect(
        videoService.updateIndex(
          UpdateVideoIndexRequest.of(ids),
          memberFixture,
        ),
      ).resolves.toBeUndefined();
    });

    it('배열의 길이가 다르면 VideoLackException을 반환한다.', async () => {
      // given
      const ids = videoListExample.map((each) => each.id);
      ids.pop();

      // when
      mockEmitter.emitAsync.mockResolvedValue(undefined);
      mockVideoRepository.findAllVideosByMemberId.mockResolvedValue(
        videoListExample,
      );
      mockVideoRepository.updateIndex.mockResolvedValue(undefined);

      // then
      await expect(
        videoService.updateIndex(
          UpdateVideoIndexRequest.of(ids),
          memberFixture,
        ),
      ).rejects.toThrow(new VideoLackException());
    });

    it('배열의 길이가 같지만 원소의 값이 하나라도 다르면 VideoAccessForbiddenException을 반환한다.', async () => {
      // given
      const ids = videoListExample.map((each) => each.id);
      ids.pop();
      ids.push(100);

      // when
      mockEmitter.emitAsync.mockResolvedValue(undefined);
      mockVideoRepository.findAllVideosByMemberId.mockResolvedValue(
        videoListExample,
      );
      mockVideoRepository.updateIndex.mockResolvedValue(undefined);

      // then
      await expect(
        videoService.updateIndex(
          UpdateVideoIndexRequest.of(ids),
          memberFixture,
        ),
      ).rejects.toThrow(new VideoAccessForbiddenException());
    });

    it('회원이 주어지지 않으면 ManipulatedTokenException을 반환한다.', async () => {
      // given
      const ids = videoListExample.map((each) => each.id);

      // when
      mockEmitter.emitAsync.mockResolvedValue(undefined);
      mockVideoRepository.findAllVideosByMemberId.mockResolvedValue(
        videoListExample,
      );
      mockVideoRepository.updateIndex.mockResolvedValue(undefined);

      // then
      await expect(
        videoService.updateIndex(UpdateVideoIndexRequest.of(ids), undefined),
      ).rejects.toThrow(new ManipulatedTokenNotFiltered());
    });
  });

  describe('deleteVideo', () => {
    const member = memberFixture;

    it('비디오 삭제 성공 시 undefined로 반환된다.', async () => {
      // given
      const deleteObjectInIDriveSpy = jest.spyOn(
        idriveUtil,
        'deleteObjectInIDrive',
      );
      deleteObjectInIDriveSpy.mockResolvedValue(undefined);

      const video = videoFixture;

      // when
      mockVideoRepository.findById.mockResolvedValue(video);
      mockVideoRepository.remove.mockResolvedValue(undefined);

      // then
      await expect(
        videoService.deleteVideo(video.id, member),
      ).resolves.toBeUndefined();

      deleteObjectInIDriveSpy.mockRestore();
    });

    it('비디오 삭제 시 member가 없으면 ManipulatedTokenNotFiltered을 반환한다.', () => {
      // given
      const video = videoFixture;
      const member = undefined;

      // when

      // then
      expect(videoService.deleteVideo(video.id, member)).rejects.toThrow(
        ManipulatedTokenNotFiltered,
      );
    });

    it('비디오 삭제 시 이미 삭제된 비디오를 삭제하려고 하면 VideoNotFoundException을 반환한다.', () => {
      // given
      const video = videoFixture;

      // when
      mockVideoRepository.findById.mockResolvedValue(undefined);

      // then
      expect(videoService.deleteVideo(video.id, member)).rejects.toThrow(
        VideoNotFoundException,
      );
    });

    it('비디오 삭제 시 자신의 것이 아닌 비디오를 삭제하려고 하면 VideoAccessForbiddenException을 반환한다.', () => {
      // given
      const video = videoOfOtherFixture;

      // when
      mockVideoRepository.findById.mockResolvedValue(video);

      // then
      expect(videoService.deleteVideo(video.id, member)).rejects.toThrow(
        VideoAccessForbiddenException,
      );
    });
  });
});

describe('VideoService 통합 테스트', () => {
  let app: INestApplication;
  let videoService: VideoService;
  let categoryRepository: CategoryRepository;
  let memberRepository: MemberRepository;
  let memberService: MemberService;
  let questionRepository: QuestionRepository;
  let questionService: QuestionService;
  let workbookRepository: WorkbookRepository;
  let videoRepository: VideoRepository;
  let videoRelationRepository: VideoRelationRepository;

  beforeAll(async () => {
    const modules = [
      MemberModule,
      VideoModule,
      QuestionModule,
      CategoryModule,
      WorkbookModule,
    ];

    const moduleFixture: TestingModule =
      await createIntegrationTestModule(modules);

    app = moduleFixture.createNestApplication();
    addAppModules(app);
    await app.init();

    videoService = moduleFixture.get<VideoService>(VideoService);
    categoryRepository =
      moduleFixture.get<CategoryRepository>(CategoryRepository);
    memberService = moduleFixture.get<MemberService>(MemberService);
    memberRepository = moduleFixture.get<MemberRepository>(MemberRepository);
    questionRepository =
      moduleFixture.get<QuestionRepository>(QuestionRepository);
    questionService = moduleFixture.get<QuestionService>(QuestionService);
    workbookRepository =
      moduleFixture.get<WorkbookRepository>(WorkbookRepository);
    videoRepository = moduleFixture.get<VideoRepository>(VideoRepository);
    videoRelationRepository = moduleFixture.get<VideoRelationRepository>(
      VideoRelationRepository,
    );
  });

  beforeEach(async () => {
    await memberRepository.save(memberFixture);
    await categoryRepository.save(categoryFixtureWithId);
    await workbookRepository.save(workbookFixtureWithId);
    await questionRepository.save(questionFixture);
  });

  describe('createVideo', () => {
    it('새로운 비디오 저장에 성공하면 undefined를 반환한다.', async () => {
      //given
      const member = memberFixture;

      //when

      //then
      await expect(
        videoService.createVideo(member, createVideoRequestFixture),
      ).resolves.toBeUndefined();
    });

    it('새로운 비디오 저장 시 member가 없으면 ManipulatedTokenNotFiltered를 반환한다.', async () => {
      //given
      const member = null;

      //when

      //then
      expect(
        videoService.createVideo(member, createVideoRequestFixture),
      ).rejects.toThrow(ManipulatedTokenNotFiltered);
    });
  });

  describe('getPreSignedUrl', () => {
    it('preSigned URL 얻기 성공 시 PreSignedUrlResponse 형식으로 반환된다.', async () => {
      //given
      const member = memberFixture;

      //when
      const result = await videoService.getPreSignedUrl(member);

      //then
      expect(result).toBeInstanceOf(PreSignedUrlResponse);
      expect(
        result.video.preSignedUrl.startsWith('https://video'),
      ).toBeTruthy();
      expect(result.video.key.endsWith('.mp4')).toBeTruthy();
      expect(
        result.thumbnail.preSignedUrl.startsWith('https://thumbnail'),
      ).toBeTruthy();
      expect(result.thumbnail.key.endsWith('.png')).toBeTruthy();
    });

    it('preSigned URL 얻기 시 member가 없으면 ManipulatedTokenNotFiltered를 반환한다.', async () => {
      //given
      const memberFixture = null;

      //when

      //then
      expect(videoService.getPreSignedUrl(memberFixture)).rejects.toThrow(
        ManipulatedTokenNotFiltered,
      );
    });
  });

  describe('getVideoDetail', () => {
    it('비디오 세부 정보 조회 성공 시 VideoDetailResponse 형식으로 반환된다.', async () => {
      //given
      const member = memberFixture;
      const video = await videoRepository.save(videoFixture);

      //when
      const result = await videoService.getVideoDetail(video.id, member);

      //then
      expect(result).toBeInstanceOf(VideoDetailResponse);
      expect(result.nickname).toBe(member.nickname);
      expect(result.url).toBe(video.url);
      expect(result.videoName).toBe(video.name);
      expect(result.hash).toBe(null);
    });

    it('비디오 세부 정보 조회 성공 시 비디오가 LINK_ONLY가 아니라면 해시를 null을 반환한다.', async () => {
      //given
      const member = memberFixture;
      const video = await videoRepository.save(privateVideoFixture);

      //when
      const result = await videoService.getVideoDetail(video.id, member);

      //then
      expect(result).toBeInstanceOf(VideoDetailResponse);
      expect(result.nickname).toBe(member.nickname);
      expect(result.url).toBe(video.url);
      expect(result.videoName).toBe(video.name);
      expect(result.hash).toBeNull();
    });

    it('비디오 세부 정보 조회 시 member가 없고 public이라면 정상적으로 반환한다.', async () => {
      //given
      const video = await videoRepository.save(videoFixture);

      //when
      const result = await videoService.getVideoDetail(video.id, null);

      //then
      expect(result).toBeInstanceOf(VideoDetailResponse);
      expect(result.nickname).toBe(memberFixture.nickname);
      expect(result.url).toBe(video.url);
      expect(result.videoName).toBe(video.name);
      expect(result.hash).toBeNull();
    });

    it('비디오 세부 정보 조회 시 존재하지 않는 비디오를 조회하려 하면 VideoNotFoundException을 반환한다.', async () => {
      //given
      const member = memberFixture;
      const video = await videoRepository.save(videoFixture);

      //when

      //then
      expect(
        videoService.getVideoDetail(video.id + 1000, member),
      ).rejects.toThrow(VideoNotFoundException);
    });

    it('비디오 세부 정보 조회 시 다른 사람이 private/link_only 비디오를 조회하려 하면 VideoAccessForbiddenException을 반환한다.', async () => {
      //given
      const member = memberFixture;
      await memberRepository.save(otherMemberFixture);
      const video = await videoRepository.save(videoOfOtherFixture);

      //when

      //then
      expect(videoService.getVideoDetail(video.id, member)).rejects.toThrow(
        VideoAccessForbiddenException,
      );
    });
  });

  describe('getVideoDetailByHash', () => {
    it('해시로 비디오 세부 정보 조회 성공 시 VideoDetailResponse 형식으로 반환된다.', async () => {
      //given
      const video = await videoRepository.save(linkOnlyVideoFixture);
      const member = await memberRepository.findById(video.memberId);
      const hash = (await videoService.getVideoDetail(video.id, memberFixture))
        .hash;
      //when
      const result = await videoService.getVideoDetailByHash(hash);

      //then
      expect(result).toBeInstanceOf(VideoDetailResponse);
      expect(result.nickname).toBe(member.nickname);
      expect(result.url).toBe(video.url);
      expect(result.videoName).toBe(video.name);
      expect(result.hash).toBe(
        crypto.createHash('md5').update(video.url).digest('hex'),
      );
    });

    it('해시로 비디오 상세 정보 조회 시 해시가 유효하지 않은 형태라면 InvalidHashException을 반환한다.', async () => {
      // given
      const hash = 'invalidHash';
      // when

      // then
      await expect(videoService.getVideoDetailByHash(hash)).rejects.toThrow(
        InvalidHashException,
      );
    });

    it('해시로 비디오 상세 정보 조회 시 해시로 조회되는 비디오가 없다면 VideoNotFoundException을 반환한다.', async () => {
      // given
      const video = await videoRepository.save(linkOnlyVideoFixture);
      const hash = (await videoService.getVideoDetail(video.id, memberFixture))
        .hash;
      await videoRepository.remove(video);

      // when

      // then
      await expect(videoService.getVideoDetailByHash(hash)).rejects.toThrow(
        VideoNotFoundException,
      );
    });

    it('해시로 비디오 상세 정보 조회 시 해시로 조회되는 비디오가 없다면 VideoNotFoundWithHashException을 반환한다.', async () => {
      // given
      const hash = crypto.createHash('md5').update('wrong').digest('hex');

      // when

      // then
      await expect(videoService.getVideoDetailByHash(hash)).rejects.toThrow(
        VideoNotFoundWithHashException,
      );
    });

    it('해시로 비디오 세부 정보 조회 시 탈퇴한 회원의 비디오를 조회하려 하면 VideoOfWithdrawnMemberException을 반환한다.', async () => {
      //given
      const video = await videoRepository.save(linkOnlyVideoFixture);
      const hash = (await videoService.getVideoDetail(video.id, memberFixture))
        .hash;
      await memberRepository.remove(memberFixture);
      video.memberId = null;
      await videoRepository.save(video);

      //when

      //then
      await expect(videoService.getVideoDetailByHash(hash)).rejects.toThrow(
        VideoOfWithdrawnMemberException,
      );
    });
  });

  describe('getAllVideosByMemberId', () => {
    it('비디오 전체 조회 성공 시 SingleVideoResponse의 배열 형식으로 반환된다.', async () => {
      // given
      const member = memberFixture;
      const video = await videoRepository.save(videoFixture);

      // when
      const result = await videoService.getAllVideosByMemberId(member);

      // then
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(SingleVideoResponse);
      expect(result[0].thumbnail).toBe('');
      expect(result[0].videoName).toBe(video.name);
      expect(result[0].videoLength).toBe(video.videoLength);
      expect(result[0].visibility).toBe(video.visibility);
    });

    it('비디오 전체 조회 시 비디오가 없다면 빈 배열을 반환한다.', async () => {
      //given
      const member = memberFixture;

      //when
      const result = await videoService.getAllVideosByMemberId(member);

      //then
      expect(result).toEqual([]);
    });

    it('비디오 전체 조회 시 member가 없으면 ManipulatedTokenNotFiltered를 반환한다.', async () => {
      //given
      const member = null;
      await videoRepository.save(videoFixture);

      //when

      //then
      expect(videoService.getAllVideosByMemberId(member)).rejects.toThrow(
        ManipulatedTokenNotFiltered,
      );
    });
  });

  describe('findAllRelatedVideoById', () => {
    let member;
    let video;

    beforeEach(async () => {
      member = await memberRepository.save(memberFixture);
      video = await videoRepository.save(videoFixture);
      const relations = videoListExample.map(async (each) => {
        await videoRepository.save(each);
        await videoRelationRepository.insert(VideoRelation.of(video, each));
      });
      await Promise.all(relations);
    });

    it('회원이 자신의 연관영상을 조회시 등록한 모든 연관영상을 조회한다', async () => {
      // given

      // when
      const response = await videoService.findAllRelatedVideoById(
        video.id,
        member,
      );

      // then
      response.forEach((singleVideoResponse) => {
        expect(singleVideoResponse).toBeInstanceOf(SingleVideoResponse);
      });
      expect(response.length).toBe(videoListExample.length);
    });

    it('다른 회원이 연관영상을 조회시 공개여부가 PUBLIC인 연관영상을 조회한다', async () => {
      // given

      // when
      const response = await videoService.findAllRelatedVideoById(
        video.id,
        null,
      );

      // then
      response.forEach((singleVideoResponse) => {
        expect(singleVideoResponse).toBeInstanceOf(SingleVideoResponse);
      });
      expect(response.length).toBe(
        videoListExample.filter((each) => each.isPublic()).length,
      );
    });

    it('존재하지 않는 id로 연관영상을 조회하면 VideoNotFoundException을 던진다.', async () => {
      // given

      // when

      // then
      await expect(
        videoService.findAllRelatedVideoById(12345, null),
      ).rejects.toThrow(VideoNotFoundException);
    });
  });

  describe('findPublicVideos', () => {
    let video;

    beforeEach(async () => {
      await memberRepository.save(memberFixture);
      video = await videoRepository.save(videoFixture);
      const relations = videoListExample.map(async (each) => {
        await videoRepository.save(each);
        await videoRelationRepository.insert(VideoRelation.of(video, each));
      });
      await Promise.all(relations);
    });

    it('조회시 PUBLIC인 영상만 조회된다.', async () => {
      // given

      // when
      const publicVideoResponses = await videoService.findPublicVideos();

      // then
      expect(publicVideoResponses).toBeInstanceOf(Array);
      expect(publicVideoResponses.length).toBe(2);
      expect(publicVideoResponses[0]).toBeInstanceOf(MemberVideoResponse);
      expect(publicVideoResponses[0].id).toBe(video.id);
      expect(publicVideoResponses[1].videoName).toBe(
        videoListExample.filter((each) => each.isPublic())[0].name,
      );
    });
  });

  describe('updateVideo', () => {
    it('비디오 이름 변경 성공 시 undefined로 반환된다.', async () => {
      // given
      const member = memberFixture;
      const video = await videoRepository.save(videoFixture);

      // when & then
      expect(
        videoService.updateVideo(updateVideoRequestFixture, member, video.id),
      ).resolves.toBeUndefined();
    });

    it('수정시 배열을 빈 배열로 주면, 모든 VideoRelation이 삭제된다.', async () => {
      // given
      const member = memberFixture;
      const video = await videoRepository.save(videoFixture);
      const updateVideoRequest = UpdateVideoRequest.of(
        video.name,
        'PUBLIC',
        [],
        video.thumbnail,
        video.videoAnswer,
      );

      // when & then
      expect(
        videoService.updateVideo(updateVideoRequest, member, video.id),
      ).resolves.toBeUndefined();
      expect(
        (await videoService.findAllRelatedVideoById(video.id, member)).length,
      ).toBe(0);
    });

    it('수정시 배열에 존재하는 id들은 후에 연관영상 조회시 나타난다.', async () => {
      // given
      const member = memberFixture;
      const video = await videoRepository.save(videoFixture);
      const relatedVideos = await Promise.all(
        videoListExample.map(async (each) => {
          const saved = await videoRepository.save(each);
          await videoRelationRepository.save([VideoRelation.of(video, saved)]);
          return saved;
        }),
      );
      const updateVideoRequest = UpdateVideoRequest.of(
        video.name,
        'PUBLIC',
        [relatedVideos.pop().id, relatedVideos.pop().id],
        video.thumbnail,
        video.videoAnswer,
      );

      // when & then
      await expect(
        videoService.updateVideo(updateVideoRequest, member, video.id),
      ).resolves.toBeUndefined();
      expect(
        (await videoService.findAllRelatedVideoById(video.id, member)).length,
      ).toBe(2);
    });

    it('영상의 공유상태를 바꾸면 정상적으로 수정된다', async () => {
      // given
      const member = memberFixture;
      const video = await videoRepository.save(videoFixture);
      const relatedVideos = await Promise.all(
        videoListExample.map(async (each) => {
          const saved = await videoRepository.save(each);
          await videoRelationRepository.save([VideoRelation.of(video, saved)]);
          return saved;
        }),
      );
      const updateVideoRequest = UpdateVideoRequest.of(
        video.name,
        'PRIVATE',
        [relatedVideos.pop().id, relatedVideos.pop().id],
        video.thumbnail,
        video.videoAnswer,
      );

      // when & then
      await expect(
        videoService.updateVideo(updateVideoRequest, member, video.id),
      ).resolves.toBeUndefined();
      expect(
        (await videoRepository.findById(video.id)).isPrivate(),
      ).toBeTruthy();
    });

    it('영상의 공유상태를 바꾸면 정상적으로 수정된다', async () => {
      // given
      const member = memberFixture;
      const video = await videoRepository.save(videoFixture);
      const relatedVideos = await Promise.all(
        videoListExample.map(async (each) => {
          const saved = await videoRepository.save(each);
          await videoRelationRepository.save([VideoRelation.of(video, saved)]);
          return saved;
        }),
      );
      const updateVideoRequest = UpdateVideoRequest.of(
        video.name,
        'LINK_ONLY',
        [relatedVideos.pop().id, relatedVideos.pop().id],
        video.thumbnail,
        video.videoAnswer,
      );

      // when & then
      await expect(
        videoService.updateVideo(updateVideoRequest, member, video.id),
      ).resolves.toBeUndefined();
      expect(
        (await videoRepository.findById(video.id)).isLinkOnly(),
      ).toBeTruthy();
    });

    it('비디오 이름 변경 시 member가 없으면 ManipulatedTokenNotFiltered를 반환한다.', async () => {
      // given
      const member = null;
      const video = await videoRepository.save(videoFixture);

      // when & then
      expect(
        videoService.updateVideo(updateVideoRequestFixture, member, video.id),
      ).rejects.toThrow(ManipulatedTokenNotFiltered);
    });

    it('비디오 이름 변경 시 존재하지 않는 비디오의 이름을 변경하려 하면 VideoNotFoundException을 반환한다.', async () => {
      // given
      const member = memberFixture;
      await videoRepository.save(videoFixture);

      // when & then
      expect(
        videoService.updateVideo(updateVideoRequestFixture, member, 100),
      ).rejects.toThrow(VideoNotFoundException);
    });

    it('비디오 이름 변경 시 다른 사람의 비디오 이름을 변경하려 하면 VideoAccessForbiddenException을 반환한다.', async () => {
      // given
      const member = memberFixture;
      await memberRepository.save(otherMemberFixture);
      const video = await videoRepository.save(videoOfOtherFixture);

      // when & then
      expect(
        videoService.updateVideo(updateVideoRequestFixture, member, video.id),
      ).rejects.toThrow(VideoAccessForbiddenException);
    });

    // TODO: 비디오 변경 시 썸네일이 ""으로 들어오면 Default 이미지로 변경한다.
  });

  describe('findRelatableVideos', () => {
    let video;

    beforeEach(async () => {
      await memberRepository.save(memberFixture);
      video = await videoRepository.save(videoFixture);
      await Promise.all(
        questionListFixture.map(
          async (each) => await questionRepository.save(each),
        ),
      );
      const relations = videoListExample.map(async (each) => {
        await videoRepository.save(each);
        await videoRelationRepository.insert(VideoRelation.of(video, each));
      });
      await Promise.all(relations);
      await Promise.all(
        videoListFixture.map(async (each) => await videoRepository.save(each)),
      );
    });

    it('연관가능한 영상들을 조회하면, isRelated가 true인 영상이 listExample만큼, false인 영상이 listFixture만큼 나온다', async () => {
      // given

      // when
      const data = await videoService.findRelatableVideos(
        video.id,
        memberFixture,
      );

      // then
      expect(data.length).toBe(
        (
          await videoRepository.findAllVideosByMemberId(memberFixture.id)
        ).filter((each) => each.id !== video.id).length,
      );
      expect(data.filter((each) => each.isRelated).length).toBe(
        videoListExample.length,
      );
      expect(data[0]).toBeInstanceOf(RelatableVideoResponse);
    });

    it('회원 정보가 없으면 ManipulatedTokenNotFiltered예외를 던진다.', async () => {
      // given

      // when

      // then
      await expect(
        videoService.findRelatableVideos(video.id, null),
      ).rejects.toThrow(ManipulatedTokenNotFiltered);
    });

    it('id가 존재하지 않으면 VideoNotFoundException을 던진다.', async () => {
      // given

      // when

      // then
      await expect(
        videoService.findRelatableVideos(10000, memberFixture),
      ).rejects.toThrow(VideoNotFoundException);
    });

    it('회원의 영상이 아니면 VideoAccessForbidden예외를 던진다.', async () => {
      // given
      const otherMember = await memberRepository.save(otherMemberFixture);

      // when

      // then
      await expect(
        videoService.findRelatableVideos(video.id, otherMember),
      ).rejects.toThrow(VideoAccessForbiddenException);
    });
  });

  describe('updateIndex', () => {
    const member = memberFixture;

    const saveDummyVideos = async () =>
      Promise.all(
        videoListExample.map(
          async (video) => await videoRepository.save(video),
        ),
      );

    it('영상의 인덱스 수정을 성공하면 undefined를 반환한다. 그리고 조회시에 변경된 인덱스 순으로 정렬된다.', async () => {
      // given
      const videos = await saveDummyVideos();

      // when
      const ids = videos.map((each) => each.id); // 1, 2, 3, 4
      ids.unshift(ids.pop()); // 4, 1, 2, 3
      ids.unshift(ids.pop()); // 3, 4, 1, 2
      const indexRequest = UpdateVideoIndexRequest.of(ids);

      // then
      await expect(
        videoService.updateIndex(indexRequest, member),
      ).resolves.toBeUndefined();
      const membersVideos = await videoService.getAllVideosByMemberId(member);
      expect(membersVideos.map((each) => each.id)).toEqual(ids);
    });

    it('배열의 길이가 다르면 VideoLackException을 반환한다.', async () => {
      // given
      const videos = await saveDummyVideos();

      // when
      const ids = videos.map((each) => each.id); // 1, 2, 3, 4
      ids.unshift(ids.pop()); // 4, 1, 2, 3
      ids.pop(); // 3, 4, 1, 2

      // then
      await expect(
        videoService.updateIndex(UpdateVideoIndexRequest.of(ids), member),
      ).rejects.toThrow(new VideoLackException());
    });

    it('배열의 길이가 같지만 원소의 값이 하나라도 다르면 VideoAccessForbiddenException을 반환한다.', async () => {
      // given
      const videos = await saveDummyVideos();

      // when
      const ids = videos.map((each) => each.id); // 1, 2, 3, 4
      ids.unshift(ids.pop()); // 4, 1, 2, 3
      ids.pop(); // 3, 4, 1, 2
      ids.push(1200);

      // then
      await expect(
        videoService.updateIndex(UpdateVideoIndexRequest.of(ids), member),
      ).rejects.toThrow(new VideoAccessForbiddenException());
    });

    it('회원이 주어지지 않으면 ManipulatedTokenException을 반환한다.', async () => {
      // given
      const videos = await saveDummyVideos();

      // when
      const ids = videos.map((each) => each.id); // 1, 2, 3, 4
      ids.unshift(ids.pop()); // 4, 1, 2, 3
      ids.unshift(ids.pop()); // 3, 4, 1, 2
      const indexRequest = UpdateVideoIndexRequest.of(ids);

      // then
      await expect(
        videoService.updateIndex(indexRequest, undefined),
      ).rejects.toThrow(new ManipulatedTokenNotFiltered());
    });
  });

  describe('deleteVideo', () => {
    it('비디오 삭제에 성공하면 undefined를 반환한다.', async () => {
      // given
      const deleteObjectInIDriveSpy = jest.spyOn(
        idriveUtil,
        'deleteObjectInIDrive',
      );
      deleteObjectInIDriveSpy.mockResolvedValue(undefined);

      const member = memberFixture;
      const video = await videoRepository.save(videoFixture);

      // when

      // then
      await expect(
        videoService.deleteVideo(video.id, member),
      ).resolves.toBeUndefined();

      deleteObjectInIDriveSpy.mockRestore();
    });

    it('비디오 삭제 시 member가 없으면 ManipulatedTokenNotFiltered를 반환한다.', async () => {
      // given
      const member = null;
      const video = await videoRepository.save(videoFixture);

      // when

      // then
      expect(videoService.deleteVideo(video.id, member)).rejects.toThrow(
        ManipulatedTokenNotFiltered,
      );
    });

    it('비디오 삭제 시 존재하지 않는 비디오를 삭제하려 하면 VideoNotFoundException을 반환한다.', async () => {
      // given
      const member = memberFixture;
      const video = await videoRepository.save(videoFixture);

      // when

      // then
      expect(videoService.deleteVideo(video.id + 1000, member)).rejects.toThrow(
        VideoNotFoundException,
      );
    });

    it('비디오 삭제 시 다른 사람의 비디오를 삭제하려 하면 VideoAccessForbiddenException을 반환한다.', async () => {
      // given
      const member = memberFixture;
      await memberRepository.save(otherMemberFixture);
      const video = await videoRepository.save(videoOfOtherFixture);

      // when

      // then
      expect(videoService.deleteVideo(video.id, member)).rejects.toThrow(
        VideoAccessForbiddenException,
      );
    });
  });

  describe('onDelete', () => {
    it('회원이 삭제되면 회원이 작성한 답변도 삭제된다.', async () => {
      //given
      const deleteObjectInIDriveSpy = jest.spyOn(
        idriveUtil,
        'deleteObjectInIDrive',
      );
      deleteObjectInIDriveSpy.mockResolvedValue(undefined);

      const member = memberFixture;
      const video = await videoRepository.save(videoFixture);

      //when
      await memberService.deleteMember(member);
      const afterMemberDelete = await videoRepository.findById(video.id);
      //then
      expect(afterMemberDelete.memberId).toBeNull();
      expect(afterMemberDelete.memberNickname).toBeNull();
      expect(afterMemberDelete.memberProfileImg).toBeNull();
    });

    it('질문이 삭제되면 영상의 질문정보도 null처리된다.', async () => {
      //given
      const member = memberFixture;
      const video = await videoRepository.save(videoFixture);

      //when
      await questionService.deleteQuestionById(video.questionId, member);
      const afterQuestionDelete = await videoRepository.findById(video.id);
      //then
      expect(afterQuestionDelete.questionId).toBeNull();
    });
  });

  afterEach(async () => {
    await questionRepository.query('delete from Member');
    await questionRepository.query('delete from Category');
    await questionRepository.query('delete from Workbook');
    await questionRepository.query('delete from Question');
    await questionRepository.query('delete from Video');
    await questionRepository.query('DELETE FROM sqlite_sequence'); // Auto Increment 초기화
  });
});
