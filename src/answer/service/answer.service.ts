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
    return AnswerResponse.from(answer, member);
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
      return;
    }

    throw new AnswerForbiddenException();
  }

  @Transactional()
  async getAnswerList(questionId: number) {
    /* 
    1. question도메인에 검증 이벤트를 발생시킨다.
    2. 질문의 origin이 있는지 검증한다.
      2-1. 있을 경우(예외 x)
          1. 예외에서 questionId를 가져온다. 
          2. questionId를 통해 질문들을 가져온다. 
      2-2. 없을 경우(예외 핸들링)
          1. id로 답변을 조회한다. 
    3. answer와 question.defaultAnswer을 join해서 question.id가 일치하는 컬럼을 가져온다. 
    4. 해당 answer를 제일 앞으로 가지는 배열을 반환한다.
    */
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
    ).map((answer) => AnswerResponse.from(answer, answer.member));
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
