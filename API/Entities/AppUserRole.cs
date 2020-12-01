using Microsoft.AspNetCore.Identity;

namespace API.Entities
{
    public class AppUserRole : IdentityUserRole<int>
    {
        // AppUserRole is acting as a join table
        public AppUser User { get; set; }
        public AppRole Role { get; set; }
    }
}