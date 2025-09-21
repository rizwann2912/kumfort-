#!/usr/bin/env python3
"""
Test script to verify location API endpoints are working
"""
import requests
import json

BASE_URL = "http://192.168.88.103:8000"

def test_connection():
    """Test basic connection"""
    try:
        response = requests.get(f"{BASE_URL}/api/auth/test/")
        print(f"✅ Connection test: {response.status_code}")
        if response.status_code == 200:
            print(f"   Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Connection test failed: {e}")
        return False

def test_location_endpoints():
    """Test location API endpoints"""
    endpoints = [
        "/api/locations/update-location/",
        "/api/locations/driver-location/",
        "/api/locations/van-location/",
        "/api/locations/location-history/",
        "/api/locations/toggle-gps/",
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}")
            print(f"📍 {endpoint}: {response.status_code}")
            if response.status_code == 401:
                print("   (Expected: Authentication required)")
            elif response.status_code == 200:
                print("   ✅ Endpoint accessible")
            else:
                print(f"   ⚠️  Unexpected status: {response.text[:100]}")
        except Exception as e:
            print(f"❌ {endpoint}: {e}")

def main():
    print("🧪 Testing Location API Endpoints")
    print("=" * 50)
    
    if test_connection():
        print("\n📍 Testing Location Endpoints:")
        test_location_endpoints()
    else:
        print("\n❌ Cannot test location endpoints - connection failed")

if __name__ == "__main__":
    main()
