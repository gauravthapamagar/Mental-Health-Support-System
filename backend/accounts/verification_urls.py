from django.urls import path
from .verification_views import (
    get_verification_documents,
    upload_verification_document
)

urlpatterns = [
    path('verification/documents/', get_verification_documents, name='get-verification-documents'),
    path('verification/upload/', upload_verification_document, name='upload-verification-document'),
]

