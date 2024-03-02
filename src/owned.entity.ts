import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DefaultEntity } from './app.entity';

@Entity()
export class OwnedEntity extends DefaultEntity {
  @Column({ name: 'member', nullable: true })
  memberId: number;

  @Column({ name: 'memberNickname', nullable: true })
  memberNickname: string;

  @Column({ name: 'memberProfileImg', nullable: true })
  memberProfileImg: string;

  constructor(
    id: number,
    createdAt: Date,
    memberId: number,
    memberNickname: string,
    memberProfileImg: string,
  ) {
    super(id, createdAt);
    this.memberId = memberId;
    this.memberNickname = memberNickname;
    this.memberProfileImg = memberProfileImg;
  }
}
