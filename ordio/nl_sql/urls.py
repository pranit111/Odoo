from django.urls import path
from . import views

app_name = 'nl_sql'

urlpatterns = [
    path('execute/', views.nl_to_sql, name='nl_to_sql'),
    path('tables/', views.get_tables, name='get_tables'),
    path('table-schema/', views.get_table_info, name='get_table_info'),
    path('database-schema/', views.get_database_schema, name='get_database_schema'),
]