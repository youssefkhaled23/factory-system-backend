import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { RolesEnum } from '../../../common/enums/enums';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  role_name: string;

  @Column({ type: 'enum', enum: RolesEnum, unique: true })
  role_key: RolesEnum;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
