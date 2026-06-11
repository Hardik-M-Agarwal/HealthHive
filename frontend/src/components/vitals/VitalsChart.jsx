import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  Dot
} from 'recharts';

const VitalsChart = ({ data, type, onAnalyze }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const getChartConfig = () => {
    switch (type) {
      case 'bp':
        return {
          lines: [
            { key: 'value.systolic', color: '#2563eb', name: 'Systolic', fillColor: '#dbeafe' },
            { key: 'value.diastolic', color: '#64748b', name: 'Diastolic', fillColor: '#f1f5f9' }
          ],
          yAxisLabel: 'mmHg',
          referenceLines: [
            { y: 140, label: 'High Sys', color: '#ef4444' },
            { y: 90, label: 'High Dia', color: '#94a3b8' }
          ]
        };
      case 'sugar':
        return {
          lines: [{ key: 'value', color: '#2563eb', name: 'Blood Sugar', fillColor: '#dbeafe' }],
          yAxisLabel: 'mg/dL',
          referenceLines: [{ y: 200, label: 'High', color: '#ef4444' }]
        };
      case 'weight':
        return {
          lines: [{ key: 'value', color: '#2563eb', name: 'Weight', fillColor: '#dbeafe' }],
          yAxisLabel: 'kg',
          referenceLines: []
        };
      case 'pulse':
        return {
          lines: [{ key: 'value', color: '#2563eb', name: 'Pulse', fillColor: '#dbeafe' }],
          yAxisLabel: 'bpm',
          referenceLines: [
            { y: 60, label: 'Low', color: '#94a3b8' },
            { y: 100, label: 'High', color: '#ef4444' }
          ]
        };
      case 'temperature':
        return {
          lines: [{ key: 'value', color: '#2563eb', name: 'Temperature', fillColor: '#dbeafe' }],
          yAxisLabel: '°F',
          referenceLines: [
            { y: 97, label: 'Low', color: '#94a3b8' },
            { y: 99.5, label: 'High', color: '#ef4444' }
          ]
        };
      default:
        return { lines: [], yAxisLabel: '', referenceLines: [] };
    }
  };

  const config = getChartConfig();

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomDot = (props) => {
    const { cx, cy, payload, dataKey } = props;
    const isAbnormal = payload?.abnormal;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={isAbnormal ? 6 : 4}
        fill={isAbnormal ? '#ef4444' : '#2563eb'}
        stroke="white"
        strokeWidth={2}
        style={{ cursor: 'pointer', filter: isAbnormal ? 'drop-shadow(0 0 4px #ef4444)' : 'none' }}
      />
    );
  };

  const CustomActiveDot = (props) => {
    const { cx, cy } = props;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={7}
        fill="#2563eb"
        stroke="white"
        strokeWidth={2.5}
        style={{ filter: 'drop-shadow(0 2px 6px rgba(37,99,235,0.5))' }}
      />
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-xl rounded-xl border border-slate-100 min-w-[160px]">
          <p className="text-sm font-semibold text-slate-700 mb-2 pb-2 border-b border-slate-100">
            {formatDate(label)}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 mt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }}></span>
                <span className="text-xs text-slate-500">{entry.name}</span>
              </div>
              <span className="text-sm font-bold text-slate-900">
                {entry.value} <span className="text-xs font-normal text-slate-400">{config.yAxisLabel}</span>
              </span>
            </div>
          ))}
          {payload[0]?.payload?.notes && (
            <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-100">
              📝 {payload[0].payload.notes}
            </p>
          )}
          {payload[0]?.payload?.abnormal && (
            <p className="text-xs text-red-500 mt-1 font-medium">⚠️ Abnormal reading</p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => (
    <div className="flex items-center justify-center gap-6 mt-2">
      {payload?.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="w-6 h-0.5 inline-block rounded" style={{ backgroundColor: entry.color }}></span>
          <span className="text-xs text-slate-500 font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-slate-500 font-medium">No data available for this period</p>
        <p className="text-slate-400 text-sm mt-1">Add a reading to see your chart</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      {/* Chart title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Trend Chart</h3>
          <p className="text-sm text-slate-400 mt-0.5">{data.length} readings plotted</p>
        </div>
        {/* Legend for abnormal */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block border-2 border-white shadow"></span>
            Normal
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block border-2 border-white shadow"></span>
            Abnormal
          </div>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <defs>
              {config.lines.map((line, i) => (
                <linearGradient key={i} id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={line.color} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={line.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              dy={8}
            />

            <YAxis
              label={{ value: config.yAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: 11 }, dx: -4 }}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={50}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Legend content={<CustomLegend />} />

            {config.referenceLines.map((line, index) => (
              <ReferenceLine
                key={index}
                y={line.y}
                stroke={line.color}
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{ value: line.label, position: 'insideTopRight', fill: line.color, fontSize: 10, fontWeight: 500 }}
              />
            ))}

            {config.lines.map((line, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={line.key}
                stroke={line.color}
                name={line.name}
                dot={<CustomDot />}
                activeDot={<CustomActiveDot />}
                strokeWidth={2.5}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Analyze Button */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
        <button
          onClick={onAnalyze}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Analyze Trend with Gemini
        </button>
      </div>
    </div>
  );
};

export default VitalsChart;