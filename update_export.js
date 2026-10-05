const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/AdminFeedback.tsx', 'utf8');

const handleExportFn = `
  const handleExport = async () => {
    try {
      setToast('Downloading report...');
      const res = await api.get('/staff/feedback/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'feedback_report.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setToast('Report exported successfully!');
    } catch (err) {
      alert(errorMessage(err) || 'Failed to download report');
    }
  };

  const handleDelete`;

content = content.replace(/const handleDelete/, handleExportFn);
content = content.replace(/<SecondaryBtn onClick=\{\(\) => setToast\('Report export started\.'\)\}>Export Report<\/SecondaryBtn>/, '<SecondaryBtn onClick={handleExport}>Export Report</SecondaryBtn>');

fs.writeFileSync('frontend/src/pages/AdminFeedback.tsx', content);
