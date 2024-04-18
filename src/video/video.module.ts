import { Module } from '@nestjs/common';
import { VideoController } from './controller/video.controller';
import { VideoService } from './service/video.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './entity/video';
import { VideoRepository } from './repository/video.repository';
import { TokenModule } from 'src/token/token.module';
import { VideoRelationRepository } from './repository/videoRelation.repository';
import { VideoRelation } from './entity/videoRelation';
import { VideoEventHandler } from './service/video.event.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Video, VideoRelation]), TokenModule],
  controllers: [VideoController],
  providers: [
    VideoService,
    VideoRepository,
    VideoRelationRepository,
    VideoEventHandler,
  ],
})
export class VideoModule {}
