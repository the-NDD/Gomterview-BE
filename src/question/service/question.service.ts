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
import { QuestionEventHandler } from './question.event.handler';

@Injectable()
export class QuestionService {
  constructor(
    private questionRepository: QuestionRepository,
    private eventHandler: QuestionEventHandler,
  ) {}

  @Transactional()
  async createQuestion(
    createQuestionRequest: CreateQuestionRequest,
    member: Member,
  ) {
    await this.eventHandler.validateWorkbookOwnership(
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
    await this.eventHandler.validateWorkbookOwnership(
      copyQuestionRequest.workbookId,
      member,
    );

    const questions = await this.questionRepository.findAllByIds(
      copyQuestionRequest.questionIds,
    );

    Array.from(
      new Set(questions.map((question) => question.workbookId)),
    ).forEach(async (workbookId) => {
      await this.eventHandler.increaseWorkbookCopyCount(workbookId);
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
    await this.eventHandler.validateWorkbookOwnership(
      question.workbookId,
      member,
    );
    this.eventHandler.publishQuestionDeleted(questionId);
    await this.questionRepository.remove(question);
  }

  @Transactional()
  async updateIndex(
    updateIndexRequest: UpdateIndexInWorkbookRequest,
    member: Member,
  ) {
    validateManipulatedToken(member);
    await this.eventHandler.validateWorkbookOwnership(
      updateIndexRequest.workbookId,
      member,
    );

    const questions = (
      await this.questionRepository.findAllByIds(updateIndexRequest.ids)
    ).filter((each) => each.workbookId === updateIndexRequest.workbookId);

    this.validateQuestionsByIds(questions, updateIndexRequest.ids);
    await this.questionRepository.updateIndex(updateIndexRequest.ids);
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
}
