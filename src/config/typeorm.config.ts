import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import 'dotenv/config';
import {
  addTransactionalDataSource,
  getDataSourceByName,
} from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { Member } from '../member/entity/member';
import { Category } from '../category/entity/category';
import { Workbook } from '../workbook/entity/workbook';
import { Question } from '../question/entity/question';
import { Answer } from '../answer/entity/answer';
import { Video } from '../video/entity/video';
import { VideoRelation } from 'src/video/entity/videoRelation';
import { HttpException } from '@nestjs/common';

export const MYSQL_OPTION: TypeOrmModuleAsyncOptions = {
  useFactory() {
    return {
      type: 'mysql',
      name: 'main',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      entities: [
        Member,
        Category,
        Workbook,
        Question,
        Answer,
        Video,
        VideoRelation,
      ],
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE,
      autoLoadEntities: true,
      synchronize: true,
    };
  },
  async dataSourceFactory(options) {
    if (!options) {
      throw new Error('Invalid options passed');
    }

    return (
      getDataSourceByName('default') ||
      addTransactionalDataSource(new DataSource(options))
    );
  },
};

export class DatabaseException extends HttpException {
  constructor() {
    super('DB 연결안됨', 503);
  }
}
