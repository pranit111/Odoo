from rest_framework import serializers
from .models import WorkCenter
from django.contrib.auth import get_user_model

User = get_user_model()

class WorkCenterSerializer(serializers.ModelSerializer):
    """Serializer for WorkCenter model"""
    
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    daily_capacity_minutes = serializers.FloatField(source='get_daily_capacity_minutes', read_only=True)
    
    class Meta:
        model = WorkCenter
        fields = [
            'work_center_id', 'name', 'code', 'cost_per_hour', 
            'capacity_hours_per_day', 'description', 'location', 
            'is_active', 'created_by', 'created_by_name', 'created_at', 
            'updated_at', 'daily_capacity_minutes'
        ]
        read_only_fields = ['work_center_id', 'created_at', 'updated_at', 'created_by_name', 'daily_capacity_minutes']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class WorkCenterListSerializer(serializers.ModelSerializer):
    """Simplified serializer for work center lists"""
    
    class Meta:
        model = WorkCenter
        fields = [
            'work_center_id', 'name', 'code', 'cost_per_hour', 
            'capacity_hours_per_day', 'is_active'
        ]