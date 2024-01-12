import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsNumber } from 'class-validator';
import { createPropertyOption } from 'src/util/swagger.util';

export class UpdateVideoIndexRequest {
  @ApiProperty(createPropertyOption([1, 2, 3, 4, 5], '영상의 id', [Number]))
  @IsArray()
  @ArrayMinSize(1) // 최소 1개의 원소를 가져야 합니다.
  @IsNumber({}, { each: true })
  ids: number[];

  constructor(ids: number[]) {
    this.ids = ids;
  }

  static of(ids: number[]) {
    return new UpdateVideoIndexRequest(ids);
  }
}
