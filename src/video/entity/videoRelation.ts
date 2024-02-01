import { BaseEntity, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Video } from './video';

@Entity({ name: 'VideoRelation' })
export class VideoRelation extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @ManyToOne(() => Video, { onDelete: 'CASCADE' })
  readonly parent: Video;

  @ManyToOne(() => Video, { onDelete: 'CASCADE' })
  readonly child: Video;

  constructor(id: number, parent: Video, child: Video) {
    super();
    this.id = id;
    this.parent = parent;
    this.child = child;
  }

  static of(parent: Video, child: Video): VideoRelation {
    return new VideoRelation(null, parent, child);
  }
}
