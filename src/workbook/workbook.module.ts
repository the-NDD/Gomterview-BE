import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workbook } from './entity/workbook';
import { WorkbookRepository } from './repository/workbook.repository';
import { WorkbookService } from './service/workbook.service';
import { WorkbookController } from './controller/workbook.controller';
import { TokenSoftGuard } from '../token/guard/token.soft.guard';
import { TokenModule } from '../token/token.module';
import { WorkbookEventHandler } from './service/workbook.event.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Workbook]), TokenModule],
  providers: [
    WorkbookRepository,
    WorkbookService,
    TokenSoftGuard,
    WorkbookEventHandler,
  ],
  controllers: [WorkbookController],
})
export class WorkbookModule {}
