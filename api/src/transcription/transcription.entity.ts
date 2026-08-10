import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../projects/project.entity';

@Entity()
export class Transcription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalFilename: string;

  @Column({ type: 'text', select: false })
  transcript: string;

  @Column({ type: 'varchar', nullable: true })
  technology: string;

  @Column({ type: 'jsonb', nullable: true })
  review: any;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Project, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
