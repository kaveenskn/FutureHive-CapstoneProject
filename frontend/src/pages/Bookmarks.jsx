import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../components/Firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { FaTrashAlt } from 'react-icons/fa';

const Bookmarks = () => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    if (!auth.currentUser) {
      setBookmarks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const snaps = await getDocs(collection(db, 'users', auth.currentUser.uid, 'bookmarks'));
      const docs = snaps.docs.map(s => ({ id: s.id, ...s.data() }));
      setBookmarks(docs);
    } catch (e) {
      console.error('Error fetching bookmarks', e);
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.currentUser?.uid]);

  const removeBookmark = async (id) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'bookmarks', id));
      setBookmarks(prev => prev.filter(b => b.id !== id));
    } catch (e) {
      console.error('Error deleting bookmark', e);
    }
  };

  if (loading) return <div className="p-6">Loading bookmarks…</div>;

  if (!auth.currentUser) return <div className="p-6">Please sign in to see your bookmarks.</div>;

  if (bookmarks.length === 0) return <div className="p-6">No bookmarks yet.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Your Bookmarks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bookmarks.map((b) => (
          <article key={b.id} className="bg-white rounded-lg p-4 shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{b.title || 'Untitled'}</h3>
                <p className="text-sm text-slate-600">{b.authors}</p>
                <p className="text-sm text-slate-700 mt-2 line-clamp-3">{b.description}</p>
                <div className="text-xs text-slate-500 mt-3">{b.university || ''} • {b.year || ''} • {b.type || ''}</div>
              </div>

              <div className="ml-4 flex flex-col items-end gap-2">
                <button
                  onClick={() => navigate('/chat', { state: { paper: b } })}
                  className="px-3 py-1 bg-sky-500 text-white rounded-md text-sm"
                >
                  Ask AI
                </button>

                <button
                  onClick={() => removeBookmark(b.id)}
                  title="Remove bookmark"
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Bookmarks;
