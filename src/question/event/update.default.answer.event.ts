import { Answer } from 'src/answer/entity/answer';

export class UpdateDefaultAnswerEvent {
  static readonly MESSAGE = 'question.update.defaultAnswer';

  readonly questionId: number;
  readonly defaultAnswer: Answer;

  constructor(questionId: number, answer: Answer) {
    this.questionId = questionId;
    this.defaultAnswer = answer;
  }

  static of(questionId: number, answer: Answer) {
    return new UpdateDefaultAnswerEvent(questionId, answer);
  }
}
