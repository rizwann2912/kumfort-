from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.test_connection, name='test_connection'),
    path('check-user/', views.check_user_exists, name='check_user_exists'),
    path('send-otp/', views.send_otp, name='send_otp'),
    path('verify-otp/', views.verify_otp, name='verify_otp'),
    path('resend-otp/', views.resend_otp, name='resend_otp'),
    path('logout/', views.logout, name='logout'),
    path('profile/', views.user_profile, name='user_profile'),
    path('update-profile/', views.update_profile, name='update_profile'),
]
