import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)

EMAIL_TEMPLATE = """<!DOCTYPE html>
<html>
<head>
<style>
body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
       background-color: #f4f6f9; margin: 0; padding: 20px; }}
.card {{ max-width: 500px; margin: 0 auto; background: #ffffff;
        border-radius: 12px; padding: 32px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        border-top: 6px solid #4f46e5; }}
.logo {{ font-size: 24px; font-weight: bold; color: #1e1b4b;
        text-align: center; margin-bottom: 24px; }}
.logo span {{ color: #4f46e5; }}
.title {{ font-size: 18px; color: #1f2937; margin-bottom: 12px; }}
.text {{ color: #4b5563; font-size: 14px; line-height: 1.6;
        margin-bottom: 24px; }}
.otp-box {{ background: #f0fdf4; border: 2px dashed #22c55e;
           border-radius: 8px; text-align: center;
           padding: 16px; margin: 20px 0; }}
.otp-code {{ font-size: 32px; font-weight: 800; letter-spacing: 6px;
            color: #15803d; }}
.footer {{ font-size: 12px; color: #9ca3af; text-align: center;
          margin-top: 24px; border-top: 1px solid #f3f4f6;
          padding-top: 16px; }}
</style>
</head>
<body>
<div class="card">
    <div class="logo">Prep<span>Success</span></div>
    <div class="title">{greeting}</div>
    <p class="text">
        Thank you for registering on <strong>PrepSuccess</strong>.
        Please use the verification code below to verify your email address
        and activate your student account:
    </p>
    <div class="otp-box">
        <div class="otp-code">{otp}</div>
    </div>
    <p class="text">
        This verification code is valid for <strong>{expire_minutes} minutes</strong>.
        Please do not share this code with anyone.
    </p>
    <div class="footer">
        &copy; {project_name}. All rights reserved.
    </div>
</div>
</body>
</html>"""


def send_otp_email(to_email: str, otp: str, first_name: str | None = None) -> bool:
    """Send a 6-digit OTP email using Gmail SMTP.

    Falls back to console logger if SMTP credentials are not configured.
    """
    greeting = f"Hello {first_name}," if first_name else "Hello,"
    subject = f"Your PrepSuccess Verification Code: {otp}"
    html_content = EMAIL_TEMPLATE.format(
        greeting=greeting,
        otp=otp,
        expire_minutes=settings.OTP_EXPIRE_MINUTES,
        project_name=settings.PROJECT_NAME,
    )

    # If SMTP is not configured, log to console for local testing
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning(
            "To: %s | OTP: %s (SMTP credentials not set in .env)",
            to_email,
            otp,
        )
        print("\n==========================================")
        print(f"📧 [DEV EMAIL MOCK] Verification OTP for {to_email}: {otp}")
        print("==========================================\n")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.SMTP_FROM_EMAIL
        msg["To"] = to_email
        msg.attach(MIMEText(html_content, "html"))

        # Send via SMTP
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_TLS:
                server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM_EMAIL, [to_email], msg.as_string())

        logger.info("Verification email sent to %s", to_email)
        return True
    except Exception as e:
        logger.error("Failed to send email to %s: %s", to_email, e)
        return False
