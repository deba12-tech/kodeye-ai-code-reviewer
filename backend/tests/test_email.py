"""Email service tests."""

from app.services.email_service import ConsoleEmailService, EmailService, get_email_backend


class TestEmailService:
    def test_console_backend_send(self, capsys):
        backend = ConsoleEmailService()
        backend.send("test@example.com", "Test Subject", "<p>HTML</p>", "Plain text")
        captured = capsys.readouterr()
        assert "test@example.com" in captured.out
        assert "Test Subject" in captured.out

    def test_verification_email(self, capsys):
        service = EmailService(backend=ConsoleEmailService())
        service.send_verification_email("user@example.com", "test-token-123")
        captured = capsys.readouterr()
        assert "user@example.com" in captured.out
        assert "test-token-123" in captured.out

    def test_password_reset_email(self, capsys):
        service = EmailService(backend=ConsoleEmailService())
        service.send_password_reset_email("user@example.com", "reset-token-456")
        captured = capsys.readouterr()
        assert "reset-token-456" in captured.out

    def test_welcome_email(self, capsys):
        service = EmailService(backend=ConsoleEmailService())
        service.send_welcome_email("user@example.com", "Alice")
        captured = capsys.readouterr()
        assert "Alice" in captured.out

    def test_get_email_backend_defaults_to_console(self, monkeypatch):
        monkeypatch.setenv("EMAIL_BACKEND", "console")
        from app.core.config import Settings

        settings = Settings()
        monkeypatch.setattr("app.services.email_service.settings", settings)
        backend = get_email_backend()
        assert isinstance(backend, ConsoleEmailService)
