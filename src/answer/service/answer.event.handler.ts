import { Injectable } from '@nestjs/common';
import { AnswerRepository } from '../repository/answer.repository';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { UpdateAnswersOriginEvent } from '../event/update.answer.origin.event';
import { FindQuestionOriginEvent } from 'src/question/event/find.question.origin.event';
import { ValidateQuestionExistenceEvent } from 'src/question/event/validate.question.existence.event';
import { ValidateQuestionOriginEvent } from 'src/question/event/validate.question.origin.event';
import { UpdateDefaultAnswerEvent } from 'src/question/event/update.default.answer.event';
import { Answer } from '../entity/answer';
import { Member } from 'src/member/entity/member';
import { FindQuestionToValidateWorkbookOwnership } from 'src/question/event/find.question.to.validate.workbook.ownership.event';
import { CheckQuestionToBeOriginEvent } from 'src/question/event/check.question.tobe.origin.event';
import { ValidateDefaultAnswersExistenceEvent } from 'src/question/event/validate.default.answers.existence.event';
import { ClearDefaultAnswerEvent } from '../event/clear.default.answer.event';
import { DeleteMemberInfoEvent } from 'src/member/event/delete.member.info.event';

@Injectable()
export class AnswerEventHandler {
  constructor(
    private answerRepository: AnswerRepository,
    private emitter: EventEmitter2,
  ) {}

  @OnEvent(UpdateAnswersOriginEvent.MESSAGE, { suppressErrors: false })
  async updateAnswersQuestion(event: UpdateAnswersOriginEvent) {
    const answer = await this.answerRepository.findById(event.answerId);
    answer.updateQuestionId(event.questionId);
    await this.answerRepository.update(answer);
  }

  @OnEvent(DeleteMemberInfoEvent.MESSAGE)
  async deleteMemberInfo(event: DeleteMemberInfoEvent) {
    const answers = await this.answerRepository.findAllByMemberId(
      event.memberId,
    );
    await this.answerRepository.removeAll(answers);
  }

  async updateAnswersQuestionId(questionId: number, answerId: number) {
    const event = FindQuestionOriginEvent.of(questionId, answerId);
    await this.emitter.emitAsync(FindQuestionOriginEvent.MESSAGE, event);
  }

  async validateQuestionExistence(questionId: number) {
    const event = ValidateQuestionExistenceEvent.of(questionId);
    await this.emitter.emitAsync(ValidateQuestionExistenceEvent.MESSAGE, event);
  }

  async validateQuestionOrigin(questionId: number) {
    const event = ValidateQuestionOriginEvent.of(questionId);
    await this.emitter.emitAsync(ValidateQuestionOriginEvent.MESSAGE, event);
  }

  async updateQuestion(questionId: number, answer: Answer) {
    const event = UpdateDefaultAnswerEvent.of(questionId, answer);
    await this.emitter.emitAsync(UpdateDefaultAnswerEvent.MESSAGE, event);
  }

  async validateOwnershipByQuestionsWorkbook(
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

  async checkQuestionToBeOrigin(questionId: number) {
    const event = CheckQuestionToBeOriginEvent.of(questionId);
    await this.emitter.emitAsync(CheckQuestionToBeOriginEvent.MESSAGE, event);
  }

  async validateDefaultAnswersExistence(questionId: number) {
    const event = ValidateDefaultAnswersExistenceEvent.of(questionId);
    await this.emitter.emitAsync(
      ValidateDefaultAnswersExistenceEvent.MESSAGE,
      event,
    );
  }

  async clearDefaultAnswer(answerId: number) {
    const event = ClearDefaultAnswerEvent.of(answerId);
    await this.emitter.emitAsync(ClearDefaultAnswerEvent.MESSAGE, event);
  }
}
