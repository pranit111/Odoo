from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser
from .utils import validate_otp_format

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'password_confirm')
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True},
        }
    
    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_username(self, value):
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = CustomUser.objects.create_user(**validated_data)
        return user

class SendOTPSerializer(serializers.Serializer):
    username = serializers.CharField()
    
    def validate_username(self, value):
        try:
            user = CustomUser.objects.get(username=value)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("No user found with this username.")
        return value

class VerifyOTPSerializer(serializers.Serializer):
    username = serializers.CharField()
    otp = serializers.CharField(max_length=6)
    
    def validate_otp(self, value):
        if not validate_otp_format(value):
            raise serializers.ValidationError("OTP must be 6 digits.")
        return value
    
    def validate_username(self, value):
        try:
            user = CustomUser.objects.get(username=value)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("No user found with this username.")
        return value

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            
            if not user:
                raise serializers.ValidationError('Invalid credentials.')
            
            if not user.is_verified:
                raise serializers.ValidationError('Please verify your account with OTP before logging in.')
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include username and password.')

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'is_verified', 'date_joined')
        read_only_fields = ('id', 'is_verified', 'date_joined')