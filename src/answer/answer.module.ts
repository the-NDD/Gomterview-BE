import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../member/entity/member';
import { Answer } from './entity/answer';
import { AnswerRepository } from './repository/answer.repository';
import { Question } from '../question/entity/question';
import { AnswerService } from './service/answer.service';
import { AnswerController } from './controller/answer.controller';
import { Category } from '../category/entity/category';
import { Workbook } from '../workbook/entity/workbook';
import { TokenModule } from 'src/token/token.module';
import { AnswerEventHandler } from './service/answer.event.handler';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member, Answer, Question, Category, Workbook]),
    TokenModule,
  ],
  providers: [AnswerRepository, AnswerService, AnswerEventHandler],
  controllers: [AnswerController],
})
export class AnswerModule {}
