export class DeleteMemberInfoEvent {
  static MESSAGE = 'member.delete';

  readonly memberId;

  constructor(memberId: number) {
    this.memberId = memberId;
  }

  static of(memberId: number) {
    return new DeleteMemberInfoEvent(memberId);
  }
}
