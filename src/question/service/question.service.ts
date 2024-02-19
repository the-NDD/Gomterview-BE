import { Injectable } from '@nestjs/common';
import { QuestionRepository } from '../repository/question.repository';
import { CreateQuestionRequest } from '../dto/createQuestionRequest';
import { isEmpty } from 'class-validator';
import { Question } from '../entity/question';
import { QuestionResponse } from '../dto/questionResponse';
import { Member } from '../../member/entity/member';
import { validateManipulatedToken } from '../../util/token.util';
import { validateQuestion } from '../util/question.util';
import { CopyQuestionRequest } from '../dto/copyQuestionRequest';
import { WorkbookIdResponse } from '../../workbook/dto/workbookIdResponse';
import { NeedToFindByWorkbookIdException } from '../../workbook/exception/workbook.exception';
import { Transactional } from 'typeorm-transactional';
import { UpdateIndexInWorkbookRequest } from '../dto/updateIndexInWorkbookRequest';
import { QuestionNotFoundException } from '../exception/question.exception';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ValidateWorkbookEvent } from 'src/workbook/event/validate.workbook.event';
import { IncreaseCopyCountEvent } from 'src/workbook/event/increase.copyCount.event';
import { ValidateQuestionExistenceEvent } from '../event/validate.question.existence.event';
import { ValidateQuestionOriginEvent } from '../event/validate.question.origin.event';

@Injectable()
export class QuestionService {
  constructor(
    private questionRepository: QuestionRepository,
    private emitter: EventEmitter2,
  ) {}

  @Transactional()
  async createQuestion(
    createQuestionRequest: CreateQuestionRequest,
    member: Member,
  ) {
    await this.validateWorkbookOwnership(
      createQuestionRequest.workbookId,
      member,
    );

    const question = await this.questionRepository.insert(
      Question.of(
        createQuestionRequest.workbookId,
        null,
        createQuestionRequest.content,
      ),
    );

    return QuestionResponse.from(question);
  }

  @Transactional()
  async copyQuestions(
    copyQuestionRequest: CopyQuestionRequest,
    member: Member,
  ) {
    await this.validateWorkbookOwnership(
      copyQuestionRequest.workbookId,
      member,
    );

    const questions = await this.questionRepository.findAllByIds(
      copyQuestionRequest.questionIds,
    );

    Array.from(
      new Set(questions.map((question) => question.workbookId)),
    ).forEach(async (workbookId) => {
      await this.increaseWorkbookCopyCount(workbookId);
    });

    await this.questionRepository.saveAll(
      questions.map((question) =>
        this.createCopy(question, copyQuestionRequest.workbookId),
      ),
    );
    return new WorkbookIdResponse(copyQuestionRequest.workbookId);
  }

  @Transactional()
  async findAllByWorkbookId(workbookId: number) {
    if (isEmpty(workbookId)) {
      throw new NeedToFindByWorkbookIdException();
    }

    const questions =
      await this.questionRepository.findByWorkbookId(workbookId);
    return questions.map(QuestionResponse.from);
  }

  @Transactional()
  async deleteQuestionById(questionId: number, member: Member) {
    validateManipulatedToken(member);
    const question = await this.questionRepository.findById(questionId);
    validateQuestion(question);
    await this.validateWorkbookOwnership(question.workbookId, member);
    await this.questionRepository.remove(question);
  }

  @Transactional()
  async updateIndex(
    updateIndexRequest: UpdateIndexInWorkbookRequest,
    member: Member,
  ) {
    validateManipulatedToken(member);
    await this.validateWorkbookOwnership(updateIndexRequest.workbookId, member);

    const questions = (
      await this.questionRepository.findAllByIds(updateIndexRequest.ids)
    ).filter((each) => each.workbookId === updateIndexRequest.workbookId);

    this.validateQuestionsByIds(questions, updateIndexRequest.ids);
    await this.questionRepository.updateIndex(updateIndexRequest.ids);
  }

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

  private validateQuestionsByIds(questions: Question[], ids: number[]) {
    if (questions.length != ids.length) throw new QuestionNotFoundException();
  }

  private createCopy(question: Question, workbookId: number) {
    if (question.origin) {
      return Question.copyOf(question.origin, workbookId);
    }

    return Question.copyOf(question, workbookId);
  }

  private async validateWorkbookOwnership(workbookId: number, member: Member) {
    await this.emitter.emitAsync(
      ValidateWorkbookEvent.MESSAGE,
      ValidateWorkbookEvent.of(member, workbookId),
    );
  }

  private async increaseWorkbookCopyCount(workbookId: number) {
    const event = IncreaseCopyCountEvent.of(workbookId);
    await this.emitter.emitAsync(IncreaseCopyCountEvent.MESSAGE, event);
  }
}
