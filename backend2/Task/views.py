from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils import timezone
from .models import Task
from .serializers import TaskSerializer

# ...existing code...

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.user != self.request.user:
            raise PermissionDenied("You don't have permission to edit this task")
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        """Delete a task"""
        task = self.get_object()
        
        # Ensure user owns the task
        if task.user != request.user:
            return Response(
                {"error": "Not authorized to delete this task"},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)