'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/lib/api';
import { Download, Database, FileText, BarChart3, Table, AlertCircle, CheckCircle } from 'lucide-react';

interface TableStats {
  [key: string]: number;
}

interface ExportResponse {
  success: boolean;
  message: string;
  filePath?: string;
  stats?: TableStats;
}

export default function ExportPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<TableStats>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const tableNames = {
    users: 'المستخدمين',
    categories: 'الفئات',
    subcategories: 'الفئات الفرعية',
    companies: 'الشركات',
    products: 'المنتجات',
    product_colors: 'ألوان المنتجات',
    product_images: 'صور المنتجات',
    product_color_images: 'صور ألوان المنتجات',
    orders: 'الطلبات',
    order_items: 'عناصر الطلبات',
    settings: 'الإعدادات',
    site_images: 'صور الموقع'
  };

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/export/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data: ExportResponse = await response.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const exportAllData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/export/json/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sprint_db_export_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showMessage('تم تصدير جميع البيانات بنجاح', 'success');
      } else {
        showMessage('حدث خطأ أثناء تصدير البيانات', 'error');
      }
    } catch (error) {
      showMessage('حدث خطأ في الاتصال', 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportTable = async (tableName: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/export/json/table/${tableName}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tableName}_export_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showMessage(`تم تصدير جدول ${tableNames[tableName as keyof typeof tableNames]} بنجاح`, 'success');
      } else {
        showMessage('حدث خطأ أثناء تصدير الجدول', 'error');
      }
    } catch (error) {
      showMessage('حدث خطأ في الاتصال', 'error');
    } finally {
      setLoading(false);
    }
  };

  const createSQLDump = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/export/sql-dump`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data: ExportResponse = await response.json();
      if (data.success && data.filePath) {
        // Download the SQL file
        const downloadResponse = await fetch(`${API_URL}/export/download/${data.filePath}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (downloadResponse.ok) {
          const blob = await downloadResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = data.filePath;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          showMessage('تم إنشاء وتحميل ملف SQL بنجاح', 'success');
        } else {
          showMessage('تم إنشاء الملف ولكن فشل في التحميل', 'error');
        }
      } else {
        showMessage(data.message || 'حدث خطأ أثناء إنشاء ملف SQL', 'error');
      }
    } catch (error) {
      showMessage('حدث خطأ في الاتصال', 'error');
    } finally {
      setLoading(false);
    }
  };

  const totalRecords = Object.values(stats).reduce((sum, count) => sum + count, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">تصدير البيانات</h1>
        <p className="text-gray-600">تصدير بيانات قاعدة البيانات بصيغ مختلفة</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          messageType === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {messageType === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message}
        </div>
      )}

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي السجلات</p>
              <p className="text-2xl font-bold text-gray-900">{totalRecords.toLocaleString()}</p>
            </div>
            <Database className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">عدد الجداول</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(stats).length}</p>
            </div>
            <Table className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">المنتجات</p>
              <p className="text-2xl font-bold text-gray-900">{stats.products || 0}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">الطلبات</p>
              <p className="text-2xl font-bold text-gray-900">{stats.orders || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Export */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">تصدير سريع</h2>
          
          <div className="space-y-4">
            <button
              onClick={exportAllData}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-5 h-5" />
              {loading ? 'جاري التصدير...' : 'تصدير جميع البيانات (JSON)'}
            </button>

            <button
              onClick={createSQLDump}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Database className="w-5 h-5" />
              {loading ? 'جاري الإنشاء...' : 'إنشاء نسخة احتياطية (SQL)'}
            </button>
          </div>
        </div>

        {/* Table-specific Export */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">تصدير الجداول</h2>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {Object.entries(stats).map(([tableName, count]) => (
              <div key={tableName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {tableNames[tableName as keyof typeof tableNames] || tableName}
                  </p>
                  <p className="text-sm text-gray-600">{count.toLocaleString()} سجل</p>
                </div>
                <button
                  onClick={() => exportTable(tableName)}
                  disabled={loading}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  تصدير
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Information */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">معلومات التصدير</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">تصدير JSON:</h4>
            <ul className="space-y-1">
              <li>• سهل القراءة والاستيراد</li>
              <li>• يحتوي على البيانات فقط</li>
              <li>• مناسب للنسخ الاحتياطية السريعة</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">تصدير SQL:</h4>
            <ul className="space-y-1">
              <li>• يحتوي على هيكل الجداول والبيانات</li>
              <li>• يمكن استيراده مباشرة إلى MySQL</li>
              <li>• مناسب للنسخ الاحتياطية الكاملة</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
