using System.ComponentModel.DataAnnotations;

namespace DoLearn.API.Features.Courses.CreateCourse
{
    public sealed class CreateCourseDto
    {
        [Required, MinLength(3)]
        public string Title { get; set; }

        public string? Description { get; set; }

        [Required, StringLength(20)]
        public string CourseCode { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }
    }
}
