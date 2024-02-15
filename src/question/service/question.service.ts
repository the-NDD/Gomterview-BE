import { Injectable } from '@nestjs/common';
import { QuestionRepository } from '../repository/question.repository';
import { CreateQuestionRequest } from '../dto/createQuestionRequest';
import { isEmpty } from 'class-validator';
import { Question } from '../entity/question';
import { QuestionResponse } from '../dto/questionResponse';
import { Member } from '../../member/entity/member';
import { validateManipulatedToken } from '../../util/token.util';
import { validateQuestion } from '../util/question.util';
import { WorkbookRepository } from '../../workbook/repository/workbook.repository';
import {
  validateWorkbook,
  validateWorkbookOwner,
} from '../../workbook/util/workbook.util';
import { CopyQuestionRequest } from '../dto/copyQuestionRequest';
import { Workbook } from '../../workbook/entity/workbook';
import { WorkbookIdResponse } from '../../workbook/dto/workbookIdResponse';
import { NeedToFindByWorkbookIdException } from '../../workbook/exception/workbook.exception';
import { Transactional } from 'typeorm-transactional';
import { UpdateIndexInWorkbookRequest } from '../dto/updateIndexInWorkbookRequest';
import { QuestionNotFoundException } from '../exception/question.exception';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ValidateWorkbookEvent } from 'src/workbook/event/validate.workbook.event';

@Injectable()
export class QuestionService {
  constructor(
    private questionRepository: QuestionRepository,
    private workbookRepository: WorkbookRepository,
    private emitter: EventEmitter2,
  ) {}

  @Transactional()
  async createQuestion(
    createQuestionRequest: CreateQuestionRequest,
    member: Member,
  ) {
    const workbook = await this.workbookRepository.findById(
      createQuestionRequest.workbookId,
    );

    validateWorkbook(workbook);
    validateWorkbookOwner(workbook, member);

    const question = await this.questionRepository.insert(
      Question.of(workbook, null, createQuestionRequest.content),
    );

    return QuestionResponse.from(question);
  }

  @Transactional()
  async copyQuestions(
    copyQuestionRequest: CopyQuestionRequest,
    member: Member,
  ) {
    const workbook = await this.workbookRepository.findById(
      copyQuestionRequest.workbookId,
    );
    validateWorkbook(workbook);
    validateWorkbookOwner(workbook, member);

    const questions = await this.questionRepository.findAllByIds(
      copyQuestionRequest.questionIds,
    );

    Array.from(new Set(questions.map((question) => question.workbook))).forEach(
      async (workbook) => {
        workbook.increaseCopyCount();
        await this.workbookRepository.update(workbook);
      },
    );

    await this.questionRepository.saveAll(
      questions.map((question) => this.createCopy(question, workbook)),
    );
    return WorkbookIdResponse.of(workbook);
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
    await this.validateMembersWorkbookById(question.workbook.id, member);
    await this.questionRepository.remove(question);
  }

  @Transactional()
  async updateIndex(
    updateIndexRequest: UpdateIndexInWorkbookRequest,
    member: Member,
  ) {
    validateManipulatedToken(member);
    await this.validateMembersWorkbookById(
      updateIndexRequest.workbookId,
      member,
    );
    const questions = (
      await this.questionRepository.findAllByIds(updateIndexRequest.ids)
    ).filter((each) => each.workbook.id === updateIndexRequest.workbookId);
    this.validateQuestionsByIds(questions, updateIndexRequest.ids);
    await this.questionRepository.updateIndex(updateIndexRequest.ids);
  }

  private async validateMembersWorkbookById(
    workbookId: number,
    member: Member,
  ) {
    const workbook = await this.workbookRepository.findById(workbookId);
    validateWorkbook(workbook);
    validateWorkbookOwner(workbook, member);
  }

  private validateQuestionsByIds(questions: Question[], ids: number[]) {
    if (questions.length != ids.length) throw new QuestionNotFoundException();
  }

  private createCopy(question: Question, workbook: Workbook) {
    if (question.origin) {
      return Question.copyOf(question.origin, workbook);
    }

    return Question.copyOf(question, workbook);
  }

  private async validateWorkbookOwnership(workbookId: number, member: Member) {
    await this.emitter.emitAsync(
      ValidateWorkbookEvent.MESSAGE,
      ValidateWorkbookEvent.of(member, workbookId),
    );
  }
}
