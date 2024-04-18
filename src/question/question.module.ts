import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entity/question';
import { TokenModule } from 'src/token/token.module';
import { QuestionService } from './service/question.service';
import { QuestionController } from './controller/question.controller';
import { QuestionRepository } from './repository/question.repository';
import { Member } from '../member/entity/member';
import { Answer } from '../answer/entity/answer';
import { QuestionEventHandler } from './service/question.event.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Member, Answer]), TokenModule],
  providers: [QuestionService, QuestionRepository, QuestionEventHandler],
  controllers: [QuestionController],
})
export class QuestionModule {}
