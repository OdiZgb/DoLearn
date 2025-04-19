using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;

public class CreateCourseDto
{
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string CourseCode { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime EndDate   { get; set; }

    public decimal Price { get; set; }

    // Binder will pick up repeated entries of these keys
    public List<DateTime> SessionStartTimes { get; set; } = new();
    public List<DateTime> SessionEndTimes   { get; set; } = new();

    public IFormFile? Image { get; set; }
    public string? ImgURL { get; set; }
}
