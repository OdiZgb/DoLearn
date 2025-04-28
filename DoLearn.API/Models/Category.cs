public class Category
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public int? ParentId { get; set; } // Add parent category reference
    public Category Parent { get; set; }
    public List<Category> Children { get; set; } = new();
}