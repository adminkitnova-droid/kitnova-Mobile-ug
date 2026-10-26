import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { TrendingUp, Award, DollarSign, PackageCheck } from 'lucide-react';

interface WeeklyDataPoint {
  day: string;
  deliveries: number;
  dailyEarnings: number; // UGX
  cumulativeEarnings: number; // UGX
}

const WEEKLY_DATA: WeeklyDataPoint[] = [
  { day: 'Mon', deliveries: 6, dailyEarnings: 72000, cumulativeEarnings: 72000 },
  { day: 'Tue', deliveries: 9, dailyEarnings: 108000, cumulativeEarnings: 180000 },
  { day: 'Wed', deliveries: 8, dailyEarnings: 96000, cumulativeEarnings: 276000 },
  { day: 'Thu', deliveries: 12, dailyEarnings: 144000, cumulativeEarnings: 420000 },
  { day: 'Fri', deliveries: 15, dailyEarnings: 180000, cumulativeEarnings: 600000 },
  { day: 'Sat', deliveries: 14, dailyEarnings: 168000, cumulativeEarnings: 768000 },
  { day: 'Sun', deliveries: 10, dailyEarnings: 120000, cumulativeEarnings: 888000 }
];

export const RiderWeeklyChart: React.FC = () => {
  const totalDeliveries = WEEKLY_DATA.reduce((acc, curr) => acc + curr.deliveries, 0);
  const totalEarnings = WEEKLY_DATA[WEEKLY_DATA.length - 1].cumulativeEarnings;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0A1A3C] border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1 font-mono">
          <p className="font-bold text-white mb-1.5">{label} — Delivery Performance</p>
          <p className="text-[#38BDF8] flex items-center justify-between gap-3">
            <span>Completed Deliveries:</span>
            <strong className="text-white font-bold">{payload[0]?.value} tasks</strong>
          </p>
          <p className="text-[#D4A029] flex items-center justify-between gap-3">
            <span>Daily Earnings:</span>
            <strong className="text-white font-bold">UGX {payload[1]?.value?.toLocaleString()}</strong>
          </p>
          <p className="text-emerald-400 flex items-center justify-between gap-3 pt-1 border-t border-slate-800">
            <span>Cumulative Week:</span>
            <strong className="text-white font-bold">UGX {payload[2]?.value?.toLocaleString()}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0A1A3C] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-[#D4A029] font-bold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Courier Performance Analytics
          </span>
          <h2 className="text-lg font-black text-white tracking-tight mt-0.5">
            Weekly Delivery Completions & Earnings Growth
          </h2>
          <p className="text-xs text-slate-400">
            Visualizing 7-day fulfillment velocity and progressive earnings accumulation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Weekly Total Payout</span>
            <span className="text-base sm:text-lg font-mono font-black text-[#D4A029]">
              UGX {totalEarnings.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-[#0F2A5F]/40 border border-slate-800">
          <span className="text-slate-400 text-[10px] flex items-center gap-1">
            <PackageCheck className="w-3.5 h-3.5 text-blue-400" />
            Total Completed
          </span>
          <p className="text-lg font-black text-white font-mono mt-0.5">{totalDeliveries} Runs</p>
          <span className="text-[10px] text-emerald-400 font-semibold">+18.5% vs last week</span>
        </div>

        <div className="p-3 rounded-xl bg-[#0F2A5F]/40 border border-slate-800">
          <span className="text-slate-400 text-[10px] flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-[#D4A029]" />
            Avg. Per Delivery
          </span>
          <p className="text-lg font-black text-[#D4A029] font-mono mt-0.5">
            UGX {(Math.round(totalEarnings / totalDeliveries)).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400">Base fee + surge bonus</span>
        </div>

        <div className="p-3 rounded-xl bg-[#0F2A5F]/40 border border-slate-800">
          <span className="text-slate-400 text-[10px] flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            On-Time Arrival
          </span>
          <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">98.4%</p>
          <span className="text-[10px] text-slate-400">Exceeds 95% target</span>
        </div>

        <div className="p-3 rounded-xl bg-[#0F2A5F]/40 border border-slate-800">
          <span className="text-slate-400 text-[10px] flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            Peak Day
          </span>
          <p className="text-lg font-black text-white font-mono mt-0.5">Friday (15 Runs)</p>
          <span className="text-[10px] text-purple-300">UGX 180,000 earned</span>
        </div>
      </div>

      {/* Recharts Visualization */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={WEEKLY_DATA}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#64748B"
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
            />
            {/* Left Axis: Completed Deliveries */}
            <YAxis
              yAxisId="left"
              stroke="#38BDF8"
              tick={{ fill: '#38BDF8', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
              label={{
                value: 'Deliveries',
                angle: -90,
                position: 'insideLeft',
                fill: '#38BDF8',
                fontSize: 10,
                dx: 15
              }}
            />
            {/* Right Axis: Cumulative Earnings */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#D4A029"
              tick={{ fill: '#D4A029', fontSize: 10 }}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
              label={{
                value: 'UGX Earnings',
                angle: 90,
                position: 'insideRight',
                fill: '#D4A029',
                fontSize: 10,
                dx: -10
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
              iconType="circle"
            />
            {/* Bar: Daily Completed Deliveries */}
            <Bar
              yAxisId="left"
              dataKey="deliveries"
              name="Deliveries Completed"
              fill="#0284C7"
              radius={[6, 6, 0, 0]}
              barSize={24}
            />
            {/* Line: Daily Earnings */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="dailyEarnings"
              name="Daily Earnings (UGX)"
              stroke="#D4A029"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#D4A029', strokeWidth: 1.5, stroke: '#FFFFFF' }}
            />
            {/* Line: Cumulative Earnings Growth Curve */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cumulativeEarnings"
              name="Cumulative Growth (UGX)"
              stroke="#10B981"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: '#10B981' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
