import { useState } from 'react';

export default function ContactHostButton() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSend = () => {
    // replace to real email api
    alert(`Message sent!\n\nName: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`);
    setShowForm(false);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="relative">
      <a
        href="#"
        className="text-blue-600 underline hover:text-blue-800"
        onClick={(e) => {
          e.preventDefault();
          setShowForm(!showForm);
        }}
      >
        Contact Host
      </a>

      {showForm && (
        <div className="absolute z-10 mt-2 w-96 p-4 bg-white border border-gray-300 shadow-xl rounded-xl">
          <h2 className="text-lg font-semibold mb-2">Send a message to the host</h2>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            className="w-full mb-2 p-2 border rounded"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            className="w-full mb-2 p-2 border rounded"
            value={formData.email}
            onChange={handleChange}
          />
          <textarea
            name="message"
            placeholder="Write your message..."
            className="w-full mb-2 p-2 border rounded"
            rows="4"
            value={formData.message}
            onChange={handleChange}
          ></textarea>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-600 hover:text-black"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-blue-600 text-blue rounded hover:bg-blue-700 min-w-[80px] shadow font-semibold"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
