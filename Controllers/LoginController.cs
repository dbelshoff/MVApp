using Microsoft.AspNetCore.Mvc;
using MVConsultoria.Web.Dtos;
using MVConsultoria.Web.Data;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using BCrypt.Net;
using MVConsultoria.Web.Models;

namespace MVConsultoria.Web.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly MVConsultoriaContext _context;

        public AuthController(MVConsultoriaContext context)
        {
            _context = context;
        }

        // POST: api/Auth/login
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                // Verifica se o usuário existe usando o CPF como login
                var user = await _context.Users.FirstOrDefaultAsync(u => u.CPF == loginDto.Login);
                if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Senha, user.Senha))
                {
                    return Unauthorized(new { message = "CPF ou senha incorretos" });
                }

                // Determina o tipo de usuário com base no campo Discriminator
                string userType = user.Discriminator;

                // Valida se o tipo de usuário é reconhecido
                if (userType != "Administrador" && userType != "Usuario" && userType != "Cliente")
                {
                    return Unauthorized(new { message = "Tipo de usuário não reconhecido." });
                }

                // Gera o token JWT
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes("supersecretkey12345678901234567890");
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new[]
                    {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.CPF),
                new Claim(ClaimTypes.Role, userType) // Define o tipo de usuário como Role
            }),
                    Expires = DateTime.UtcNow.AddHours(1),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                    Issuer = "yourapp",
                    Audience = "yourapp"
                };

                var token = tokenHandler.CreateToken(tokenDescriptor);
                var tokenString = tokenHandler.WriteToken(token);

                // Retorna o token JWT para o cliente junto com o tipo de usuário
                return Ok(new { token = tokenString, userType });
            }
            catch (Exception ex)
            {
                // Loga a exceção no console ou em um sistema de monitoramento
                Console.WriteLine($"Erro ao processar login: {ex.Message}");
                return StatusCode(500, new { message = "Erro interno no servidor. Por favor, tente novamente mais tarde." });
            }
        }



    }
}
