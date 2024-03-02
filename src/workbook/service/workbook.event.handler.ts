import { Injectable } from '@nestjs/common';
import { WorkbookRepository } from '../repository/workbook.repository';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ValidateWorkbookEvent } from '../event/validate.workbook.event';
import {
  WorkbookForbiddenException,
  WorkbookNotFoundException,
} from '../exception/workbook.exception';
import { ValidateWorkbookOwnershipForQuestionEvent } from '../event/validate.workbook.ownership.event';
import { isEmpty } from 'class-validator';
import { QuestionForbiddenException } from 'src/question/exception/question.exception';
import { IncreaseCopyCountEvent } from '../event/increase.copyCount.event';
import { DeleteMemberInfoEvent } from 'src/member/event/delete.member.info.event';

@Injectable()
export class WorkbookEventHandler {
  constructor(
    private workbookRepository: WorkbookRepository,
    private emitter: EventEmitter2,
  ) {}

  async validateCategoryExistence(categoryId: number) {
    await this.emitter.emitAsync('category.validate', categoryId);
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
    if (!workbook.isOwnedBy(member.id)) throw new WorkbookForbiddenException();
  }

  @OnEvent(ValidateWorkbookOwnershipForQuestionEvent.MESSAGE, {
    suppressErrors: false,
  })
  async validateWorkbookOwnershipForQuestion(
    event: ValidateWorkbookOwnershipForQuestionEvent,
  ) {
    const member = event.member;
    const workbook = await this.workbookRepository.findById(event.workbookId);
    if (isEmpty(workbook)) throw new WorkbookNotFoundException();
    if (!workbook.isOwnedBy(member.id)) throw new QuestionForbiddenException();
  }

  @OnEvent(IncreaseCopyCountEvent.MESSAGE, { suppressErrors: false })
  async increaseCopyCount(event: IncreaseCopyCountEvent) {
    const workbook = await this.workbookRepository.findById(event.workbookId);

    if (isEmpty(workbook)) throw new WorkbookNotFoundException();
    workbook.increaseCopyCount();
    await this.workbookRepository.update(workbook);
  }

  @OnEvent(DeleteMemberInfoEvent.MESSAGE)
  async deleteMemberInfo(event: DeleteMemberInfoEvent) {
    const workbooks = await this.workbookRepository.findAllbyMemberId(
      event.memberId,
    );
    await this.workbookRepository.removeAll(workbooks);
  }
}
