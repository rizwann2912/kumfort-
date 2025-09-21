#!/usr/bin/env python3
"""
Test the complete OTP flow
"""
import requests
import json

BASE_URL = "http://192.168.88.103:8000"

def test_otp_flow():
    """Test the complete OTP flow"""
    phone_number = "+919876543210"  # Demo driver phone
    user_type = "driver"
    
    print("🧪 Testing Complete OTP Flow")
    print("=" * 50)
    
    # Step 1: Send OTP
    print("1️⃣ Sending OTP...")
    send_response = requests.post(f"{BASE_URL}/api/auth/send-otp/", json={
        "phone_number": phone_number,
        "user_type": user_type
    })
    
    print(f"   Status: {send_response.status_code}")
    if send_response.status_code == 200:
        data = send_response.json()
        print(f"   Message: {data.get('message')}")
        otp_code = data.get('otp_code')
        print(f"   OTP Code: {otp_code}")
        
        if otp_code:
            # Step 2: Verify OTP
            print("\n2️⃣ Verifying OTP...")
            verify_response = requests.post(f"{BASE_URL}/api/auth/verify-otp/", json={
                "phone_number": phone_number,
                "otp_code": otp_code
            })
            
            print(f"   Status: {verify_response.status_code}")
            if verify_response.status_code == 200:
                verify_data = verify_response.json()
                print(f"   Message: {verify_data.get('message')}")
                print(f"   User: {verify_data.get('user', {}).get('first_name')} {verify_data.get('user', {}).get('last_name')}")
                print(f"   Token: {verify_data.get('token', '')[:20]}...")
                print("✅ OTP flow completed successfully!")
            else:
                print(f"   Error: {verify_response.text}")
        else:
            print("   ❌ No OTP code received")
    else:
        print(f"   Error: {send_response.text}")

if __name__ == "__main__":
    test_otp_flow()
