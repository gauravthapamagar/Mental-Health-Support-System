# ============================================================
# FILE: backend/booking/views_payment.py  (NEW FILE)
# ============================================================
# Three views:
#   1. initiate_payment  - Patient initiates Khalti payment
#   2. verify_payment    - Called after Khalti redirect to verify
#   3. payment_status    - Check payment status for an appointment
# ============================================================

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.conf import settings

from accounts.permissions import IsPatient
from .models import Appointment, Payment, AppointmentHistory
from .khalti_service import KhaltiService
from .serializers import PaymentSerializer  # Add to your existing serializers imports


# ──────────────────────────────────────────────
# 1. INITIATE PAYMENT
# ──────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsPatient])
def initiate_payment(request):
    """
    Patient initiates a Khalti payment for an awaiting_payment appointment.

    POST /api/booking/payments/initiate/
    Body: { "appointment_id": 123 }

    Returns: { payment_url, pidx, payment_id }
    """
    appointment_id = request.data.get('appointment_id')

    if not appointment_id:
        return Response(
            {'error': 'appointment_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Get the appointment
    appointment = get_object_or_404(
        Appointment,
        id=appointment_id,
        patient=request.user
    )

    # Validate status
    if appointment.status != 'awaiting_payment':
        return Response(
            {'error': f'Appointment is not awaiting payment. Current status: {appointment.status}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Only online appointments need payment
    if appointment.session_mode != 'online':
        return Response(
            {'error': 'Payment is only required for online consultations'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if payment already exists and is not failed/expired
    existing_payment = Payment.objects.filter(
        appointment=appointment,
        status__in=['initiated', 'completed']
    ).first()

    if existing_payment and existing_payment.status == 'completed':
        return Response(
            {'error': 'Payment has already been completed for this appointment'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Get fee from therapist profile (in NPR, convert to paisa)
    therapist_profile = appointment.therapist.therapist_profile
    fee_npr = float(therapist_profile.consultation_fees or 0)

    if fee_npr <= 0:
        return Response(
            {'error': 'Therapist has not set a consultation fee'},
            status=status.HTTP_400_BAD_REQUEST
        )

    amount_paisa = int(fee_npr * 100)

    # Build return URL (frontend payment verification page)
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    return_url = f"{frontend_url}/patient/appointments/payment/verify"

    website_url = frontend_url

    # Initialize Khalti service
    khalti = KhaltiService()
    result = khalti.initiate_payment(
        amount=amount_paisa,
        purchase_order_id=f"APT-{appointment.id}",
        purchase_order_name=f"Consultation with {appointment.therapist.full_name}",
        return_url=return_url,
        website_url=website_url,
        customer_info={
            'name': request.user.full_name,
            'email': request.user.email,
            'phone': request.user.phone_number,
        }
    )

    if not result['success']:
        return Response(
            {'error': 'Failed to initiate payment', 'details': result['error']},
            status=status.HTTP_502_BAD_GATEWAY
        )

    # Create or update payment record
    if existing_payment and existing_payment.status == 'initiated':
        # Update the existing initiated payment
        existing_payment.khalti_pidx = result['data']['pidx']
        existing_payment.amount = amount_paisa
        existing_payment.khalti_response = result['data']
        existing_payment.save()
        payment = existing_payment
    else:
        payment = Payment.objects.create(
            appointment=appointment,
            patient=request.user,
            khalti_pidx=result['data']['pidx'],
            amount=amount_paisa,
            status='initiated',
            khalti_response=result['data']
        )

    return Response({
        'payment_url': result['data']['payment_url'],
        'pidx': result['data']['pidx'],
        'payment_id': payment.id,
        'amount': amount_paisa,
        'amount_display': f"Rs. {fee_npr:.2f}",
    }, status=status.HTTP_200_OK)


# ──────────────────────────────────────────────
# 2. VERIFY PAYMENT
# ──────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsPatient])
def verify_payment(request):
    """
    Verify a Khalti payment after redirect.

    POST /api/booking/payments/verify/
    Body: { "pidx": "...", "appointment_id": 123 }

    After Khalti redirects user back, the frontend calls this
    with the pidx from the URL query params.
    """
    pidx = request.data.get('pidx')
    appointment_id = request.data.get('appointment_id')

    if not pidx or not appointment_id:
        return Response(
            {'error': 'pidx and appointment_id are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Find payment record
    payment = get_object_or_404(Payment, khalti_pidx=pidx)

    # Verify the payment belongs to this user
    if payment.patient != request.user:
        return Response(
            {'error': 'Unauthorized'},
            status=status.HTTP_403_FORBIDDEN
        )

    # If already completed, return success
    if payment.status == 'completed':
        return Response({
            'message': 'Payment already verified',
            'payment': PaymentSerializer(payment).data,
            'appointment_status': payment.appointment.status
        }, status=status.HTTP_200_OK)

    # Verify with Khalti
    khalti = KhaltiService()
    result = khalti.verify_payment(pidx)

    if not result['success']:
        payment.status = 'failed'
        payment.khalti_response = result.get('error')
        payment.save()
        return Response(
            {'error': 'Payment verification failed', 'details': result['error']},
            status=status.HTTP_400_BAD_REQUEST
        )

    khalti_data = result['data']
    khalti_status = khalti_data.get('status', '').lower()

    if khalti_status == 'completed':
        # Payment successful
        payment.status = 'completed'
        payment.khalti_transaction_id = khalti_data.get('transaction_id')
        payment.khalti_response = khalti_data
        payment.completed_at = timezone.now()
        payment.save()

        # Move appointment from awaiting_payment -> confirmed
        appointment = payment.appointment
        old_status = appointment.status
        appointment.status = 'confirmed'
        appointment.save()

        # Create history entry
        AppointmentHistory.objects.create(
            appointment=appointment,
            changed_by=request.user,
            action='payment_completed',
            old_status=old_status,
            new_status='confirmed',
            notes=f'Khalti payment completed. Transaction ID: {khalti_data.get("transaction_id")}'
        )

        return Response({
            'message': 'Payment verified successfully',
            'payment': PaymentSerializer(payment).data,
            'appointment_status': 'confirmed'
        }, status=status.HTTP_200_OK)

    elif khalti_status in ['pending', 'initiated']:
        return Response({
            'message': 'Payment is still processing',
            'payment_status': khalti_status
        }, status=status.HTTP_202_ACCEPTED)

    else:
        # Payment failed/expired/etc
        payment.status = 'failed'
        payment.khalti_response = khalti_data
        payment.save()

        return Response({
            'error': f'Payment was not successful. Khalti status: {khalti_status}',
            'payment_status': khalti_status
        }, status=status.HTTP_400_BAD_REQUEST)


# ──────────────────────────────────────────────
# 3. PAYMENT STATUS
# ──────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_status(request, appointment_id):
    """
    Get payment status for an appointment.

    GET /api/booking/payments/status/<appointment_id>/
    """
    appointment = get_object_or_404(Appointment, id=appointment_id)

    # Check permission
    if request.user.role == 'patient' and appointment.patient != request.user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    if request.user.role == 'therapist' and appointment.therapist != request.user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    try:
        payment = appointment.payment
        return Response({
            'has_payment': True,
            'payment': PaymentSerializer(payment).data
        }, status=status.HTTP_200_OK)
    except Payment.DoesNotExist:
        return Response({
            'has_payment': False,
            'payment': None
        }, status=status.HTTP_200_OK)
