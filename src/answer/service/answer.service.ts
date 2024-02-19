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
    2. 질문의 origin이 있는지 검증한다.
      2-1. 있을 경우(예외 x)
          1. 예외에서 questionId를 가져온다. 
          2. questionId를 통해 질문들을 가져온다. 
      2-2. 없을 경우(예외 핸들링)
          1. id로 답변을 조회한다. 
    3. answer와 question.defaultAnswer을 join해서 question.id가 일치하는 컬럼을 가져온다. 
    4. 해당 answer를 제일 앞으로 가지는 배열을 반환한다.
    */
    await this.validateQuestionExistence(id);

    const answers = (await this.answerRepository.findAllByQuestionId(id)).map(
      (answer) => AnswerResponse.from(answer, answer.member),
    );

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
    await this.emitter.emitAsync(FindQuestionOriginEvent.MESSAGE, event);
  }

  private async validateQuestionExistence(questionId: number) {
    const event = ValidateQuestionExistenceEvent.of(questionId);
    await this.emitter.emitAsync(ValidateQuestionExistenceEvent.MESSAGE, event);
  }

  private async validateQuestionOrigin(questionId: number) {
    const event = ValidateQuestionOriginEvent.of(questionId);
    await this.emitter.emitAsync(ValidateQuestionOriginEvent.MESSAGE, event);
  }

  private async updateQuestion(questionId: number, answer: Answer) {
    const event = UpdateDefaultAnswerEvent.of(questionId, answer);
    await this.emitter.emitAsync(UpdateDefaultAnswerEvent.MESSAGE, event);
  }

  private async validateOwnershipByQuestionsWorkbook(
    questionId: number,
    member: Member,
  ) {
    const event = FindQuestionToValidateWorkbookOwnership.of(
      questionId,
      member,
    );
    await this.emitter.emitAsync(
      FindQuestionToValidateWorkbookOwnership.MESSAGE,
      event,
    );
  }
}
