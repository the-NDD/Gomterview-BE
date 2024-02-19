export class ValidateQuestionOriginEvent {
  static readonly MESSAGE = 'question.validate.origin';

  readonly questionId: number;

  constructor(questionId: number) {
    this.questionId = questionId;
  }

  static of(questionId: number) {
    return new ValidateQuestionOriginEvent(questionId);
  }
}
