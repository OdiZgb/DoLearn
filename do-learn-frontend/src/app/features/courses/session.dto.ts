export interface SessionDto {
  id: number;
  courseScheduleId: number;
  courseSchedule: any; // Adjust type if needed
  start: string;  // Keep as string for raw response
  finish: string; // Keep as string for raw response
  reservations: {
    id: number;
    studentId: number;
    courseId: number;
    status: string;
    enrolledAt: string;
    endedAt: string | null;
    notes: string | null;
  }[];
  capacity: number;
  isCanceled: boolean;
}
export interface SessionReservation {
  id: number;
  studentId: number;
  courseId: number;
  status: string;
  enrolledAt: string;
  endedAt: string | null;
  notes: string | null;
}