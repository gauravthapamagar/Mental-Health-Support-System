from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import VerificationDocument
from .serializers import VerificationDocumentSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_verification_documents(request):
    """Get verification documents for authenticated therapist"""
    try:
        therapist_profile = request.user.therapist_profile
    except:
        return Response(
            {'error': 'User is not a therapist'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    documents = VerificationDocument.objects.filter(
        therapist_profile=therapist_profile
    )
    serializer = VerificationDocumentSerializer(
        documents, 
        many=True, 
        context={'request': request}
    )
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes((MultiPartParser, FormParser))  # ADD THIS LINE
def upload_verification_document(request):
    """Upload verification document for therapist"""
    try:
        print("[v0] Request data:", request.data)
        print("[v0] Request files:", request.FILES)
        
        # Get the file from request
        document_file = request.FILES.get('document_file')
        document_type = request.data.get('document_type')
        
        if not document_file:
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not document_type:
            return Response(
                {'error': 'No document_type provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get therapist profile
        therapist_profile = request.user.therapist_profile
        
        # Check if document already exists for this type
        existing_doc = VerificationDocument.objects.filter(
            therapist_profile=therapist_profile,
            document_type=document_type
        ).first()
        
        if existing_doc:
            # Update existing document
            existing_doc.document_file = document_file
            existing_doc.is_verified = False
            existing_doc.verified_at = None
            existing_doc.verified_by = None
            existing_doc.save()
            doc = existing_doc
        else:
            # Create new document
            doc = VerificationDocument.objects.create(
                therapist_profile=therapist_profile,
                document_type=document_type,
                document_file=document_file
            )
        
        serializer = VerificationDocumentSerializer(
            doc, 
            context={'request': request}
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print("[v0] Upload error:", str(e))
        import traceback
        traceback.print_exc()
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )