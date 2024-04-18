export class DeleteQuestionEvent {
  static readonly MESSAGE = 'question.delete';

  readonly questionId: number;

  constructor(questionId: number) {
    this.questionId = questionId;
  }

  static of(questionId: number) {
    return new DeleteQuestionEvent(questionId);
  }
}
