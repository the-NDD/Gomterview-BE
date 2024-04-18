import { ArgumentsHost, Catch, ExceptionFilter, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseException, MYSQL_OPTION } from './config/typeorm.config';
import { MemberModule } from './member/member.module';
import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';
import { QuestionModule } from './question/question.module';
import { VideoModule } from './video/video.module';
import { CategoryModule } from './category/category.module';
import { AnswerModule } from './answer/answer.module';
import { WorkbookModule } from './workbook/workbook.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Response } from 'express';
import { APP_FILTER } from '@nestjs/core';

@Catch(DatabaseException)
export class DatabaseConnectionFilter implements ExceptionFilter {
  catch(exception: DatabaseException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.status(503).json(exception);
  }
}

@Catch(AggregateError)
export class AggregateErrorFilter implements ExceptionFilter {
  catch(exception: DatabaseException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.status(503).json(exception);
  }
}

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRootAsync(MYSQL_OPTION),
    MemberModule,
    AuthModule,
    TokenModule,
    QuestionModule,
    VideoModule,
    CategoryModule,
    AnswerModule,
    WorkbookModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: DatabaseConnectionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: AggregateErrorFilter,
    },
  ],
})
export class AppModule {}
