'use client';

import { useState, useEffect } from 'react';
import { Trash2, Plus, Sparkles, Save } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('notes');
    if (saved) {
      setNotes(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('notes', JSON.stringify(notes));
    }
  }, [notes]);

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setCurrentNote(newNote);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map(note =>
      note.id === id
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    ));
    if (currentNote?.id === id) {
      setCurrentNote({ ...currentNote, ...updates, updatedAt: new Date().toISOString() });
    }
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    if (currentNote?.id === id) {
      setCurrentNote(null);
    }
  };

  const handleAiAssist = async () => {
    if (!aiPrompt || !currentNote) return;

    setAiLoading(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          context: currentNote.content,
        }),
      });

      const data = await response.json();

      if (data.result) {
        const newContent = currentNote.content + '\n\n' + data.result;
        updateNote(currentNote.id, { content: newContent });
      }
    } catch (error) {
      console.error('AI assist error:', error);
    }
    setAiLoading(false);
    setAiPrompt('');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNote}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            New Note
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notes.map(note => (
            <div
              key={note.id}
              onClick={() => setCurrentNote(note)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                currentNote?.id === note.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{note.title}</h3>
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {note.content || 'Empty note'}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  className="text-gray-400 hover:text-red-600 transition-colors ml-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {currentNote ? (
          <>
            <div className="p-6 border-b border-gray-200 bg-white">
              <input
                type="text"
                value={currentNote.title}
                onChange={(e) => updateNote(currentNote.id, { title: e.target.value })}
                className="text-3xl font-bold w-full outline-none text-gray-900"
                placeholder="Note title..."
              />
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <textarea
                value={currentNote.content}
                onChange={(e) => updateNote(currentNote.id, { content: e.target.value })}
                className="w-full h-full outline-none resize-none text-gray-800 text-lg"
                placeholder="Start writing your notes here..."
              />
            </div>

            {/* AI Assistant */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" size={20} />
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiAssist()}
                    placeholder="Ask AI to brainstorm, expand, or improve your notes..."
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={aiLoading}
                  />
                </div>
                <button
                  onClick={handleAiAssist}
                  disabled={aiLoading || !aiPrompt}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {aiLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles size={20} />
                  )}
                  AI Assist
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Save size={64} className="mx-auto mb-4 opacity-20" />
              <p className="text-xl">Select a note or create a new one to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
