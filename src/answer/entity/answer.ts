import { Column, Entity, Index } from 'typeorm';
import { Member } from '../../member/entity/member';
import { OwnedEntity } from 'src/owned.entity';

@Entity({ name: 'Answer' })
@Index('Answer_memberId', ['memberId'])
@Index('Answer_questionId', ['questionId'])
export class Answer extends OwnedEntity {
  @Column({ type: 'blob' })
  content: string;

  @Column({ name: 'question' })
  questionId: number;

  constructor(
    id: number,
    createdAt: Date,
    content: string,
    memberId: number,
    memberNickname: string,
    memberProfileImg: string,
    questionId: number,
  ) {
    super(id, createdAt, memberId, memberNickname, memberProfileImg);
    this.content = content;
    this.questionId = questionId;
  }

  static of(content: string, member: Member, questionId: number) {
    return new Answer(
      null,
      new Date(),
      content,
      member.id,
      member.nickname,
      member.profileImg,
      questionId,
    );
  }

  isOwnedBy(member: Member) {
    return this.memberId === member.id;
  }

  updateQuestionId(questionId: number) {
    this.questionId = questionId;
  }
}
