export class CheckQuestionToBeOriginEvent {
  static readonly MESSAGE = 'question.check.or.throw.origin';

  readonly questionId: number;

  constructor(questionId: number) {
    this.questionId = questionId;
  }

  static of(questionId: number) {
    return new CheckQuestionToBeOriginEvent(questionId);
  }
}
