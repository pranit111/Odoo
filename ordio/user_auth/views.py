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
    UserProfileSerializer
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_operators(request):
    """
    Get all users with OPERATOR role for assignee dropdown
    """
    try:
        operators = CustomUser.objects.filter(
            role='OPERATOR',
            is_active=True
        ).values('id', 'username', 'first_name', 'last_name', 'email').order_by('username')
        
        # Format the response to include display name
        operator_list = []
        for operator in operators:
            display_name = f"{operator['first_name']} {operator['last_name']}".strip()
            if not display_name:
                display_name = operator['username']
                
            operator_list.append({
                'id': operator['id'],
                'username': operator['username'],
                'display_name': display_name,
                'email': operator['email']
            })
        
        return Response(operator_list, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error fetching operators: {str(e)}")
        return Response({
            'error': 'Failed to fetch operators.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
