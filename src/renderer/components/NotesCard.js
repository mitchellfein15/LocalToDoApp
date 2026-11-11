import React, { useEffect, useMemo, useState } from 'react';
import ApiService from '../services/api';
import './WidgetCards.css';
import './NotesCard.css';

function formatRelativeTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function previewText(content, max = 90) {
  const cleaned = String(content || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'No content';
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max)}…`;
}

function NotesCard({ expanded = false }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)),
    [notes]
  );

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sortedNotes;
    return sortedNotes.filter((note) => {
      const haystack = `${note.title || ''} ${note.content || ''}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [sortedNotes, search]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getNotes();
      const list = data || [];
      setNotes(list);
      if (list.length > 0) {
        setSelectedId((prev) => {
          if (prev && list.some((note) => note.id === prev)) return prev;
          return list[0].id;
        });
      } else {
        setSelectedId(null);
      }
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
    setIsComposing(false);
  };

  const startNewNote = () => {
    setSelectedId(null);
    setEditingId(null);
    setTitle('');
    setContent('');
    setIsComposing(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }
    try {
      if (editingId) {
        const updated = await ApiService.updateNote(editingId, { title: title.trim(), content });
        setNotes((prev) => prev.map((note) => (note.id === editingId ? updated : note)));
        setSelectedId(updated.id);
      } else {
        const created = await ApiService.createNote({ title: title.trim(), content });
        setNotes((prev) => [created, ...prev]);
        setSelectedId(created.id);
      }
      resetDraft();
    } catch (error) {
      console.error('Failed to save note', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note? This cannot be undone.')) {
      return;
    }
    try {
      await ApiService.deleteNote(id);
      setNotes((prev) => {
        const next = prev.filter((note) => note.id !== id);
        if (selectedId === id) {
          setSelectedId(next[0] ? next[0].id : null);
        }
        return next;
      });
      if (editingId === id) {
        resetDraft();
      }
    } catch (error) {
      console.error('Failed to delete note', error);
    }
  };

  const handleEdit = (note) => {
    setSelectedId(note.id);
    setEditingId(note.id);
    setTitle(note.title || '');
    setContent(note.content || '');
    setIsComposing(true);
  };

  const handleSelect = (note) => {
    setSelectedId(note.id);
    if (expanded) {
      setEditingId(null);
      setIsComposing(false);
      setTitle('');
      setContent('');
    }
  };

  const selectedNote = sortedNotes.find((note) => note.id === selectedId) || null;
  const showEditor = !expanded || isComposing || Boolean(editingId);

  const renderEditor = (compact = false) => (
    <div className={`notes-editor ${compact ? 'compact' : ''}`}>
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
        rows={expanded ? 14 : 4}
      />
      <div className="notes-actions">
        <button type="button" className="notes-btn primary" onClick={handleSave}>
          {editingId ? 'Update' : 'Add Note'}
        </button>
        {(editingId || (expanded && isComposing)) && (
          <button type="button" className="notes-btn ghost" onClick={resetDraft}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );

  const renderNoteList = (items, { selectable = false, showActions = true } = {}) => (
    <div className={`notes-list ${expanded ? 'expanded-list' : 'compact-list'}`}>
      {items.length === 0 && (
        <div className="notes-empty">
          <p>{search.trim() ? 'No notes match your search.' : 'No notes yet.'}</p>
          {!search.trim() && expanded && (
            <button type="button" className="notes-btn primary" onClick={startNewNote}>
              New note
            </button>
          )}
        </div>
      )}
      {items.map((note) => (
        <div
          key={note.id}
          className={`note-item ${selectable && selectedId === note.id ? 'selected' : ''}`}
          onClick={selectable ? () => handleSelect(note) : undefined}
          onKeyDown={
            selectable
              ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleSelect(note);
                  }
                }
              : undefined
          }
          role={selectable ? 'button' : undefined}
          tabIndex={selectable ? 0 : undefined}
        >
          <div className="note-item-top">
            <h4>{note.title}</h4>
            <span className="note-meta">{formatRelativeTime(note.updated_at)}</span>
          </div>
          <p>{previewText(note.content, expanded ? 120 : 80)}</p>
          {showActions && (
            <div className="note-item-actions" onClick={(event) => event.stopPropagation()}>
              <button type="button" className="notes-btn ghost" onClick={() => handleEdit(note)}>
                Edit
              </button>
              <button type="button" className="notes-btn danger" onClick={() => handleDelete(note.id)}>
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  if (loading) {
    return <div className="widget-loading">Loading notes...</div>;
  }

  if (expanded) {
    return (
      <div className="notes-widget expanded">
        <div className="notes-page-header">
          <div>
            <h3 className="card-title notes-page-title">Notes</h3>
            <p className="notes-count">{sortedNotes.length} note{sortedNotes.length === 1 ? '' : 's'}</p>
          </div>
          <div className="notes-header-actions">
            <input
              type="search"
              className="notes-search"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="button" className="notes-btn primary" onClick={startNewNote}>
              New note
            </button>
          </div>
        </div>

        <div className="notes-master-detail">
          <aside className="notes-sidebar">
            {renderNoteList(filteredNotes, { selectable: true, showActions: false })}
          </aside>

          <section className="notes-detail">
            {showEditor ? (
              <>
                <div className="notes-detail-header">
                  <h4>{editingId ? 'Edit note' : 'New note'}</h4>
                </div>
                {renderEditor(false)}
              </>
            ) : selectedNote ? (
              <>
                <div className="notes-detail-header">
                  <div>
                    <h4>{selectedNote.title}</h4>
                    <span className="note-meta">
                      Updated {formatRelativeTime(selectedNote.updated_at)}
                    </span>
                  </div>
                  <div className="note-item-actions">
                    <button
                      type="button"
                      className="notes-btn ghost"
                      onClick={() => handleEdit(selectedNote)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="notes-btn danger"
                      onClick={() => handleDelete(selectedNote.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="notes-detail-body">
                  {selectedNote.content || <span className="notes-placeholder">No content</span>}
                </div>
              </>
            ) : (
              <div className="notes-empty detail-empty">
                <p>Select a note or create a new one.</p>
                <button type="button" className="notes-btn primary" onClick={startNewNote}>
                  New note
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-widget compact">
      {renderEditor(true)}
      {renderNoteList(sortedNotes.slice(0, 8), { selectable: false, showActions: true })}
    </div>
  );
}

export default NotesCard;
