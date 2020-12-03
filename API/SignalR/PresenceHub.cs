using System;
using System.Threading.Tasks;
using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
    [Authorize]
    public class PresenceHub : Hub
    {
        private readonly PresenceTracker presenceTracker;
        public PresenceHub(PresenceTracker presenceTracker)
        {
            this.presenceTracker = presenceTracker;
        }

        public override async Task OnConnectedAsync()
        {
            // when client connects, updates the tracker
            var isOnline = await presenceTracker.UserConnected(Context.User.GetUsername(), Context.ConnectionId);
            if (isOnline)
            {
                await Clients.Others.SendAsync("UserIsOnline", Context.User.GetUsername());
            }

            var currentUsers = await presenceTracker.GetOnlineUsers();
            // await Clients.All.SendAsync("GetOnlineUsers", currentUsers);
            await Clients.Caller.SendAsync("GetOnlineUsers", currentUsers);
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var isOffline = await presenceTracker.UserDisconnected(Context.User.GetUsername(), Context.ConnectionId);
            if (isOffline) await Clients.Others.SendAsync("UserIsOffline", Context.User.GetUsername());
 
            // var currentUsers = await presenceTracker.GetOnlineUsers();
            // await Clients.All.SendAsync("GetOnlineUsers", currentUsers);

            // if there is an exception pass it to the parent class
            await base.OnDisconnectedAsync(exception);
        }
    }
}