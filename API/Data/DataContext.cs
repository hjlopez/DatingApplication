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
        public DbSet<UserLike> Likes { get; set; }
        public DbSet<Message> Messages { get; set; }

        // manually configuring many to many relationship in a table
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            
            // this will form the primary key for Likes table
            builder.Entity<UserLike>().HasKey(k => new {k.SourceUserId, k.LikedUserId}); 

            // a source user can like many users
            builder.Entity<UserLike>().HasOne(s => s.SourceUser).WithMany(l => l.LikedUsers).HasForeignKey(s => s.SourceUserId)
                            .OnDelete(DeleteBehavior.Cascade);

            // a user can be liked by many users
            builder.Entity<UserLike>().HasOne(s => s.LikedUser).WithMany(l => l.LikedByUsers).HasForeignKey(s => s.LikedUserId)
                            .OnDelete(DeleteBehavior.Cascade);

            // recipient has many messages recieved
            builder.Entity<Message>().HasOne(u => u.Recipient).WithMany(m => m.MessagesRecieved).OnDelete(DeleteBehavior.Restrict);

            // sender has many messages sent
            builder.Entity<Message>().HasOne(u => u.Sender).WithMany(m => m.MessagesSent).OnDelete(DeleteBehavior.Restrict);
        }
    }
}