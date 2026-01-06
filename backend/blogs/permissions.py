from rest_framework import permissions


class IsTherapistOrReadOnly(permissions.BasePermission):
    """
    Allow therapists to create/edit, everyone else can read
    """
    def has_permission(self, request, view):
        # Read permissions for everyone (including unauthenticated)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for authenticated therapists
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'therapist'
        )


class IsBlogAuthorOrReadOnly(permissions.BasePermission):
    """
    Allow blog author to edit their own posts, everyone else can read
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions for everyone
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for the author
        return obj.author == request.user


class CanApproveBlogs(permissions.BasePermission):
    """
    Only verified therapists and admins can approve blogs
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admins can always approve
        if request.user.role == 'admin' or request.user.is_staff:
            return True
        
        # Verified therapists can approve
        if request.user.role == 'therapist':
            if hasattr(request.user, 'therapist_profile'):
                return request.user.therapist_profile.is_verified
        
        return False


class IsVerifiedTherapist(permissions.BasePermission):
    """
    Check if user is a verified therapist
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.role != 'therapist':
            return False
        
        if hasattr(request.user, 'therapist_profile'):
            return request.user.therapist_profile.is_verified
        
        return False