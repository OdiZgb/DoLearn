public class SessionUpdateDto
{
    public int? Id { get; set; }
    public DateTimeOffset Start { get; set; }
    public DateTimeOffset End { get; set; }
    public bool IsCanceled { get; set; }
}
