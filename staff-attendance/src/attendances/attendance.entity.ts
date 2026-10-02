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
import { Employee } from '../employees/employee.entity.js';

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

  @Column({ type: 'timestamp', name: 'check_out_at' })
  check_out_at: Date;

  @Column({ name: 'check_out_photo' })
  check_out_photo: string;

  @Column({ name: 'check_in_photo' })
  check_in_photo: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  check_in_latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  check_in_longitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  check_out_latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  check_out_longitude: number;

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

  @ManyToOne(() => Employee, (employee) => employee.attendances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;
}
