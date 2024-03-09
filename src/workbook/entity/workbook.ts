import { Column, Entity, Index } from 'typeorm';
import { Category } from '../../category/entity/category';
import { UpdateWorkbookRequest } from '../dto/updateWorkbookRequest';
import { CreateWorkbookRequest } from '../dto/createWorkbookRequest';
import { Member } from 'src/member/entity/member';
import { OwnedEntity } from 'src/owned.entity';

@Entity({ name: 'Workbook' })
@Index('idx_isPublic', ['isPublic'])
@Index('idx_isPublic_categoryId', ['isPublic', 'categoryId'])
@Index('Workbook_memberId', ['memberId'])
export class Workbook extends OwnedEntity {
  @Column()
  title: string;

  @Column({ type: 'blob', nullable: true })
  content: string;

  @Column({ name: 'category' })
  categoryId: number;

  @Column()
  copyCount: number;

  @Column({ default: true })
  isPublic: boolean;

  constructor(
    id: number,
    createdAt: Date,
    title: string,
    content: string,
    categoryId: number,
    copyCount: number,
    memberId: number,
    memberNickname: string,
    memberProfileImg: string,
    isPublic: boolean,
  ) {
    super(id, createdAt, memberId, memberNickname, memberProfileImg);
    this.title = title;
    this.content = content;
    this.categoryId = categoryId;
    this.copyCount = copyCount;
    this.isPublic = isPublic;
  }

  static of(
    title: string,
    content: string,
    category: Category,
    memberId: number,
    memberNickname: string,
    memberProfileImg: string,
    isPublic: boolean,
  ): Workbook {
    return new Workbook(
      null,
      new Date(),
      title,
      content,
      category.id,
      0,
      memberId,
      memberNickname,
      memberProfileImg,
      isPublic,
    );
  }

  static from(
    createWorkbookRequest: CreateWorkbookRequest,
    member: Member,
  ): Workbook {
    return new Workbook(
      null,
      new Date(),
      createWorkbookRequest.title,
      createWorkbookRequest.content,
      createWorkbookRequest.categoryId,
      0,
      member.id,
      member.nickname,
      member.profileImg,
      createWorkbookRequest.isPublic,
    );
  }

  isOwnedBy(memberId: number) {
    return this.memberId === memberId;
  }

  increaseCopyCount() {
    this.copyCount++;
  }

  updateInfo(updateWorkbookRequest: UpdateWorkbookRequest) {
    this.title = updateWorkbookRequest.title;
    this.content = updateWorkbookRequest.content;
    this.categoryId = updateWorkbookRequest.categoryId;
    this.isPublic = updateWorkbookRequest.isPublic;
  }
}
