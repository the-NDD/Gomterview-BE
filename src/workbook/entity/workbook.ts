import { DefaultEntity } from '../../app.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Member } from '../../member/entity/member';
import { Category } from '../../category/entity/category';
import { UpdateWorkbookRequest } from '../dto/updateWorkbookRequest';
import { CreateWorkbookRequest } from '../dto/createWorkbookRequest';

@Entity({ name: 'Workbook' })
@Index('idx_isPublic', ['isPublic'])
@Index('idx_isPublic_categoryId', ['isPublic', 'categoryId'])
export class Workbook extends DefaultEntity {
  @Column()
  title: string;

  @Column({ type: 'blob', nullable: true })
  content: string;

  @Column({ name: 'category' })
  categoryId: number;

  @Column()
  copyCount: number;

  @ManyToOne(() => Member, { nullable: true, onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'member' })
  member: Member;

  @Column({ default: true })
  isPublic: boolean;

  constructor(
    id: number,
    createdAt: Date,
    title: string,
    content: string,
    categoryId: number,
    copyCount: number,
    member: Member,
    isPublic: boolean,
  ) {
    super(id, createdAt);
    this.title = title;
    this.content = content;
    this.categoryId = categoryId;
    this.copyCount = copyCount;
    this.member = member;
    this.isPublic = isPublic;
  }

  static of(
    title: string,
    content: string,
    category: Category,
    member: Member,
    isPublic: boolean,
  ): Workbook {
    return new Workbook(
      null,
      new Date(),
      title,
      content,
      category.id,
      0,
      member,
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
      member,
      createWorkbookRequest.isPublic,
    );
  }

  isOwnedBy(member: Member) {
    return this.member.id === member.id;
  }

  increaseCopyCount() {
    this.copyCount++;
  }

  updateInfo(updateWorkbookRequest: UpdateWorkbookRequest, category: Category) {
    this.title = updateWorkbookRequest.title;
    this.content = updateWorkbookRequest.content;
    this.categoryId = category.id;
    this.isPublic = updateWorkbookRequest.isPublic;
  }
}
