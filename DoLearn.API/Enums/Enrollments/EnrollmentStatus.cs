public enum EnrollmentStatus
{
    Pending,
    Active,
    Completed,
    Withdrawn,
    Rejected
}

// Add to Enums/EnrollmentResult.cs
public enum EnrollmentResult
{
    Success,
    SessionFull,
    Conflict,
    NotFound,
    Error
}