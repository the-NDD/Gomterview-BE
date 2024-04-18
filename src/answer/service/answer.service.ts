import { Injectable } from '@nestjs/common';
import { AnswerRepository } from '../repository/answer.repository';
import { CreateAnswerRequest } from '../dto/createAnswerRequest';
import { Member } from '../../member/entity/member';
import { Answer } from '../entity/answer';
import { AnswerResponse } from '../dto/answerResponse';
import { DefaultAnswerRequest } from '../dto/defaultAnswerRequest';
import { validateAnswer } from '../util/answer.util';
import { AnswerForbiddenException } from '../exception/answer.exception';
import { Transactional } from 'typeorm-transactional';
import { AnswerEventHandler } from './answer.event.handler';

@Injectable()
export class AnswerService {
  constructor(
    private answerRepository: AnswerRepository,
    private answerEventHandler: AnswerEventHandler,
  ) {}

  @Transactional()
  async addAnswer(createAnswerRequest: CreateAnswerRequest, member: Member) {
    await this.answerEventHandler.validateQuestionOrigin(
      createAnswerRequest.questionId,
    );
    const answer = await this.saveAnswerAndQuestion(
      createAnswerRequest,
      createAnswerRequest.questionId,
      member,
    );
    await this.answerEventHandler.updateAnswersQuestionId(
      createAnswerRequest.questionId,
      answer.id,
    );
    return AnswerResponse.from(answer);
  }

  @Transactional()
  async setDefaultAnswer(
    defaultAnswerRequest: DefaultAnswerRequest,
    member: Member,
  ) {
    await this.answerEventHandler.validateQuestionExistence(
      defaultAnswerRequest.questionId,
    );
    await this.answerEventHandler.validateOwnershipByQuestionsWorkbook(
      defaultAnswerRequest.questionId,
      member,
    );
    const answer = await this.answerRepository.findById(
      defaultAnswerRequest.answerId,
    );
    validateAnswer(answer);
    await this.answerEventHandler.updateQuestion(
      defaultAnswerRequest.questionId,
      answer,
    );
  }

  @Transactional()
  async deleteAnswer(id: number, member: Member) {
    const answer = await this.answerRepository.findById(id);

    validateAnswer(answer);

    if (answer.isOwnedBy(member)) {
      await this.answerRepository.remove(answer);
      await this.answerEventHandler.clearDefaultAnswer(answer.id);
      return;
    }

    throw new AnswerForbiddenException();
  }

  @Transactional()
  async getAnswerList(questionId: number) {
    await this.answerEventHandler.validateQuestionExistence(questionId);
    let originId: number;
    try {
      await this.answerEventHandler.checkQuestionToBeOrigin(questionId);
      originId = questionId;
    } catch (e) {
      originId = e.originId;
    }

    const answers = (
      await this.answerRepository.findAllByQuestionId(originId)
    ).map((answer) => AnswerResponse.from(answer));
    try {
      await this.answerEventHandler.validateDefaultAnswersExistence(questionId);
    } catch (e) {
      const defaultAnswer = answers
        .filter((answer) => answer.answerId === e.answerId)
        .pop();
      const result = answers.filter((answer) => answer.answerId !== e.answerId);
      result.unshift(defaultAnswer);
      return result;
    }
    return answers;
  }

  private async saveAnswerAndQuestion(
    createAnswerRequest: CreateAnswerRequest,
    questionId: number,
    member: Member,
  ) {
    const answer = Answer.of(createAnswerRequest.content, member, questionId);
    return await this.answerRepository.save(answer);
  }
}
