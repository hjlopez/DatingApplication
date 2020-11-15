using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class DataContext : DbContext
    {
        // generate constructor
        // db context represents a session of the database
        public DataContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<AppUser> Users { get; set; }
    }
}