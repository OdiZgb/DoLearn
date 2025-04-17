// src/app/core/models/course.model.ts
export interface Course {
    id?: number;
    title: string;
    description: string;
    courseCode: string;
    createdAt?: string;
    startDate: string;
    endDate: string;
    sessionStartTimes: string[];
    sessionEndTimes: string[];
  }
  