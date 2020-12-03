using System.Text;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace API.Extensions
{
    public static class IdentityServiceExtensions
    {
        // using this to extend the IServiceCollection
        public static IServiceCollection AddIdentityServices(this IServiceCollection services, 
            IConfiguration configuration)
        {
            // for identities
            services.AddIdentityCore<AppUser>(opt => {
                opt.Password.RequireNonAlphanumeric = false;
            })
                .AddRoles<AppRole>()
                .AddRoleManager<RoleManager<AppRole>>()
                .AddSignInManager<SignInManager<AppUser>>()
                .AddRoleValidator<RoleValidator<AppRole>>()
                .AddEntityFrameworkStores<DataContext>(); // need to setup the tables for identity tables

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options => {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true, // validate signing key
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["TokenKey"])),
                        ValidateIssuer = false, // issuer = api
                        ValidateAudience = false // audience = angular
                    };

                    // for SignalR
                    // allows client to send up token like a query string
                    options.Events = new JwtBearerEvents 
                    {
                        OnMessageReceived = context =>
                        {
                            // access_token is specific
                            var accessToken = context.Request.Query["access_token"];

                            var path = context.HttpContext.Request.Path;

                            // paths that has hubs in url
                            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                            {
                                context.Token = accessToken;
                            }

                            return Task.CompletedTask;
                        }
                    };
                });

            // add role authorization
            services.AddAuthorization(opt => {
                opt.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"));
                opt.AddPolicy("ModeratePhotoRole", policy => policy.RequireRole("Admin", "Moderator"));
            });

            return services;
        }
    }
}