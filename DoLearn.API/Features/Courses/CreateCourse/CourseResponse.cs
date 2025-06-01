using DoLearn.API.Models;

public record CourseResponse(
    int    Id,
    string Title,
    string CourseCode,
    DateTime CreatedAt,
    DateTime StartDate,
    DateTime EndDate,
    List<CourseSession> SessionStartTimes,
    string? ImgURL,
    string Description,
    User Teacher
    
);
