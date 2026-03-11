import { useState, useEffect, useCallback } from 'react';

interface Note {
  id: string;
  text: string;
  color: string;
  createdAt: number;
}

const COLORS = [
  '#fef08a', // yellow
  '#bbf7d0', // green
  '#bfdbfe', // blue
  '#fecaca', // red
  '#e9d5ff', // purple
  '#fed7aa', // orange
  '#99f6e4', // teal
  '#f9a8d4', // pink
];

const STORAGE_KEY = 'vntoolkit_sticky_notes';

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export default function StickyNotes() {
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const addNote = useCallback(() => {
    const newNote: Note = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text: '',
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      createdAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setEditingId(newNote.id);
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (editingId === id) setEditingId(null);
  }, [editingId]);

  const updateText = useCallback((id: string, text: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, text } : n)));
  }, []);

  const changeColor = useCallback((id: string, color: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, color } : n)));
  }, []);

  const clearAll = () => {
    if (notes.length === 0) return;
    setNotes([]);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="glass-card flex items-center justify-between gap-4 flex-wrap">
        <button onClick={addNote} className="btn-primary px-6">
          + Thêm ghi chú
        </button>
        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <span>{notes.length} ghi chú</span>
          {notes.length > 0 && (
            <button onClick={clearAll} className="btn-secondary text-xs px-3 py-1 text-red-400 hover:text-red-300">
              Xoá tất cả
            </button>
          )}
        </div>
      </div>

      {/* Notes grid */}
      {notes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl p-4 shadow-lg transition-transform hover:scale-[1.02] relative group"
              style={{ backgroundColor: note.color + 'cc', color: '#1a1a1a' }}
            >
              {/* Color picker */}
              <div className="flex gap-1 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => changeColor(note.id, c)}
                    className={`w-4 h-4 rounded-full border-2 transition-transform ${note.color === c ? 'border-gray-700 scale-125' : 'border-transparent hover:scale-110'
                      }`}
                    style={{ backgroundColor: c }}
                    title={`Màu ${c}`}
                  />
                ))}
              </div>

              {/* Text */}
              <textarea
                value={note.text}
                onChange={(e) => updateText(note.id, e.target.value)}
                onFocus={() => setEditingId(note.id)}
                onBlur={() => setEditingId(null)}
                placeholder="Nhập ghi chú..."
                className="w-full bg-transparent resize-none outline-none text-sm min-h-[80px] placeholder-gray-500"
                rows={4}
                autoFocus={editingId === note.id}
              />

              {/* Footer */}
              <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                <span>{new Date(note.createdAt).toLocaleDateString('vi-VN')}</span>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 text-base"
                  title="Xoá"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card text-center text-[var(--text-secondary)] py-12">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-sm">Chưa có ghi chú nào</p>
          <p className="text-xs mt-1">Nhấn "Thêm ghi chú" để bắt đầu</p>
        </div>
      )}
    </div>
  );
}
