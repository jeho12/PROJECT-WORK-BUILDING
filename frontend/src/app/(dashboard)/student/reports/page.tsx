'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLogbook } from '@/hooks/useLogbook';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import EmptyState from '@/components/shared/EmptyState';
import { FileText, Download, Award, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function StudentReportsPage() {
  const { user } = useAuth();
  const studentId = user?.id || '';

  const { useWeeksQuery } = useLogbook(studentId);
  const { data: weeks, isLoading } = useWeeksQuery(studentId);

  const handleExportPDF = (week: any) => {
    toast.success('Generating PDF report...');
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(30, 64, 175); // #1E40AF
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('Helvetica', 'bold');
    doc.text('ANCHOR UNIVERSITY, LAGOS', 20, 15);
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text('INDUSTRIAL WORK EXPERIENCE SCHEME (SIWES) REPORT', 20, 22);
    doc.text(`Student: ${user?.name || 'Student'} | Week ${week.weekNumber}`, 20, 29);

    // Body
    doc.setTextColor(15, 23, 42); // #0F172A
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text('WEEK DETAILS', 20, 55);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Week Range: ${week.startDate} to ${week.endDate}`, 20, 63);
    doc.text(`Status: ${week.status.toUpperCase()}`, 20, 70);

    // Weekly Summary Report
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('WEEKLY SUMMARY REPORT', 20, 85);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Projects Worked On: ${week.weeklyReport?.projectsWorkedOn || 'N/A'}`, 20, 93);
    doc.text(`Section / Department: ${week.weeklyReport?.sectionOrDepartment || 'N/A'}`, 20, 100);
    
    doc.setFont('Helvetica', 'bold');
    doc.text('Work Done Summary:', 20, 110);
    doc.setFont('Helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(week.weeklyReport?.workDoneSummary || 'No summary submitted.', 170);
    doc.text(summaryLines, 20, 117);

    // Signatures
    const finalY = 160;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('SIGNATURES & VERIFICATION', 20, finalY);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Student:', 20, finalY + 10);
    doc.text(`${user?.name}`, 20, finalY + 15);
    
    doc.text('Academic Supervisor:', 110, finalY + 10);
    doc.text(`${week.supervisorSignature || 'Pending Approval'}`, 110, finalY + 15);
    if (week.supervisorRank) {
      doc.text(`Rank: ${week.supervisorRank}`, 110, finalY + 20);
    }

    doc.save(`AUL_SIWES_Week_${week.weekNumber}_Report.pdf`);
    toast.success('Download complete!');
  };

  if (isLoading) {
    return <LoadingSkeleton type="table" count={4} />;
  }

  // Filter approved or submitted weeks for PDF printout
  const printableWeeks = weeks?.filter((w) => w.status === 'approved' || w.status === 'submitted') || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">SIWES Logbook Reports</h1>
        <p className="text-sm text-text-secondary mt-1">
          Generate and download signed PDF summaries of your verified weekly logbook sheets.
        </p>
      </div>

      {printableWeeks.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start space-x-3 text-xs">
            <Award className="w-5 h-5 shrink-0 text-emerald-600 animate-pulse" />
            <div>
              <span className="font-bold">Ready to Print:</span> The weeks listed below have been submitted for evaluation. You can generate custom PDF reports containing supervisor endorsements and signatures.
            </div>
          </div>

          <div className="bg-white border border-border-custom rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-border-custom">
              {printableWeeks.map((week) => (
                <div key={week.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-slate-50/40 transition-colors gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-50 text-primary rounded-xl shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">
                        Week {week.weekNumber} Training Sheet
                      </h4>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {week.startDate} to {week.endDate}
                      </p>
                      <div className="mt-2 flex items-center space-x-2">
                        <StatusBadge status={week.status} />
                        {week.supervisorSignature && (
                          <span className="text-[10px] text-emerald-600 font-semibold">
                            ✓ Signed by {week.supervisorSignature}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => handleExportPDF(week)}
                      className="inline-flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-light text-xs font-bold text-white rounded-lg shadow-sm transition-all gap-1.5 focus:outline-none"
                    >
                      <Download className="w-4 h-4 shrink-0" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-100 border border-slate-200 text-text-secondary p-4 rounded-xl flex items-start space-x-3 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              Reports will become available for download once you submit weekly summaries and your academic supervisor logs an evaluation check.
            </div>
          </div>
          <EmptyState
            icon={FileText}
            title="No Reports Ready"
            description="You must submit weekly logbooks first. Once submitted, they will appear here as printable summaries."
          />
        </div>
      )}
    </div>
  );
}
