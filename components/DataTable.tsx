'use client';

import React from 'react';
import { Download, Copy, FileSpreadsheet } from 'lucide-react';
import { downloadCSV, downloadExcel, copyToClipboard } from '@/lib/utils/export';

interface TableData {
  headers: string[];
  rows: any[];
  total_rows: number;
  downloadable: boolean;
}

interface DataTableProps {
  data: TableData;
  title?: string;
}

export function DataTable({ data, title = 'Query Results' }: DataTableProps) {
  const { headers, rows, total_rows } = data;

  if (!rows || rows.length === 0) {
    return null;
  }

  const handleDownloadCSV = () => {
    downloadCSV(rows, `ncc-${title.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const handleDownloadExcel = () => {
    downloadExcel(rows, `ncc-${title.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const handleCopyData = () => {
    copyToClipboard(rows);
  };

  const formatCellValue = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'number') {
      // Format numbers with commas for readability
      return value.toLocaleString();
    }
    return String(value);
  };

  return (
    <div className="mt-4 bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
        <div>
          <h4 className="font-medium text-gray-900">{title}</h4>
          <p className="text-sm text-gray-500">{total_rows} records</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyData}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
            title="Copy to clipboard"
          >
            <Copy className="w-3 h-3" />
            Copy
          </button>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
            title="Download as CSV"
          >
            <Download className="w-3 h-3" />
            CSV
          </button>
          <button
            onClick={handleDownloadExcel}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
            title="Download as Excel"
          >
            <FileSpreadsheet className="w-3 h-3" />
            Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                >
                  {header.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.slice(0, 10).map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {headers.map((header, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                  >
                    {formatCellValue(row[header])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {total_rows > 10 && (
        <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-500">
          Showing first 10 of {total_rows} records. Download full dataset using the buttons above.
        </div>
      )}
    </div>
  );
}