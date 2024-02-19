export class UpdateAnswersOriginEvent {
  static readonly MESSAGE = 'answer.update.origin';

  readonly questionId: number;
  readonly answerId: number;

  constructor(questionId: number, answerId: number) {
    this.questionId = questionId;
    this.answerId = answerId;
  }

  static of(questionId: number, answerId: number) {
    return new UpdateAnswersOriginEvent(questionId, answerId);
  }
}
