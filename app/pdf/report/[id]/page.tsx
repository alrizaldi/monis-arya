"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Printer, Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Define types based on the actual API response
type Submission = {
  id: string;
  submissionNumber: string;
  patient: {
    id: string;
    patientName: string;
    medicalRecordNumber: string;
    gender: string;
    birthDate: Date;
    createdAt: Date;
    updatedAt: Date;
  };
  room: {
    id: string;
    roomNumber: string;
    bedNumber: number;
    roomClass: string;
    createdAt: Date;
    updatedAt: Date;
  };
  payer: {
    id: string;
    payerName: string;
    createdAt: Date;
    updatedAt: Date;
  };
  status: string;
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  details: Array<{
    id: string;
    submissionType: string;
    pengajuan: string; // Renamed from submissionValue
    note?: string;
    status: string;
    approvedAt?: Date;
    rejectedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    pendingHistories: Array<{
      id: string;
      pendingType: string;
      pendingNote?: string;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      resolvedAt?: Date;
    }>;
  }>;
};

export default function SubmissionPdfReport() {
  const { id } = useParams();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await fetch(`/api/submissions/${id}/pdf`);
        if (!response.ok) {
          throw new Error("Failed to fetch submission");
        }
        const submissionData = await response.json();
        setSubmission(submissionData);
      } catch (error) {
        console.error("Error fetching submission:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSubmission();
    }
  }, [id]);

  const generatePdf = async () => {
    const input = document.getElementById("pdf-content");
    if (!input) return;

    try {
      // Use html2canvas to capture the content
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        scrollY: -window.scrollY, // Handle fixed elements correctly
        width: 595, // A4 width in pixels at 96 DPI (595px = 210mm)
        height: 842, // A4 height in pixels at 96 DPI (842px = 297mm)
        windowWidth: 595,
        windowHeight: 842,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          imgData,
          "PNG",
          0,
          Math.abs(position),
          imgWidth,
          imgHeight,
        );
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save(`submission-report-${submission?.submissionNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Submission Not Found
          </h2>
          <p className="text-gray-600">
            The requested submission could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-4 px-2 sm:px-4 lg:px-6 bg-white min-h-screen">
      <style jsx global>{`
        @media print {
          body {
            margin: 0 !important;
            padding: 0 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
          }
          @page {
            size: A4;
            margin: 0.5cm !important;
          }
          .pdf-container {
            width: 20cm !important;
            min-height: 28.7cm !important;
            margin: 0 auto !important;
            padding: 0.8cm !important;
            box-sizing: border-box !important;
            background-color: white !important;
            display: block !important;
          }
        }

        /* Hide elements during printing */
        @media print {
          .no-print {
            display: none !important;
          }
          .pdf-container {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      <div className="mb-4 flex justify-between items-center no-print">
        <h1 className="text-2xl font-bold text-gray-900">Submission Report</h1>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="flex items-center"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div
        id="pdf-content"
        className="pdf-container bg-white shadow rounded-lg p-4 print:p-2 print:shadow-none print:rounded-none"
        style={{
          maxWidth: "20cm",
          minHeight: "28.7cm",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {/* Header Section */}
        <div className="text-center mb-4 print:mb-3 border-b pb-2">
          <h1 className="text-xl font-bold text-gray-900 print:text-lg">
            Submission Report
          </h1>
          <p className="text-sm text-gray-600 print:text-xs">
            Detailed submission information and tracking
          </p>
        </div>

        {/* Main Info Grid - Compact 3-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 print:gap-2 print:mb-3">
          <div className="bg-gray-50 p-2 rounded print:p-1 print:text-xs">
            <p className="text-xs text-gray-500 print:text-[0.6rem]">
              Submission ID
            </p>
            <p className="font-medium break-all text-sm print:text-[0.7rem]">
              {submission.submissionNumber}
            </p>
          </div>
          <div className="bg-gray-50 p-2 rounded print:p-1 print:text-xs">
            <p className="text-xs text-gray-500 print:text-[0.6rem]">Status</p>
            <p
              className={`font-medium text-sm print:text-[0.7rem] ${
                submission.status === "APPROVED"
                  ? "text-green-600"
                  : submission.status === "PENDING"
                    ? "text-yellow-600"
                    : submission.status === "REJECTED"
                      ? "text-red-600"
                      : submission.status === "SUBMITTED"
                        ? "text-blue-600"
                        : "text-gray-600"
              }`}
            >
              {submission.status}
            </p>
          </div>
          <div className="bg-gray-50 p-2 rounded print:p-1 print:text-xs">
            <p className="text-xs text-gray-500 print:text-[0.6rem]">Date</p>
            <p className="font-medium text-sm print:text-[0.7rem]">
              {new Date(submission.createdAt).toLocaleString([], {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Patient & Room Info - Side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 print:gap-2 print:mb-3">
          <div className="border rounded p-3 print:p-2">
            <h3 className="font-semibold text-sm mb-2 print:text-xs border-b print:border-b">
              Patient Information
            </h3>
            <div className="space-y-1 text-xs print:text-[0.7rem]">
              <div className="flex">
                <span className="w-24 text-gray-500 print:w-16 print:text-[0.6rem]">
                  Name:
                </span>
                <span className="font-medium">
                  {submission.patient.patientName}
                </span>
              </div>
              <div className="flex">
                <span className="w-24 text-gray-500 print:w-16 print:text-[0.6rem]">
                  MRN:
                </span>
                <span className="font-medium">
                  {submission.patient.medicalRecordNumber}
                </span>
              </div>
              <div className="flex">
                <span className="w-24 text-gray-500 print:w-16 print:text-[0.6rem]">
                  Gender:
                </span>
                <span className="font-medium">{submission.patient.gender}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-gray-500 print:w-16 print:text-[0.6rem]">
                  DOB:
                </span>
                <span className="font-medium">
                  {new Date(submission.patient.birthDate).toLocaleDateString(
                    [],
                    {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="border rounded p-3 print:p-2">
            <h3 className="font-semibold text-sm mb-2 print:text-xs border-b print:border-b">
              Room & Payer
            </h3>
            <div className="space-y-1 text-xs print:text-[0.7rem]">
              <div className="flex">
                <span className="w-24 text-gray-500 print:w-16 print:text-[0.6rem]">
                  Room:
                </span>
                <span className="font-medium">
                  {submission.room.roomNumber}
                </span>
              </div>
              <div className="flex">
                <span className="w-24 text-gray-500 print:w-16 print:text-[0.6rem]">
                  Bed:
                </span>
                <span className="font-medium">{submission.room.bedNumber}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-gray-500 print:w-16 print:text-[0.6rem]">
                  Class:
                </span>
                <span className="font-medium">{submission.room.roomClass}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-gray-500 print:w-16 print:text-[0.6rem]">
                  Payer:
                </span>
                <span className="font-medium">
                  {submission.payer.payerName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Submission Details - Compact table */}
        <div className="mb-4 print:mb-3">
          <h3 className="font-semibold text-sm mb-2 print:text-xs border-b print:border-b">
            Submission Details
          </h3>
          <div className="overflow-x-auto print:overflow-visible">
            <Table className="text-xs print:text-[0.7rem]">
              <TableHeader className="print:text-[0.6rem]">
                <TableRow className="print:h-6">
                  <TableHead className="print:text-[0.6rem]">Type</TableHead>
                  <TableHead className="print:text-[0.6rem]">
                    Pengajuan
                  </TableHead>
                  <TableHead className="print:text-[0.6rem]">Note</TableHead>
                  <TableHead className="print:text-[0.6rem]">Status</TableHead>
                  <TableHead className="print:text-[0.6rem]">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submission.details.map((detail) => (
                  <TableRow key={detail.id} className="print:h-5">
                    <TableCell className="font-medium print:text-[0.7rem]">
                      {detail.submissionType}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-gray-900 print:text-[0.7rem]">
                      {detail.pengajuan}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-gray-900 print:text-[0.7rem]">
                      {detail.note}
                    </TableCell>
                    <TableCell className="print:text-[0.7rem]">
                      <span
                        className={`px-1 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full 
                        ${
                          detail.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : detail.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : detail.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : detail.status === "SUBMITTED"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                        } print:text-[0.5rem]`}
                      >
                        {detail.status}
                      </span>
                    </TableCell>
                    <TableCell className="print:text-[0.7rem]">
                      {new Date(detail.createdAt).toLocaleDateString([], {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pending Records - Compact view */}
        <div className="mb-4 print:mb-2">
          <h3 className="font-semibold text-sm mb-2 print:text-xs border-b print:border-b">
            Pending Records
          </h3>
          {submission.details.some(
            (detail) => detail.pendingHistories.length > 0,
          ) ? (
            <div className="space-y-2 print:space-y-1">
              {submission.details.map(
                (detail) =>
                  detail.pendingHistories.length > 0 && (
                    <div
                      key={detail.id}
                      className="border rounded p-2 print:p-1 break-inside-avoid"
                    >
                      <h4 className="font-medium text-xs mb-1 print:text-[0.7rem]">
                        Detail: {detail.submissionType}
                      </h4>
                      {detail.pendingHistories.map((pending) => (
                        <div
                          key={pending.id}
                          className={`p-1.5 rounded text-xs ${
                            pending.isActive
                              ? "bg-yellow-50 border border-yellow-200"
                              : "bg-green-50 border border-green-200"
                          } print:p-0.5 print:text-[0.6rem]`}
                        >
                          <div className="flex justify-between">
                            <span>Type: {pending.pendingType}</span>
                            <span
                              className={`${
                                pending.isActive
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}
                            >
                              {pending.isActive ? "Active" : "Resolved"}
                            </span>
                          </div>
                          {pending.pendingNote && (
                            <div className="mt-1 text-xs text-gray-500 print:text-[0.6rem]">
                              Note: {pending.pendingNote}
                            </div>
                          )}
                          <div className="mt-1 text-xs text-gray-500 print:text-[0.6rem]">
                            Created:{" "}
                            {new Date(pending.createdAt).toLocaleString([], {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {pending.resolvedAt &&
                              ` | Resolved: ${new Date(pending.resolvedAt).toLocaleString([], { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  ),
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic text-xs print:text-[0.7rem]">
              No pending records found
            </p>
          )}
        </div>

        <div className="mt-2 print:mt-1 text-center text-gray-500 text-xs print:text-[0.6rem]">
          Generated on {new Date().toLocaleDateString()} at{" "}
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
