import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { DefaultEntity } from '../../app.entity';
import { Member } from '../../member/entity/member';

@Entity({ name: 'Answer' })
export class Answer extends DefaultEntity {
  @Column({ type: 'blob' })
  content: string;

  @ManyToOne(() => Member, { onDelete: 'CASCADE', eager: true, nullable: true })
  @JoinColumn()
  member: Member;

  @Column({ name: 'question' })
  questionId: number;

  constructor(
    id: number,
    createdAt: Date,
    content: string,
    member: Member,
    questionId: number,
  ) {
    super(id, createdAt);
    this.content = content;
    this.member = member;
    this.questionId = questionId;
  }

  static of(content: string, member: Member, questionId: number) {
    return new Answer(null, new Date(), content, member, questionId);
  }

  isOwnedBy(member: Member) {
    return this.member.id === member.id;
  }

  updateQuestionId(questionId: number) {
    this.questionId = questionId;
  }
}
