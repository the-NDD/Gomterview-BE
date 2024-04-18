import { Member } from 'src/member/entity/member';

export class ValidateWorkbookOwnershipForQuestionEvent {
  static readonly MESSAGE = 'workbook.validate.ownership.to.question';

  readonly workbookId: number;
  readonly member: Member;

  constructor(workbookId: number, member: Member) {
    this.workbookId = workbookId;
    this.member = member;
  }

  static of(workbookId: number, member: Member) {
    return new ValidateWorkbookOwnershipForQuestionEvent(workbookId, member);
  }
}
