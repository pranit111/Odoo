import React, { useState } from 'react';
import { Send, Database, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { executeNLQuery } from '../services/apiClient';

interface QueryResult {
  sql: string;
  columns: string[];
  rows: any[][];
  error: string | null;
}

const NLToSQL: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ query: string; result: QueryResult }[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await executeNLQuery(query);
      setResult(response);
      setHistory(prev => [{ query, result: response }, ...prev.slice(0, 4)]); // Keep last 5 queries
    } catch (error) {
      console.error('Error executing query:', error);
      setResult({
        sql: '',
        columns: [],
        rows: [],
        error: 'Failed to execute query. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (historyItem: { query: string; result: QueryResult }) => {
    setQuery(historyItem.query);
    setResult(historyItem.result);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Database className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Natural Language to SQL</h1>
        </div>
        <p className="text-gray-600">
          Ask questions about your data in plain English and get SQL queries with results
        </p>
      </div>

      {/* Query Input */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Show me the top 10 customers by order value"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {loading ? 'Processing...' : 'Execute'}
          </button>
        </div>
      </form>

      {/* History */}
      {history.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Recent Queries</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {history.map((item, index) => (
              <button
                key={index}
                onClick={() => handleHistoryClick(item)}
                className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border text-sm"
              >
                <div className="truncate text-gray-800">{item.query}</div>
                <div className="flex items-center gap-1 mt-1">
                  {item.result.error ? (
                    <AlertCircle className="h-3 w-3 text-red-500" />
                  ) : (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  )}
                  <span className="text-xs text-gray-500">
                    {item.result.error ? 'Error' : `${item.result.rows.length} rows`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Generated SQL */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Database className="h-4 w-4" />
              Generated SQL
            </h3>
            <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
              {result.sql || 'No SQL generated'}
            </pre>
          </div>

          {/* Error */}
          {result.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="font-semibold">Error</span>
              </div>
              <p className="text-red-700 mt-1">{result.error}</p>
            </div>
          )}

          {/* Results Table */}
          {!result.error && result.columns.length > 0 && (
            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Query Results ({result.rows.length} rows)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {result.columns.map((column, index) => (
                        <th
                          key={index}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {result.rows.slice(0, 100).map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-3 text-sm text-gray-900">
                            {cell !== null ? String(cell) : <span className="text-gray-400 italic">null</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {result.rows.length > 100 && (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    Showing first 100 rows of {result.rows.length} total results
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Example Queries */}
      {!result && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold mb-3 text-blue-900">Example Queries</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Show me the top 10 customers by total order value",
              "What are the most popular products this month?",
              "List all orders placed in the last 7 days",
              "Which products have low stock levels?",
              "Show revenue trends by month",
              "Find customers who haven't ordered in 90 days"
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setQuery(example)}
                className="text-left p-3 bg-white hover:bg-blue-100 rounded border border-blue-200 text-sm text-blue-800"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NLToSQL;