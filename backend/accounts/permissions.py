from rest_framework import permissions


class IsPatient(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'patient'


class IsTherapist(permissions.BasePermission):
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'therapist'


class IsOwner(permissions.BasePermission):
    
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return obj == request.user