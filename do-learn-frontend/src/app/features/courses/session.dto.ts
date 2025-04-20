export interface SessionDto {
    id: number;
    start: Date;
    finish: Date;
    capacity: number;
    reserved: number;
    isCanceled: boolean;
  }