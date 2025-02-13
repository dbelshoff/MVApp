using System.ComponentModel.DataAnnotations;

namespace MVConsultoria.Web.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O nome é obrigatório.")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "O CPF é obrigatório.")]
        [RegularExpression(@"^\d{11}$", ErrorMessage = "O CPF deve ter 11 dígitos.")]
        public string CPF { get; set; } = string.Empty;

        [Required(ErrorMessage = "O e-mail é obrigatório.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "A senha é obrigatória.")]
        public string Senha { get; set; } = string.Empty;

        // Propriedade para bloquear o usuário
        public bool UserBloqueado { get; set; } = false;

        // Mapeamento do campo Discriminator
        public string Discriminator { get; set; } = string.Empty;
    }
}






