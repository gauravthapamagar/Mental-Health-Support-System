from rest_framework import permissions


class IsPatient(permissions.BasePermission):
    """
    Custom permission to only allow patients to access patient-specific views.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'patient'


class IsTherapist(permissions.BasePermission):
    """
    Custom permission to only allow therapists to access therapist-specific views.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'therapist'


class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Check if the object has a user attribute and if it matches the request user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return obj == request.user