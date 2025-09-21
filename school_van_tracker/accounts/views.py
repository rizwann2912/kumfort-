from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.conf import settings
from .models import OTPVerification
import logging
import os

logger = logging.getLogger(__name__)

User = get_user_model()

def send_sms_otp(phone_number, otp_code):
    """Send OTP via SMS using Twilio"""
    try:
        from twilio.rest import Client
        
        # Twilio configuration
        account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        from_number = os.getenv('TWILIO_PHONE_NUMBER')
        
        if not all([account_sid, auth_token, from_number]):
            logger.warning("Twilio credentials not configured, skipping SMS")
            return False
            
        client = Client(account_sid, auth_token)
        print(f"Sending SMS to {phone_number} with OTP {otp_code}")
        message = client.messages.create(
            body=f"Your Kumfort OTP is: {otp_code}. Valid for 10 minutes.",
            from_=from_number,
            to=str(phone_number)
        )
        print(f"SMS sent successfully to {phone_number}, SID: {message.sid}")
        logger.info(f"SMS sent successfully to {phone_number}, SID: {message.sid}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send SMS to {phone_number}: {str(e)}")
        return False

@api_view(["GET"])
@permission_classes([AllowAny])
def test_connection(request):
    logger.info(f"🔍 Test connection request from {request.META.get('REMOTE_ADDR', 'unknown')}")
    logger.info(f"🌐 Request headers: {dict(request.headers)}")
    logger.info(f"🔗 Request method: {request.method}")
    logger.info(f"📍 Request path: {request.path}")
    return Response({"message": "Connection successful", "timestamp": timezone.now()}, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([AllowAny])
def send_otp(request):
    logger.info(f"🚀 Send OTP request received from {request.META.get('REMOTE_ADDR', 'unknown')}")
    logger.info(f"📱 Request data: {request.data}")
    logger.info(f"🌐 Request headers: {dict(request.headers)}")
    logger.info(f"🔗 Request method: {request.method}")
    logger.info(f"📍 Request path: {request.path}")
    
    phone_number = request.data.get("phone_number")
    user_type = request.data.get("user_type", "parent")
    
    if not phone_number:
        return Response(
            {"error": "Phone number is required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate user type
    valid_user_types = ["parent", "driver"]
    if user_type not in valid_user_types:
        return Response(
            {"error": f"Invalid user type. Must be one of: {', '.join(valid_user_types)}"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate phone number format
    try:
        from phonenumbers import parse, is_valid_number
        parsed_number = parse(phone_number, None)
        if not is_valid_number(parsed_number):
            return Response(
                {"error": "Invalid phone number format"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    except Exception:
        return Response(
            {"error": "Invalid phone number format"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check for recent OTP requests (rate limiting)
    recent_otp = OTPVerification.objects.filter(
        phone_number=phone_number,
        created_at__gte=timezone.now() - timezone.timedelta(minutes=1)
    ).first()
    
    if recent_otp:
        return Response(
            {"error": "Please wait before requesting another OTP"}, 
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )
    
    # Create or get user
    user, created = User.objects.get_or_create(
        phone_number=phone_number,
        defaults={"user_type": user_type}
    )
    
    # Create OTP verification
    otp_verification = OTPVerification.objects.create(phone_number=phone_number)
    
    # Send SMS
    sms_sent = send_sms_otp(phone_number, otp_verification.otp_code)
    
    response_data = {
        "message": "OTP sent successfully",
        "expires_in": 600,
        "sms_sent": sms_sent
    }
    
    # In development, include OTP in response
    if settings.DEBUG:
        response_data["otp_code"] = otp_verification.otp_code
    
    return Response(response_data, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([AllowAny])
def check_user_exists(request):
    """Check if a user exists with the given phone number"""
    logger.info(f"🔍 Check user exists request from {request.META.get('REMOTE_ADDR', 'unknown')}")
    logger.info(f"📱 Request data: {request.data}")
    
    phone_number = request.data.get("phone_number")
    
    if not phone_number:
        return Response(
            {"error": "Phone number is required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(phone_number=phone_number)
        logger.info(f"User found: {user.get_full_name()} ({user.user_type})")
        return Response({
            "exists": True,
            "user_type": user.user_type,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_active": user.is_active
        })
    except User.DoesNotExist:
        logger.info(f"User not found for phone: {phone_number}")
        return Response({
            "exists": False,
            "message": "User not registered"
        })
    except Exception as e:
        logger.error(f"Error checking user existence: {str(e)}")
        return Response(
            {"error": "An error occurred while checking user existence"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(["POST"])
@permission_classes([AllowAny])
def verify_otp(request):
    logger.info(f"🔍 Verify OTP request received from {request.META.get('REMOTE_ADDR', 'unknown')}")
    logger.info(f"📱 Request data: {request.data}")
    
    phone_number = request.data.get("phone_number")
    otp_code = request.data.get("otp_code")
    
    logger.info(f"📱 Phone number: {phone_number}")
    logger.info(f"🔑 OTP code: {otp_code}")
    
    if not phone_number or not otp_code:
        logger.warning("❌ Missing phone number or OTP code")
        return Response(
            {"error": "Phone number and OTP code are required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        logger.info(f"🔍 Looking for OTP verification for phone: {phone_number}")
        otp_verifications = OTPVerification.objects.filter(
            phone_number=phone_number,
            otp_code=otp_code,
            is_verified=False
        )
        logger.info(f"📊 Found {otp_verifications.count()} OTP verifications")
        
        if not otp_verifications.exists():
            logger.warning(f"❌ No OTP verification found for phone: {phone_number}")
            return Response(
                {"error": "Invalid OTP or phone number"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        otp_verification = otp_verifications.latest("created_at")
        logger.info(f"✅ Found OTP verification: {otp_verification}")
        
        if not otp_verification.is_valid():
            otp_verification.attempts += 1
            otp_verification.save()
            
            if otp_verification.is_expired():
                return Response(
                    {"error": "OTP has expired"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif otp_verification.attempts >= 3:
                return Response(
                    {"error": "Too many failed attempts"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            else:
                return Response(
                    {"error": "Invalid OTP"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        otp_verification.is_verified = True
        otp_verification.save()
        
        try:
            logger.info(f"🔍 Looking for user with phone: {phone_number}")
            user = User.objects.get(phone_number=phone_number)
            logger.info(f"✅ Found user: {user}")
        except User.DoesNotExist:
            logger.warning(f"❌ User not found for phone: {phone_number}")
            return Response(
                {"error": "User not found. Please register first."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        token, created = Token.objects.get_or_create(user=user)
        logger.info(f"✅ Created/found token for user: {user}")
        
        return Response({
            "message": "Login successful",
            "token": token.key,
            "user": {
                "id": user.id,
                "phone_number": str(user.phone_number),
                "user_type": user.user_type,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_new_user": created,
                "created_at": user.created_at.isoformat(),
                "is_active": user.is_active,
            }
        }, status=status.HTTP_200_OK)
        
    except OTPVerification.DoesNotExist:
        logger.warning(f"❌ OTPVerification.DoesNotExist for phone: {phone_number}")
        return Response(
            {"error": "Invalid OTP or phone number"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except User.DoesNotExist:
        logger.warning(f"❌ User.DoesNotExist for phone: {phone_number}")
        return Response(
            {"error": "User not found"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"❌ Unexpected error in verify_otp: {str(e)}")
        return Response(
            {"error": "An error occurred during verification"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(["POST"])
def logout(request):
    try:
        request.user.auth_token.delete()
        return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
    except:
        return Response({"error": "Logout failed"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
def user_profile(request):
    """Get current user profile"""
    user = request.user
    return Response({
        "id": user.id,
        "phone_number": str(user.phone_number),
        "user_type": user.user_type,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "address": user.address,
        "emergency_contact": str(user.emergency_contact) if user.emergency_contact else None,
        "created_at": user.created_at,
        "is_active": user.is_active
    }, status=status.HTTP_200_OK)

@api_view(["PUT"])
def update_profile(request):
    """Update user profile"""
    user = request.user
    
    # Update allowed fields
    if "first_name" in request.data:
        user.first_name = request.data["first_name"]
    if "last_name" in request.data:
        user.last_name = request.data["last_name"]
    if "address" in request.data:
        user.address = request.data["address"]
    if "emergency_contact" in request.data:
        user.emergency_contact = request.data["emergency_contact"]
    
    user.save()
    
    return Response({
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "phone_number": str(user.phone_number),
            "user_type": user.user_type,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "address": user.address,
            "emergency_contact": str(user.emergency_contact) if user.emergency_contact else None
        }
    }, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([AllowAny])
def resend_otp(request):
    """Resend OTP for the same phone number"""
    phone_number = request.data.get("phone_number")
    
    if not phone_number:
        return Response(
            {"error": "Phone number is required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check for recent OTP requests (rate limiting)
    recent_otp = OTPVerification.objects.filter(
        phone_number=phone_number,
        created_at__gte=timezone.now() - timezone.timedelta(minutes=1)
    ).first()
    
    if recent_otp:
        return Response(
            {"error": "Please wait before requesting another OTP"}, 
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )
    
    # Create new OTP verification
    otp_verification = OTPVerification.objects.create(phone_number=phone_number)
    
    # Send SMS
    sms_sent = send_sms_otp(phone_number, otp_verification.otp_code)
    
    response_data = {
        "message": "OTP resent successfully",
        "expires_in": 600,
        "sms_sent": sms_sent
    }
    
    # In development, include OTP in response
    if settings.DEBUG:
        response_data["otp_code"] = otp_verification.otp_code
    
    return Response(response_data, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([AllowAny])
def check_user_exists(request):
    """Check if a user exists with the given phone number"""
    logger.info(f"🔍 Check user exists request from {request.META.get('REMOTE_ADDR', 'unknown')}")
    logger.info(f"📱 Request data: {request.data}")
    
    phone_number = request.data.get("phone_number")
    
    if not phone_number:
        return Response(
            {"error": "Phone number is required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(phone_number=phone_number)
        logger.info(f"User found: {user.get_full_name()} ({user.user_type})")
        return Response({
            "exists": True,
            "user_type": user.user_type,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_active": user.is_active
        })
    except User.DoesNotExist:
        logger.info(f"User not found for phone: {phone_number}")
        return Response({
            "exists": False,
            "message": "User not registered"
        })
    except Exception as e:
        logger.error(f"Error checking user existence: {str(e)}")
        return Response(
            {"error": "An error occurred while checking user existence"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
