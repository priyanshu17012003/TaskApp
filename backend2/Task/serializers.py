from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'effort_days',
            'due_date',
            'created_at',
            'updated_at',
            'user'
        ]

    def validate_due_date(self, value):
        """
        Validate that due_date is not in the past
        """
        from django.utils import timezone
        if value < timezone.now().date():
            raise serializers.ValidationError("Due date cannot be in the past")
        return value