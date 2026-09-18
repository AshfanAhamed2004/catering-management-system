import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { api } from '../api';

export const AdminFeedback = () => {
  const [feedback, setFeedback] = useState<any[]>([]);

  useEffect(() => {
    api.get('/api/feedback').then(res => setFeedback(res.data)).catch(console.error);
  }, []);

  return (
    <AdminLayout title="Customer Feedback">
      <div className="grid gap-6">
        {feedback.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-gray-800">{item.title || 'Event Feedback'}</h3>
                <p className="text-sm text-gray-500">Rating: {item.rating || 5}/5</p>
              </div>
              <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded">Needs Response</span>
            </div>
            <p className="text-gray-700 italic mb-4">"{item.comments || item.content}"</p>
            <div className="border-t border-gray-100 pt-4 flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">Reply to Client</button>
            </div>
          </div>
        ))}
        {feedback.length === 0 && <p className="text-gray-500">No feedback submitted yet.</p>}
      </div>
    </AdminLayout>
  );
};