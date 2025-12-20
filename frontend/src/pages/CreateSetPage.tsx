import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Plus, Trash2, Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';

interface TermItem {
  term: string;
  definition: string;
  id: string; // temp id for UI
}

export const CreateSetPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [terms, setTerms] = useState<TermItem[]>([
    { id: '1', term: '', definition: '' },
    { id: '2', term: '', definition: '' },
    { id: '3', term: '', definition: '' },
  ]);
  const [saving, setSaving] = useState(false);

  const handleAddTerm = () => {
    setTerms([...terms, { id: Date.now().toString(), term: '', definition: '' }]);
  };

  const handleRemoveTerm = (index: number) => {
    const newTerms = [...terms];
    newTerms.splice(index, 1);
    setTerms(newTerms);
  };

  const handleTermChange = (index: number, field: 'term' | 'definition', value: string) => {
    const newTerms = [...terms];
    newTerms[index][field] = value;
    setTerms(newTerms);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert('Please enter a title');

    // Filter out empty terms
    const validTerms = terms.filter(t => t.term.trim() || t.definition.trim());
    if (validTerms.length < 2) return alert('Please add at least 2 terms');

    setSaving(true);
    try {
      await api.post('/sets', {
        title,
        description,
        terms: validTerms.map(({ term, definition }) => ({ term, definition }))
      });
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Failed to create set');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 sticky top-[72px] bg-gray-50/90 backdrop-blur-sm z-30 py-4 -mx-4 px-4 md:static md:bg-transparent md:p-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create new study set</h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
        >
          {saving ? 'Saving...' : <><Save size={18} /> Create</>}
        </button>
      </div>

      <div className="space-y-8">
        {/* Set Info */}
        <div className="glass-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-lg border-b-2 border-gray-300 focus:border-indigo-600 outline-none py-2 bg-transparent transition-colors placeholder-gray-400"
              placeholder='e.g., "Biology Chapter 1: The Cell"'
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border-b-2 border-gray-300 focus:border-indigo-600 outline-none py-2 bg-transparent transition-colors placeholder-gray-400 resize-none"
              placeholder="Add a description..."
              rows={2}
            />
          </div>
        </div>

        {/* Terms List */}
        <div className="space-y-6">
          {terms.map((item, index) => (
            <div key={item.id} className="glass-card p-6 group transition-all hover:shadow-lg relative">
              <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                <span className="text-gray-400 font-bold text-sm">#{index + 1}</span>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50">
                    <ImageIcon size={18} />
                  </button>
                  <button
                    onClick={() => handleRemoveTerm(index)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <input
                    value={item.term}
                    onChange={e => handleTermChange(index, 'term', e.target.value)}
                    className="w-full border-b-2 border-gray-200 focus:border-indigo-500 outline-none py-2 bg-transparent font-medium"
                    placeholder="Enter term"
                  />
                  <label className="block text-xs text-gray-400 mt-1 uppercase tracking-wide font-bold">Term</label>
                </div>
                <div>
                  <input
                    value={item.definition}
                    onChange={e => handleTermChange(index, 'definition', e.target.value)}
                    className="w-full border-b-2 border-gray-200 focus:border-indigo-500 outline-none py-2 bg-transparent"
                    placeholder="Enter definition"
                  />
                  <label className="block text-xs text-gray-400 mt-1 uppercase tracking-wide font-bold">Definition</label>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={handleAddTerm}
            className="w-full py-8 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all font-bold group"
          >
            <div className="bg-gray-100 group-hover:bg-indigo-100 p-3 rounded-full mb-2 transition-colors">
              <Plus size={24} />
            </div>
            + Add Card
          </button>
        </div>
      </div>
    </div>
  );
};
