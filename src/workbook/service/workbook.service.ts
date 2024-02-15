import { Injectable } from '@nestjs/common';
import { WorkbookRepository } from '../repository/workbook.repository';
import { CreateWorkbookRequest } from '../dto/createWorkbookRequest';
import { CategoryRepository } from '../../category/repository/category.repository';
import { validateCategory } from '../../category/util/category.util';
import { Workbook } from '../entity/workbook';
import { Member } from '../../member/entity/member';
import { validateManipulatedToken } from '../../util/token.util';
import { WorkbookResponse } from '../dto/workbookResponse';
import { isEmpty } from 'class-validator';
import { validateWorkbook, validateWorkbookOwner } from '../util/workbook.util';
import { WorkbookTitleResponse } from '../dto/workbookTitleResponse';
import { UpdateWorkbookRequest } from '../dto/updateWorkbookRequest';
import { Transactional } from 'typeorm-transactional';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ValidateWorkbookEvent } from '../event/validate.workbook.event';
import {
  WorkbookForbiddenException,
  WorkbookNotFoundException,
} from '../exception/workbook.exception';

@Injectable()
export class WorkbookService {
  constructor(
    private readonly workbookRepository: WorkbookRepository,
    readonly emitter: EventEmitter2,
  ) {}

  @Transactional()
  async createWorkbook(
    createWorkbookRequest: CreateWorkbookRequest,
    member: Member,
  ) {
    validateManipulatedToken(member);
    await this.validateCategoryExistence(createWorkbookRequest.categoryId);

    const workbook = Workbook.from(createWorkbookRequest, member);
    const result = await this.workbookRepository.insert(workbook);
    return result.identifiers[0].id as number;
  }

  @Transactional()
  async findWorkbooks(categoryId: number) {
    if (isEmpty(categoryId)) {
      return await this.findAllWorkbook();
    }

    return this.findAllByCategory(categoryId);
  }

  private async findAllWorkbook() {
    const workbooks = await this.workbookRepository.findAll();
    return workbooks.map(WorkbookResponse.of);
  }

  private async findAllByCategory(categoryId: number) {
    await this.validateCategoryExistence(categoryId);

    const workbooks =
      await this.workbookRepository.findAllByCategoryId(categoryId);

    return workbooks.map(WorkbookResponse.of);
  }

  @Transactional()
  async findWorkbookTitles(member: Member) {
    const workbooks = await this.findWorkbookByMember(member);
    return workbooks.map(WorkbookTitleResponse.of);
  }

  private async findWorkbookByMember(member: Member) {
    if (isEmpty(member)) {
      return await this.workbookRepository.findTop5Workbooks();
    }

    return await this.workbookRepository.findMembersWorkbooks(member.id);
  }

  @Transactional()
  async findSingleWorkbook(workbookId: number) {
    const workbook = await this.workbookRepository.findById(workbookId);
    validateWorkbook(workbook);

    return WorkbookResponse.of(workbook);
  }

  @Transactional()
  async updateWorkbook(
    updateWorkbookRequest: UpdateWorkbookRequest,
    member: Member,
  ) {
    await this.validateCategoryExistence(updateWorkbookRequest.categoryId);

    const workbook = await this.workbookRepository.findById(
      updateWorkbookRequest.workbookId,
    );
    validateManipulatedToken(member);
    validateWorkbook(workbook);
    validateWorkbookOwner(workbook, member);

    workbook.updateInfo(updateWorkbookRequest);
    await this.workbookRepository.update(workbook);
    return WorkbookResponse.of(workbook);
  }

  @Transactional()
  async deleteWorkbookById(workbookId: number, member: Member) {
    validateManipulatedToken(member);
    const workbook =
      await this.workbookRepository.findByIdWithoutJoin(workbookId);
    validateWorkbook(workbook);
    validateWorkbookOwner(workbook, member);
    await this.workbookRepository.remove(workbook);
  }

  @OnEvent(ValidateWorkbookEvent.MESSAGE, {
    suppressErrors: false,
  })
  async validateWorkbookOwner(validateWorkbookEvent: ValidateWorkbookEvent) {
    const member = validateWorkbookEvent.member;
    const workbook = await this.workbookRepository.findById(
      validateWorkbookEvent.workbookId,
    );
    if (isEmpty(workbook)) throw new WorkbookNotFoundException();
    if (!workbook.isOwnedBy(member)) throw new WorkbookForbiddenException();
  }

  async validateCategoryExistence(categoryId: number) {
    await this.emitter.emitAsync('category.validate', categoryId);
  }
}
