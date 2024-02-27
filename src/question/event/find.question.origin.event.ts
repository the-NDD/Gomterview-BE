export class FindQuestionOriginEvent {
  static readonly MESSAGE = 'question.find.origin';

  readonly questionId: number;
  readonly answerId: number;

  constructor(questionId: number, answerId: number) {
    this.questionId = questionId;
    this.answerId = answerId;
  }

  static of(questionId: number, answerId: number) {
    return new FindQuestionOriginEvent(questionId, answerId);
  }
}
