// Models/Enrollments/EnrollmentStatus.cs
public enum EnrollmentStatus
{
    Active = 0,      // Student is actively enrolled
    Completed = 1,   // Course finished successfully
    Dropped = 2,     // Student withdrew from the course
    Expired = 3,     // Enrollment period ended without completion
    Pending = 4      // Awaiting approval (for approval-required courses)
}