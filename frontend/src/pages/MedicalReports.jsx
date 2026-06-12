import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Trash2, 
  AlertCircle, 
  Loader2, 
  HeartPulse, 
  Plus, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const MedicalReports = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const fetchReports = async () => {
    try {
      setError('');
      const res = await api.get('/medical-reports');
      setReports(res.data);
      // Keep selected report updated if it exists in the list
      if (selectedReport) {
        const updated = res.data.find(r => r._id === selectedReport._id);
        if (updated) setSelectedReport(updated);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch report history.');
      toast.error('Failed to load report history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    // Validate file type
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      toast.error('Only PDF files are supported.');
      return;
    }

    // Validate size (10 MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size exceeds the 10 MB limit.');
      return;
    }

    setProcessing(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/medical-reports/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      toast.success('Report processed successfully');
      setSelectedReport(res.data);
      await fetchReports();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to process report.';
      toast.error(msg);
    } finally {
      setProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this report analysis?')) return;

    try {
      await api.delete(`/medical-reports/${id}`);
      toast.success('Report deleted successfully');
      if (selectedReport?._id === id) {
        setSelectedReport(null);
      }
      fetchReports();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete report.');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      <header className="mb-4">
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
          <FileText className="text-sky-600 w-8 h-8 md:w-10 md:h-10" />
          Medical Report Simplifier
        </h1>
        <p className="text-text-secondary mt-1">
          Upload complex PDF medical reports to extract, analyze, and translate clinical terms into patient-friendly summaries.
        </p>
      </header>

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sidebar/List Section */}
        <div className="md:col-span-1 space-y-4">
          <div className="glass-card p-4 flex flex-col h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-text-sky">History</h2>
              <button 
                onClick={() => setSelectedReport(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-full text-xs font-bold hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> New Report
              </button>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
              </div>
            ) : error ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                <p className="text-sm text-text-secondary">{error}</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-text-secondary">
                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-sm font-medium">No reports uploaded yet.</p>
                <p className="text-xs text-text-secondary mt-1">Your uploaded reports history will appear here.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {reports.map((report) => (
                  <div 
                    key={report._id}
                    onClick={() => setSelectedReport(report)}
                    className={`p-3 rounded-xl cursor-pointer border transition-all duration-200 flex items-start justify-between gap-2 group ${
                      selectedReport?._id === report._id 
                        ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800' 
                        : 'border-transparent bg-surface hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex gap-2 min-w-0">
                      <FileText className={`w-5 h-5 shrink-0 mt-0.5 ${selectedReport?._id === report._id ? 'text-sky-600' : 'text-text-secondary'}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-text-sky truncate">{report.fileName}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-text-secondary">
                          <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {formatDate(report.createdAt)}</span>
                          <span>•</span>
                          <span>{formatBytes(report.fileSize)}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(e, report._id)}
                      className="text-text-secondary hover:text-red-500 p-1 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action/Content Section */}
        <div className="md:col-span-2">
          <AnimatePresence mode="wait">
            {processing ? (
              // Processing Loader Card
              <motion.div 
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-6 h-full min-h-[500px]"
              >
                <div className="flex items-center gap-3 text-sky-600 dark:text-sky-400">
                  <HeartPulse className="w-12 h-12 animate-pulse" />
                  <h1 className="text-3xl font-bold tracking-tight">Aurora</h1>
                </div>
                <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                  <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
                  <p className="text-base font-semibold text-text-sky">Analyzing your medical report...</p>
                  
                  {uploadProgress > 0 && (
                    <div className="w-full">
                      <div className="w-full bg-surface rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-sky-600 h-2.5 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-text-secondary mt-1.5 font-medium">
                        {uploadProgress === 100 ? 'Analyzing with Groq AI...' : `Uploading: ${uploadProgress}%`}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : selectedReport ? (
              // Analysis Output Card
              <motion.div
                key="analysis"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="glass-card p-6 md:p-8 space-y-6 h-full min-h-[500px] flex flex-col"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border-color">
                  <div>
                    <h2 className="text-2xl font-bold text-text-sky">Health Summary</h2>
                    <p className="text-xs text-text-secondary mt-1">
                      File: {selectedReport.fileName} ({formatBytes(selectedReport.fileSize)})
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary bg-surface px-3 py-1.5 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Simplified by Aurora AI
                  </div>
                </div>

                <div className="space-y-6 flex-1">
                  {/* Key Findings */}
                  <div>
                    <h3 className="font-bold text-lg text-text-sky mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-sky-500 rounded-full inline-block"></span>
                      Key Findings
                    </h3>
                    {selectedReport.analysis?.keyFindings?.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedReport.analysis.keyFindings.map((finding, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-sm leading-relaxed text-text-secondary">
                            <span className="text-sky-500 text-lg leading-none mt-0.5">•</span>
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-text-secondary italic">No critical findings summarized.</p>
                    )}
                  </div>

                  {/* Abnormal Values Table */}
                  <div>
                    <h3 className="font-bold text-lg text-text-sky mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-sky-500 rounded-full inline-block"></span>
                      Abnormal Values
                    </h3>
                    {selectedReport.analysis?.abnormalValues?.length > 0 ? (
                      <div className="overflow-x-auto border border-border-color rounded-xl">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="bg-surface border-b border-border-color text-text-sky font-semibold">
                              <th className="p-3">Parameter</th>
                              <th className="p-3">Value</th>
                              <th className="p-3">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedReport.analysis.abnormalValues.map((row, idx) => (
                              <tr key={idx} className="border-b border-border-color last:border-0 hover:bg-surface/50 transition-colors">
                                <td className="p-3 font-medium text-text-sky">{row.parameter}</td>
                                <td className="p-3 text-text-secondary">{row.value}</td>
                                <td className="p-3">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block capitalize ${
                                    row.status?.toLowerCase() === 'high' 
                                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                                      : row.status?.toLowerCase() === 'low'
                                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400'
                                  }`}>
                                    {row.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-950/20 rounded-xl text-center">
                        <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                          ✨ No significant abnormal parameters identified in this report.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Suggestions */}
                  <div>
                    <h3 className="font-bold text-lg text-text-sky mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-sky-500 rounded-full inline-block"></span>
                      Suggestions
                    </h3>
                    {selectedReport.analysis?.suggestions?.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedReport.analysis.suggestions.map((sug, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-sm leading-relaxed text-text-secondary">
                            <span className="text-sky-500 text-lg leading-none mt-0.5">•</span>
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-text-secondary italic">No specific suggestions generated.</p>
                    )}
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="mt-8 pt-4 border-t border-border-color text-center">
                  <p className="text-xs text-text-secondary italic leading-relaxed">
                    "This AI-generated summary is for informational purposes only and is not a medical diagnosis."
                  </p>
                </div>
              </motion.div>
            ) : (
              // File Uploader Card
              <motion.div
                key="uploader"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="h-full"
              >
                <div 
                  className={`glass-card p-8 md:p-12 flex flex-col items-center justify-center text-center border-2 border-dashed rounded-3xl h-full min-h-[500px] cursor-pointer transition-all duration-300 ${
                    dragActive 
                      ? 'border-sky-500 bg-sky-50/20 dark:bg-sky-950/10' 
                      : 'border-border-color hover:border-sky-400 bg-card'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('report-file-input').click()}
                >
                  <input 
                    type="file" 
                    id="report-file-input"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-full mb-4 text-sky-600 dark:text-sky-400">
                    <UploadCloud className="w-10 h-10 md:w-12 md:h-12" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-text-sky mb-2">Upload Your Medical Report</h3>
                  <p className="text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
                    Drag and drop your PDF report here, or click to browse files from your computer.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-text-secondary font-medium">
                    <span className="px-3 py-1 bg-surface rounded-full">PDF format only</span>
                    <span className="px-3 py-1 bg-surface rounded-full">Max size 10 MB</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default MedicalReports;
