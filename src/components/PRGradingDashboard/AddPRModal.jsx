import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

const PR_NUMBER_REGEX = /^\d+(?:\s*\+\s*\d+)*$/;
const GRADE_OPTIONS = ['Unsatisfactory', 'Okay', 'Exceptional', 'No Correct Image'];

function AddPRModal({ reviewer, onAdd, onCancel }) {
  const [prNumber, setPrNumber] = useState('');
  const [prNumberError, setPrNumberError] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [step, setStep] = useState(1); // 1: PR Number input, 2: Grade selection

  const validatePRNumber = value => {
    if (!value.trim()) {
      setPrNumberError('');
      return false;
    }
    if (!PR_NUMBER_REGEX.test(value.trim())) {
      setPrNumberError('Invalid format. Use format like "1234" or "1234 + 5678"');
      return false;
    }
    setPrNumberError('');
    return true;
  };

  const handlePRNumberChange = e => {
    const value = e.target.value;
    setPrNumber(value);
    if (value.trim()) {
      validatePRNumber(value);
    } else {
      setPrNumberError('');
    }
  };

  const handlePRNumberBlur = () => {
    if (prNumber.trim()) {
      validatePRNumber(prNumber);
    }
  };

  const handlePRNumberSubmit = e => {
    e.preventDefault();
    if (validatePRNumber(prNumber)) {
      setStep(2);
    }
  };

  const handleGradeSelect = grade => {
    setSelectedGrade(grade);
    // Automatically add on selection
    onAdd(reviewer, prNumber.trim(), grade);
    // Reset form
    setPrNumber('');
    setSelectedGrade('');
    setStep(1);
    setPrNumberError('');
  };

  const handleCancel = () => {
    setPrNumber('');
    setSelectedGrade('');
    setStep(1);
    setPrNumberError('');
    onCancel();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Add PR for {reviewer}</h3>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {step === 1 && (
        <form onSubmit={handlePRNumberSubmit}>
          <div className="mb-4">
            <label htmlFor="prNumber" className="block text-sm font-medium text-gray-700 mb-2">
              PR Number
            </label>
            <input
              id="prNumber"
              type="text"
              value={prNumber}
              onChange={handlePRNumberChange}
              onBlur={handlePRNumberBlur}
              placeholder="e.g., 1234 or 1234 + 5678"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                prNumberError
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {prNumberError && <p className="mt-1 text-sm text-red-600">{prNumberError}</p>}
            {!prNumberError && prNumber.trim() && (
              <p className="mt-1 text-sm text-green-600 flex items-center">
                <Check className="w-4 h-4 mr-1" />
                Valid format
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!prNumber.trim() || !!prNumberError}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              PR Number: <span className="font-semibold text-gray-800">{prNumber}</span>
            </p>
            <div className="block text-sm font-medium text-gray-700 mb-2">Select Grade</div>
            <div className="space-y-2">
              {GRADE_OPTIONS.map(grade => (
                <button
                  key={grade}
                  onClick={() => handleGradeSelect(grade)}
                  className={`w-full px-4 py-2 text-left border rounded-md transition-colors ${
                    selectedGrade === grade
                      ? 'bg-blue-100 border-blue-500 text-blue-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => {
                setStep(1);
                setSelectedGrade('');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddPRModal;
