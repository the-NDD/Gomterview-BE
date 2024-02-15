import { Member } from 'src/member/entity/member';

export class ValidateWorkbookEvent {
  readonly member: Member;
  readonly workbookId: number;

  static readonly MESSAGE = 'workbook.validate.owner';

  constructor(member: Member, workbookId: number) {
    this.member = member;
    this.workbookId = workbookId;
  }

  static of(member: Member, workbookId: number) {
    return new ValidateWorkbookEvent(member, workbookId);
  }
}
