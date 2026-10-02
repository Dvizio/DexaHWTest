import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import type { Employee } from '../employees/employee.entity.js';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  LATE = 'LATE',
}

@Entity('attendances')
@Unique(['employee_id', 'attendance_date'])
@Index(['employee_id'])
@Index(['attendance_date'])
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'employee_id' })
  employee_id: number;

  @Column({ type: 'date', name: 'attendance_date' })
  attendance_date: string;

  @Column({ type: 'timestamp', name: 'check_in_at' })
  check_in_at: Date;

  @Column({ name: 'check_in_photo' })
  check_in_photo: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  check_in_latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  check_in_longitude: number;

  @Column({
    type: 'timestamp',
    name: 'check_out_at',
    nullable: true,
    default: null,
  })
  check_out_at: Date | null;


  @Column({
    type: 'varchar',
    length: 255,
    name: 'check_out_photo',
    nullable: true,
    default: null,
  })
  check_out_photo: string | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    name: 'check_out_latitude',
    nullable: true,
    default: null,
  })
  check_out_latitude: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    name: 'check_out_longitude',
    nullable: true,
    default: null,
  })
  check_out_longitude: number | null;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
  })
  status: AttendanceStatus;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne('Employee', 'attendances', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;
}
