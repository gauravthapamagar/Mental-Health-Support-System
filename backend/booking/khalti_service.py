# ============================================================
# FILE: backend/booking/khalti_service.py  (NEW FILE)
# ============================================================
# Service class that wraps Khalti e-Payment Gateway API v2.
# Handles initiating payments and verifying (looking up) payments.
#
# Khalti API docs: https://docs.khalti.com/khalti-epayment/
# ============================================================

import requests
from django.conf import settings


class KhaltiService:
    """
    Khalti e-Payment Gateway integration service.

    Required in settings.py:
        KHALTI_SECRET_KEY = "your-secret-key"   # live or test key
        KHALTI_BASE_URL = "https://a.khalti.com/api/v2"  # production
        # For testing use: "https://a.khalti.com/api/v2" with test secret key

    Test credentials (Khalti sandbox):
        Secret Key: Use the test secret key from your Khalti merchant dashboard
        Test Khalti ID: 9800000000 (or any 10-digit number)
        Test MPIN: 1111
        Test OTP: 987654
    """

    def __init__(self):
        self.secret_key = getattr(settings, 'KHALTI_SECRET_KEY', '')
        self.base_url = getattr(
            settings,
            'KHALTI_BASE_URL',
            'https://a.khalti.com/api/v2'
        )
        self.headers = {
            'Authorization': f'key {self.secret_key}',
            'Content-Type': 'application/json',
        }

    def initiate_payment(
        self,
        amount,
        purchase_order_id,
        purchase_order_name,
        return_url,
        website_url,
        customer_info=None
    ):
        """
        Initiate a Khalti payment.

        Args:
            amount (int): Amount in PAISA (1 NPR = 100 paisa). Min 1000 (Rs. 10), Max 100000 (Rs. 1000).
            purchase_order_id (str): Unique order ID (e.g., "APT-123")
            purchase_order_name (str): Description shown to user
            return_url (str): URL where Khalti redirects after payment
            website_url (str): Your website URL
            customer_info (dict, optional): {name, email, phone}

        Returns:
            dict: {success: bool, data: {...}, error: str|None}
                  On success, data contains 'pidx' and 'payment_url'
        """
        payload = {
            'return_url': return_url,
            'website_url': website_url,
            'amount': amount,
            'purchase_order_id': str(purchase_order_id),
            'purchase_order_name': purchase_order_name,
        }

        if customer_info:
            payload['customer_info'] = customer_info

        try:
            response = requests.post(
                f'{self.base_url}/epayment/initiate/',
                json=payload,
                headers=self.headers,
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'data': data,   # Contains: pidx, payment_url, expires_at, expires_in
                    'error': None
                }
            else:
                return {
                    'success': False,
                    'data': None,
                    'error': response.json() if response.text else f'HTTP {response.status_code}'
                }

        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'data': None,
                'error': str(e)
            }

    def verify_payment(self, pidx):
        """
        Verify/lookup a Khalti payment by pidx.

        Args:
            pidx (str): The payment identifier returned during initiation

        Returns:
            dict: {success: bool, data: {...}, error: str|None}
                  On success, data contains status, transaction_id, etc.
        """
        try:
            response = requests.post(
                f'{self.base_url}/epayment/lookup/',
                json={'pidx': pidx},
                headers=self.headers,
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'data': data,
                    'error': None
                }
            else:
                return {
                    'success': False,
                    'data': None,
                    'error': response.json() if response.text else f'HTTP {response.status_code}'
                }

        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'data': None,
                'error': str(e)
            }
