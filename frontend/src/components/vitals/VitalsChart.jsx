import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const VitalsChart = ({ data, type, onAnalyze }) => {
  const getChartConfig = () => {
    switch(type) {
      case 'bp':
        return {
          lines: [
            { key: 'value.systolic', color: '#ef4444', name: 'Systolic' },
            { key: 'value.diastolic', color: '#3b82f6', name: 'Diastolic' }
          ],
          yAxisLabel: 'mmHg',
          referenceLines: [
            { y: 140, label: 'High Systolic', color: '#ef4444' },
            { y: 90, label: 'High Diastolic', color: '#3b82f6' }
          ]
        };
      case 'sugar':
        return {
          lines: [{ key: 'value', color: '#8b5cf6', name: 'Blood Sugar' }],
          yAxisLabel: 'mg/dL',
          referenceLines: [{ y: 200, label: 'High', color: '#ef4444' }]
        };
      case 'weight':
        return {
          lines: [{ key: 'value', color: '#10b981', name: 'Weight' }],
          yAxisLabel: 'kg',
          referenceLines: []
        };
      case 'pulse':
        return {
          lines: [{ key: 'value', color: '#f59e0b', name: 'Pulse' }],
          yAxisLabel: 'bpm',
          referenceLines: [
            { y: 60, label: 'Low', color: '#3b82f6' },
            { y: 100, label: 'High', color: '#ef4444' }
          ]
        };
      case 'temperature':
        return {
          lines: [{ key: 'value', color: '#ec4899', name: 'Temperature' }],
          yAxisLabel: '°F',
          referenceLines: [
            { y: 97, label: 'Low', color: '#3b82f6' },
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-1">{formatDate(label)}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value} {config.yAxisLabel}
            </p>
          ))}
          {payload[0]?.payload?.notes && (
            <p className="text-xs text-gray-500 mt-1">📝 {payload[0].payload.notes}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl p-4">
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              label={{ value: config.yAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {config.referenceLines.map((line, index) => (
              <ReferenceLine
                key={index}
                y={line.y}
                stroke={line.color}
                strokeDasharray="3 3"
                label={{ value: line.label, position: 'right', fill: line.color, fontSize: 10 }}
              />
            ))}
            
            {config.lines.map((line, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={line.key}
                stroke={line.color}
                name={line.name}
                dot={{ r: 4, fill: line.color, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Analyze Button - Shows when there's data */}
      {data && data.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onAnalyze}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Analyze Trend with Gemini
          </button>
        </div>
      )}
    </div>
  );
};

export default VitalsChart;