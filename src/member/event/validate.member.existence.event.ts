export class ValidateMemberExistenceEvent {
  static MESSAGE = 'member.validate.existence';

  readonly memberId;

  constructor(memberId: number) {
    this.memberId = memberId;
  }

  static of(memberId: number) {
    return new ValidateMemberExistenceEvent(memberId);
  }
}
