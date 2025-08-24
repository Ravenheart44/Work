function loadCSV(filePath, containerId) {
  Papa.parse(filePath, {
    download: true,
    header: true,
    complete: function(results) {
      const data = results.data;
      const container = document.getElementById(containerId);
      container.innerHTML = generateTable(data);
    }
  });
}

function generateTable(data) {
  if (data.length === 0) return '<p>No data available.</p>';
  const headers = Object.keys(data[0]);
  let html = '<table><thead><tr>';
  headers.forEach(h => html += `<th>${h}</th>`);
  html += '</tr></thead><tbody>';
  data.forEach(row => {
    html += '<tr>';
    headers.forEach(h => html += `<td>${row[h]}</td>`);
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html;
}