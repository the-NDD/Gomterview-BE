export class ClearDefaultAnswerEvent {
  static readonly MESSAGE = 'question.clear.default.answer';

  readonly answerId: number;

  constructor(answerId: number) {
    this.answerId = answerId;
  }

  static of(answerId: number) {
    return new ClearDefaultAnswerEvent(answerId);
  }
}
