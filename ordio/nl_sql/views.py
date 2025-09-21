from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import logging

from .serializers import (
    NLQuerySerializer,
    NLQueryResponseSerializer,
    TableListResponseSerializer,
    TableSchemaSerializer,
    TableSchemaResponseSerializer,
    DatabaseSchemaResponseSerializer
)
from .nl_sql_engine import (
    nl_to_sql_execute,
    get_table_list,
    get_table_schema,
    get_db_schema
)

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def nl_to_sql(request):
    """
    Convert natural language query to SQL and execute it.
    
    This endpoint takes a natural language query and converts it to SQL using AI,
    then executes the query safely and returns the results.
    """
    serializer = NLQuerySerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    nl_query = serializer.validated_data['query']
    max_rows = serializer.validated_data.get('max_rows', 200)
    
    logger.info(f"NL to SQL request from user {request.user.username}: {nl_query}")
    
    try:
        result = nl_to_sql_execute(nl_query, max_rows=max_rows)
        
        response_data = {
            'sql': result.get('sql'),
            'columns': result.get('columns', []),
            'rows': result.get('rows', []),
            'row_count': result.get('row_count', 0),
            'error': result.get('error')
        }
        
        if result.get('error'):
            logger.warning(f"NL to SQL error for user {request.user.username}: {result.get('error')}")
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
        
        logger.info(f"NL to SQL success for user {request.user.username}: returned {result.get('row_count', 0)} rows")
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Unexpected error in nl_to_sql for user {request.user.username}: {str(e)}")
        return Response({
            'sql': None,
            'columns': [],
            'rows': [],
            'row_count': 0,
            'error': f"Internal server error: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_tables(request):
    """
    Get a list of all tables in the database.
    
    This endpoint returns all table names available in the database
    that can be queried using the NL to SQL functionality.
    """
    try:
        tables = get_table_list()
        logger.info(f"Table list request from user {request.user.username}: {len(tables)} tables found")
        
        return Response({
            'tables': tables
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error getting table list for user {request.user.username}: {str(e)}")
        return Response({
            'tables': [],
            'error': f"Failed to retrieve table list: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_table_info(request):
    """
    Get detailed schema information for a specific table.
    
    This endpoint returns column information including names, types,
    nullability, and default values for the specified table.
    """
    serializer = TableSchemaSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    table_name = serializer.validated_data['table_name']
    
    logger.info(f"Table schema request from user {request.user.username}: {table_name}")
    
    try:
        schema_info = get_table_schema(table_name)
        
        if schema_info.get('error'):
            logger.warning(f"Table schema error for user {request.user.username}: {schema_info.get('error')}")
            return Response(schema_info, status=status.HTTP_400_BAD_REQUEST)
        
        logger.info(f"Table schema success for user {request.user.username}: {table_name}")
        return Response(schema_info, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Unexpected error getting table schema for user {request.user.username}: {str(e)}")
        return Response({
            'table_name': table_name,
            'columns': [],
            'error': f"Internal server error: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_database_schema(request):
    """
    Get the complete database schema as formatted text.
    
    This endpoint returns the full database schema including all tables
    and their column information in a human-readable format.
    """
    try:
        schema = get_db_schema()
        logger.info(f"Database schema request from user {request.user.username}")
        
        return Response({
            'schema': schema,
            'error': None
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error getting database schema for user {request.user.username}: {str(e)}")
        return Response({
            'schema': '',
            'error': f"Failed to retrieve database schema: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
