import { Injectable } from '@nestjs/common';
import { AnswerRepository } from '../repository/answer.repository';
import { QuestionRepository } from '../../question/repository/question.repository';
import { CreateAnswerRequest } from '../dto/createAnswerRequest';
import { Member } from '../../member/entity/member';
import { Question } from '../../question/entity/question';
import { Answer } from '../entity/answer';
import { AnswerResponse } from '../dto/answerResponse';
import { DefaultAnswerRequest } from '../dto/defaultAnswerRequest';
import { validateAnswer } from '../util/answer.util';
import { AnswerForbiddenException } from '../exception/answer.exception';
import { Transactional } from 'typeorm-transactional';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ValidateQuestionExistenceEvent } from 'src/question/event/validate.question.existence.event';
import { ValidateQuestionOriginEvent } from 'src/question/event/validate.question.origin.event';
import { UpdateDefaultAnswerEvent } from 'src/question/event/update.default.answer.event';
import { FindQuestionToValidateWorkbookOwnership } from 'src/question/event/find.question.to.validate.workbook.ownership.event';
import { FindQuestionOriginEvent } from '../../question/event/find.question.origin.event';
import { UpdateAnswersOriginEvent } from '../event/update.answer.origin.event';

@Injectable()
export class AnswerService {
  constructor(
    private answerRepository: AnswerRepository,
    private emitter: EventEmitter2,
  ) {}

  @Transactional()
  async addAnswer(createAnswerRequest: CreateAnswerRequest, member: Member) {
    await this.validateQuestionOrigin(createAnswerRequest.questionId);
    const answer = await this.saveAnswerAndQuestion(
      createAnswerRequest,
      createAnswerRequest.questionId,
      member,
    );
    await this.updateAnswersQuestionId(
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
    await this.validateQuestionExistence(defaultAnswerRequest.questionId);
    await this.validateOwnershipByQuestionsWorkbook(
      defaultAnswerRequest.questionId,
      member,
    );
    const answer = await this.answerRepository.findById(
      defaultAnswerRequest.answerId,
    );
    validateAnswer(answer);
    await this.updateQuestion(defaultAnswerRequest.questionId, answer);
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
  async getAnswerList(id: number) {
    // 로직 전면 수정 필요
    // 어떻게 수정할까?
    /* TODO
    1. question도메인에 검증 이벤트를 발생시킨다.
    2. try-catch를 통해 커스텀 예외를 이벤트를 통해 받아와 처리한다?
    */
    // const question =
    //   await this.questionRepository.findQuestionWithOriginById(id);
    await this.validateQuestionExistence(id);
    // const questionId = question.origin ? question.origin.id : question.id;

    const answers = (await this.answerRepository.findAllByQuestionId(id)).map(
      (answer) => AnswerResponse.from(answer, answer.member),
    );

    // if (question.defaultAnswer) {
    //   return this.createAnswerResponsesWithDefaultAnswer(question, answers);
    // }

    return answers;
  }

  private createAnswerResponsesWithDefaultAnswer(
    question: Question,
    answers: AnswerResponse[],
  ) {
    const defaultAnswerResponse = AnswerResponse.from(
      question.defaultAnswer,
      question.defaultAnswer.member,
    );

    const resultList = answers.filter(
      (response) => response.answerId != defaultAnswerResponse.answerId,
    );
    resultList.unshift(defaultAnswerResponse);
    return resultList;
  }

  private async saveAnswerAndQuestion(
    createAnswerRequest: CreateAnswerRequest,
    questionId: number,
    member: Member,
  ) {
    const answer = Answer.of(createAnswerRequest.content, member, questionId);
    return await this.answerRepository.save(answer);
  }

  @OnEvent(UpdateAnswersOriginEvent.MESSAGE, { suppressErrors: false })
  async updateAnswersQuestion(event: UpdateAnswersOriginEvent) {
    const answer = await this.answerRepository.findById(event.answerId);
    answer.updateQuestionId(event.questionId);
    await this.answerRepository.update(answer);
  }

  private async updateAnswersQuestionId(questionId: number, answerId: number) {
    const event = FindQuestionOriginEvent.of(questionId, answerId);
    this.emitter.emitAsync(FindQuestionOriginEvent.MESSAGE, event);
  }

  private async validateQuestionExistence(questionId: number) {
    const event = ValidateQuestionExistenceEvent.of(questionId);
    this.emitter.emitAsync(ValidateQuestionExistenceEvent.MESSAGE, event);
  }

  private async validateQuestionOrigin(questionId: number) {
    const event = ValidateQuestionOriginEvent.of(questionId);
    this.emitter.emitAsync(ValidateQuestionOriginEvent.MESSAGE, event);
  }

  private async updateQuestion(questionId: number, answer: Answer) {
    const event = UpdateDefaultAnswerEvent.of(questionId, answer);
    this.emitter.emitAsync(UpdateDefaultAnswerEvent.MESSAGE, event);
  }

  private async validateOwnershipByQuestionsWorkbook(
    questionId: number,
    member: Member,
  ) {
    const event = FindQuestionToValidateWorkbookOwnership.of(
      questionId,
      member,
    );
    this.emitter.emitAsync(
      FindQuestionToValidateWorkbookOwnership.MESSAGE,
      event,
    );
  }
}
