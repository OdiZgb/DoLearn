public record CourseCreateResponse(
    int    Id,
    string Title,
    string CourseCode,
    DateTimeOffset CreatedAt,
    DateTimeOffset StartDate,
    DateTimeOffset EndDate,
    List<DateTimeOffset> SessionStartTimes,
    List<DateTimeOffset> SessionEndTimes,
    string? ImgURL                   // ← include here too
);
