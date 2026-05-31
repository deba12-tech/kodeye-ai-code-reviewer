"""Email service abstraction with console, SMTP, and SendGrid backends."""

import logging
import smtplib
from abc import ABC, abstractmethod
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from string import Template

import httpx

from app.core.config import settings

logger = logging.getLogger("kodeye.email_service")

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates" / "emails"


def _render_template(template_name: str, context: dict) -> str:
    template_path = TEMPLATES_DIR / template_name
    content = template_path.read_text(encoding="utf-8")
    return Template(content).safe_substitute(context)


class EmailBackend(ABC):
    """Abstract email backend interface."""

    @abstractmethod
    def send(self, to_email: str, subject: str, html_body: str, text_body: str) -> None:
        """Send an email message."""


class ConsoleEmailService(EmailBackend):
    """Print emails to console for local development."""

    def send(self, to_email: str, subject: str, html_body: str, text_body: str) -> None:
        print("\n" + "=" * 80)
        print(" [KODEYE EMAIL SERVICE - CONSOLE]")
        print(f" To:      {to_email}")
        print(f" Subject: {subject}")
        print("-" * 80)
        print(text_body)
        print("=" * 80 + "\n")
        logger.info("Console email sent to %s: %s", to_email, subject)


class SMTPEmailService(EmailBackend):
    """Send emails via SMTP."""

    def send(self, to_email: str, subject: str, html_body: str, text_body: str) -> None:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = settings.SMTP_FROM_EMAIL
        message["To"] = to_email
        message.attach(MIMEText(text_body, "plain"))
        message.attach(MIMEText(html_body, "html"))

        try:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30) as server:
                server.starttls()
                if settings.SMTP_USER and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_FROM_EMAIL, [to_email], message.as_string())
            logger.info("SMTP email sent to %s: %s", to_email, subject)
        except Exception as exc:
            logger.error("Failed to send SMTP email to %s: %s", to_email, exc)
            raise


class SendGridEmailService(EmailBackend):
    """Send emails via SendGrid HTTP API."""

    def send(self, to_email: str, subject: str, html_body: str, text_body: str) -> None:
        from_email = settings.SENDGRID_FROM_EMAIL or settings.SMTP_FROM_EMAIL
        payload = {
            "personalizations": [{"to": [{"email": to_email}]}],
            "from": {"email": from_email},
            "subject": subject,
            "content": [
                {"type": "text/plain", "value": text_body},
                {"type": "text/html", "value": html_body},
            ],
        }

        try:
            response = httpx.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={
                    "Authorization": f"Bearer {settings.SENDGRID_API_KEY}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=30,
            )
            response.raise_for_status()
            logger.info("SendGrid email sent to %s: %s", to_email, subject)
        except Exception as exc:
            logger.error("Failed to send SendGrid email to %s: %s", to_email, exc)
            raise


def get_email_backend() -> EmailBackend:
    """Factory: select email backend from configuration."""
    backend = settings.EMAIL_BACKEND.lower()
    if backend == "smtp":
        if settings.ENVIRONMENT == "production" and (
            not settings.SMTP_HOST or not settings.SMTP_FROM_EMAIL
        ):
            raise RuntimeError("SMTP email backend requires SMTP_HOST and SMTP_FROM_EMAIL")
        return SMTPEmailService()
    if backend == "sendgrid":
        if not settings.SENDGRID_API_KEY:
            raise RuntimeError("SendGrid email backend requires SENDGRID_API_KEY")
        return SendGridEmailService()
    return ConsoleEmailService()


class EmailService:
    """High-level email service used by auth and notification flows."""

    def __init__(self, backend: EmailBackend | None = None):
        self.backend = backend or get_email_backend()

    def _send(self, to_email: str, subject: str, html_body: str, text_body: str) -> None:
        self.backend.send(to_email, subject, html_body, text_body)

    def send_verification_email(self, email: str, token: str) -> None:
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        html_body = _render_template(
            "verification.html",
            {"verification_url": verification_url},
        )
        text_body = f"Verify your Kodeye account: {verification_url}"
        self._send(email, "Verify your Kodeye email", html_body, text_body)

    def send_password_reset_email(self, email: str, token: str) -> None:
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        html_body = _render_template("password_reset.html", {"reset_url": reset_url})
        text_body = f"Reset your Kodeye password: {reset_url}"
        self._send(email, "Reset your Kodeye password", html_body, text_body)

    def send_welcome_email(self, email: str, name: str | None = None) -> None:
        dashboard_url = f"{settings.FRONTEND_URL}/dashboard"
        greeting = f"Welcome to Kodeye, {name}!" if name else "Welcome to Kodeye!"
        html_body = _render_template(
            "welcome.html",
            {"greeting": greeting, "dashboard_url": dashboard_url},
        )
        text_body = f"{greeting} Visit your dashboard: {dashboard_url}"
        self._send(email, "Welcome to Kodeye", html_body, text_body)

    def send_notification_email(
        self,
        email: str,
        subject: str,
        title: str,
        message: str,
        action_url: str | None = None,
        action_label: str = "View Details",
    ) -> None:
        action_block = ""
        if action_url:
            action_block = (
                f'<p style="text-align: center; margin: 32px 0;">'
                f'<a href="{action_url}" style="background: #00E5FF; color: #000; padding: 12px 24px; '
                f'border-radius: 8px; text-decoration: none; font-weight: bold;">'
                f"{action_label}</a></p>"
            )
        html_body = _render_template(
            "notification.html",
            {
                "subject": subject,
                "title": title,
                "message": message,
                "action_block": action_block,
            },
        )
        text_body = f"{title}\n\n{message}"
        if action_url:
            text_body += f"\n\n{action_url}"
        self._send(email, subject, html_body, text_body)


email_service = EmailService()
