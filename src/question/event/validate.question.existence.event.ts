export class ValidateQuestionExistenceEvent {
  static readonly MESSAGE = 'question.validate.existence';

  readonly questionId: number;

  constructor(questionId: number) {
    this.questionId = questionId;
  }

  static of(questionId: number) {
    return new ValidateQuestionExistenceEvent(questionId);
  }
}
