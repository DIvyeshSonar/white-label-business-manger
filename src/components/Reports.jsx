import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { BarChart, PieChart, TrendingUp, Calendar, Download, Filter } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const { store } = useData();
  const [period, setPeriod] = useState('30d');
  
  const metrics = useMemo(() => {
    const sales = store.transactions.filter(t => t.type === 'sale');
    const purchases = store.transactions.filter(t => t.type === 'purchase');
    const totalSales = sales.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalPurchases = purchases.reduce((sum, t) => sum + t.totalAmount, 0);
    
    return {
      totalSales,
      totalPurchases,
      netProfit: totalSales - totalPurchases,
      transactionCount: store.transactions.length
    };
  }, [store.transactions]);

  const categoryData = useMemo(() => {
    const counts = {};
    store.products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + p.currentStock;
    });
    
    return {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: ['#14b8a6', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#f43f5e'],
        borderWidth: 0
      }]
    };
  }, [store.products]);

  const salesByMonth = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = new Array(12).fill(0);
    
    store.transactions.filter(t => t.type === 'sale').forEach(t => {
      const month = new Date(t.date).getMonth();
      data[month] += t.totalAmount;
    });

    return {
      labels: months,
      datasets: [{
        label: 'Monthly Sales (₹)',
        data,
        backgroundColor: '#14b8a6',
        borderRadius: 8
      }]
    };
  }, [store.transactions]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <Calendar className="text-gray-400" size={20} />
          <select 
            className="text-sm font-semibold text-gray-700 bg-transparent border-none focus:ring-0 cursor-pointer"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="year">This Year</option>
          </select>
        </div>
        <button className="btn btn-secondary py-2 px-4 gap-2 text-xs" onClick={() => {
          const headers = ['Invoice No', 'Party Name', 'Type', 'Date', 'Amount', 'Status'];
          const rows = store.transactions.map(t => [
            t.invoiceNumber,
            t.partyName,
            t.type.toUpperCase(),
            new Date(t.date).toLocaleDateString(),
            t.totalAmount,
            'Completed'
          ]);
          
          const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }}>
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard title="Revenue" value={`₹${metrics.totalSales.toLocaleString()}`} trend="+12%" color="bg-teal-50 text-teal-600" />
        <ReportCard title="Expenses" value={`₹${metrics.totalPurchases.toLocaleString()}`} trend="-5%" color="bg-orange-50 text-orange-600" />
        <ReportCard title="Net Profit" value={`₹${metrics.netProfit.toLocaleString()}`} trend="+8%" color="bg-blue-50 text-blue-600" />
        <ReportCard title="Transactions" value={metrics.transactionCount} trend="+24" color="bg-purple-50 text-purple-600" />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-gray-900">Sales Performance</h3>
          </div>
          <div className="card-body h-80">
            <Bar data={salesByMonth} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>

        <div className="card">
          <div className="card-header border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-gray-900">Inventory Distribution</h3>
          </div>
          <div className="card-body h-80 flex items-center justify-center">
            <Pie data={categoryData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Detailed Transaction Log */}
      <div className="card overflow-hidden">
        <div className="card-header border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Transaction History</h3>
          <button className="text-primary-600 text-sm font-semibold hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Party</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {store.transactions.slice(0, 5).map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{t.invoiceNumber}</td>
                  <td className="px-6 py-4 text-gray-600">{t.partyName}</td>
                  <td className="px-6 py-4 capitalize">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${t.type === 'sale' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">₹{t.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-green-600 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ReportCard = ({ title, value, trend, color }) => (
  <div className="card p-6">
    <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
    <div className="flex items-end justify-between">
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${color}`}>{trend}</span>
    </div>
  </div>
);

export default Reports;
