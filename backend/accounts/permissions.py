from rest_framework import permissions


class IsPatient(permissions.BasePermission):
    """
    Permission to check if user is a patient
    """
    message = 'Only patients can perform this action.'
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'patient'


class IsTherapist(permissions.BasePermission):
    """
    Permission to check if user is a therapist
    """
    message = 'Only therapists can perform this action.'
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'therapist'


class IsOwner(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to access it.
    """
    
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return obj == request.user


class IsTherapistOrAdmin(permissions.BasePermission):
    """
    Permission to check if user is a therapist or admin
    """
    message = 'Only therapists or admins can perform this action.'
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['therapist', 'admin']
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    Assumes the model instance has an `author` or `user` attribute.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        # Check for both 'author' and 'user' attributes
        if hasattr(obj, 'author'):
            return obj.author == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False


class IsOwnerOrModerator(permissions.BasePermission):
    """
    Object-level permission to allow owners and moderators (therapists/admins) 
    to edit/delete content.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check if user is the owner
        is_owner = False
        if hasattr(obj, 'author'):
            is_owner = obj.author == request.user
        elif hasattr(obj, 'user'):
            is_owner = obj.user == request.user
        
        # Allow if owner or moderator
        is_moderator = request.user.role in ['therapist', 'admin']
        
        return is_owner or is_moderator