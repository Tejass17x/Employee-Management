import React, { useState, useEffect } from 'react';
import { FileText, Download, Plus, Loader2, UploadCloud } from 'lucide-react';
import api from '../../services/api';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Form State
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('PDF/Contract');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employee/documents');
      setDocuments(res.data);
    } catch (e) {
      console.error('Error fetching documents:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    try {
      setUploadLoading(true);
      await api.post('/employee/documents', {
        file_name: fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`,
        file_type: fileType
      });
      alert('Document uploaded successfully (mock simulation)!');
      setFileName('');
      fetchDocuments();
    } catch (error) {
      alert('Upload failed.');
    } finally {
      setUploadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-slate-400">
        <Loader2 className="animate-spin mr-2" size={24} /> Loading Documents...
      </div>
    );
  }

  return (
    <div className="text-white font-sans pb-10 flex flex-col gap-6">
      
      {/* Upload and list row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Form Card (1 Col) */}
        <div className="bg-[#12192b] p-6 rounded-2xl border border-slate-800 h-fit">
          <h3 className="text-base font-bold mb-4">Upload Document</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-2">FILE NAME</label>
              <input 
                type="text" 
                required
                placeholder="e.g. passport_scan"
                value={fileName}
                onChange={e => setFileName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0a0f1c] border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-2">DOCUMENT TYPE</label>
              <select 
                value={fileType} 
                onChange={e => setFileType(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0a0f1c] border border-slate-800 rounded-lg outline-none focus:border-blue-500 text-sm"
              >
                <option value="PDF/Contract">Employment Contract</option>
                <option value="PDF/Finance">Tax & Finance Forms</option>
                <option value="PDF/Identification">ID Proof (Passport/SSN)</option>
                <option value="PDF/Certification">Skill Certification</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={uploadLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {uploadLoading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />} Upload Document
            </button>
          </form>
        </div>

        {/* Documents Directory (2 Cols) */}
        <div className="lg:col-span-2 bg-[#12192b] p-6 rounded-2xl border border-slate-800">
          <h3 className="text-base font-bold mb-6">Uploaded Files Directory</h3>
          {documents.length === 0 ? (
            <p className="text-xs text-slate-500 py-10 text-center">No documents found in directory.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-[#0a0f1c] p-4 rounded-xl border border-slate-800/80 flex items-center justify-between group hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400"><FileText size={20} /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-200 truncate max-w-[150px] md:max-w-[200px]" title={doc.file_name}>{doc.file_name}</p>
                      <p className="text-[10px] text-slate-500">{doc.file_type} • {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => alert(`Downloading: ${doc.file_name}`)}
                    className="p-2 bg-slate-800 hover:bg-blue-600 rounded-lg text-slate-400 hover:text-white transition-all"
                    title="Download"
                  >
                    <Download size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Documents;
