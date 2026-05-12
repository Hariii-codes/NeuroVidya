#!/usr/bin/env python3
"""
Validation script for Task 4: Authentication API & Schemas
"""
import sys
from pathlib import Path

def validate_file_exists(filepath, description):
    """Check if a file exists and report."""
    path = Path(filepath)
    if path.exists():
        print(f"[PASS] {description}: {filepath}")
        return True
    else:
        print(f"[FAIL] {description} NOT FOUND: {filepath}")
        return False

def validate_imports(filepath, required_imports):
    """Check if required imports are present in a file."""
    try:
        content = Path(filepath).read_text()
        missing = []
        for imp in required_imports:
            if imp not in content:
                missing.append(imp)
        if missing:
            print(f"[FAIL] Missing imports in {filepath}: {missing}")
            return False
        else:
            print(f"[PASS] All required imports present in {filepath}")
            return True
    except Exception as e:
        print(f"[FAIL] Error checking imports in {filepath}: {e}")
        return False

def main():
    print("=" * 60)
    print("Task 4: Authentication API & Schemas - Validation")
    print("=" * 60)
    print()

    results = []

    # Check file existence
    print("1. Checking file existence:")
    print("-" * 60)
    results.append(validate_file_exists(
        "C:/Users/Hari/Desktop/NeuroVidya MIni Project/backend/app/schemas/auth.py",
        "Auth schemas"
    ))
    results.append(validate_file_exists(
        "C:/Users/Hari/Desktop/NeuroVidya MIni Project/backend/app/api/auth.py",
        "Auth API router"
    ))
    results.append(validate_file_exists(
        "C:/Users/Hari/Desktop/NeuroVidya MIni Project/backend/tests/test_auth.py",
        "Auth tests"
    ))
    results.append(validate_file_exists(
        "C:/Users/Hari/Desktop/NeuroVidya MIni Project/backend/tests/conftest.py",
        "Pytest configuration"
    ))
    print()

    # Check schemas
    print("2. Checking auth schemas:")
    print("-" * 60)
    required_schemas = [
        "class UserBase",
        "class UserCreate",
        "class UserLogin",
        "class UserResponse",
        "class Token",
        "class TokenData"
    ]
    auth_schemas_path = "C:/Users/Hari/Desktop/NeuroVidya MIni Project/backend/app/schemas/auth.py"
    for schema in required_schemas:
        if schema in Path(auth_schemas_path).read_text():
            print(f"[PASS] {schema} defined")
            results.append(True)
        else:
            print(f"[FAIL] {schema} NOT FOUND")
            results.append(False)
    print()

    # Check API endpoints
    print("3. Checking auth API endpoints:")
    print("-" * 60)
    required_endpoints = [
        '@router.post("/register"',
        '@router.post("/login"',
        '@router.get("/me"',
        '@router.post("/logout"'
    ]
    auth_api_path = "C:/Users/Hari/Desktop/NeuroVidya MIni Project/backend/app/api/auth.py"
    for endpoint in required_endpoints:
        if endpoint in Path(auth_api_path).read_text():
            print(f"[PASS] {endpoint} endpoint defined")
            results.append(True)
        else:
            print(f"[FAIL] {endpoint} endpoint NOT FOUND")
            results.append(False)
    print()

    # Check tests
    print("4. Checking auth tests:")
    print("-" * 60)
    required_tests = [
        "def test_register_user",
        "def test_login_user",
        "def test_invalid_login",
        "def test_get_me_without_token"
    ]
    test_auth_path = "C:/Users/Hari/Desktop/NeuroVidya MIni Project/backend/tests/test_auth.py"
    for test in required_tests:
        if test in Path(test_auth_path).read_text():
            print(f"[PASS] {test} test defined")
            results.append(True)
        else:
            print(f"[FAIL] {test} test NOT FOUND")
            results.append(False)
    print()

    # Check main.py imports
    print("5. Checking main.py configuration:")
    print("-" * 60)
    main_path = "C:/Users/Hari/Desktop/NeuroVidya MIni Project/backend/app/main.py"
    main_content = Path(main_path).read_text()
    if "from app.api.auth import router as auth_router" in main_content:
        print("[PASS] Auth router imported in main.py")
        results.append(True)
    else:
        print("[FAIL] Auth router NOT imported in main.py")
        results.append(False)

    if 'app.include_router(auth_router, prefix="/api/auth"' in main_content:
        print("[PASS] Auth router included with /api/auth prefix")
        results.append(True)
    else:
        print("[FAIL] Auth router NOT properly included")
        results.append(False)
    print()

    # Summary
    print("=" * 60)
    total = len(results)
    passed = sum(results)
    failed = total - passed
    print(f"SUMMARY: {passed}/{total} checks passed")
    if failed > 0:
        print(f"         {failed} checks failed")
        print()
        print("Status: FAILED - Some components are missing")
        return 1
    else:
        print()
        print("Status: SUCCESS - All components implemented correctly!")
        return 0

if __name__ == "__main__":
    sys.exit(main())
