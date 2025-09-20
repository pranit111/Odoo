from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
import logging

from .models import CustomUser
from .serializers import (
    UserRegistrationSerializer,
    SendOTPSerializer,
    VerifyOTPSerializer,
    LoginSerializer,
    UserProfileSerializer,
    SendEmailChangeOTPSerializer,
    ChangeEmailSerializer,
    SendPasswordChangeOTPSerializer,
    ChangePasswordSerializer
)
from .utils import send_otp_email

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        logger.info(f"New user registered: {user.email}")
        
        return Response({
            'message': 'User registered successfully. Please verify your account with OTP.',
            'user_id': user.id,
            'username': user.username
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    """
    Send OTP to user's email
    """
    serializer = SendOTPSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        
        try:
            user = CustomUser.objects.get(username=username)
            otp = user.generate_otp()
            
            # Send OTP via email
            if send_otp_email(user, otp):
                logger.info(f"OTP sent to {user.email} for user {username}")
                return Response({
                    'message': 'OTP sent successfully to your registered email.',
                    'username': username
                }, status=status.HTTP_200_OK)
            else:
                logger.error(f"Failed to send OTP to {user.email} for user {username}")
                return Response({
                    'error': 'Failed to send OTP. Please try again.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except CustomUser.DoesNotExist:
            return Response({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """
    Verify OTP and activate user account
    """
    serializer = VerifyOTPSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        otp = serializer.validated_data['otp']
        
        try:
            user = CustomUser.objects.get(username=username)
            
            if user.verify_otp(otp):
                logger.info(f"OTP verified for user {username}")
                
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                access_token = refresh.access_token
                
                return Response({
                    'message': 'OTP verified successfully. Account activated.',
                    'access_token': str(access_token),
                    'refresh_token': str(refresh),
                    'user': UserProfileSerializer(user).data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Invalid or expired OTP.'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except CustomUser.DoesNotExist:
            return Response({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    Login user with email and password
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        logger.info(f"User logged in: {user.username}")
        
        return Response({
            'message': 'Login successful.',
            'access_token': str(access_token),
            'refresh_token': str(refresh),
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get current user's profile
    """
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    Update user profile
    """
    serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Profile updated successfully.',
            'user': serializer.data
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """
    Logout user by blacklisting the refresh token
    """
    try:
        refresh_token = request.data.get("refresh_token")
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
            
        logger.info(f"User logged out: {request.user.username}")
        return Response({
            'message': 'Logout successful.'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'Invalid token.'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_email_change_otp(request):
    """
    Send OTP for email change verification
    """
    serializer = SendEmailChangeOTPSerializer(data=request.data)
    if serializer.is_valid():
        new_email = serializer.validated_data['newEmail']
        user = request.user
        
        try:
            # Generate OTP first
            otp = user.generate_otp()
            
            # Send OTP to the NEW email address using the specific function
            from .utils import send_otp_to_email
            send_otp_to_email(user, new_email, otp)
            
            logger.info(f"Email change OTP sent to {new_email} for user: {user.username}")
            return Response({
                'message': 'OTP sent to your new email address.'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Failed to send email change OTP: {str(e)}")
            return Response({
                'error': 'Failed to send OTP. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_email(request):
    """
    Change user's email after OTP verification
    """
    serializer = ChangeEmailSerializer(data=request.data)
    if serializer.is_valid():
        new_email = serializer.validated_data['newEmail']
        otp = serializer.validated_data['otp']
        user = request.user
        
        # Verify OTP
        if not user.verify_otp(otp):
            return Response({
                'error': 'Invalid or expired OTP.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Update email
            user.email = new_email
            user.save()
            
            logger.info(f"Email changed successfully for user: {user.username}")
            return Response({
                'message': 'Email address updated successfully.'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Failed to change email: {str(e)}")
            return Response({
                'error': 'Failed to update email. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_password_change_otp(request):
    """
    Send OTP for password change verification
    """
    serializer = SendPasswordChangeOTPSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        current_password = serializer.validated_data['currentPassword']
        
        # Verify this is the same user
        if request.user.username != username:
            return Response({
                'error': 'You can only change your own password.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Validate current password before sending OTP
        if not request.user.check_password(current_password):
            return Response({
                'error': 'Current password is incorrect.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Generate OTP first
            otp = request.user.generate_otp()
            
            # Send OTP to user's current email (using original function)
            send_otp_email(request.user, otp)
            
            logger.info(f"Password change OTP sent for user: {username}")
            return Response({
                'message': 'OTP sent to your registered email address.'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Failed to send password change OTP: {str(e)}")
            return Response({
                'error': 'Failed to send OTP. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change user's password after OTP verification
    """
    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        current_password = serializer.validated_data['currentPassword']
        new_password = serializer.validated_data['newPassword']
        otp = serializer.validated_data['otp']
        user = request.user
        
        # Verify current password
        if not user.check_password(current_password):
            return Response({
                'error': 'Current password is incorrect.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify OTP
        if not user.verify_otp(otp):
            return Response({
                'error': 'Invalid or expired OTP.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Update password
            user.set_password(new_password)
            user.save()
            
            logger.info(f"Password changed successfully for user: {user.username}")
            return Response({
                'message': 'Password updated successfully.'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Failed to change password: {str(e)}")
            return Response({
                'error': 'Failed to update password. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
