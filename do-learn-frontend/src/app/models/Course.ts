export interface Course {
    id: number;
    title: string;
    description: string;
    courseCode: string;
    startDate: string;
    endDate: string;
    imgIRL: string;
    createdAt: string;       // Changed from createdById
    lastUpdated: string;     // Changed from lastUpdated
    imgURL: string | null;   // Corrected from imgIRL
  }
  