from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)

def send_otp_email(user, otp):
    """
    Send OTP via email using Google Gmail SMTP
    """
    try:
        subject = 'Your OTP for Ordio App'
        
        # Create HTML message
        html_message = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .otp-code {{ 
                    font-size: 24px; 
                    font-weight: bold; 
                    color: #2196F3; 
                    text-align: center; 
                    padding: 20px; 
                    border: 2px solid #2196F3; 
                    border-radius: 8px; 
                    margin: 20px 0;
                }}
                .warning {{ color: #ff6b6b; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Welcome to Ordio!</h2>
                <p>Hello {user.username},</p>
                <p>Your One-Time Password (OTP) for account verification is:</p>
                
                <div class="otp-code">{otp}</div>
                
                <p>This OTP will expire in <strong>10 minutes</strong>.</p>
                <p class="warning">⚠️ Do not share this OTP with anyone for security reasons.</p>
                
                <p>If you didn't request this OTP, please ignore this email.</p>
                
                <hr>
                <p style="font-size: 12px; color: #666;">
                    This is an automated message from Ordio App. Please do not reply to this email.
                </p>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        plain_message = f"""
        Welcome to Ordio!
        
        Hello {user.username},
        
        Your One-Time Password (OTP) for account verification is: {otp}
        
        This OTP will expire in 10 minutes.
        
        Do not share this OTP with anyone for security reasons.
        
        If you didn't request this OTP, please ignore this email.
        
        ---
        This is an automated message from Ordio App.
        """
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"OTP email sent successfully to {user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send OTP email to {user.email}: {str(e)}")
        return False

def send_otp_to_email(user, email, otp):
    """
    Send OTP to a specific email address (used for email change)
    """
    try:
        subject = 'Your OTP for Ordio App Email Change'
        
        # Create HTML message
        html_message = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .otp-code {{ 
                    font-size: 24px; 
                    font-weight: bold; 
                    color: #2196F3; 
                    text-align: center; 
                    padding: 20px; 
                    border: 2px solid #2196F3; 
                    border-radius: 8px; 
                    margin: 20px 0;
                }}
                .warning {{ color: #ff6b6b; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Email Change Verification - Ordio</h2>
                <p>Hello {user.username},</p>
                <p>You have requested to change your email address. Your verification code is:</p>
                
                <div class="otp-code">{otp}</div>
                
                <p>This OTP will expire in <strong>10 minutes</strong>.</p>
                <p class="warning">⚠️ Do not share this OTP with anyone for security reasons.</p>
                
                <p>If you didn't request this email change, please ignore this email.</p>
                
                <hr>
                <p style="font-size: 12px; color: #666;">
                    This is an automated message from Ordio App. Please do not reply to this email.
                </p>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        plain_message = f"""
        Email Change Verification - Ordio
        
        Hello {user.username},
        
        You have requested to change your email address. Your verification code is: {otp}
        
        This OTP will expire in 10 minutes.
        
        Do not share this OTP with anyone for security reasons.
        
        If you didn't request this email change, please ignore this email.
        
        ---
        This is an automated message from Ordio App.
        """
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Email change OTP sent successfully to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email change OTP to {email}: {str(e)}")
        return False

def validate_otp_format(otp):
    """
    Validate OTP format (6 digits)
    """
    if not otp:
        return False
    
    if len(otp) != 6:
        return False
        
    if not otp.isdigit():
        return False
        
    return True