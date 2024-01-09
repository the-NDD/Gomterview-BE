import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber } from 'class-validator';
import { createPropertyOption } from 'src/util/swagger.util';

export class UpdateIndexInWorkbookRequest {
  @ApiProperty(createPropertyOption('1', '문제집 id', Number))
  @IsNotEmpty()
  @IsNumber()
  workbookId: number;

  @ApiProperty(createPropertyOption('1', '문제집 id', Number))
  @IsArray()
  @ArrayMinSize(1) // 최소 1개의 원소를 가져야 합니다.
  @IsNumber({}, { each: true })
  ids: number[];

  constructor(workbookId: number, ids: number[]) {
    this.workbookId = workbookId;
    this.ids = ids;
  }
}
