'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, Download, Loader2, CheckCircle, AlertCircle,
  FileStack, Scissors, FileDown, RotateCw, Lock, Unlock, 
  FileImage, Image, Stamp, FileText, ScanLine, FileType,
  Trash2, GripVertical, Maximize, Minimize, Hash, Eraser,
  FilePlus, FileCheck, Crop, FileSearch, Camera, FileSpreadsheet,
  Presentation, Wrench, Archive, LucideIcon, Sparkles, Edit, PenTool
} from 'lucide-react';
import { FileUploader } from '@/components/pdf/FileUploader';
import { usePDFTools } from '@/hooks/usePDFTools';
import { downloadFile } from '@/lib/utils';

// Complete tool configuration for ALL iLovePDF tools
const TOOLS_CONFIG: Record<string, {
  name: string;
  description: string;
  longDescription: string;
  icon: LucideIcon;
  accept: string;
  multiple: boolean;
  color: string;
  bgColor: string;
  options?: {
    name: string;
    type: 'text' | 'number' | 'select' | 'checkbox' | 'range' | 'textarea';
    label: string;
    default?: string | number | boolean;
    options?: { value: string; label: string }[];
    min?: number;
    max?: number;
    placeholder?: string;
  }[];
}> = {
  // ==================== ORGANIZE PDF ====================
  'merge': {
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into one',
    longDescription: 'Combine PDFs in the order you want with the easiest PDF merger available. Select multiple files and merge them into a single PDF.',
    icon: FileStack,
    accept: '.pdf',
    multiple: true,
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-50',
  },
  'split': {
    name: 'Split PDF',
    description: 'Separate PDF into multiple files',
    longDescription: 'Separate one page or a whole set for easy conversion into independent PDF files.',
    icon: Scissors,
    accept: '.pdf',
    multiple: false,
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-50',
    options: [
      { name: 'splitMode', type: 'select', label: 'Split Mode', default: 'range', options: [
        { value: 'all', label: 'Extract all pages as separate PDFs' },
        { value: 'range', label: 'Custom page range' },
      ]},
      { name: 'range', type: 'text', label: 'Page Range (e.g., 1-3, 5, 7-10)', default: '1-5', placeholder: '1-5' },
    ],
  },
  'remove-pages': {
    name: 'Remove Pages',
    description: 'Remove unwanted pages from PDF',
    longDescription: 'Remove unwanted pages from your PDF document. Select the pages you want to delete.',
    icon: Trash2,
    accept: '.pdf',
    multiple: false,
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-50',
    options: [
      { name: 'pages', type: 'text', label: 'Pages to remove (e.g., 1, 3, 5-7)', default: '1', placeholder: '1, 3, 5-7' },
    ],
  },
  'extract': {
    name: 'Extract Pages',
    description: 'Extract specific pages from PDF',
    longDescription: 'Extract specific pages from your PDF to create a new document with only the pages you need.',
    icon: FileDown,
    accept: '.pdf',
    multiple: false,
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-50',
    options: [
      { name: 'pages', type: 'text', label: 'Pages to extract (e.g., 1, 3, 5-7)', default: '1-3', placeholder: '1-3' },
    ],
  },
  'organize': {
    name: 'Organize PDF',
    description: 'Sort pages of your PDF file',
    longDescription: 'Sort pages of your PDF file however you like. Reorder, delete, or add PDF pages to your document.',
    icon: GripVertical,
    accept: '.pdf',
    multiple: false,
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-50',
    options: [
      { name: 'order', type: 'text', label: 'New page order (e.g., 3, 1, 2, 4)', default: '', placeholder: '3, 1, 2, 4' },
    ],
  },
  'scan-to-pdf': {
    name: 'Scan to PDF',
    description: 'Capture document scans',
    longDescription: 'Capture document scans from your mobile device and send them instantly to your browser.',
    icon: Camera,
    accept: 'image/*',
    multiple: true,
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-50',
  },
  
  // ==================== OPTIMIZE PDF ====================
  'compress': {
    name: 'Compress PDF',
    description: 'Reduce PDF file size',
    longDescription: 'Reduce file size while optimizing for maximal PDF quality. Choose your compression level.',
    icon: Minimize,
    accept: '.pdf',
    multiple: false,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    options: [
      { name: 'quality', type: 'select', label: 'Compression Level', default: 'recommended', options: [
        { value: 'extreme', label: 'Extreme Compression (smallest size)' },
        { value: 'recommended', label: 'Recommended Compression (balanced)' },
        { value: 'less', label: 'Less Compression (best quality)' },
      ]},
    ],
  },
  'repair': {
    name: 'Repair PDF',
    description: 'Fix damaged PDF files',
    longDescription: 'Repair a damaged PDF and recover data from corrupt PDF. Fix PDF files with our Repair tool.',
    icon: Wrench,
    accept: '.pdf',
    multiple: false,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
  },
  'ocr': {
    name: 'OCR PDF',
    description: 'Make scanned PDFs searchable',
    longDescription: 'Easily convert scanned PDF into searchable and selectable documents. Extract text from images.',
    icon: ScanLine,
    accept: '.pdf',
    multiple: false,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    options: [
      { name: 'language', type: 'select', label: 'Document Language', default: 'eng', options: [
        { value: 'eng', label: 'English' },
        { value: 'spa', label: 'Spanish' },
        { value: 'fra', label: 'French' },
        { value: 'deu', label: 'German' },
        { value: 'ita', label: 'Italian' },
        { value: 'por', label: 'Portuguese' },
        { value: 'chi_sim', label: 'Chinese (Simplified)' },
        { value: 'jpn', label: 'Japanese' },
        { value: 'kor', label: 'Korean' },
        { value: 'ara', label: 'Arabic' },
        { value: 'hin', label: 'Hindi' },
      ]},
    ],
  },

  // ==================== CONVERT TO PDF ====================
  'jpg-to-pdf': {
    name: 'JPG to PDF',
    description: 'Convert images to PDF',
    longDescription: 'Convert JPG images to PDF in seconds. Easily adjust orientation and margins.',
    icon: Image,
    accept: 'image/*',
    multiple: true,
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-50',
    options: [
      { name: 'orientation', type: 'select', label: 'Page Orientation', default: 'portrait', options: [
        { value: 'portrait', label: 'Portrait' },
        { value: 'landscape', label: 'Landscape' },
      ]},
      { name: 'margin', type: 'select', label: 'Margin', default: 'small', options: [
        { value: 'none', label: 'No Margin' },
        { value: 'small', label: 'Small Margin' },
        { value: 'large', label: 'Large Margin' },
      ]},
    ],
  },
  'word-to-pdf': {
    name: 'WORD to PDF',
    description: 'Convert Word documents to PDF',
    longDescription: 'Make DOC and DOCX files easy to read by converting them to PDF format.',
    icon: FileText,
    accept: '.doc,.docx,.txt,.rtf',
    multiple: false,
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-50',
  },
  'powerpoint-to-pdf': {
    name: 'POWERPOINT to PDF',
    description: 'Convert presentations to PDF',
    longDescription: 'Make PPT and PPTX slideshows easy to view by converting them to PDF.',
    icon: Presentation,
    accept: '.ppt,.pptx',
    multiple: false,
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-50',
  },
  'excel-to-pdf': {
    name: 'EXCEL to PDF',
    description: 'Convert spreadsheets to PDF',
    longDescription: 'Make EXCEL spreadsheets easy to read by converting them to PDF format.',
    icon: FileSpreadsheet,
    accept: '.xls,.xlsx,.csv',
    multiple: false,
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-50',
  },
  'html-to-pdf': {
    name: 'HTML to PDF',
    description: 'Convert web pages to PDF',
    longDescription: 'Convert webpages in HTML to PDF. Copy and paste the URL of the page you want and convert it to PDF with a click.',
    icon: FileType,
    accept: '.html,.htm',
    multiple: false,
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-50',
    options: [
      { name: 'url', type: 'text', label: 'Enter URL (or upload HTML file)', default: '', placeholder: 'https://example.com' },
    ],
  },

  // ==================== CONVERT FROM PDF ====================
  'pdf-to-jpg': {
    name: 'PDF to JPG',
    description: 'Convert PDF pages to images',
    longDescription: 'Convert each PDF page into a JPG or extract all images contained in a PDF.',
    icon: FileImage,
    accept: '.pdf',
    multiple: false,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    options: [
      { name: 'quality', type: 'select', label: 'Image Quality', default: 'high', options: [
        { value: 'low', label: 'Low (72 DPI)' },
        { value: 'medium', label: 'Medium (150 DPI)' },
        { value: 'high', label: 'High (300 DPI)' },
      ]},
      { name: 'mode', type: 'select', label: 'Conversion Mode', default: 'pages', options: [
        { value: 'pages', label: 'Convert all pages' },
        { value: 'images', label: 'Extract embedded images' },
      ]},
    ],
  },
  'pdf-to-word': {
    name: 'PDF to WORD',
    description: 'Convert PDF to Word document',
    longDescription: 'Easily convert your PDF files into easy to edit DOC and DOCX documents. The converted WORD document is almost 100% accurate.',
    icon: FileText,
    accept: '.pdf',
    multiple: false,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
  },
  'pdf-to-powerpoint': {
    name: 'PDF to POWERPOINT',
    description: 'Convert PDF to presentation',
    longDescription: 'Turn your PDF files into easy to edit PPT and PPTX slideshows.',
    icon: Presentation,
    accept: '.pdf',
    multiple: false,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
  },
  'pdf-to-excel': {
    name: 'PDF to EXCEL',
    description: 'Extract data to spreadsheet',
    longDescription: 'Pull data straight from PDFs into Excel spreadsheets in a few short seconds.',
    icon: FileSpreadsheet,
    accept: '.pdf',
    multiple: false,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
  },
  'pdf-to-pdfa': {
    name: 'PDF to PDF/A',
    description: 'Convert to archival format',
    longDescription: 'Transform your PDF to PDF/A, the ISO-standardized version of PDF for long-term archiving. Your PDF will preserve formatting.',
    icon: Archive,
    accept: '.pdf',
    multiple: false,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    options: [
      { name: 'conformance', type: 'select', label: 'PDF/A Conformance Level', default: 'pdfa-2b', options: [
        { value: 'pdfa-1b', label: 'PDF/A-1b (Basic)' },
        { value: 'pdfa-2b', label: 'PDF/A-2b (Recommended)' },
        { value: 'pdfa-3b', label: 'PDF/A-3b (Latest)' },
      ]},
    ],
  },

  // ==================== EDIT PDF ====================
  'rotate': {
    name: 'Rotate PDF',
    description: 'Rotate PDF pages',
    longDescription: 'Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!',
    icon: RotateCw,
    accept: '.pdf',
    multiple: false,
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
    options: [
      { name: 'angle', type: 'select', label: 'Rotation Angle', default: '90', options: [
        { value: '90', label: '90° Clockwise' },
        { value: '180', label: '180°' },
        { value: '270', label: '90° Counter-clockwise' },
      ]},
      { name: 'pages', type: 'text', label: 'Pages to rotate (leave empty for all)', default: '', placeholder: '1, 3, 5-7' },
    ],
  },
  'page-numbers': {
    name: 'Page Numbers',
    description: 'Add page numbers to PDF',
    longDescription: 'Add page numbers into PDFs with ease. Choose your positions, dimensions, typography.',
    icon: Hash,
    accept: '.pdf',
    multiple: false,
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
    options: [
      { name: 'position', type: 'select', label: 'Position', default: 'bottom-center', options: [
        { value: 'bottom-center', label: 'Bottom Center' },
        { value: 'bottom-right', label: 'Bottom Right' },
        { value: 'bottom-left', label: 'Bottom Left' },
        { value: 'top-center', label: 'Top Center' },
        { value: 'top-right', label: 'Top Right' },
        { value: 'top-left', label: 'Top Left' },
      ]},
      { name: 'startFrom', type: 'number', label: 'Start numbering from page', default: 1, min: 1 },
      { name: 'format', type: 'select', label: 'Number Format', default: 'number', options: [
        { value: 'number', label: '1, 2, 3...' },
        { value: 'roman', label: 'I, II, III...' },
        { value: 'alpha', label: 'A, B, C...' },
      ]},
    ],
  },
  'watermark': {
    name: 'Add Watermark',
    description: 'Add text or image watermark',
    longDescription: 'Stamp an image or text over your PDF in seconds. Choose the typography, transparency and position.',
    icon: Stamp,
    accept: '.pdf',
    multiple: false,
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
    options: [
      { name: 'text', type: 'text', label: 'Watermark Text', default: 'CONFIDENTIAL', placeholder: 'Enter watermark text' },
      { name: 'opacity', type: 'range', label: 'Opacity', default: 30, min: 10, max: 100 },
      { name: 'position', type: 'select', label: 'Position', default: 'diagonal', options: [
        { value: 'center', label: 'Center' },
        { value: 'diagonal', label: 'Diagonal' },
        { value: 'top', label: 'Top' },
        { value: 'bottom', label: 'Bottom' },
      ]},
      { name: 'fontSize', type: 'number', label: 'Font Size', default: 48, min: 12, max: 200 },
    ],
  },
  'crop': {
    name: 'Crop PDF',
    description: 'Crop margins and page areas',
    longDescription: 'Crop margins of PDF documents or select specific areas, then apply the changes to one page or the whole document.',
    icon: Crop,
    accept: '.pdf',
    multiple: false,
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
    options: [
      { name: 'marginTop', type: 'number', label: 'Top Margin (pts)', default: 50, min: 0, max: 300 },
      { name: 'marginBottom', type: 'number', label: 'Bottom Margin (pts)', default: 50, min: 0, max: 300 },
      { name: 'marginLeft', type: 'number', label: 'Left Margin (pts)', default: 50, min: 0, max: 300 },
      { name: 'marginRight', type: 'number', label: 'Right Margin (pts)', default: 50, min: 0, max: 300 },
    ],
  },
  'edit': {
    name: 'Edit PDF',
    description: 'Add text, images, shapes',
    longDescription: 'Add text, images, shapes or freehand annotations to a PDF document. Edit the size, font, and color of the added content.',
    icon: Edit,
    accept: '.pdf',
    multiple: false,
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
    options: [
      { name: 'text', type: 'textarea', label: 'Text to add', default: '', placeholder: 'Enter text to add to PDF' },
      { name: 'x', type: 'number', label: 'X Position (from left)', default: 100, min: 0, max: 1000 },
      { name: 'y', type: 'number', label: 'Y Position (from bottom)', default: 700, min: 0, max: 1000 },
      { name: 'fontSize', type: 'number', label: 'Font Size', default: 16, min: 8, max: 72 },
      { name: 'page', type: 'number', label: 'Page Number', default: 1, min: 1 },
      { name: 'color', type: 'select', label: 'Text Color', default: 'black', options: [
        { value: 'black', label: 'Black' },
        { value: 'red', label: 'Red' },
        { value: 'blue', label: 'Blue' },
        { value: 'green', label: 'Green' },
        { value: 'gray', label: 'Gray' },
      ]},
    ],
  },

  // ==================== PDF SECURITY ====================
  'unlock': {
    name: 'Unlock PDF',
    description: 'Remove password protection',
    longDescription: 'Remove PDF password security, giving you the freedom to use your PDFs as you want.',
    icon: Unlock,
    accept: '.pdf',
    multiple: false,
    color: 'from-slate-600 to-gray-700',
    bgColor: 'bg-slate-50',
    options: [
      { name: 'password', type: 'text', label: 'Current Password', default: '', placeholder: 'Enter current password' },
    ],
  },
  'protect': {
    name: 'Protect PDF',
    description: 'Add password protection',
    longDescription: 'Protect PDF files with a password. Encrypt PDF documents to prevent unauthorized access.',
    icon: Lock,
    accept: '.pdf',
    multiple: false,
    color: 'from-slate-600 to-gray-700',
    bgColor: 'bg-slate-50',
    options: [
      { name: 'password', type: 'text', label: 'Password', default: '', placeholder: 'Enter password' },
      { name: 'confirmPassword', type: 'text', label: 'Confirm Password', default: '', placeholder: 'Confirm password' },
    ],
  },
  'sign': {
    name: 'Sign PDF',
    description: 'Add your signature',
    longDescription: 'Sign yourself or request electronic signatures from others. Create and place your signature on any page.',
    icon: PenTool,
    accept: '.pdf',
    multiple: false,
    color: 'from-slate-600 to-gray-700',
    bgColor: 'bg-slate-50',
    options: [
      { name: 'signatureText', type: 'text', label: 'Signature (type your name)', default: '', placeholder: 'Your Name' },
      { name: 'page', type: 'number', label: 'Page Number', default: 1, min: 1 },
      { name: 'x', type: 'number', label: 'X Position', default: 100, min: 0, max: 1000 },
      { name: 'y', type: 'number', label: 'Y Position', default: 100, min: 0, max: 1000 },
    ],
  },
  'redact': {
    name: 'Redact PDF',
    description: 'Remove sensitive information',
    longDescription: 'Redact text and graphics to permanently remove sensitive information from a PDF.',
    icon: Eraser,
    accept: '.pdf',
    multiple: false,
    color: 'from-slate-600 to-gray-700',
    bgColor: 'bg-slate-50',
    options: [
      { name: 'searchText', type: 'text', label: 'Text to redact', default: '', placeholder: 'Enter text to redact' },
      { name: 'page', type: 'number', label: 'Page Number (0 for all)', default: 0, min: 0 },
    ],
  },
  'compare': {
    name: 'Compare PDF',
    description: 'Compare two documents',
    longDescription: 'Show a side-by-side document comparison and easily spot changes between different file versions.',
    icon: FileSearch,
    accept: '.pdf',
    multiple: true,
    color: 'from-slate-600 to-gray-700',
    bgColor: 'bg-slate-50',
  },

  // ==================== LEGACY ALIASES ====================
  'delete': {
    name: 'Delete Pages',
    description: 'Remove pages from PDF',
    longDescription: 'Select and permanently remove specific pages from your PDF document.',
    icon: Trash2,
    accept: '.pdf',
    multiple: false,
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-50',
    options: [
      { name: 'pages', type: 'text', label: 'Pages to delete (e.g., 1, 3, 5-7)', default: '1' },
    ],
  },
  'reorder': {
    name: 'Reorder Pages',
    description: 'Rearrange PDF pages',
    longDescription: 'Change the order of pages in your PDF document by specifying the new sequence.',
    icon: GripVertical,
    accept: '.pdf',
    multiple: false,
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-50',
    options: [
      { name: 'order', type: 'text', label: 'New page order (e.g., 3, 1, 2, 4)', default: '' },
    ],
  },
  'resize': {
    name: 'Resize PDF',
    description: 'Change PDF page dimensions',
    longDescription: 'Resize PDF pages to a different paper size like A4, Letter, or custom dimensions.',
    icon: Maximize,
    accept: '.pdf',
    multiple: false,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    options: [
      { name: 'size', type: 'select', label: 'Page Size', default: 'a4', options: [
        { value: 'a4', label: 'A4 (210×297mm)' },
        { value: 'letter', label: 'Letter (8.5×11in)' },
        { value: 'legal', label: 'Legal (8.5×14in)' },
        { value: 'a3', label: 'A3 (297×420mm)' },
        { value: 'a5', label: 'A5 (148×210mm)' },
      ]},
    ],
  },
  'flatten': {
    name: 'Flatten PDF',
    description: 'Flatten form fields',
    longDescription: 'Convert interactive form fields and annotations into static content.',
    icon: FileCheck,
    accept: '.pdf',
    multiple: false,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
  },
  'fill-forms': {
    name: 'Fill PDF Forms',
    description: 'Fill out PDF forms',
    longDescription: 'Fill in the interactive form fields in your PDF document.',
    icon: FileText,
    accept: '.pdf',
    multiple: false,
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
  },
  'annotate': {
    name: 'Annotate PDF',
    description: 'Add notes and markup',
    longDescription: 'Add highlights, notes, and annotations to your PDF document.',
    icon: FileText,
    accept: '.pdf',
    multiple: false,
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
    options: [
      { name: 'text', type: 'text', label: 'Annotation Text', default: '' },
      { name: 'page', type: 'number', label: 'Page Number', default: 1, min: 1 },
    ],
  },
  'pdf-a': {
    name: 'PDF to PDF/A',
    description: 'Convert to archival format',
    longDescription: 'Transform your PDF to PDF/A, the ISO-standardized version for long-term archiving.',
    icon: Archive,
    accept: '.pdf',
    multiple: false,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
  },
  // ==================== NEW PDFFILLER TOOLS ====================
  'create-pdf': { name: 'Create PDF', description: 'Generate a new PDF', longDescription: 'Generate a new PDF or fillable form from scratch.', icon: FilePlus, accept: '.txt,.doc,.docx', multiple: false, color: 'from-red-500 to-rose-600', bgColor: 'bg-red-50' },
  'replace-text': { name: 'Replace Text', description: 'Find and replace text', longDescription: 'Find and swap out existing text in your PDFs.', icon: FileText, accept: '.pdf', multiple: false, color: 'from-red-500 to-rose-600', bgColor: 'bg-red-50', options: [{ name: 'find', type: 'text', label: 'Find text', default: '' }, { name: 'replace', type: 'text', label: 'Replace with', default: '' }] },
  'add-text-fields': { name: 'Add Text Fields', description: 'Insert fillable fields', longDescription: 'Insert fillable text fields for user input.', icon: FileText, accept: '.pdf', multiple: false, color: 'from-red-500 to-rose-600', bgColor: 'bg-red-50' },
  'add-text': { name: 'Add Text', description: 'Insert custom text', longDescription: 'Insert custom text anywhere in a PDF.', icon: FileText, accept: '.pdf', multiple: false, color: 'from-red-500 to-rose-600', bgColor: 'bg-red-50', options: [{ name: 'text', type: 'textarea', label: 'Text to add', default: '' }, { name: 'x', type: 'number', label: 'X Position', default: 100, min: 0 }, { name: 'y', type: 'number', label: 'Y Position', default: 700, min: 0 }, { name: 'fontSize', type: 'number', label: 'Font Size', default: 16, min: 8, max: 72 }, { name: 'page', type: 'number', label: 'Page', default: 1, min: 1 }] },
  'add-images': { name: 'Add Images', description: 'Insert images into PDF', longDescription: 'Upload and insert images into your PDFs.', icon: Image, accept: '.pdf', multiple: false, color: 'from-red-500 to-rose-600', bgColor: 'bg-red-50' },
  'erase': { name: 'Erase Content', description: 'Remove content from PDF', longDescription: 'Remove unwanted content from PDFs using the eraser tool.', icon: Eraser, accept: '.pdf', multiple: false, color: 'from-red-500 to-rose-600', bgColor: 'bg-red-50' },
  'spell-check': { name: 'Check Spelling', description: 'Fix spelling errors', longDescription: 'Identify and fix spelling mistakes in your PDFs.', icon: FileCheck, accept: '.pdf', multiple: false, color: 'from-red-500 to-rose-600', bgColor: 'bg-red-50' },
  'add-checkmarks': { name: 'Add Checkmarks', description: 'Place checkmarks', longDescription: 'Place checkmarks to indicate selections or approvals.', icon: FileCheck, accept: '.pdf', multiple: false, color: 'from-red-500 to-rose-600', bgColor: 'bg-red-50', options: [{ name: 'x', type: 'number', label: 'X Position', default: 100 }, { name: 'y', type: 'number', label: 'Y Position', default: 700 }, { name: 'page', type: 'number', label: 'Page', default: 1, min: 1 }] },
  'add-tables': { name: 'Insert Tables', description: 'Add tables to PDF', longDescription: 'Add customizable tables to your PDFs.', icon: FileText, accept: '.pdf', multiple: false, color: 'from-red-500 to-rose-600', bgColor: 'bg-red-50', options: [{ name: 'rows', type: 'number', label: 'Rows', default: 3, min: 1 }, { name: 'cols', type: 'number', label: 'Columns', default: 3, min: 1 }] },
  'add-radio-buttons': { name: 'Radio Buttons', description: 'Add radio buttons', longDescription: 'Insert selectable radio button options for forms.', icon: FileText, accept: '.pdf', multiple: false, color: 'from-red-500 to-rose-600', bgColor: 'bg-red-50' },
  'add-dates': { name: 'Add Dates', description: 'Insert date fields', longDescription: 'Insert date fields in your PDFs.', icon: FileText, accept: '.pdf', multiple: false, color: 'from-red-500 to-rose-600', bgColor: 'bg-red-50', options: [{ name: 'format', type: 'select', label: 'Date Format', default: 'dd/mm/yyyy', options: [{ value: 'dd/mm/yyyy', label: 'DD/MM/YYYY' }, { value: 'mm/dd/yyyy', label: 'MM/DD/YYYY' }, { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD' }] }] },
  'highlight': { name: 'Highlight', description: 'Highlight text', longDescription: 'Highlight important data with color.', icon: FileText, accept: '.pdf', multiple: false, color: 'from-amber-500 to-orange-600', bgColor: 'bg-amber-50', options: [{ name: 'color', type: 'select', label: 'Highlight Color', default: 'yellow', options: [{ value: 'yellow', label: 'Yellow' }, { value: 'green', label: 'Green' }, { value: 'blue', label: 'Blue' }, { value: 'pink', label: 'Pink' }] }] },
  'add-comments': { name: 'Add Comments', description: 'Leave feedback', longDescription: 'Exchange comments and leave feedback in PDFs.', icon: FileText, accept: '.pdf', multiple: false, color: 'from-amber-500 to-orange-600', bgColor: 'bg-amber-50', options: [{ name: 'comment', type: 'textarea', label: 'Comment', default: '' }, { name: 'page', type: 'number', label: 'Page', default: 1, min: 1 }] },
  'add-arrows': { name: 'Add Arrows', description: 'Point out areas', longDescription: 'Point out specific document areas with arrows.', icon: FileText, accept: '.pdf', multiple: false, color: 'from-amber-500 to-orange-600', bgColor: 'bg-amber-50' },
  'add-notes': { name: 'Add Notes', description: 'Add sticky notes', longDescription: 'Place sticky notes with feedback or remarks.', icon: FileText, accept: '.pdf', multiple: false, color: 'from-amber-500 to-orange-600', bgColor: 'bg-amber-50', options: [{ name: 'note', type: 'textarea', label: 'Note', default: '' }, { name: 'page', type: 'number', label: 'Page', default: 1, min: 1 }] },
  'add-circles': { name: 'Add Circles', description: 'Draw circles', longDescription: 'Draw circles to highlight key areas.', icon: FileText, accept: '.pdf', multiple: false, color: 'from-amber-500 to-orange-600', bgColor: 'bg-amber-50' },
  'add-shapes': { name: 'Add Shapes', description: 'Add shapes', longDescription: 'Add rectangles, lines, and other shapes.', icon: FileText, accept: '.pdf', multiple: false, color: 'from-amber-500 to-orange-600', bgColor: 'bg-amber-50', options: [{ name: 'shape', type: 'select', label: 'Shape', default: 'rectangle', options: [{ value: 'rectangle', label: 'Rectangle' }, { value: 'circle', label: 'Circle' }, { value: 'line', label: 'Line' }] }] },
  'draw': { name: 'Freehand Draw', description: 'Draw on PDF', longDescription: 'Draw freehand annotations on your PDF.', icon: PenTool, accept: '.pdf', multiple: false, color: 'from-amber-500 to-orange-600', bgColor: 'bg-amber-50' },
  'share-pdf': { name: 'Share PDF', description: 'Share documents', longDescription: 'Send documents via links or email.', icon: FileText, accept: '.pdf', multiple: false, color: 'from-purple-500 to-violet-600', bgColor: 'bg-purple-50' },
  'request-signatures': { name: 'Request eSignatures', description: 'Get signatures', longDescription: 'Send a document for signing to others.', icon: PenTool, accept: '.pdf', multiple: false, color: 'from-purple-500 to-violet-600', bgColor: 'bg-purple-50' },
  'create-template': { name: 'Create Templates', description: 'Save templates', longDescription: 'Save reusable templates for quick document preparation.', icon: FileText, accept: '.pdf', multiple: false, color: 'from-purple-500 to-violet-600', bgColor: 'bg-purple-50' },
  'create-fillable': { name: 'Create Fillable Forms', description: 'Make fillable PDF', longDescription: 'Add fields, checkboxes, and dropdowns to PDFs.', icon: FileText, accept: '.pdf', multiple: false, color: 'from-pink-500 to-rose-600', bgColor: 'bg-pink-50' },
  'add-checkboxes': { name: 'Add Checkboxes', description: 'Insert checkboxes', longDescription: 'Insert interactive checkboxes for selections.', icon: FileCheck, accept: '.pdf', multiple: false, color: 'from-pink-500 to-rose-600', bgColor: 'bg-pink-50' },
  'remove-fields': { name: 'Remove Fields', description: 'Delete form fields', longDescription: 'Delete unnecessary fillable fields from PDF.', icon: Trash2, accept: '.pdf', multiple: false, color: 'from-pink-500 to-rose-600', bgColor: 'bg-pink-50' },
  'populate-forms': { name: 'Populate Forms', description: 'Pre-fill forms', longDescription: 'Pre-fill documents with spreadsheet data.', icon: FileText, accept: '.pdf', multiple: false, color: 'from-pink-500 to-rose-600', bgColor: 'bg-pink-50' },
  'insert-pages': { name: 'Insert Pages', description: 'Add new pages', longDescription: 'Add new pages to your document.', icon: FilePlus, accept: '.pdf', multiple: true, color: 'from-slate-600 to-gray-700', bgColor: 'bg-slate-50' },
  'export': { name: 'Export PDF', description: 'Save in formats', longDescription: 'Save and share PDFs in various formats.', icon: FileDown, accept: '.pdf', multiple: false, color: 'from-blue-500 to-indigo-600', bgColor: 'bg-blue-50', options: [{ name: 'format', type: 'select', label: 'Export Format', default: 'pdf', options: [{ value: 'pdf', label: 'PDF' }, { value: 'jpg', label: 'JPG Images' }, { value: 'png', label: 'PNG Images' }] }] },
};

export default function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const resolvedParams = use(params);
  const toolId = resolvedParams.tool;
  const tool = TOOLS_CONFIG[toolId];
  
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<Record<string, any>>({});
  const { processing, progress, error, result, processPDF, reset } = usePDFTools();

  // Initialize default options
  useEffect(() => {
    if (tool?.options) {
      const defaults: Record<string, any> = {};
      tool.options.forEach(opt => {
        defaults[opt.name] = opt.default ?? '';
      });
      setOptions(defaults);
    }
  }, [toolId]);

  if (!tool) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tool Not Found</h1>
          <p className="text-gray-500 mb-6">The requested tool "{toolId}" doesn't exist.</p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-red-500 hover:text-red-600 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Tools
          </Link>
        </div>
      </div>
    );
  }

  const Icon = tool.icon;

  const handleProcess = async () => {
    if (files.length === 0) return;
    await processPDF(toolId, files, options);
  };

  const handleDownload = () => {
    if (result) {
      const ext = result.type === 'application/zip' ? 'zip' : 
                  result.type.includes('image') ? 'jpg' : 
                  result.type.includes('text') ? 'txt' :
                  result.type.includes('csv') ? 'csv' : 'pdf';
      downloadFile(result.data, `${toolId}-result.${ext}`, result.type);
    }
  };

  const handleReset = () => {
    setFiles([]);
    reset();
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">All Tools</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Complete PDF</span>
          </Link>
        </div>
      </header>

      {/* Tool Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Tool Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className={`w-20 h-20 rounded-2xl ${tool.bgColor} flex items-center justify-center mx-auto mb-6`}>
            <Icon className="w-10 h-10 text-gray-700" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{tool.name}</h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">{tool.longDescription}</p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {/* Upload State */}
            {!processing && !result && (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8"
              >
                <FileUploader
                  accept={tool.accept}
                  multiple={tool.multiple}
                  files={files}
                  onFilesChange={setFiles}
                />

                {/* Options */}
                {tool.options && files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-8 pt-8 border-t border-gray-100"
                  >
                    <h3 className="font-semibold text-gray-900 mb-4">Options</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {tool.options.map((option) => (
                        <div key={option.name} className={option.type === 'textarea' ? 'md:col-span-2' : ''}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {option.label}
                          </label>
                          {option.type === 'select' ? (
                            <select
                              value={options[option.name] || ''}
                              onChange={(e) => setOptions({ ...options, [option.name]: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all bg-gray-50"
                            >
                              {option.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          ) : option.type === 'range' ? (
                            <div className="flex items-center gap-4">
                              <input
                                type="range"
                                min={option.min}
                                max={option.max}
                                value={options[option.name] || option.default}
                                onChange={(e) => setOptions({ ...options, [option.name]: Number(e.target.value) })}
                                className="flex-1 accent-red-500"
                              />
                              <span className="text-sm font-medium text-gray-600 w-12">
                                {options[option.name] || option.default}%
                              </span>
                            </div>
                          ) : option.type === 'textarea' ? (
                            <textarea
                              value={options[option.name] || ''}
                              onChange={(e) => setOptions({ ...options, [option.name]: e.target.value })}
                              placeholder={option.placeholder}
                              rows={3}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all bg-gray-50 resize-none"
                            />
                          ) : (
                            <input
                              type={option.type}
                              value={options[option.name] || ''}
                              onChange={(e) => setOptions({ ...options, [option.name]: option.type === 'number' ? Number(e.target.value) : e.target.value })}
                              min={option.min}
                              max={option.max}
                              placeholder={option.placeholder || option.label}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all bg-gray-50"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Process Button */}
                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8"
                  >
                    <button
                      onClick={handleProcess}
                      disabled={processing}
                      className="w-full py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {tool.name}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Processing State */}
            {processing && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-16 text-center"
              >
                <div className="relative w-24 h-24 mx-auto mb-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-full h-full"
                  >
                    <Loader2 className="w-24 h-24 text-red-500" />
                  </motion.div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">{progress}%</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing your file...</h3>
                <p className="text-gray-500">This may take a moment depending on file size</p>
                
                {/* Progress bar */}
                <div className="mt-8 max-w-xs mx-auto">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-gradient-to-r from-red-500 to-rose-600 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Result State */}
            {result && !processing && (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-16 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-8"
                >
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
                <p className="text-gray-500 mb-8">Your file has been processed and is ready to download.</p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all"
                  >
                    <Download className="w-5 h-5" />
                    Download Result
                  </button>
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                  >
                    Process Another File
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="m-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-700">Error Processing File</h4>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid md:grid-cols-3 gap-6"
        >
          {[
            { icon: Sparkles, title: 'Free Forever', text: 'No hidden costs or limits' },
            { icon: Lock, title: 'Secure Processing', text: 'Files processed locally in your browser' },
            { icon: CheckCircle, title: 'Fast Results', text: 'Ready in seconds' },
          ].map((feature) => (
            <div key={feature.title} className="flex items-start gap-3 p-4">
              <feature.icon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">{feature.title}</h4>
                <p className="text-sm text-gray-500">{feature.text}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
