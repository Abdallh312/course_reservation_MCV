namespace Backend.DTOs
{
    /// <summary>
    /// DTO used when a new user/student registers themselves.
    /// (بيانات تسجيل مستخدم/طالب جديد - الحالة الافتراضية Pending)
    /// </summary>
    public class RegisterDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO used for login requests.
    /// (بيانات تسجيل الدخول)
    /// </summary>
    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO used by an Admin to add a student that is Approved immediately.
    /// (بيانات إضافة طالب بواسطة الأدمن - يتم تفعيله فوراً)
    /// </summary>
    public class AdminAddStudentDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    /// <summary>
    /// Safe representation of a User returned by the API (never includes PasswordHash).
    /// (تمثيل آمن للمستخدم بدون إظهار كلمة السر المشفرة)
    /// </summary>
    public class UserDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }

    /// <summary>
    /// Response returned after a successful login, containing the JWT token.
    /// (الرد بعد تسجيل الدخول بنجاح - يحتوي على التوكين)
    /// </summary>
    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public UserDto User { get; set; } = null!;
    }
}
