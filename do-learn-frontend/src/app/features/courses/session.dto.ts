export interface SessionDto {
  id: number;
  start: any;
  finish: any; // Changed from 'end' to 'finish' to match backend
  reserved: number;
  capacity: number;
  isCanceled: boolean;
  reservedByUserID:number[];
}