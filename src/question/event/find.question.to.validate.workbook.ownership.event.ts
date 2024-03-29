import { Member } from 'src/member/entity/member';

export class FindQuestionToValidateWorkbookOwnership {
  static readonly MESSAGE = 'question.find.to.validate.workbook.ownership';

  readonly questionId: number;
  readonly member: Member;

  constructor(questionId: number, member: Member) {
    this.questionId = questionId;
    this.member = member;
  }

  static of(questionId: number, member: Member) {
    return new FindQuestionToValidateWorkbookOwnership(questionId, member);
  }
}
