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
      memberId: memberId,
      questionId: questionId,
    });
  }

  async findAllByQuestionId(questionId: number) {
    return this.repository
      .createQueryBuilder('answer')
      .where('answer.question = :questionId', { questionId })
      .orderBy('answer.createdAt', 'DESC')
      .getMany();
  }

  async findAllByMemberId(memberId: number) {
    return this.repository
      .createQueryBuilder('answer')
      .where('answer.member = :memberId', { memberId })
      .orderBy('answer.createdAt', 'DESC')
      .getMany();
  }

  async update(answer: Answer) {
    await this.repository.update(answer.id, answer);
  }

  async remove(answer: Answer) {
    await this.repository.remove(answer);
  }

  async removeAll(answer: Answer[]) {
    await this.repository.remove(answer);
  }
}
