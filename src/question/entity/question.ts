import { DefaultEntity } from '../../app.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Answer } from '../../answer/entity/answer';

@Entity({ name: 'Question' })
@Index('idx_indexInWorkbook', ['indexInWorkbook'])
export class Question extends DefaultEntity {
  @Column({ type: 'text' })
  readonly content: string;

  @Column({ name: 'workbook' })
  readonly workbookId: number;

  @ManyToOne(() => Question, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'origin' })
  readonly origin: Question;

  @Column({ name: 'defaultAnswer', nullable: true })
  defaultAnswerId: number;

  @Column({ name: 'answerContent', nullable: true })
  defaultAnswerContent: string;

  @Column({ default: 0 })
  indexInWorkbook: number;

  constructor(
    id: number,
    content: string,
    workbookId: number,
    origin: Question,
    createdAt: Date,
    defaultAnswerId: number,
    defaultAnswerContent: string,
  ) {
    super(id, createdAt);
    this.content = content;
    this.workbookId = workbookId;
    this.origin = origin;
    this.defaultAnswerId = defaultAnswerId;
    this.defaultAnswerContent = defaultAnswerContent;
    this.indexInWorkbook = 0;
  }

  static of(workbookId: number, origin: Question, content: string) {
    return new Question(
      null,
      content,
      workbookId,
      origin,
      new Date(),
      null,
      null,
    );
  }

  static copyOf(question: Question, workbookId: number) {
    return new Question(
      null,
      question.content,
      workbookId,
      question,
      new Date(),
      question.defaultAnswerId,
      question.defaultAnswerContent,
    );
  }

  setDefaultAnswer(answer: Answer) {
    this.defaultAnswerId = answer.id;
    this.defaultAnswerContent = answer.content;
  }

  clearDefaultAnswer() {
    this.defaultAnswerId = null;
    this.defaultAnswerContent = null;
  }
}
