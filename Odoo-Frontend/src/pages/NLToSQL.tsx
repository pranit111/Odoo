import React, { useState } from 'react';
import { Loader, AlertCircle, CheckCircle } from 'lucide-react';
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
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Smart Query</h2>
            <p className="text-gray-600">
              Ask questions about your inventory, orders, and manufacturing data in natural language
            </p>
          </div>
        </div>

        {/* Query Input */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about your products, orders, manufacturing data..."
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Query'}
            </button>
          </div>
        </form>

        {/* History */}
        {history.length > 0 && (
          <div className="mb-6">
            <h3 className="text-base font-semibold mb-3 text-gray-900">Recent Queries</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {history.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(item)}
                  className="text-left p-3 bg-white hover:bg-gray-50 rounded-md border border-gray-200 text-sm transition-colors"
                >
                  <div className="truncate text-gray-800 font-medium">{item.query}</div>
                  <div className="flex items-center gap-1 mt-2">
                    {item.result.error ? (
                      <AlertCircle className="h-3 w-3 text-red-600" />
                    ) : (
                      <CheckCircle className="h-3 w-3 text-green-600" />
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
          <div className="space-y-6">
            {/* Generated SQL */}
            {/* <div className="bg-white rounded-md border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">
                  Generated Query
                </h3>
              </div>
              <div className="p-4">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-md text-sm overflow-x-auto font-mono">
                  {result.sql || 'No SQL generated'}
                </pre>
              </div>
            </div> */}

            {/* Error */}
            {result.error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-semibold">Error</span>
                </div>
                <p className="text-red-700 mt-1">{result.error}</p>
              </div>
            )}

            {/* Results Table */}
            {!result.error && result.columns.length > 0 && (
              <div className="bg-white rounded-md border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Results ({result.rows.length} rows)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        {result.columns.map((column, index) => (
                          <th
                            key={index}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.slice(0, 100).map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
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
                    <div className="p-4 text-center text-gray-500 text-sm bg-gray-50">
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
          <div className="bg-white rounded-md border border-gray-200 p-6">
            <h3 className="font-semibold mb-4 text-gray-900">Example Queries</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Show me products with critically low stock levels",
                "What manufacturing orders are behind schedule?",
                "Find my most profitable products this quarter",
                "Which work centers have the highest utilization?",
                "Show me BOMs that use expensive components",
                "Analyze production efficiency trends"
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(example)}
                  className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 text-sm text-gray-800 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NLToSQL;