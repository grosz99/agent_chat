// Utility functions for exporting data tables

export function downloadCSV(data: any[], filename: string = 'ncc-data') {
  if (!data || data.length === 0) {
    alert('No data available to download');
    return;
  }

  // Get headers from first row
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Add headers
  csvContent += headers.join(',') + '\n';
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Handle values that contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvContent += values.join(',') + '\n';
  });

  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadExcel(data: any[], filename: string = 'ncc-data') {
  if (!data || data.length === 0) {
    alert('No data available to download');
    return;
  }

  // For simple Excel-compatible format, we'll use CSV with .xlsx extension
  // In a real implementation, you'd use libraries like xlsx or exceljs
  downloadCSV(data, filename);
}

export function copyToClipboard(data: any[]) {
  if (!data || data.length === 0) {
    alert('No data available to copy');
    return;
  }

  const headers = Object.keys(data[0]);
  let content = headers.join('\t') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => row[header] || '');
    content += values.join('\t') + '\n';
  });

  navigator.clipboard.writeText(content).then(() => {
    alert('Data copied to clipboard!');
  }).catch(() => {
    alert('Failed to copy data to clipboard');
  });
}

export function formatTableData(data: any[]): { headers: string[], rows: any[][] } {
  if (!data || data.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = Object.keys(data[0]);
  const rows = data.map(item => headers.map(header => item[header]));
  
  return { headers, rows };
}