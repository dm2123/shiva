'use client';

interface CertificateCardProps {
  certificate: {
    id: string;
    certificateNumber: string;
    courseTitle: string;
    issuedAt: string;
    studentName?: string;
  };
}

export default function CertificateCard({ certificate }: CertificateCardProps) {
  const downloadCertificate = () => {
    // Create a simple HTML certificate for download
    const certHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Georgia', serif; margin: 0; padding: 40px; background: #f5f5f5; }
          .certificate {
            width: 800px; margin: 0 auto; background: white;
            border: 3px solid #c8a96e; padding: 60px; text-align: center;
            position: relative;
          }
          .border-decoration {
            position: absolute; top: 10px; left: 10px; right: 10px; bottom: 10px;
            border: 1px solid #c8a96e;
          }
          .logo { font-size: 32px; font-weight: bold; color: #1a1a2e; margin-bottom: 10px; }
          .subtitle { color: #666; font-size: 14px; letter-spacing: 3px; text-transform: uppercase; }
          .title { font-size: 28px; color: #1a1a2e; margin: 40px 0 20px; }
          .name { font-size: 36px; color: #c8a96e; font-weight: bold; margin: 20px 0; }
          .course { font-size: 18px; color: #333; margin: 10px 0; }
          .details { color: #666; font-size: 14px; margin-top: 40px; }
          .date { color: #666; font-size: 14px; margin-top: 20px; }
          .signature { margin-top: 40px; font-style: italic; color: #333; }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="border-decoration"></div>
          <div class="logo">THE SHIVA</div>
          <div class="subtitle">EdTech Platform</div>
          <div class="title">Certificate of Completion</div>
          <p style="color: #666;">This is to certify that</p>
          <div class="name">${certificate.studentName || 'Student'}</div>
          <p style="color: #666;">has successfully completed the course</p>
          <div class="course">${certificate.courseTitle}</div>
          <div class="details">
            Certificate No: ${certificate.certificateNumber}<br>
            Issued: ${new Date(certificate.issuedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div class="signature">
            <div style="border-top: 1px solid #333; width: 200px; margin: 0 auto; padding-top: 10px;">
              Authorized Signatory
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([certHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${certificate.certificateNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
          <span className="text-3xl">🏆</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-900 dark:text-white">{certificate.courseTitle}</h3>
          <p className="text-sm text-slate-500">
            No: {certificate.certificateNumber} • {new Date(certificate.issuedAt).toLocaleDateString('en-IN')}
          </p>
        </div>
        <button
          onClick={downloadCertificate}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
        >
          Download
        </button>
      </div>
    </div>
  );
}
