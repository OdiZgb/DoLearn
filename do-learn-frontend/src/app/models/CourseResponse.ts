export interface CourseResponse {
    id: number;
    title: string;
    courseCode: string;
    createdAt: string;
    startDate: string;
    endDate: string;
    sessionStartTimes: string[];
    sessionEndTimes: string[];
    imgURL?: string;
  }