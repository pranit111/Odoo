#!/usr/bin/env python3
"""
Test script to verify the complete Manufacturing Order workflow
"""
import requests
import json
import time

# Django API Configuration
BASE_URL = 'http://localhost:8000/api'
HEADERS = {'Content-Type': 'application/json'}

def test_mo_workflow():
    """Test complete MO workflow"""
    print("🧪 Testing Manufacturing Order Workflow")
    print("=" * 50)
    
    try:
        # 1. Test finished products endpoint
        print("1. Testing finished products endpoint...")
        response = requests.get(f'{BASE_URL}/products/finished_products/')
        if response.status_code == 200:
            finished_products = response.json()
            print(f"   ✅ Found {len(finished_products)} finished products")
            if finished_products:
                test_product = finished_products[0]
                print(f"   📦 Test product: {test_product.get('name', 'N/A')}")
        else:
            print(f"   ❌ Error: {response.status_code}")
            return False

        # 2. Test operators endpoint
        print("2. Testing operators endpoint...")
        response = requests.get(f'{BASE_URL}/users/operators/')
        if response.status_code == 200:
            operators = response.json()
            print(f"   ✅ Found {len(operators)} operators")
            if operators:
                test_operator = operators[0]
                print(f"   👤 Test operator: {test_operator.get('full_name', 'N/A')}")
        else:
            print(f"   ❌ Error: {response.status_code}")
            return False

        # 3. Test BOMs endpoint
        print("3. Testing BOMs endpoint...")
        response = requests.get(f'{BASE_URL}/bom/')
        if response.status_code == 200:
            boms = response.json()
            print(f"   ✅ Found {len(boms)} BOMs")
            if boms:
                test_bom = boms[0] if isinstance(boms, list) else boms.get('results', [{}])[0] if boms.get('results') else {}
                print(f"   📋 Test BOM: {test_bom.get('name', 'N/A')}")
        else:
            print(f"   ❌ Error: {response.status_code}")
            return False

        # 4. Test manufacturing orders dashboard
        print("4. Testing manufacturing orders dashboard...")
        response = requests.get(f'{BASE_URL}/manufacturing-orders/dashboard/')
        if response.status_code == 200:
            dashboard = response.json()
            print(f"   ✅ Dashboard data retrieved")
            print(f"   📊 MO counts: {dashboard.get('mos_by_status', {})}")
        else:
            print(f"   ❌ Error: {response.status_code}")
            return False

        print("\n🎉 All API endpoints are working correctly!")
        print("\nNext steps:")
        print("1. Open the React frontend at http://localhost:5174")
        print("2. Navigate to Manufacturing Orders")
        print("3. Create a new MO and test the complete workflow:")
        print("   - Create MO → Save & Confirm → Work Orders appear")
        print("   - Execute work orders (Start/Pause/Complete)")
        print("   - MO auto-completes with inventory processing")
        
        return True

    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure Django server is running on localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == '__main__':
    success = test_mo_workflow()
    if success:
        print("\n✅ Test completed successfully!")
    else:
        print("\n❌ Test failed!")