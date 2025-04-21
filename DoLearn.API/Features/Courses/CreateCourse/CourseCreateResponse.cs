public record CourseCreateResponse(
    int    Id,
    string Title,
    string CourseCode,
    DateTime CreatedAt,
    DateTime StartDate,
    DateTime EndDate,
    List<DateTime> SessionStartTimes,
    List<DateTime> SessionEndTimes,
    string? ImgURL                   // ← include here too
);
