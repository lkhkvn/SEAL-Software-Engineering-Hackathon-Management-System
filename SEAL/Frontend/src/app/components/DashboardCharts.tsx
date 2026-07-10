import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface Hackathon {
  id: number;
  name: string;
  category: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

interface User {
  id: number;
  role: string;
  [key: string]: any;
}

interface DashboardChartsProps {
  contests: Hackathon[];
  users: User[];
  totalTeams: number;
}

const renderGauge = (title: string, subtitle: string, data: any[], valueStr: string, subtitle2: string) => (
  <div className="bg-white p-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center justify-center h-48 relative">
    <div className="absolute top-3 left-3 text-xs font-bold text-gray-700">{title}</div>
    {subtitle && <div className="absolute top-8 left-3 text-[10px] text-gray-400">{subtitle}</div>}
    <div className="w-full h-24 mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={40}
            outerRadius={55}
            dataKey="value"
            stroke="none"
            isAnimationActive={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div className="text-lg font-bold mt-2">{valueStr}</div>
    <div className="text-[10px] text-gray-400">{subtitle2}</div>
  </div>
);

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ contests, users, totalTeams }) => {
  const totalUsers = users.length;
  const totalEvents = contests.length;
  const activeEvents = contests.filter(c => c.status === 'ACTIVE').length;
  const upcomingEvents = contests.filter(c => c.status === 'UPCOMING').length;
  const completedEvents = contests.filter(c => c.status === 'COMPLETED').length;
  const adminUsers = users.filter(u => u.role === 'ADMIN').length;

  const activeRatio = totalEvents > 0 ? (activeEvents / totalEvents) * 100 : 0;
  const completedRatio = totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0;
  const upcomingRatio = totalEvents > 0 ? (upcomingEvents / totalEvents) * 100 : 0;
  const adminRatio = totalUsers > 0 ? (adminUsers / totalUsers) * 100 : 0;

  const gaugeData1 = [{ value: activeRatio, fill: '#10B981' }, { value: 100 - activeRatio, fill: '#E5E7EB' }];
  const gaugeData2 = [{ value: completedRatio, fill: '#3B82F6' }, { value: 100 - completedRatio, fill: '#E5E7EB' }];
  const gaugeData3 = [{ value: upcomingRatio, fill: '#F59E0B' }, { value: 100 - upcomingRatio, fill: '#E5E7EB' }];
  const gaugeData4 = [{ value: adminRatio, fill: '#8B5CF6' }, { value: 100 - adminRatio, fill: '#E5E7EB' }];

  const CATEGORIES = Array.from(new Set(contests.map(c => c.category))).filter(Boolean);
  const tallBarData = CATEGORIES.map(cat => ({
    name: cat,
    active: contests.filter(c => c.category === cat && c.status === 'ACTIVE').length,
    other: contests.filter(c => c.category === cat && c.status !== 'ACTIVE').length,
  })).sort((a, b) => (b.active + b.other) - (a.active + a.other));

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const stackedBarData = months.map((m, idx) => {
    const eventsInMonth = contests.filter(c => {
      if (!c.startDate) return false;
      return new Date(c.startDate).getMonth() === idx;
    });
    return {
      name: m,
      upcoming: eventsInMonth.filter(e => e.status === 'UPCOMING').length,
      active: eventsInMonth.filter(e => e.status === 'ACTIVE').length,
      completed: eventsInMonth.filter(e => e.status === 'COMPLETED').length,
    };
  });

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2/3 (Stats + Gauges) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Top 4 Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 text-center flex flex-col justify-center">
              <div className="text-xs font-bold text-gray-800">Tổng Người Dùng</div>
              <div className="text-3xl font-light text-blue-500 mt-2">{totalUsers}</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 text-center flex flex-col justify-center">
              <div className="text-xs font-bold text-gray-800">Tổng Sự Kiện</div>
              <div className="text-3xl font-light text-indigo-500 mt-2">{totalEvents}</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 text-center flex flex-col justify-center">
              <div className="text-sm font-bold text-gray-800">Tổng Đội Thi</div>
              <div className="text-3xl font-light text-emerald-500 mt-2">{totalTeams}</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 text-center flex flex-col justify-center">
              <div className="text-sm font-bold text-gray-800">Đang Diễn Ra</div>
              <div className="text-3xl font-light text-orange-500 mt-2">{activeEvents}</div>
            </div>
          </div>

          {/* 4 Gauges */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {renderGauge('Sự kiện Đang diễn ra', '', gaugeData1, `${activeRatio.toFixed(1)}%`, `${activeEvents} sự kiện`)}
            {renderGauge('Sự kiện Đã kết thúc', '', gaugeData2, `${completedRatio.toFixed(1)}%`, `${completedEvents} sự kiện`)}
            {renderGauge('Sự kiện Sắp tới', '', gaugeData3, `${upcomingRatio.toFixed(1)}%`, `${upcomingEvents} sự kiện`)}
            {renderGauge('Tỷ lệ Admin', '', gaugeData4, `${adminRatio.toFixed(1)}%`, `${adminUsers} Admin`)}
          </div>
        </div>

        {/* Right 1/3 (Tall Bar Chart) */}
        <div className="lg:col-span-1 bg-white p-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col min-h-[350px]">
          <div className="text-xs font-bold text-gray-600 mb-4">Phân bổ Hackathon theo Danh mục</div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tallBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} stroke="#9ca3af" />
                <YAxis fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} stroke="#9ca3af" />
                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="active" name="Đang diễn ra" fill="#10B981" barSize={16} />
                <Bar dataKey="other" name="Trạng thái khác" fill="#9CA3AF" barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-white p-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col h-[350px]">
        <div className="text-xs font-bold text-gray-600 mb-4">Số lượng Hackathon theo Trạng thái (Hàng tháng)</div>
        <div className="flex-1 relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stackedBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} stroke="#9ca3af" />
              <YAxis fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} stroke="#9ca3af" />
              <Tooltip cursor={{ fill: '#f3f4f6' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="active" name="Đang diễn ra" stackId="a" fill="#10B981" barSize={32} />
              <Bar dataKey="upcoming" name="Sắp tới" stackId="a" fill="#3B82F6" />
              <Bar dataKey="completed" name="Đã kết thúc" stackId="a" fill="#9CA3AF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
