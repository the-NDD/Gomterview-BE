import { Repository } from 'typeorm';
import { Question } from '../entity/question';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class QuestionRepository {
  constructor(
    @InjectRepository(Question) private repository: Repository<Question>,
  ) {}

  async query(query: string) {
    return await this.repository.query(query);
  }

  async save(question: Question) {
    return await this.repository.save(question);
  }

  async insert(question: Question) {
    await this.repository.insert(question);
    return question;
  }

  async saveAll(questions: Question[]) {
    await this.repository.insert(questions);
  }

  async findByWorkbookId(workbookId: number) {
    return await this.repository
      .createQueryBuilder('Question')
      .leftJoinAndSelect('Question.origin', 'origin')
      .where('Question.workbook = :workbookId', { workbookId })
      .orderBy('Question.indexInWorkbook', 'ASC')
      .getMany();
  }

  async findAllByIds(ids: number[]) {
    return await this.repository
      .createQueryBuilder('Question')
      .leftJoinAndSelect('Question.origin', 'origin')
      .where('Question.id IN (:...ids)', { ids })
      .getMany();
  }

  async findById(questionId: number) {
    return await this.repository.findOneBy({ id: questionId });
  }

  async findQuestionWithOriginById(id: number) {
    return await this.repository
      .createQueryBuilder('Question')
      .leftJoinAndSelect('Question.origin', 'origin')
      .where('Question.id = :id', { id })
      .getOne();
  }

  async findAllByDefaultAnswerId(answerId: number) {
    return await this.repository.findBy({ defaultAnswerId: answerId });
  }

  async findOriginById(id: number): Promise<Question | null> {
    const question = await this.findQuestionWithOriginById(id);
    return this.fetchOrigin(question);
  }

  async update(question: Question) {
    await this.repository.update({ id: question.id }, question);
  }

  async clearDefaultAnswer(questions: Question[]) {
    await this.repository
      .createQueryBuilder()
      .update(Question)
      .set({
        defaultAnswerId: null,
        defaultAnswerContent: null,
      })
      .whereInIds(questions.map((each) => each.id))
      .execute();
  }

  async remove(question: Question) {
    await this.repository.remove(question);
  }

  async updateIndex(ids: number[]) {
    const caseStatements = ids.map(
      (id) => `WHEN id = ${id} THEN ${ids.indexOf(id)}`,
    );

    const updateQuery = `
      UPDATE Question
      SET indexInWorkbook = CASE ${caseStatements.join(' ')} END
      WHERE id IN (${ids.join(', ')})
    `;

    await this.repository.query(updateQuery);
  }

  private fetchOrigin(question: Question) {
    if (!question) {
      return null;
    }

    const originQuestion = question.origin as Question | null;

    if (!originQuestion) {
      return question;
    }

    return originQuestion;
  }
}
