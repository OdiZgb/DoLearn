public class CoursePricing
{
    public int Id { get; set; }

    public decimal Price { get; set; }
    public string Currency { get; set; } = "USD";
    public decimal? Discount { get; set; }

    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;
}
