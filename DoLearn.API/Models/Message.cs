using DoLearn.API.Models;
using Microsoft.EntityFrameworkCore;

public class Message
{
    public int Id { get; set; }
    public int SenderId { get; set; }
    public int ReceiverId { get; set; }
    public string Content { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; } = false;
    
    [DeleteBehavior(DeleteBehavior.Restrict)]
    public User Sender { get; set; }
    
    [DeleteBehavior(DeleteBehavior.Restrict)]
    public User Receiver { get; set; }
}