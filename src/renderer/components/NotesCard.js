import React, { useEffect, useMemo, useState } from 'react';
import ApiService from '../services/api';
import './WidgetCards.css';

function NotesCard({ expanded = false }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)),
    [notes]
  );

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getNotes();
      setNotes(data || []);
    } catch (error) {
      console.error('Failed to load notes', error);
    } finally {
      setLoading(false);
    }
  };

  const resetDraft = () => {
    setTitle('');
    setContent('');
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }
    try {
      if (editingId) {
        const updated = await ApiService.updateNote(editingId, { title: title.trim(), content });
        setNotes(notes.map((note) => (note.id === editingId ? updated : note)));
      } else {
        const created = await ApiService.createNote({ title: title.trim(), content });
        setNotes([created, ...notes]);
      }
      resetDraft();
    } catch (error) {
      console.error('Failed to save note', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await ApiService.deleteNote(id);
      setNotes(notes.filter((note) => note.id !== id));
      if (editingId === id) {
        resetDraft();
      }
    } catch (error) {
      console.error('Failed to delete note', error);
    }
  };

  const handleEdit = (note) => {
    setEditingId(note.id);
    setTitle(note.title || '');
    setContent(note.content || '');
  };

  return (
    <div className={`notes-widget ${expanded ? 'expanded' : ''}`}>
      <div className="notes-editor">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="notes-title-input"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note..."
          className="notes-content-input"
          rows={expanded ? 7 : 4}
        />
        <div className="notes-actions">
          <button onClick={handleSave}>{editingId ? 'Update' : 'Add Note'}</button>
          {editingId && <button onClick={resetDraft}>Cancel</button>}
        </div>
      </div>

      {loading ? (
        <div className="widget-loading">Loading notes...</div>
      ) : (
        <div className="notes-list">
          {sortedNotes.length === 0 && <p className="empty-text">No notes yet.</p>}
          {sortedNotes.map((note) => (
            <div key={note.id} className="note-item">
              <h4>{note.title}</h4>
              <p>{note.content}</p>
              <div className="note-item-actions">
                <button onClick={() => handleEdit(note)}>Edit</button>
                <button onClick={() => handleDelete(note.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotesCard;
