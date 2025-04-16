using DoLearn.API.Models;

public class UserCourse
{
    public int Id { get; set; }
    public required int UserId { get; set; }
    public required int CourseId { get; set; }

    public bool IsStudent { get; set; } = false;
    public bool IsParent { get; set; } = false;
    public bool IsTeacher { get; set; } = false;
    public bool IsEnrolled { get; set; } = false;
    public bool IsBlocked { get; set; } = false;
    public bool IsAccepted { get; set; } = true;

    public DateTime? EnrolledDate { get; set; }
    public DateTime? BlockedDate { get; set; }
    public bool IsSoftDeleted { get; set; } = false;

    public User User{get;set;}
    public Course Course{get;set;}
}
