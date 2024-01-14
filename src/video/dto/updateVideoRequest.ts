import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { createPropertyOption } from 'src/util/swagger.util';

export class UpdateVideoRequest {
  @ApiProperty(createPropertyOption('example.mp4', '비디오 파일 이름', String))
  @IsString()
  @IsNotEmpty()
  videoName: string;
}
