using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DoLearn.API.Models;
using Microsoft.IdentityModel.Tokens;

public class TokenService(IConfiguration config)
{
    public string CreateToken(User user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role.ToString())
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(config["Jwt:Key"]!));

        return new JwtSecurityTokenHandler().WriteToken(
            new JwtSecurityToken(
                issuer: config["Jwt:Issuer"],
                audience: config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(60),
                signingCredentials: new SigningCredentials(
                    key, SecurityAlgorithms.HmacSha512Signature)
            ));
    }
}