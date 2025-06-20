using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using DoLearn.API.Models;
using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using DoLearn.API.Data;
using System.Security.Claims;
using DoLearn.API.Controllers;
using Microsoft.AspNetCore.Authorization;

namespace ChatApp.Hubs
{[Authorize] 
    public class MessageHub : Hub
    {
        private readonly AppDbContext _context;
        private static readonly Dictionary<int, string> _userConnections = new();

        public MessageHub(AppDbContext context)
        {
            _context = context;
        }

        public override async Task OnConnectedAsync()
        {
            var userIdStr = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr))
            {
                Console.WriteLine("User ID not found in claims.");
                await base.OnConnectedAsync();
                return;
            }

            var userId = int.Parse(userIdStr);
            _userConnections[userId] = Context.ConnectionId;

            Console.WriteLine($"Connected: userId = {userId}, ConnectionId = {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userIdStr = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userIdStr))
            {
                var userId = int.Parse(userIdStr);
                _userConnections.Remove(userId);
            }
            
            await base.OnDisconnectedAsync(exception);
        }

  public async Task SendMessage(SendMessageDto messageDto)
        {
            try
            {
                var userIdStr = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdStr))
                    throw new Exception("User ID not found in claims.");

                var userId = int.Parse(userIdStr);

                // Validate receiver exists
                var receiver = await _context.Users.FindAsync(messageDto.ReceiverId);
                if (receiver == null)
                {
                    throw new Exception("Receiver not found");
                }

                // Create and save message
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

                // Prepare response
                var response = new MessageResponse
                {
                    Id = message.Id,
                    SenderId = message.SenderId,
                    ReceiverId = message.ReceiverId,
                    Content = message.Content,
                    CreatedDate = message.CreatedDate,
                    IsRead = message.IsRead
                };

                // Send to receiver if connected
                if (_userConnections.TryGetValue(messageDto.ReceiverId, out var receiverConnectionId))
                {
                    await Clients.Client(receiverConnectionId).SendAsync("ReceiveMessage", response);
                }

                // Send confirmation to sender
                await Clients.Caller.SendAsync("MessageSent", response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SendMessage error: {ex.Message}\n{ex.StackTrace}");
                await Clients.Caller.SendAsync("ReceiveError", ex.Message);
                throw;
            }
        }


        public async Task MarkAsRead(int messageId)
        {
var userIdStr = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
if (string.IsNullOrEmpty(userIdStr))
    throw new Exception("User ID not found in claims.");
var userId = int.Parse(userIdStr);            
            var message = await _context.Messages
                .FirstOrDefaultAsync(m => m.Id == messageId && m.ReceiverId == userId);
            
            if (message != null && !message.IsRead)
            {
                message.IsRead = true;
                await _context.SaveChangesAsync();
                
                // Notify sender that their message was read
                if (_userConnections.TryGetValue(message.SenderId, out var senderConnectionId))
                {
                    await Clients.Client(senderConnectionId).SendAsync("MessageRead", messageId);
                }
            }
        }

        public async Task<IEnumerable<MessageResponse>> GetConversationHistory(int otherUserId)
        {
            var userId = int.Parse(Context.UserIdentifier);
            
            var messages = await _context.Messages
                .Where(m => (m.SenderId == userId && m.ReceiverId == otherUserId) || 
                           (m.SenderId == otherUserId && m.ReceiverId == userId))
                .OrderBy(m => m.CreatedDate)
                .Select(m => new MessageResponse
                {
                    Id = m.Id,
                    SenderId = m.SenderId,
                    ReceiverId = m.ReceiverId,
                    Content = m.Content,
                    CreatedDate = m.CreatedDate,
                    IsRead = m.IsRead
                })
                .ToListAsync();

            return messages;
        }

        public async Task<IEnumerable<User>> GetChatContacts()
        {
            var userId = int.Parse(Context.UserIdentifier);
            
            // Get all users that the current user has exchanged messages with
            var contacts = await _context.Messages
                .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                .Select(m => m.SenderId == userId ? m.Receiver : m.Sender)
                .Distinct()
                .ToListAsync();

            return contacts;
        }
    }

    public class MessageDto
    {
        public int ReceiverId { get; set; }
        public string Content { get; set; }
    }

    public class MessageResponse
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string Content { get; set; }
        public DateTimeOffset  CreatedDate { get; set; }
        public bool IsRead { get; set; }
    }
}