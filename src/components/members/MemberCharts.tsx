'use client';

import { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { ChevronDown, TrendingUp, Users, Calendar, Award } from 'lucide-react';

interface MemberChartsProps {
  growthData: { month: string; count: number }[];
  classYearData: { year: string; count: number }[];
  statusData: { name: string; value: number }[];
  chairData: { name: string; count: number }[];
  className?: string;
}

const COLORS = ['#10b981', '#6b7280', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dash-card border border-dash-border rounded-lg shadow-lg px-3 py-2">
        <p className="text-xs text-dash-text font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-[10px] text-dash-text-secondary">
            {entry.name}: <span className="font-semibold text-dash-text">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function MemberCharts({
  growthData,
  classYearData,
  statusData,
  chairData,
  className = '',
}: MemberChartsProps) {
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  const toggleChart = (chart: string) => {
    setExpandedChart(expandedChart === chart ? null : chart);
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${className}`}>
      {/* Member Growth Line Chart */}
      <div className="bg-dash-card rounded-xl border border-dash-border p-4">
        <button
          onClick={() => toggleChart('growth')}
          className="w-full flex items-center justify-between mb-4"
        >
          <h3 className="text-xs font-semibold text-dash-text uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={12} />
            Member Growth
          </h3>
          <ChevronDown
            size={14}
            className={`text-dash-text-muted transition-transform ${expandedChart === 'growth' ? 'rotate-180' : ''}`}
          />
        </button>
        <div className={`transition-all overflow-hidden ${expandedChart === 'growth' ? 'h-64' : 'h-48'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--dash-text-muted)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--dash-text-muted)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                name="Members"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 0 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Members by Class Year Bar Chart */}
      <div className="bg-dash-card rounded-xl border border-dash-border p-4">
        <button
          onClick={() => toggleChart('classYear')}
          className="w-full flex items-center justify-between mb-4"
        >
          <h3 className="text-xs font-semibold text-dash-text uppercase tracking-wider flex items-center gap-2">
            <Calendar size={12} />
            By Class Year
          </h3>
          <ChevronDown
            size={14}
            className={`text-dash-text-muted transition-transform ${expandedChart === 'classYear' ? 'rotate-180' : ''}`}
          />
        </button>
        <div className={`transition-all overflow-hidden ${expandedChart === 'classYear' ? 'h-64' : 'h-48'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classYearData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-border)" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'var(--dash-text-muted)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--dash-text-muted)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Members" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active vs Inactive Pie Chart */}
      <div className="bg-dash-card rounded-xl border border-dash-border p-4">
        <button
          onClick={() => toggleChart('status')}
          className="w-full flex items-center justify-between mb-4"
        >
          <h3 className="text-xs font-semibold text-dash-text uppercase tracking-wider flex items-center gap-2">
            <Users size={12} />
            Active vs Inactive
          </h3>
          <ChevronDown
            size={14}
            className={`text-dash-text-muted transition-transform ${expandedChart === 'status' ? 'rotate-180' : ''}`}
          />
        </button>
        <div className={`transition-all overflow-hidden ${expandedChart === 'status' ? 'h-64' : 'h-48'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={expandedChart === 'status' ? 50 : 35}
                outerRadius={expandedChart === 'status' ? 80 : 60}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {statusData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span className="text-[10px] text-dash-text-secondary">{value}</span>}
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chairs Distribution Horizontal Bar */}
      <div className="bg-dash-card rounded-xl border border-dash-border p-4">
        <button
          onClick={() => toggleChart('chairs')}
          className="w-full flex items-center justify-between mb-4"
        >
          <h3 className="text-xs font-semibold text-dash-text uppercase tracking-wider flex items-center gap-2">
            <Award size={12} />
            Chair Distribution
          </h3>
          <ChevronDown
            size={14}
            className={`text-dash-text-muted transition-transform ${expandedChart === 'chairs' ? 'rotate-180' : ''}`}
          />
        </button>
        <div className={`transition-all overflow-hidden ${expandedChart === 'chairs' ? 'h-64' : 'h-48'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chairData}
              layout="vertical"
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--dash-text-muted)' }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fill: 'var(--dash-text-muted)' }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Members" radius={[0, 4, 4, 0]}>
                {chairData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
