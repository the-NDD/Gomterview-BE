import { Member } from 'src/member/entity/member';

export class ValidateWorkbookOwnershipEvent {
  static readonly MESSAGE = 'question.update.defaultAnswer';

  readonly workbookId: number;
  readonly member: Member;

  constructor(workbookId: number, member: Member) {
    this.workbookId = workbookId;
    this.member = member;
  }

  static of(workbookId: number, member: Member) {
    return new ValidateWorkbookOwnershipEvent(workbookId, member);
  }
}
