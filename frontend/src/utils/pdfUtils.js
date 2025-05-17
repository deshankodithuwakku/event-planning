import jsPDF from 'jspdf';
import 'jspdf-autotable';
import COMPANY_LOGO from '../assets/logo1.jpg';

// Company logo as base64 (imported from local file)

/**
 * Adds a professional header to PDF document
 * 
 * @param {jsPDF} doc - The PDF document
 * @param {String} title - Report title
 * @param {Object} options - Additional options
 */
export const addPdfHeader = (doc, title, options = {}) => {
  const {
    subtitle = '',
    showLogo = true,
    showDate = true,
    dateText = `Generated on: ${new Date().toLocaleDateString()}`,
    primaryColor = [100, 149, 237] // Cornflower blue
  } = options;

  // Set background for header
  doc.setFillColor(245, 245, 245);
  doc.rect(0, 0, doc.internal.pageSize.width, 35, 'F');
  
  // Add logo
  if (showLogo) {
    doc.addImage(COMPANY_LOGO, 'PNG', 14, 8, 20, 20);
  }
  
  // Add company name
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Event Planning', showLogo ? 40 : 14, 16);

  // Add horizontal line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(14, 35, doc.internal.pageSize.width - 14, 35);
  
  // Add title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(title, 14, 50);
  
  // Add subtitle if provided
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, 14, 58);
  }
  
  // Add date
  if (showDate) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(dateText, doc.internal.pageSize.width - 14, 50, { align: 'right' });
  }
  
  return 65; // Return the Y position where content should start
};

/**
 * Adds a footer with page numbers
 * 
 * @param {jsPDF} doc - The PDF document
 * @param {Number} pageNumber - Current page number
 */
export const addPdfFooter = (doc, pageNumber) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Add footer background
  doc.setFillColor(245, 245, 245);
  doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
  
  // Add page number
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Page ${pageNumber}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
  
  // Add company website or contact
  doc.text('www.eventplanning.com | info@eventplanning.com', 14, pageHeight - 10);
};

/**
 * Adds a summary section with statistics
 * 
 * @param {jsPDF} doc - The PDF document
 * @param {Number} startY - Y position to start
 * @param {Array} stats - Array of stat objects {label, value}
 * @param {Array} primaryColor - RGB color array
 */
export const addStatsSummary = (doc, startY, stats, primaryColor = [100, 149, 237]) => {
  // Add heading
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Summary Statistics', 14, startY);
  
  // Add stats in a nice grid format
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  
  const colWidth = 120;
  const rowHeight = 8;
  let currentX = 14;
  let currentY = startY + 10;
  
  stats.forEach((stat, index) => {
    // Start a new column after every 5 items
    if (index > 0 && index % 5 === 0) {
      currentX += colWidth;
      currentY = startY + 10;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text(`${stat.label}:`, currentX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(stat.value, currentX + 70, currentY);
    
    currentY += rowHeight;
  });
};

export default {
  addPdfHeader,
  addPdfFooter,
  addStatsSummary
};
