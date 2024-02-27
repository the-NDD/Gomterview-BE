export class ValidateDefaultAnswersExistenceEvent {
  static readonly MESSAGE = 'question.validate.default.answer.existence';

  readonly questionId: number;

  constructor(questionId: number) {
    this.questionId = questionId;
  }

  static of(questionId: number) {
    return new ValidateDefaultAnswersExistenceEvent(questionId);
  }
}
