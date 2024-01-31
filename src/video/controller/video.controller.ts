import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { VideoService } from '../service/video.service';
import { Request, Response } from 'express';
import { Member } from 'src/member/entity/member';
import { CreateVideoRequest } from '../dto/createVideoRequest';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { createApiResponseOption } from 'src/util/swagger.util';
import { PreSignedUrlResponse } from '../dto/preSignedUrlResponse';
import { VideoDetailResponse } from '../dto/videoDetailResponse';
import { VideoHashResponse } from '../dto/videoHashResponse';
import { SingleVideoResponse } from '../dto/singleVideoResponse';
import { TokenHardGuard } from 'src/token/guard/token.hard.guard';
import { UpdateVideoRequest } from '../dto/updateVideoRequest';
import {
  InvalidHashException,
  VideoAccessForbiddenException,
  VideoNotFoundException,
} from '../exception/video.exception';
import { ManipulatedTokenNotFiltered } from 'src/token/exception/token.exception';
import { UpdateVideoIndexRequest } from '../dto/updateVideoIndexRequest';
import { TokenSoftGuard } from 'src/token/guard/token.soft.guard';
import { RelatableVideoResponse } from '../dto/RelatableVideoResponse';
import { MemberVideoResponse } from '../dto/MemberVideoResponse';

@Controller('/api/video')
@ApiTags('video')
export class VideoController {
  constructor(private videoService: VideoService) {}

  // @Post('upload')
  // @UseGuards(TokenHardGuard)
  // @ApiCookieAuth()
  // @ApiBody({ type: UploadVideoRequest })
  // @ApiOperation({
  //   summary: '비디오를 인코딩/클라우드 저장/테이블 저장',
  // })
  // @ApiResponse(
  //   createApiResponseOption(
  //     201,
  //     '비디오 인코딩/클라우드 저장/테이블 저장 완료',
  //     null,
  //   ),
  // )
  // @ApiResponse(createApiResponseOption(500, 'SERVER', null))
  // @UseInterceptors(FileInterceptor('file', UPLOAD_UTIL))
  // async uploadFile(
  //   @UploadedFile() file: Express.Multer.File,
  //   @Req() req: Request,
  //   @Body() uploadVideoRequest: UploadVideoRequest,
  // ) {
  //   await this.videoService.saveVideoOnCloud(
  //     uploadVideoRequest,
  //     req.user as Member,
  //     file,
  //   );
  // }

  @Post()
  @UseGuards(TokenHardGuard)
  @ApiCookieAuth()
  @ApiBody({ type: CreateVideoRequest })
  @ApiOperation({
    summary: '비디오 정보를 DB에 저장',
  })
  @ApiResponse(createApiResponseOption(201, '비디오 정보 저장 완료', null))
  @ApiResponse(ManipulatedTokenNotFiltered.response())
  async createVideo(
    @Req() req: Request,
    @Body() createVideoRequest: CreateVideoRequest,
  ) {
    await this.videoService.createVideo(req.user as Member, createVideoRequest);
  }

