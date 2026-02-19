import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { UserStatusEnum } from 'src/common/enums/enums';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', nullable: true })
  refresh_token: string | null;

  @Column({
    type: 'tinyint',
    default: UserStatusEnum.ACTIVE,
  })
  status: UserStatusEnum;

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date | null;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
