import { useState } from 'react';

export default function BookingHistoryButton({ bookings }) {
  const [showHistory, setShowHistory] = useState(false);

  const upcoming = bookings.filter(b => new Date(b.date) >= new Date());
  const past = bookings.filter(b => new Date(b.date) < new Date());

  return (
    <div className="relative">
      <a
        href="#"
        className="text-blue-600 underline hover:text-blue-800"
        onClick={(e) => {
          e.preventDefault();
          setShowHistory(!showHistory);
        }}
      >
        Booking History
      </a>

      {showHistory && (
        <div className="absolute z-10 mt-2 w-96 p-4 bg-white border border-gray-300 shadow-xl rounded-xl max-h-96 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-2">Upcoming Bookings</h2>
          {upcoming.length > 0 ? (
            <ul className="mb-4 list-disc pl-5 text-sm">
              {upcoming.map((b, i) => (
                <li key={i}>{b.date} - {b.unitName}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 mb-4">No upcoming bookings.</p>
          )}

          <h2 className="text-lg font-semibold mb-2">Past Bookings</h2>
          {past.length > 0 ? (
            <ul className="list-disc pl-5 text-sm">
              {past.map((b, i) => (
                <li key={i}>{b.date} - {b.unitName}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No past bookings.</p>
          )}

          <div className="flex justify-end mt-4">
            <button
              onClick={() => setShowHistory(false)}
              className="px-4 py-2 text-gray-600 hover:text-black"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
