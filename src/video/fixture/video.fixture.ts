import { PRIVATE, PUBLIC } from '../constant/videoVisibility';
import { CreateVideoRequest } from '../dto/createVideoRequest';
import { UpdateVideoIndexRequest } from '../dto/updateVideoIndexRequest';
import { Video } from '../entity/video';
import { PreSignedInfo } from '../interface/video.interface';

export const videoListExample = [
  new Video(
    5,
    1,
    1,
    'test1.webm',
    'https://test-video1.com',
    'https://test-thumbnail1.com',
    '02:42',
    PRIVATE,
  ),
  new Video(
    6,
    1,
    1,
    'test2.webm',
    'https://test-video2.com',
    'https://test-thumbnail2.com',
    '02:42',
    PRIVATE,
  ),
  new Video(
    7,
    1,
    1,
    'test3.webm',
    'https://test-video3.com',
    'https://test-thumbnail3.com',
    '02:42',
    PRIVATE,
  ),
  new Video(
    8,
    1,
    1,
    'test4.webm',
    'https://test-video4.com',
    'https://test-thumbnail4.com',
    '02:42',
    PUBLIC,
  ),
].slice(0, 4);

export const videoListFixture = [
  new Video(
    9,
    1,
    1,
    '루이뷔통통튀기네',
    'https://test.com',
    'https://thumbnail-test.com',
    '03:29',
    PUBLIC,
  ),
  new Video(
    10,
    1,
    4,
    '루이뷔통통튀기네',
    'https://foo.com',
    'https://bar-test.com',
    '02:12',
    PUBLIC,
  ),
];

export const videoFixture = new Video(
  1,
  1,
  1,
  '루이뷔통통튀기네',
  'https://test.com',
  'https://thumbnail-test.com',
  '03:29',
  PUBLIC,
);

export const privateVideoFixture = new Video(
  2,
  1,
  1,
  '루이뷔통통튀기네',
  'https://priavte-test.com',
  'https://thumbnail-test.com',
  '03:29',
  PRIVATE,
);

export const videoOfOtherFixture = new Video(
  3,
  999,
  1,
  '루이뷔통통튀기네',
  'https://test.com',
  'https://thumbnail-test.com',
  '03:29',
  PRIVATE,
);

export const videoOfWithdrawnMemberFixture = new Video(
  4,
  null,
  1,
  '루이뷔통통튀기네',
  'https://test.com',
  'https://thumbnail-test.com',
  '03:29',
  PUBLIC,
);

export const createVideoRequestFixture = new CreateVideoRequest(
  1,
  'foobar.webm',
  'https://u2e0.c18.e2-4.dev/videos/example.mp4',
  'https://bar.com',
  '03:29',
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
};

const arr = [2, 1, 4, 3];
export const updateVideoIndexRequestFixture = UpdateVideoIndexRequest.of(arr);
