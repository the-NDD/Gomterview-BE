import {
  memberFixture,
  otherMemberFixture,
} from 'src/member/fixture/member.fixture';
import { LINK_ONLY, PRIVATE, PUBLIC } from '../constant/videoVisibility';
import { CreateVideoRequest } from '../dto/createVideoRequest';
import { UpdateVideoIndexRequest } from '../dto/updateVideoIndexRequest';
import { Video } from '../entity/video';
import { PreSignedInfo } from '../interface/video.interface';

export const videoListExample = [
  new Video(
    5,
    memberFixture.id,
    memberFixture.nickname,
    memberFixture.profileImg,
    1,
    'test1.webm',
    'https://test-video1.com',
    'https://test-thumbnail1.com',
    '02:42',
    PRIVATE,
    '예시 답변1입니다.',
  ),
  new Video(
    6,
    memberFixture.id,
    memberFixture.nickname,
    memberFixture.profileImg,
    1,
    'test2.webm',
    'https://test-video2.com',
    'https://test-thumbnail2.com',
    '02:42',
    PRIVATE,
    '예시 답변2입니다.',
  ),
  new Video(
    7,
    memberFixture.id,
    memberFixture.nickname,
    memberFixture.profileImg,
    1,
    'test3.webm',
    'https://test-video3.com',
    'https://test-thumbnail3.com',
    '02:42',
    PRIVATE,
    '예시 답변3입니다.',
  ),
  new Video(
    8,
    memberFixture.id,
    memberFixture.nickname,
    memberFixture.profileImg,
    1,
    'test4.webm',
    'https://test-video4.com',
    'https://test-thumbnail4.com',
    '02:42',
    PUBLIC,
    '예시 답변4입니다.',
  ),
].slice(0, 4);

export const videoListFixture = [
  new Video(
    9,
    memberFixture.id,
    memberFixture.nickname,
    memberFixture.profileImg,
    1,
    '루이뷔통통튀기네',
    'https://test.com',
    'https://thumbnail-test.com',
    '03:29',
    PUBLIC,
    '예시 답변1입니다.',
  ),
  new Video(
    10,
    memberFixture.id,
    memberFixture.nickname,
    memberFixture.profileImg,
    4,
    '루이뷔통통튀기네',
    'https://foo.com',
    'https://bar-test.com',
    '02:12',
    PUBLIC,
    '예시 답변2입니다.',
  ),
];

export const videoFixture = new Video(
  1,
  memberFixture.id,
  memberFixture.nickname,
  memberFixture.profileImg,
  1,
  '루이뷔통통튀기네',
  'https://test.com',
  'https://thumbnail-test.com',
  '03:29',
  PUBLIC,
  '예시 답변입니다.',
);

export const linkOnlyVideoFixture = new Video(
  1,
  memberFixture.id,
  memberFixture.nickname,
  memberFixture.profileImg,
  1,
  '루이뷔통통튀기네',
  'https://test.com',
  'https://thumbnail-test.com',
  '03:29',
  LINK_ONLY,
  '예시 답변입니다.',
);

export const privateVideoFixture = new Video(
  2,
  memberFixture.id,
  memberFixture.nickname,
  memberFixture.profileImg,
  1,
  '루이뷔통통튀기네',
  'https://priavte-test.com',
  'https://thumbnail-test.com',
  '03:29',
  PRIVATE,
  '예시 답변입니다.',
);

export const videoOfOtherFixture = new Video(
  3,
  otherMemberFixture.id,
  otherMemberFixture.nickname,
  otherMemberFixture.profileImg,
  1,
  '루이뷔통통튀기네',
  'https://test.com',
  'https://thumbnail-test.com',
  '03:29',
  PRIVATE,
  '예시 답변입니다.',
);

export const videoOfWithdrawnMemberFixture = new Video(
  4,
  null,
  null,
  null,
  1,
  '루이뷔통통튀기네',
  'https://test.com',
  'https://thumbnail-test.com',
  '03:29',
  PUBLIC,
  '예시 답변입니다.',
);

export const createVideoRequestFixture = new CreateVideoRequest(
  1,
  'foobar.webm',
  'https://u2e0.c18.e2-4.dev/videos/example.mp4',
  'https://bar.com',
  '03:29',
  '예시 답변입니다.',
);

export const videoPreSignedInfoFixture = {
  preSignedUrl: 'https://video-example.com',
  key: 'video-example.mp4',
} as PreSignedInfo;

export const thumbnailPreSignedInfoFixture = {
  preSignedUrl: 'https://thumbnail-example.com',
  key: 'thumbnail-example.png',
} as PreSignedInfo;

export const updateVideoRequestFixture = {
  videoName: 'example.mp4',
  visibility: 'PUBLIC',
  relatedVideoIds: [],
  thumbnail: '',
  videoAnswer: '예시 답변입니다.',
};

const arr = [2, 1, 4, 3];
export const updateVideoIndexRequestFixture = UpdateVideoIndexRequest.of(arr);
