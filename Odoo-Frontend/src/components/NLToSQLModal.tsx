import React, { useState } from 'react';
import { X } from 'lucide-react';
import NLToSQL from '../pages/NLToSQL';

const NLToSQLModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      {/* Smart Query Button */}
      <button
        onClick={openModal}
        className="fixed bottom-6 right-6 bg-black hover:bg-gray-800 text-white px-4 py-3 rounded-md shadow-lg transition-all duration-300 hover:shadow-xl z-40 text-sm font-medium"
        title="Open Smart Query"
      >
        Smart Query
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <h2 className="text-xl font-bold text-gray-900">Smart Query</h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto bg-gray-100">
                <NLToSQL />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NLToSQLModal;