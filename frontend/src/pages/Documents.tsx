import React, { useEffect, useState } from 'react';
import { DocumentService } from '../services/api';
import { FileText, Upload, Search, Database, CheckCircle, File, Sparkles } from 'lucide-react';

export const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      const data = await DocumentService.listDocuments();
      setDocuments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setUploading(true);
    try {
      await DocumentService.uploadDocument(file);
      await loadDocs();
    } catch (err) {
      console.error(err);
      alert("Failed to ingest document.");
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || searching) return;

    setSearching(true);
    try {
      const res = await DocumentService.searchDocuments(searchQuery);
      setSearchResults(res.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-darkbg-800 border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white">RAG Document & Vector Index Manager</h1>
          <p className="text-xs text-slate-400 mt-1">Upload PDF, DOCX, TXT, or MD documents. Automatic text chunking & ChromaDB embedding vector store.</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
          <Database className="w-5 h-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Dropzone */}
        <div className="p-6 rounded-2xl bg-darkbg-800 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Upload Files to RAG Pipeline</h3>
            <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, Markdown, Text</p>
          </div>

          <label className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer transition shadow-lg shadow-blue-500/20 inline-block">
            {uploading ? 'Processing & Chunking...' : 'Select File'}
            <input type="file" onChange={handleFileUpload} accept=".pdf,.docx,.txt,.md" className="hidden" disabled={uploading} />
          </label>
        </div>

        {/* Vector Search Inspector */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-darkbg-800 border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-400" /> Test Vector Similarity Search (ChromaDB)
          </h3>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query semantic document embeddings..."
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={searching || !searchQuery.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow transition disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Vector Search'}
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="space-y-2 mt-4 max-h-48 overflow-y-auto">
              {searchResults.map((res, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-blue-400 font-mono mb-1 text-[11px]">
                    <span>[{res.metadata?.filename || 'Document'} - Chunk {res.metadata?.chunk_index}]</span>
                    <span className="text-emerald-400 font-bold">Similarity Score: {res.score}</span>
                  </div>
                  <p className="text-slate-300 font-sans">{res.chunk_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Indexed Documents Table */}
      <div className="p-6 rounded-2xl bg-darkbg-800 border border-slate-800">
        <h2 className="text-base font-bold text-white mb-4">Indexed Knowledge Base Documents</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="p-3">Filename</th>
                <th className="p-3">Type</th>
                <th className="p-3">Size</th>
                <th className="p-3">Chunks Created</th>
                <th className="p-3">Indexing Status</th>
                <th className="p-3">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500">No documents indexed yet. Upload one above.</td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" /> {doc.filename}
                    </td>
                    <td className="p-3 uppercase text-slate-400">{doc.file_type.split('/')[1] || 'doc'}</td>
                    <td className="p-3">{Math.round(doc.file_size / 1024)} KB</td>
                    <td className="p-3 text-indigo-400 font-bold">{doc.chunk_count} chunks</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{new Date(doc.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
