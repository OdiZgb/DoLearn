using DoLearn.API.Models;

public record CourseResponse(
    int    Id,
    string Title,
    string CourseCode,
    DateTimeOffset  CreatedAt,
    DateTimeOffset  StartDate,
    DateTimeOffset  EndDate,
    List<CourseSession> SessionStartTimes,
    string? ImgURL,
    string Description,
    User Teacher
    
);
