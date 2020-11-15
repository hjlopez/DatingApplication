using System.Collections.Generic;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using AutoMapper.QueryableExtensions;
using AutoMapper;

namespace API.Data
{
    public class UserRepository : IUserRepository
    {
        private readonly DataContext context;
        private readonly IMapper mapper;
        public UserRepository(DataContext context, IMapper mapper)
        {
            this.mapper = mapper;
            this.context = context;
        }

        public async Task<MemberDto> GetMemberAsync(string username)
        {
            return await context.Users
                .Where(x => x.UserName == username)
                .ProjectTo<MemberDto>(mapper.ConfigurationProvider) // to get configuration provided in AutoMapperProfile.cs
                .SingleOrDefaultAsync(); // this queries to the database
        }

        public async Task<IEnumerable<MemberDto>> GetMembersAsync()
        {
            return await context.Users
                .ProjectTo<MemberDto>(mapper.ConfigurationProvider) // to get configuration provided in AutoMapperProfile.cs
                .ToListAsync(); // this queries to the database
        }

        public async Task<AppUser> GetUserByIdAsync(int id)
        {
            return await context.Users.FindAsync(id);
        }

        public async Task<AppUser> GetUserByUsernameAsync(string username)
        {
            return await context.Users.Include(p => p.Photos).SingleOrDefaultAsync(x => x.UserName == username);
        }

        public async Task<IEnumerable<AppUser>> GetUsersAsync()
        {
            // to include relational objects e.g. photos of user
            return await context.Users.Include(p => p.Photos).ToListAsync();
        }

        public async Task<bool> SaveAllAsync()
        {
            return await context.SaveChangesAsync() > 0; // returns more than 0 if there are saved changes
        }

        public void Update(AppUser user)
        {
            context.Entry(user).State = EntityState.Modified; // add flag to entity that its been modified
        }
    }
}