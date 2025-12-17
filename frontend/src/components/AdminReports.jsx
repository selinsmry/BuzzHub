import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Mock reports - Backend'te reports API olmadığından test verileri kullanıyoruz
      const mockReports = [
        {
          id: 1,
          type: 'post',
          priority: 'high',
          status: 'under_review',
          reportedContent: 'Uygunsuz dil içeriyor',
          reason: 'Spam and harassment',
          reporter: 'user123',
          date: new Date().toLocaleDateString('tr-TR'),
          reportedBy: 'John Doe'
        },
        {
          id: 2,
          type: 'user',
          priority: 'medium',
          status: 'investigating',
          reportedContent: 'Şüpheli kullanıcı aktivitesi',
          reason: 'Suspicious activity',
          reporter: 'user456',
          date: new Date(Date.now() - 86400000).toLocaleDateString('tr-TR'),
          reportedBy: 'Jane Smith'
        },
        {
          id: 3,
          type: 'post',
          priority: 'low',
          status: 'resolved',
          reportedContent: 'Hatalı kategori',
          reason: 'Wrong category',
          reporter: 'user789',
          date: new Date(Date.now() - 172800000).toLocaleDateString('tr-TR'),
          reportedBy: 'Bob Johnson'
        }
      ];
      setReports(mockReports);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReportStatus = async (reportId, newStatus) => {
    try {
      setReports(reports.map(r => 
        r.id === reportId ? { ...r, status: newStatus } : r
      ));
      alert(`✅ Rapor durumu ${newStatus} olarak güncellendi`);
    } catch (err) {
      console.error('Error updating report:', err);
      alert('❌ Hata oluştu');
    }
  };

  const handleResolveReport = async (reportId) => {
    await handleUpdateReportStatus(reportId, 'resolved');
  };

  const filteredReports = reports.filter(report => {
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesSearch = report.reportedContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Reports Management</h1>
        <p className="text-gray-400">Review and respond to user reports</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
            >
              <option value="all">All Reports</option>
              <option value="under_review">Under Review</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
            >
              <option value="date">Newest First</option>
              <option value="priority">By Priority</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Reports</label>
            <input
              type="text"
              placeholder="Arama yapın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {sortedReports.length > 0 ? sortedReports.map((report) => (
          <div key={report.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-orange-500/30 transition-all shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.type === 'post' ? 'bg-pink-500/20 text-pink-400' :
                    report.type === 'user' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {report.type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    report.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {report.priority} priority
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                    report.status === 'under_review' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {report.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-white font-medium mb-1">{report.reportedContent}</p>
                <p className="text-gray-400 text-sm mb-2">Reason: {report.reason}</p>
                <p className="text-gray-500 text-xs">Reported by @{report.reporter} • {report.date}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <button className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors text-sm font-medium">
                View Full Details
              </button>
              <button className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-sm font-medium">
                Add Note
              </button>
              {report.status !== 'resolved' && (
                <button
                  onClick={() => handleResolveReport(report.id)}
                  className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors text-sm font-medium">
                  Resolve
                </button>
              )}
            </div>
          </div>
        )) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No reports found</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 shadow-xl">
          <p className="text-gray-400 text-sm mb-1">Total Reports</p>
          <p className="text-2xl font-bold text-white">{reports.length}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 shadow-xl">
          <p className="text-gray-400 text-sm mb-1">Under Review</p>
          <p className="text-2xl font-bold text-orange-400">{reports.filter(r => r.status === 'under_review').length}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 shadow-xl">
          <p className="text-gray-400 text-sm mb-1">Investigating</p>
          <p className="text-2xl font-bold text-blue-400">{reports.filter(r => r.status === 'investigating').length}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 shadow-xl">
          <p className="text-gray-400 text-sm mb-1">Resolved</p>
          <p className="text-2xl font-bold text-green-400">{reports.filter(r => r.status === 'resolved').length}</p>
        </div>
      </div>

      {/* Report Guidelines */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">📋 Report Guidelines</h3>
        <ul className="space-y-2 text-gray-400 text-sm">
          <li className="flex items-start space-x-2">
            <span className="text-orange-500 mt-1">•</span>
            <span>Verify all reported content before taking action</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-orange-500 mt-1">•</span>
            <span>Document your reasoning for each decision</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-orange-500 mt-1">•</span>
            <span>Contact the reporter if additional information is needed</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-orange-500 mt-1">•</span>
            <span>High priority reports should be resolved within 24 hours</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default AdminReports;
