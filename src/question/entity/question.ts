import { DefaultEntity } from '../../app.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Answer } from '../../answer/entity/answer';
import { Workbook } from '../../workbook/entity/workbook';

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

  @ManyToOne(() => Answer, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  @JoinColumn({ name: 'defaultAnswer' })
  defaultAnswer: Answer;

  @Column({ default: 0 })
  indexInWorkbook: number;

  constructor(
    id: number,
    content: string,
    workbookId: number,
    origin: Question,
    createdAt: Date,
    defaultAnswer: Answer,
  ) {
    super(id, createdAt);
    this.content = content;
    this.workbookId = workbookId;
    this.origin = origin;
    this.defaultAnswer = defaultAnswer;
    this.indexInWorkbook = 0;
  }

  static of(workbookId: number, origin: Question, content: string) {
    return new Question(null, content, workbookId, origin, new Date(), null);
  }

  static copyOf(question: Question, workbookId: number) {
    return new Question(
      null,
      question.content,
      workbookId,
      question,
      new Date(),
      question.defaultAnswer,
    );
  }

  setDefaultAnswer(answer: Answer) {
    this.defaultAnswer = answer;
  }
}
