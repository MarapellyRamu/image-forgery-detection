'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { imagesApi } from '@/lib/api';
import { formatConfidence, formatDate } from '@/lib/utils';
import { Search, Filter, Trash2, Eye, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await imagesApi.getHistory(1, 100);
      setHistory(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await imagesApi.deletePrediction(deleteId);
      toast.success('Record deleted');
      setHistory(history.filter(h => h.id !== deleteId));
    } catch (err) {
      toast.error('Failed to delete');
    } finally {
      setDeleteId(null);
    }
  };

  const filteredHistory = history.filter(h => {
    const matchesSearch = h.original_filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || h.result === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight">Detection History</h1>
          <p className="text-dark-400 mt-1">Review your past image analyses.</p>
        </div>
      </div>

      <Card className="p-0 border-white/10 shadow-xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4 bg-white/[0.02]">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <Input 
              placeholder="Search filename..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-dark-400" />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="h-11 rounded-xl border border-dark-700/50 bg-dark-900/50 px-3 text-sm text-white outline-none focus:border-primary-500 transition-colors"
            >
              <option value="all">All Results</option>
              <option value="authentic">Authentic</option>
              <option value="forged">Forged</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center p-12"><Spinner className="w-8 h-8 text-primary-500" /></div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-16 text-dark-400">
            <p>No records found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-dark-300">
              <thead className="text-xs uppercase bg-dark-900/50 text-dark-400">
                <tr>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Filename</th>
                  <th className="px-6 py-4">Result</th>
                  <th className="px-6 py-4">Confidence</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3">
                      <div className="w-12 h-12 rounded bg-dark-800 overflow-hidden border border-white/10">
                        <img src={`http://localhost:8000/uploads/${item.filename}`} alt="Thumb" className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-3 font-medium text-white truncate max-w-[200px]">{item.original_filename}</td>
                    <td className="px-6 py-3">
                      <Badge variant={item.result === 'authentic' ? 'success' : 'danger'}>
                        {item.result.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-white">{formatConfidence(item.confidence)}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{formatDate(item.created_at)}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="p-2" onClick={async () => {
                          try {
                            const res = await imagesApi.downloadReport(item.id);
                            const url = URL.createObjectURL(new Blob([res.data]));
                            const a = document.createElement('a');
                            a.href = url; a.download = `report-${item.id}.pdf`;
                            document.body.appendChild(a); a.click();
                            URL.revokeObjectURL(url);
                          } catch { toast.error('Failed to download report'); }
                        }} title="Download Report">
                          <Download className="w-4 h-4 text-primary-400" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2 hover:bg-red-500/10 hover:text-red-500 text-dark-400" onClick={() => setDeleteId(item.id)} title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)}
        title="Delete Record"
      >
        <p className="text-dark-300 mb-6">Are you sure you want to delete this prediction record? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
