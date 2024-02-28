import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DefaultEntity } from './app.entity';

@Entity()
export class OwnedEntity extends DefaultEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @CreateDateColumn()
  readonly createdAt: Date;

  @Column({ name: 'member' })
  memberId: number;

  @Column({ name: 'memberNickname' })
  memberNickname: string;

  @Column({ name: 'memberProfileImg' })
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
