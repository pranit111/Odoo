from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'user_auth'

urlpatterns = [
    # Authentication endpoints
    path('register/', views.register_user, name='register'),
    path('send-otp/', views.send_otp, name='send_otp'),
    path('verify-otp/', views.verify_otp, name='verify_otp'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    
    # Token refresh
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User profile
    path('profile/', views.user_profile, name='profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
]