  @Post('/pre-signed')
  @UseGuards(TokenHardGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Pre-Signed URL을 발급',
  })
  @ApiResponse(
    createApiResponseOption(
      201,
      'Pre-Signed URL 발급 완료',
      PreSignedUrlResponse,
    ),
  )
  @ApiResponse(createApiResponseOption(500, 'V01, SERVER', null))
  async getPreSignedUrl(@Req() req: Request) {
    return await this.videoService.getPreSignedUrl(req.user as Member);
  }

  @Get('/all')
  @UseGuards(TokenHardGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: '자신의 모든 비디오 정보를 반환',
  })
  @ApiResponse(
    createApiResponseOption(200, '모든 비디오 조회 완료', [
      SingleVideoResponse,
    ]),
  )
  @ApiResponse(ManipulatedTokenNotFiltered.response())
  async getAllVideo(@Req() req: Request) {
    return await this.videoService.getAllVideosByMemberId(req.user as Member);
  }

  @Get('/hash/:hash')
  @ApiOperation({
    summary: '해시값으로 비디오 정보 불러오기',
  })
  @ApiResponse(
    createApiResponseOption(
      200,
      '해시값을 사용하여 비디오 정보 조회 완료',
      VideoDetailResponse,
    ),
  )
  @ApiResponse(InvalidHashException.response())
  @ApiResponse(VideoAccessForbiddenException.response())
  @ApiResponse(createApiResponseOption(404, 'V03, V04, V09, M01', null))
  @ApiResponse(createApiResponseOption(500, 'V06', null))
  async getVideoDetailByHash(@Param('hash') hash: string) {
    return await this.videoService.getVideoDetailByHash(hash);
  }

  @Get('/relate/:videoId')
  @UseGuards(TokenHardGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: '연관영상으로 등록할 수 있는 모든 영상을 조회한다.',
  })
  @ApiResponse(
    createApiResponseOption(
      200,
      '연관영상으로 등록할 수 있는 모든 영상 조회 완료',
      [RelatableVideoResponse],
    ),
  )
  @ApiResponse(VideoAccessForbiddenException.response())
  @ApiResponse(VideoNotFoundException.response())
  @ApiResponse(ManipulatedTokenNotFiltered.response())
  @ApiResponse(createApiResponseOption(500, 'V08, SERVER', null))
  async getRelatableVideos(
    @Param('videoId') videoId: number,
    @Req() req: Request,
  ) {
    return await this.videoService.findRelatableVideos(
      videoId,
      req.user as Member,
    );
  }

  @Get('/related/:videoId')
  @UseGuards(TokenSoftGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: '관계된 비디오 정보 조회',
  })
  @ApiResponse(
    createApiResponseOption(200, '관계된 비디오 조회 완료', [
      SingleVideoResponse,
    ]),
  )
  @ApiResponse(VideoNotFoundException.response())
  async findRelatedVideoById(
    @Param('videoId') videoId: number,
    @Req() req: Request,
  ) {
    return await this.videoService.findAllRelatedVideoById(
      videoId,
      req.user as Member,
    );
  }

  @Get('/public')
  @ApiOperation({
    summary: '공개된 영상 조회',
  })
  @ApiResponse(
    createApiResponseOption(200, 'PUBLIC 영상 조회 완료', [
      MemberVideoResponse,
    ]),
  )
  async findPublicVideos() {
    console.log('여기왔니?');
    return await this.videoService.findPublicVideos();
  }

  @Get(':videoId')
  @UseGuards(TokenSoftGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: '비디오 상세 정보를 반환',
  })
  @ApiResponse(
    createApiResponseOption(
      200,
      '비디오 상세 정보 조회 완료',
      VideoDetailResponse,
    ),
  )
  @ApiResponse(VideoAccessForbiddenException.response())
  @ApiResponse(VideoNotFoundException.response())
  @ApiResponse(createApiResponseOption(500, 'V08, SERVER', null))
  async getVideoDetail(@Param('videoId') videoId: number, @Req() req: Request) {
    return await this.videoService.getVideoDetail(videoId, req.user as Member);
  }

  @Patch('/index')
  @UseGuards(TokenHardGuard)
  @ApiCookieAuth()
  @ApiBody({ type: UpdateVideoIndexRequest })
  @ApiOperation({
    summary: '비디오 순서 변경',
  })
  @ApiResponse(createApiResponseOption(200, '비디오 순서 변경 완료', null))
  @ApiResponse(VideoAccessForbiddenException.response())
  @ApiResponse(VideoNotFoundException.response())
  @ApiResponse(ManipulatedTokenNotFiltered.response())
  async updateIndex(
    @Req() req: Request,
    @Body() updateVideoIndexRequest: UpdateVideoIndexRequest,
  ) {
    await this.videoService.updateIndex(
      updateVideoIndexRequest,
      req.user as Member,
    );
  }

  // @Patch(':videoId')
  // @UseGuards(TokenHardGuard)
  // @ApiCookieAuth()
  // @ApiOperation({
  //   summary: '비디오 공개/비공개 상태를 전환',
  // })
  // @ApiResponse(
  //   createApiResponseOption(200, '비디오 상태 전환 완료', VideoHashResponse),
  // )
  // @ApiResponse(VideoAccessForbiddenException.response())
  // @ApiResponse(VideoNotFoundException.response())
  // @ApiResponse(createApiResponseOption(500, 'V05, V06, V07, SERVER', null))
  // async toggleVideoStatus(
  //   @Param('videoId') videoId: number,
  //   @Req() req: Request,
  // ) {
  //   return await this.videoService.toggleVideoStatus(
  //     videoId,
  //     req.user as Member,
  //   );
  // }

  @Patch('/:videoId')
  @UseGuards(TokenHardGuard)
  @ApiCookieAuth()
  @ApiBody({ type: UpdateVideoRequest })
  @ApiOperation({
    summary: '비디오 정보 수정(이름/공개여부/관계 영상 수정)',
  })
  @ApiResponse(createApiResponseOption(200, '비디오 수정 완료', null))
  @ApiResponse(VideoAccessForbiddenException.response())
  @ApiResponse(VideoNotFoundException.response())
  @ApiResponse(ManipulatedTokenNotFiltered.response())
  async updateVideoInfo(
    @Param('videoId') videoId: number,
    @Req() req: Request,
    @Body() updateVideoRequest: UpdateVideoRequest,
  ) {
    await this.videoService.updateVideo(
      updateVideoRequest,
      req.user as Member,
      videoId,
    );
  }

  @Delete(':videoId')
  @UseGuards(TokenHardGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: '비디오 삭제',
  })
  @ApiResponse(createApiResponseOption(204, '비디오 삭제 완료', null))
  @ApiResponse(VideoAccessForbiddenException.response())
  @ApiResponse(VideoNotFoundException.response())
  @ApiResponse(createApiResponseOption(500, 'V12, SERVER', null))
  async deleteVideo(
    @Param('videoId') videoId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.videoService.deleteVideo(videoId, req.user as Member);
    res.status(204).send();
  }
}
