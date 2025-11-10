using Microsoft.EntityFrameworkCore;
using MarketCampaignProject.Models;
using MarketCampaignProject.Data;
using MarketCampaignProject.DTOs;
using BCrypt.Net;

namespace MarketCampaignProject.Services
{
    public class AuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtTokenService _jwt;

        public AuthService(ApplicationDbContext context, JwtTokenService jwt)
        {
            _context = context;
            _jwt = jwt;
        }

        public async Task<ResponseDto> RegisterAsync(RegisterDto dto)
        {
            var existinguser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (existinguser != null)
            {
                return new ResponseDto(false, "User already registered");
            }
            else
            {
                var newUser = new User
                {
                    Username = dto.Username,
                    Email = dto.Email,
                    PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(dto.Password),
                };

                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();

                return new ResponseDto(true, "User registered successfully");
            }
        }

        public async Task<ResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null)
            {
                return new ResponseDto(false, "Invalid username or password");
            }
            else
            {
                bool isPasswordCorrect = BCrypt.Net.BCrypt.EnhancedVerify(dto.Password, user.PasswordHash);

                if (isPasswordCorrect)
                {
                    var token = _jwt.GenerateToken(user);
                    int sessionDuration = 30 * 60;

                    return new ResponseDto(true, "Login successful", new { token, expiresIn = sessionDuration });
                }
                else
                {
                    return new ResponseDto(false, "Invalid password", null);
                }
            }
        }
    }
}
