import { SessionDto } from "./session.dto";

export interface CalendarDay {
    date: Date;
    sessions: SessionDto[];
    isCurrentMonth: boolean;
    isToday: boolean;
  }