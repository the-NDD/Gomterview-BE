import { CreateVideoRequest } from '../dto/createVideoRequest';
import { UpdateVideoIndexRequest } from '../dto/updateVideoIndexRequest';
import { Video } from '../entity/video';
import { PreSignedInfo } from '../interface/video.interface';

export const videoListExample = [
  new Video(
    1,
    1,
    'test1.webm',
    'https://test-video1.com',
    'https://test-thumbnail1.com',
    '02:42',
    false,
  ),
  new Video(
    1,
    1,
    'test2.webm',
    'https://test-video2.com',
    'https://test-thumbnail2.com',
    '02:42',
    false,
  ),
  new Video(
    1,
    1,
    'test3.webm',
    'https://test-video3.com',
    'https://test-thumbnail3.com',
    '02:42',
    false,
  ),
  new Video(
    1,
    1,
    'test4.webm',
    'https://test-video4.com',
    'https://test-thumbnail4.com',
    '02:42',
    false,
  ),
];

export const videoListFixture = [
  new Video(
    1,
    1,
    '루이뷔통통튀기네',
    'https://test.com',
    'https://thumbnail-test.com',
    '03:29',
    true,
  ),
  new Video(
    1,
    4,
    '루이뷔통통튀기네',
    'https://foo.com',
    'https://bar-test.com',
    '02:12',
    false,
  ),
];

export const videoFixture = new Video(
  1,
  1,
  '루이뷔통통튀기네',
  'https://test.com',
  'https://thumbnail-test.com',
  '03:29',
  true,
);

export const privateVideoFixture = new Video(
  1,
  1,
  '루이뷔통통튀기네',
  'https://priavte-test.com',
  'https://thumbnail-test.com',
  '03:29',
  false,
);

export const videoOfOtherFixture = new Video(
  999,
  1,
  '루이뷔통통튀기네',
  'https://test.com',
  'https://thumbnail-test.com',
  '03:29',
  false,
);

export const videoOfWithdrawnMemberFixture = new Video(
  null,
  1,
  '루이뷔통통튀기네',
  'https://test.com',
  'https://thumbnail-test.com',
  '03:29',
  true,
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
};

export const updateVideoIndexRequestFixture = UpdateVideoIndexRequest.of([
  2, 1, 4, 3,
]);
