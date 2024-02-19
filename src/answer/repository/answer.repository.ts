import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from '../entity/answer';
import { Repository } from 'typeorm';

@Injectable()
export class AnswerRepository {
  constructor(
    @InjectRepository(Answer) private repository: Repository<Answer>,
  ) {}

  async save(answer: Answer) {
    await this.repository.insert(answer);
    return answer;
  }

  async findById(id: number) {
    return await this.repository.findOneBy({ id: id });
  }

  async findByContentMemberIdAndQuestionId(
    content: string,
    memberId: number,
    questionId: number,
  ) {
    return await this.repository.findOneBy({
      content: content,
      member: { id: memberId },
      questionId: questionId,
    });
  }

  async findAllByQuestionId(questionId: number) {
    return this.repository
      .createQueryBuilder('answer')
      .leftJoinAndSelect('answer.member', 'member')
      .where('answer.question = :questionId', { questionId })
      .orderBy('answer.createdAt', 'DESC')
      .getMany();
  }

  async findAllByQuestionOriginId(questionId: number) {
    return this.repository
      .createQueryBuilder('answer')
      .leftJoinAndSelect('answer.member', 'member')
      .leftJoinAndSelect('answer.question', 'question')
      .where('answer.question = question.origin.id')
      .where('answer.question = :questionId', { questionId })
      .orderBy('answer.createdAt', 'DESC')
      .getMany();
  }

  async update(answer: Answer) {
    await this.repository.update(answer.id, answer);
  }

  async remove(answer: Answer) {
    await this.repository.remove(answer);
  }
}
