import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  TrendingUp, 
  Package, 
  Truck, 
  Users, 
  AlertTriangle 
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Utility for formatting currency
const formatCurrency = (amount) => {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const Dashboard = () => {
  const { store, metrics } = useData();

  // --- Chart Data Preparation ---
  const chartColors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'];

  const salesChartData = useMemo(() => {
    // Generate last 7 days labels
    const labels = [];
    const data = [];
    const now = new Date();
    
    // Group transactions
    const sales = store.transactions.filter(t => t.type === 'sale');
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      labels.push(dateString);
      
      // Calculate sum for this date
      const daySum = sales.reduce((sum, t) => {
        const tDate = new Date(t.date);
        if (tDate.getDate() === d.getDate() && tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear()) {
          return sum + t.totalAmount;
        }
        return sum;
      }, 0);
      data.push(daySum);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Sales Revenue (7d)',
          data,
          borderColor: chartColors[0],
          backgroundColor: 'rgba(31, 184, 205, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [store.transactions]);

  const productChartData = useMemo(() => {
    const sortedProducts = [...store.products]
      .sort((a, b) => (b.totalSold * b.salePrice) - (a.totalSold * a.salePrice))
      .slice(0, 5);

    if (sortedProducts.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [1], backgroundColor: ['#f3f4f6'] }]
      };
    }

    return {
      labels: sortedProducts.map(p => p.name),
      datasets: [
        {
          data: sortedProducts.map(p => p.totalSold * p.salePrice),
          backgroundColor: chartColors.slice(0, sortedProducts.length),
          borderWidth: 0,
        },
      ],
    };
  }, [store.products]);

  const recentTransactions = [...store.transactions]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Revenue" 
          value={formatCurrency(metrics.totalSalesRevenue)} 
          icon={<TrendingUp className="text-primary-600" size={24} />} 
        />
        <MetricCard 
          title="Total Products" 
          value={metrics.totalProducts} 
          icon={<Package className="text-secondary-600" size={24} />} 
        />
        <MetricCard 
          title="Active Customers" 
          value={metrics.totalCustomers} 
          icon={<Users className="text-blue-500" size={24} />} 
        />
        <MetricCard 
          title="Low Stock Warning" 
          value={metrics.lowStockItems} 
          icon={<AlertTriangle className={`${metrics.lowStockItems > 0 ? 'text-red-500' : 'text-gray-400'}`} size={24} />}
          isAlert={metrics.lowStockItems > 0}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Sales Overview</h3>
          </div>
          <div className="card-body h-80">
             <Line data={salesChartData} options={{ maintainAspectRatio: false, responsive: true }} />
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Products</h3>
          </div>
          <div className="card-body h-80 flex items-center justify-center">
             <Doughnut data={productChartData} options={{ maintainAspectRatio: false, responsive: true }} />
          </div>
        </div>
      </div>

      {/* Recent Transactions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header border-b border-gray-100 pb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          </div>
          <ul className="divide-y divide-gray-100">
            {recentTransactions.length === 0 ? (
              <li className="p-6 text-center text-gray-500">No recent transactions.</li>
            ) : (
              recentTransactions.map(t => (
                <li key={t.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'purchase' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                      {t.type === 'purchase' ? <Truck size={18} /> : <TrendingUp size={18} />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{t.partyName}</p>
                      <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()} • {t.invoiceNumber}</p>
                    </div>
                  </div>
                  <div className={`font-semibold ${t.type === 'purchase' ? 'text-gray-600' : 'text-green-600'}`}>
                    {t.type === 'purchase' ? '-' : '+'}{formatCurrency(t.totalAmount)}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Action Highlights or Quick Links could go here */}
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon, isAlert }) => (
  <div className={`card overflow-hidden relative ${isAlert ? 'border-red-200 shadow-sm shadow-red-100' : ''}`}>
    {isAlert && <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />}
    <div className="card-body flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
      </div>
    </div>
  </div>
);

export default Dashboard;
