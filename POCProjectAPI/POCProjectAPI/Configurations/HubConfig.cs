using Microsoft.AspNetCore.SignalR;

namespace POCProjectAPI.Configurations
{
    public class HubConfig : Hub
    {
        public void NewMessage(string userName, string message)
        {
            Clients.All.SendAsync("newMessage", userName, message);
        }
    }
}