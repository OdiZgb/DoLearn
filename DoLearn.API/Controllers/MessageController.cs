using Microsoft.AspNetCore.Mvc;
using DoLearn.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using DoLearn.API.Data;
using Microsoft.AspNetCore.Authorization;

namespace DoLearn.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MessagesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageDto messageDto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            // Validate the receiver exists
            var receiver = await _context.Users.FindAsync(messageDto.ReceiverId);
            if (receiver == null)
            {
                return NotFound("Receiver not found");
            }

            var message = new Message
            {
                SenderId = userId,
                ReceiverId = messageDto.ReceiverId,
                Content = messageDto.Content,
                CreatedDate = DateTime.UtcNow,
                IsRead = false
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            // Return the created message with sender/receiver details
            var response = await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Where(m => m.Id == message.Id)
                .Select(m => new
                {
                    m.Id,
                    m.SenderId,
                    SenderName = m.Sender.Username,
                    m.ReceiverId,
                    ReceiverName = m.Receiver.Username,
                    m.Content,
                    m.CreatedDate,
                    m.IsRead
                })
                .FirstOrDefaultAsync();

            return Ok(response);
        }

        [HttpGet("conversation/{otherUserId}")]
        public async Task<IActionResult> GetConversation(int otherUserId)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized("User ID not found in token.");
            var userId = int.Parse(userIdStr);
            var messages = await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Where(m => (m.SenderId == userId && m.ReceiverId == otherUserId) ||
                           (m.SenderId == otherUserId && m.ReceiverId == userId))
                .OrderBy(m => m.CreatedDate)
                .Select(m => new
                {
                    m.Id,
                    m.SenderId,
                    SenderName = m.Sender.Username,
                    m.ReceiverId,
                    ReceiverName = m.Receiver.Username,
                    m.Content,
                    m.CreatedDate,
                    m.IsRead
                })
                .ToListAsync();

            return Ok(messages);
        }

        [HttpGet("contacts")]
        public async Task<IActionResult> GetChatContacts()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var contacts = await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                .Select(m => m.SenderId == userId ? m.Receiver : m.Sender)
                .Distinct()
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    LastMessage = _context.Messages
                        .Where(m => (m.SenderId == userId && m.ReceiverId == u.Id) ||
                                    (m.SenderId == u.Id && m.ReceiverId == userId))
                        .OrderByDescending(m => m.CreatedDate)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(contacts);
        }

        [HttpPost("mark-as-read/{messageId}")]
        public async Task<IActionResult> MarkAsRead(int messageId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var message = await _context.Messages
                .FirstOrDefaultAsync(m => m.Id == messageId && m.ReceiverId == userId);

            if (message == null)
            {
                return NotFound();
            }

            message.IsRead = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

public class SendMessageDto
{
    public int ReceiverId { get; set; }
    public string Content { get; set; }
}
}