export interface SessionDto {
  id: number;
  start: string;
  finish: string; // Changed from 'end' to 'finish' to match backend
  reserved: number;
  capacity: number;
  isCanceled: boolean;
}