from rest_framework import serializers


class NLQuerySerializer(serializers.Serializer):
    """
    Serializer for natural language query requests.
    """
    query = serializers.CharField(
        max_length=1000,
        help_text="Natural language query to convert to SQL"
    )
    max_rows = serializers.IntegerField(
        default=200,
        min_value=1,
        max_value=1000,
        help_text="Maximum number of rows to return (default: 200, max: 1000)"
    )


class NLQueryResponseSerializer(serializers.Serializer):
    """
    Serializer for natural language query responses.
    """
    sql = serializers.CharField(
        allow_null=True,
        help_text="Generated SQL query"
    )
    columns = serializers.ListField(
        child=serializers.CharField(),
        help_text="Column names from the query result"
    )
    rows = serializers.ListField(
        child=serializers.ListField(),
        help_text="Query result rows"
    )
    row_count = serializers.IntegerField(
        help_text="Number of rows returned"
    )
    error = serializers.CharField(
        allow_null=True,
        help_text="Error message if query failed"
    )


class TableListResponseSerializer(serializers.Serializer):
    """
    Serializer for table list response.
    """
    tables = serializers.ListField(
        child=serializers.CharField(),
        help_text="List of table names in the database"
    )


class TableSchemaSerializer(serializers.Serializer):
    """
    Serializer for table schema requests.
    """
    table_name = serializers.CharField(
        max_length=255,
        help_text="Name of the table to get schema for"
    )


class ColumnInfoSerializer(serializers.Serializer):
    """
    Serializer for column information.
    """
    name = serializers.CharField()
    type = serializers.CharField()
    nullable = serializers.BooleanField()
    default = serializers.CharField(allow_null=True)


class TableSchemaResponseSerializer(serializers.Serializer):
    """
    Serializer for table schema response.
    """
    table_name = serializers.CharField()
    columns = ColumnInfoSerializer(many=True)
    error = serializers.CharField(allow_null=True)


class DatabaseSchemaResponseSerializer(serializers.Serializer):
    """
    Serializer for full database schema response.
    """
    schema = serializers.CharField(
        help_text="Complete database schema as text"
    )
    error = serializers.CharField(
        allow_null=True,
        help_text="Error message if schema retrieval failed"
    )