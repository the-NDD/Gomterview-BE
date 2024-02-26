import { Injectable } from '@nestjs/common';
import { QuestionRepository } from '../repository/question.repository';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ValidateQuestionExistenceEvent } from '../event/validate.question.existence.event';
import { validateQuestion } from '../util/question.util';
import { ValidateQuestionOriginEvent } from '../event/validate.question.origin.event';
import { UpdateDefaultAnswerEvent } from '../event/update.default.answer.event';
import { FindQuestionToValidateWorkbookOwnership } from '../event/find.question.to.validate.workbook.ownership.event';
import { ValidateWorkbookEvent } from 'src/workbook/event/validate.workbook.event';
import { FindQuestionOriginEvent } from '../event/find.question.origin.event';
import { UpdateAnswersOriginEvent } from 'src/answer/event/update.answer.origin.event';
import { CheckQuestionToBeOriginEvent } from '../event/check.question.tobe.origin.event';
import {
  QuestionDefaultAnswerExists,
  QuestionOriginFound,
} from '../exception/question.exception';
import { ValidateDefaultAnswersExistenceEvent } from '../event/validate.default.answers.existence.event';
import { Member } from 'src/member/entity/member';
import { IncreaseCopyCountEvent } from 'src/workbook/event/increase.copyCount.event';

@Injectable()
export class QuestionEventHandler {
  constructor(
    private questionRepository: QuestionRepository,
    private emitter: EventEmitter2,
  ) {}

  @OnEvent(ValidateQuestionExistenceEvent.MESSAGE, { suppressErrors: false })
  async validateQuestionExistence(event: ValidateQuestionExistenceEvent) {
    const question = await this.questionRepository.findById(event.questionId);
    validateQuestion(question);
  }

  @OnEvent(ValidateQuestionOriginEvent.MESSAGE, { suppressErrors: false })
  async validateQuestionOrigin(event: ValidateQuestionOriginEvent) {
    const question = await this.questionRepository.findOriginById(
      event.questionId,
    );
    validateQuestion(question);
  }

  @OnEvent(UpdateDefaultAnswerEvent.MESSAGE, { suppressErrors: false })
  async updateDefaultAnswer(event: UpdateDefaultAnswerEvent) {
    const question = await this.questionRepository.findById(event.questionId);
    validateQuestion(question);
    question.setDefaultAnswer(event.defaultAnswer);
    await this.questionRepository.update(question);
  }

  @OnEvent(FindQuestionToValidateWorkbookOwnership.MESSAGE, {
    suppressErrors: false,
  })
  async validateWorkbookOwnershipByWorkbookId(
    event: FindQuestionToValidateWorkbookOwnership,
  ) {
    const question = await this.questionRepository.findById(event.questionId);
    const workbookEvent = ValidateWorkbookEvent.of(
      event.member,
      question.workbookId,
    );
    await this.emitter.emitAsync(ValidateWorkbookEvent.MESSAGE, workbookEvent);
  }

  @OnEvent(FindQuestionOriginEvent.MESSAGE, { suppressErrors: false })
  async findQuestionsOriginToUpdateAnswer(event: FindQuestionOriginEvent) {
    const question = await this.questionRepository.findOriginById(
      event.questionId,
    );
    const updateEvent = UpdateAnswersOriginEvent.of(
      question.id,
      event.answerId,
    );
    await this.emitter.emitAsync(UpdateAnswersOriginEvent.MESSAGE, updateEvent);
  }

  @OnEvent(CheckQuestionToBeOriginEvent.MESSAGE, { suppressErrors: false })
  async checkQuestionToBeOrigin(event: CheckQuestionToBeOriginEvent) {
    const question = await this.questionRepository.findOriginById(
      event.questionId,
    );
    if (question.id !== event.questionId) {
      throw new QuestionOriginFound(question.id);
    }
  }

  @OnEvent(ValidateDefaultAnswersExistenceEvent.MESSAGE, {
    suppressErrors: false,
  })
  async validateDefaultAnswersExistence(
    event: ValidateDefaultAnswersExistenceEvent,
  ) {
    const question = await this.questionRepository.findQuestionWithOriginById(
      event.questionId,
    );
    if (question.defaultAnswerId) {
      throw new QuestionDefaultAnswerExists(question.defaultAnswerId);
    }
  }

  async validateWorkbookOwnership(workbookId: number, member: Member) {
    await this.emitter.emitAsync(
      ValidateWorkbookEvent.MESSAGE,
      ValidateWorkbookEvent.of(member, workbookId),
    );
  }

  async increaseWorkbookCopyCount(workbookId: number) {
    const event = IncreaseCopyCountEvent.of(workbookId);
    await this.emitter.emitAsync(IncreaseCopyCountEvent.MESSAGE, event);
  }
}
