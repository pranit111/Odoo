from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'user_management'

urlpatterns = [
    # Authentication endpoints
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User profile endpoints
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('profile/update/', views.UserProfileView.as_view(), name='update_profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('delete-account/', views.delete_account, name='delete_account'),
    
    # User management endpoints
    path('users/', views.UserListView.as_view(), name='user_list'),
    path('me/', views.user_profile, name='current_user'),
]
