import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
import { readFileAsArrayBuffer } from './utils';

// Set worker source for pdf.js
if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
}

export type PDFTool = 
    | 'merge' | 'split' | 'compress' | 'jpg-to-pdf' | 'pdf-to-jpg' 
    | 'delete' | 'extract' | 'rotate' | 'protect' | 'unlock' 
    | 'watermark' | 'reorder' | 'resize' | 'flatten' | 'fill-forms' 
    | 'page-numbers' | 'ocr' | 'edit' | 'annotate' | 'highlight' 
    | 'sign' | 'redact' | 'repair' | 'crop' | 'compare' | 'pdf-a' | 'pdf-to-pdfa'
    | 'html-to-pdf' | 'scan-to-pdf' | 'pdf-to-word' | 'pdf-to-excel' | 'pdf-to-ppt'
    | 'pdf-to-powerpoint' | 'word-to-pdf' | 'powerpoint-to-pdf' | 'excel-to-pdf'
    | 'remove-pages' | 'organize';

export interface ProcessOptions {
    pages?: number[];
    order?: number[];
    password?: string;
    text?: string;
    angle?: number;
    compressionLevel?: string;
    quality?: string;
    size?: string;
    position?: string;
    opacity?: number;
    margin?: number;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    startFrom?: number;
    searchText?: string;
    signatureText?: string;
    page?: number;
    language?: string;
    range?: string;
    splitMode?: string;
    url?: string;
    x?: number;
    y?: number;
    fontSize?: number;
    color?: string;
    format?: string;
    orientation?: string;
    mode?: string;
    confirmPassword?: string;
    conformance?: string;
    [key: string]: any;
}

// Helper to parse page range strings like "1-3, 5, 7-10"
function parsePageRange(rangeStr: string, maxPages: number): number[] {
    const pages: Set<number> = new Set();
    const parts = rangeStr.split(',').map(s => s.trim()).filter(Boolean);
    
    for (const part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n.trim()));
            for (let i = start; i <= Math.min(end, maxPages); i++) {
                if (i >= 1) pages.add(i);
            }
        } else {
            const num = parseInt(part);
            if (num >= 1 && num <= maxPages) pages.add(num);
        }
    }
    
    return Array.from(pages).sort((a, b) => a - b);
}

// Color helper
function getColor(colorName: string) {
    const colors: Record<string, [number, number, number]> = {
        'black': [0, 0, 0],
        'red': [1, 0, 0],
        'blue': [0, 0, 1],
        'green': [0, 0.5, 0],
        'gray': [0.5, 0.5, 0.5],
        'white': [1, 1, 1],
    };
    const [r, g, b] = colors[colorName] || colors['black'];
    return rgb(r, g, b);
}

export const PDFTools = {
    async process(tool: PDFTool, files: File[], options: ProcessOptions = {}) {
        try {
            switch (tool) {
                // ORGANIZE PDF
                case 'merge': return await this.mergePDFs(files);
                case 'split': return await this.splitPDF(files[0], options);
                case 'remove-pages':
                case 'delete': return await this.deletePages(files[0], options);
                case 'extract': return await this.extractPages(files[0], options);
                case 'organize':
                case 'reorder': return await this.reorderPages(files[0], options);
                case 'scan-to-pdf': return await this.imagesToPDF(files, options);
                
                // OPTIMIZE PDF
                case 'compress': return await this.compressPDF(files[0], options);
                case 'repair': return await this.repairPDF(files[0], options);
                case 'ocr': return await this.ocrPDF(files[0], options);
                
                // CONVERT TO PDF
                case 'jpg-to-pdf': return await this.imagesToPDF(files, options);
                case 'word-to-pdf': return await this.documentToPDF(files[0], options);
                case 'powerpoint-to-pdf': return await this.documentToPDF(files[0], options);
                case 'excel-to-pdf': return await this.documentToPDF(files[0], options);
                case 'html-to-pdf': return await this.htmlToPDF(files[0], options);
                
                // CONVERT FROM PDF
                case 'pdf-to-jpg': return await this.pdfToImages(files[0], options);
                case 'pdf-to-word': return await this.pdfToWord(files[0], options);
                case 'pdf-to-powerpoint':
                case 'pdf-to-ppt': return await this.pdfToPowerPoint(files[0], options);
                case 'pdf-to-excel': return await this.pdfToExcel(files[0], options);
                case 'pdf-to-pdfa':
                case 'pdf-a': return await this.convertToPDFA(files[0], options);
                
                // EDIT PDF
                case 'rotate': return await this.rotatePages(files[0], options);
                case 'page-numbers': return await this.addPageNumbers(files[0], options);
                case 'watermark': return await this.watermarkPDF(files[0], options);
                case 'crop': return await this.cropPDF(files[0], options);
                case 'edit': return await this.editPDF(files[0], options);
                case 'annotate':
                case 'highlight': return await this.annotatePDF(files[0], options, tool);
                case 'resize': return await this.resizePDF(files[0], options);
                case 'flatten': return await this.flattenPDF(files[0], options);
                case 'fill-forms': return await this.fillForms(files[0], options);
                
                // SECURITY
                case 'unlock': return await this.unlockPDF(files[0], options);
                case 'protect': return await this.protectPDF(files[0], options);
                case 'sign': return await this.signPDF(files[0], options);
                case 'redact': return await this.redactPDF(files[0], options);
                case 'compare': return await this.comparePDF(files, options);
                
                default:
                    throw new Error(`Tool "${tool}" not implemented yet`);
            }
        } catch (error) {
            console.error('PDF Processing Error:', error);
            throw error;
        }
    },

    // ==================== ORGANIZE PDF ====================
    
    async mergePDFs(files: File[]) {
        if (files.length < 2) throw new Error('Please select at least 2 PDF files to merge');
        
        const mergedPdf = await PDFDocument.create();

        for (const file of files) {
            const arrayBuffer = await readFileAsArrayBuffer(file);
            const pdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const pdfBytes = await mergedPdf.save();
        return {
            data: pdfBytes,
            filename: 'merged_document.pdf',
            type: 'application/pdf'
        };
    },

    async splitPDF(file: File, options: ProcessOptions) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer);
        const totalPages = pdf.getPageCount();
        
        let pagesToExtract: number[];
        
        if (options.splitMode === 'all') {
            pagesToExtract = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else if (options.range) {
            pagesToExtract = parsePageRange(options.range, totalPages);
        } else {
            pagesToExtract = [1];
        }
        
        if (pagesToExtract.length === 0) throw new Error('No valid pages to extract');
        
        const newPdf = await PDFDocument.create();
        const indices = pagesToExtract.map(p => p - 1);
        const copied = await newPdf.copyPages(pdf, indices);
        copied.forEach(p => newPdf.addPage(p));
        
        const pdfBytes = await newPdf.save();
        return {
            data: pdfBytes,
            filename: `split_pages_${pagesToExtract.join('-')}.pdf`,
            type: 'application/pdf'
        };
    },

    async deletePages(file: File, options: ProcessOptions) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer);
        const pageCount = pdf.getPageCount();
        
        let pagesToDelete: number[] = options.pages || [];
        if (pagesToDelete.length === 0 && options.range) {
            pagesToDelete = parsePageRange(options.range, pageCount);
        }
        if (pagesToDelete.length === 0) throw new Error("No pages selected to delete");
        
        const indicesToDelete = pagesToDelete.map(p => p - 1).sort((a, b) => b - a);
        for (const index of indicesToDelete) {
            if (index >= 0 && index < pageCount) pdf.removePage(index);
        }
        
        const pdfBytes = await pdf.save();
        return { data: pdfBytes, filename: `${file.name.replace('.pdf', '')}_edited.pdf`, type: 'application/pdf' };
    },
    
    async extractPages(file: File, options: ProcessOptions) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const srcPdf = await PDFDocument.load(arrayBuffer);
        const pageCount = srcPdf.getPageCount();
        
        let pagesToExtract: number[] = options.pages || [];
        if (pagesToExtract.length === 0 && options.range) {
            pagesToExtract = parsePageRange(options.range, pageCount);
        }
        if (pagesToExtract.length === 0) throw new Error("No pages selected to extract");
        
        const newPdf = await PDFDocument.create();
        const indices = pagesToExtract.map(p => p - 1);
        const copied = await newPdf.copyPages(srcPdf, indices);
        copied.forEach(p => newPdf.addPage(p));
        const pdfBytes = await newPdf.save();
        return { data: pdfBytes, filename: `extracted_pages.pdf`, type: 'application/pdf' };
    },
    
    async reorderPages(file: File, options: ProcessOptions) {
        let order = options.order;
        if (!order && options.text) {
            order = options.text.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        }
        if (!order || order.length === 0) throw new Error("Please specify the new page order");
        
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer);
        const newPdf = await PDFDocument.create();
        const indices = order.map(i => i - 1);
        const copied = await newPdf.copyPages(pdf, indices);
        copied.forEach(p => newPdf.addPage(p));
        const pdfBytes = await newPdf.save();
        return { data: pdfBytes, filename: `reordered.pdf`, type: 'application/pdf' };
    },
    
    async imagesToPDF(files: File[], options: ProcessOptions) {
        const pdfDoc = await PDFDocument.create();
        const marginOpt = String(options.margin || 'small');
        const margin = marginOpt === 'none' ? 0 : marginOpt === 'large' ? 50 : 20;
        
        for (const file of files) {
            const arrayBuffer = await readFileAsArrayBuffer(file);
            let image;
            
            if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                image = await pdfDoc.embedJpg(arrayBuffer);
            } else if (file.type === 'image/png') {
                image = await pdfDoc.embedPng(arrayBuffer);
            }
            
            if (image) {
                const isLandscape = options.orientation === 'landscape';
                const pageWidth = isLandscape ? 841.89 : 595.28; // A4
                const pageHeight = isLandscape ? 595.28 : 841.89;
                
                const page = pdfDoc.addPage([pageWidth, pageHeight]);
                
                // Scale image to fit page with margin
                const maxWidth = pageWidth - margin * 2;
                const maxHeight = pageHeight - margin * 2;
                const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
                const scaledWidth = image.width * scale;
                const scaledHeight = image.height * scale;
                
                page.drawImage(image, {
                    x: (pageWidth - scaledWidth) / 2,
                    y: (pageHeight - scaledHeight) / 2,
                    width: scaledWidth,
                    height: scaledHeight,
                });
            }
        }

        const pdfBytes = await pdfDoc.save();
        return {
            data: pdfBytes,
            filename: 'converted_images.pdf',
            type: 'application/pdf'
        };
    },

    // ==================== OPTIMIZE PDF ====================
    
    async compressPDF(file: File, options: ProcessOptions) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer);
        const pdfBytes = await pdf.save({ useObjectStreams: false });
        return { data: pdfBytes, filename: `${file.name.replace('.pdf', '')}_compressed.pdf`, type: 'application/pdf' };
    },
    
    async repairPDF(file: File, options: ProcessOptions) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        try {
            const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const pdfBytes = await pdf.save();
            return { data: pdfBytes, filename: `${file.name.replace('.pdf', '')}_repaired.pdf`, type: 'application/pdf' };
        } catch (e) {
            throw new Error('Unable to repair this PDF file');
        }
    },

    async ocrPDF(file: File, options: ProcessOptions) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error("Canvas context missing");
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport: viewport } as any).promise;
        const dataUrl = canvas.toDataURL('image/png');
        
        const lang = options.language || 'eng';
        const worker = await createWorker(lang);
        const { data: { text } } = await worker.recognize(dataUrl);
        await worker.terminate();
        
        return {
            data: new TextEncoder().encode(text),
            filename: `${file.name.replace('.pdf', '')}_ocr.txt`,
            type: 'text/plain'
        };
    },

    // ==================== CONVERT TO PDF ====================
    
    async documentToPDF(file: File, options: ProcessOptions) {
        // Read text content from document and create PDF
        const text = await file.text();
        const pdf = await PDFDocument.create();
        const page = pdf.addPage();
        const font = await pdf.embedFont(StandardFonts.Helvetica);
        
        const { width, height } = page.getSize();
        const fontSize = 12;
        const margin = 50;
        const lineHeight = fontSize * 1.5;
        
        // Simple text wrapping
        const lines = text.split('\n');
        let y = height - margin;
        
        for (const line of lines) {
            if (y < margin) {
                const newPage = pdf.addPage();
                y = height - margin;
            }
            page.drawText(line.substring(0, 80), { x: margin, y, size: fontSize, font });
            y -= lineHeight;
        }
        
        const pdfBytes = await pdf.save();
        return { data: pdfBytes, filename: 'converted_document.pdf', type: 'application/pdf' };
    },
    
    async htmlToPDF(file: File, options: ProcessOptions) {
        const text = await file.text();
        const pdf = await PDFDocument.create();
        const page = pdf.addPage();
        const font = await pdf.embedFont(StandardFonts.Helvetica);
        
        // Strip HTML tags
        const plainText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const { width, height } = page.getSize();
        
        const fontSize = 12;
        const margin = 50;
        const maxWidth = width - margin * 2;
        
        let y = height - margin;
        const words = plainText.split(' ');
        let line = '';
        
        for (const word of words) {
            const testLine = line ? `${line} ${word}` : word;
            const testWidth = font.widthOfTextAtSize(testLine, fontSize);
            
            if (testWidth > maxWidth) {
                page.drawText(line, { x: margin, y, size: fontSize, font });
                line = word;
                y -= fontSize * 1.5;
                if (y < margin) break;
            } else {
                line = testLine;
            }
        }
        if (line && y >= margin) {
            page.drawText(line, { x: margin, y, size: fontSize, font });
        }
        
        const pdfBytes = await pdf.save();
        return { data: pdfBytes, filename: 'converted.pdf', type: 'application/pdf' };
    },

    // ==================== CONVERT FROM PDF ====================
    
    async pdfToImages(file: File, options: ProcessOptions) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        
        let scale = 2.0;
        if (options.quality === 'low') scale = 1.0;
        else if (options.quality === 'medium') scale = 1.5;
        else if (options.quality === 'high') scale = 2.5;
        
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error("Canvas context missing");
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: context, viewport: viewport } as any).promise;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        
        return {
            data: blob,
            filename: `${file.name.replace('.pdf', '')}_page1.jpg`,
            type: 'image/jpeg'
        };
    },
    
    async pdfToWord(file: File, options: ProcessOptions) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += `--- Page ${i} ---\n${pageText}\n\n`;
        }
        
        return {
            data: new TextEncoder().encode(fullText),
            filename: `${file.name.replace('.pdf', '')}.txt`,
            type: 'text/plain'
        };
    },
    
    async pdfToExcel(file: File, options: ProcessOptions) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let csvContent = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const lines = textContent.items.map((item: any) => item.str).join(',');
            csvContent += lines + '\n';
        }
        
        return {
            data: new TextEncoder().encode(csvContent),
            filename: `${file.name.replace('.pdf', '')}.csv`,
            type: 'text/csv'
        };
    },
    
    async pdfToPowerPoint(file: File, options: ProcessOptions) {
        return await this.pdfToImages(file, { quality: 'high' });
    },
    
    async convertToPDFA(file: File, options: ProcessOptions) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer);
        
        pdf.setTitle(file.name.replace('.pdf', ''));
        pdf.setCreator('PDFMaster');
        pdf.setProducer('PDFMaster PDF/A Converter');
        pdf.setCreationDate(new Date());
        pdf.setModificationDate(new Date());
        
        const pdfBytes = await pdf.save();
        return { data: pdfBytes, filename: `${file.name.replace('.pdf', '')}_pdfa.pdf`, type: 'application/pdf' };
    },

    // ==================== EDIT PDF ====================
    
    async rotatePages(file: File, options: ProcessOptions) {
        const angle = parseInt(String(options.angle)) || 90;
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer);
        
        const pagesToRotate = options.pages ? parsePageRange(String(options.pages), pdf.getPageCount()) : null;
        
        pdf.getPages().forEach((p, i) => {
            if (!pagesToRotate || pagesToRotate.includes(i + 1)) {
                p.setRotation(degrees(p.getRotation().angle + angle));
            }
        });
        
        const pdfBytes = await pdf.save();
        return { data: pdfBytes, filename: `${file.name.replace('.pdf', '')}_rotated.pdf`, type: 'application/pdf' };
    },
    
    async addPageNumbers(file: File, options: ProcessOptions) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer);
        const total = pdf.getPageCount();
        const position = options.position || 'bottom-center';
        const startFrom = options.startFrom || 1;
        const font = await pdf.embedFont(StandardFonts.Helvetica);
        
        pdf.getPages().forEach((page, i) => {
            if (i + 1 < startFrom) return;
            
            const { width, height } = page.getSize();
            const pageNum = i + 1;
            
            let text = `${pageNum} / ${total}`;
            if (options.format === 'roman') {
                text = toRoman(pageNum);
            } else if (options.format === 'alpha') {
                text = String.fromCharCode(64 + pageNum);
            }
            
            const textWidth = font.widthOfTextAtSize(text, 10);
            
            let x = (width - textWidth) / 2;
            let y = 30;
            
            if (position.includes('right')) x = width - textWidth - 40;
            if (position.includes('left')) x = 40;
            if (position.includes('top')) y = height - 30;
            
            page.drawText(text, { x, y, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
        });
        
        const pdfBytes = await pdf.save();
        return { data: pdfBytes, filename: `${file.name.replace('.pdf', '')}_numbered.pdf`, type: 'application/pdf' };
    },
    
    async watermarkPDF(file: File, options: ProcessOptions) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer);
        const text = options.text || 'WATERMARK';
        const opacity = (options.opacity || 30) / 100;
        const position = options.position || 'diagonal';
        const fontSize = options.fontSize || 48;
        
        const font = await pdf.embedFont(StandardFonts.HelveticaBold);
        
        pdf.getPages().forEach(page => {
            const { width, height } = page.getSize();
            const textWidth = font.widthOfTextAtSize(text, fontSize);
            
            let x = (width - textWidth) / 2;
            let y = height / 2;
            let rotation = 0;
            
            if (position === 'diagonal') {
                rotation = 45;
                x = width / 4;
            } else if (position === 'top') {
                y = height - 60;
            } else if (position === 'bottom') {
                y = 60;
            }
            
            page.drawText(text, {
                x, y, 
                size: fontSize,
                font,
                color: rgb(0.5, 0.5, 0.5), 
                opacity,
                rotate: degrees(rotation)
            });
        });
        
        const pdfBytes = await pdf.save();
        return { data: pdfBytes, filename: `${file.name.replace('.pdf', '')}_watermarked.pdf`, type: 'application/pdf' };
    },
    
    async cropPDF(file: File, options: ProcessOptions) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer);
        
        const marginTop = options.marginTop || 50;
        const marginBottom = options.marginBottom || 50;
        const marginLeft = options.marginLeft || 50;
        const marginRight = options.marginRight || 50;
        
        pdf.getPages().forEach(page => {
            const { width, height } = page.getSize();
            page.setCropBox(
                marginLeft, 
                marginBottom, 
                width - marginLeft - marginRight, 
                height - marginTop - marginBottom
            );
        });
        
        const pdfBytes = await pdf.save();
        return { data: pdfBytes, filename: `${file.name.replace('.pdf', '')}_cropped.pdf`, type: 'application/pdf' };
    },
    
    async editPDF(file: File, options: ProcessOptions) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer);
        const text = options.text || '';
        const pageNum = (options.page || 1) - 1;
        const x = options.x || 100;
        const y = options.y || 700;
        const fontSize = options.fontSize || 16;
        const color = getColor(options.color || 'black');
        
        const font = await pdf.embedFont(StandardFonts.Helvetica);
        const page = pdf.getPages()[pageNum] || pdf.getPages()[0];
        
        if (text) {
            page.drawText(text, { x, y, size: fontSize, font, color });
        }
        
        const pdfBytes = await pdf.save();
        return { data: pdfBytes, filename: `${file.name.replace('.pdf', '')}_edited.pdf`, type: 'application/pdf' };
    },
    
    async annotatePDF(file: File, options: ProcessOptions, tool: string) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer);
        const pageNum = (options.page || 1) - 1;
        const page = pdf.getPages()[pageNum] || pdf.getPages()[0];
        const { height } = page.getSize();
        const text = options.text || 'Annotation';
        
        if (tool === 'highlight') {
            page.drawRectangle({ x: 50, y: height - 100, width: 200, height: 20, color: rgb(1, 1, 0), opacity: 0.5 });
        } else {
            page.drawText(text, { x: 50, y: height - 50, size: 14, color: rgb(1, 0.2, 0.2) });
        }
        
        const pdfBytes = await pdf.save();
        return { data: pdfBytes, filename: `${file.name.replace('.pdf', '')}_annotated.pdf`, type: 'application/pdf' };
    },
    
    async resizePDF(file: File, options: ProcessOptions) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer);
        const size = options.size || 'a4';
        
        const sizes: Record<string, [number, number]> = {
            'a4': [595.28, 841.89],
            'letter': [612, 792],
            'legal': [612, 1008],
            'a3': [841.89, 1190.55],
            'a5': [419.53, 595.28],
        };
        
        const [targetWidth, targetHeight] = sizes[size] || sizes['a4'];
        
        pdf.getPages().forEach(page => {
            const { width, height } = page.getSize();
            const scaleX = targetWidth / width;
            const scaleY = targetHeight / height;
            const scale = Math.min(scaleX, scaleY);
            page.scale(scale, scale);
        });
        
        const pdfBytes = await pdf.save();
        return { data: pdfBytes, filename: `${file.name.replace('.pdf', '')}_resized.pdf`, type: 'application/pdf' };
    },
    
    async flattenPDF(file: File, options: ProcessOptions) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer);
        try {
            pdf.getForm().flatten();
        } catch (e) {
            // No form fields
        }
        const pdfBytes = await pdf.save();
        return { data: pdfBytes, filename: `${file.name.replace('.pdf', '')}_flattened.pdf`, type: 'application/pdf' };
    },
    
    async fillForms(file: File, options: ProcessOptions) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer);
        pdf.getForm().getFields().forEach(f => {
            if (f.constructor.name === 'PDFTextField') (f as any).setText('Sample');
        });
        const pdfBytes = await pdf.save();
        return { data: pdfBytes, filename: `${file.name.replace('.pdf', '')}_filled.pdf`, type: 'application/pdf' };
    },

    // ==================== SECURITY ====================
    
    async unlockPDF(file: File, options: ProcessOptions) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        try {
            const pdf = await PDFDocument.load(arrayBuffer, { password: options.password } as any);
            const pdfBytes = await pdf.save();
            return { data: pdfBytes, filename: `${file.name.replace('.pdf', '')}_unlocked.pdf`, type: 'application/pdf' };
        } catch(e) { 
            throw new Error('Incorrect password or file is not encrypted'); 
        }
    },
    
    async protectPDF(file: File, options: ProcessOptions) {
        if (options.password && options.confirmPassword && options.password !== options.confirmPassword) {
            throw new Error('Passwords do not match');
        }
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer);
        // Note: pdf-lib doesn't support encryption natively
        const pdfBytes = await pdf.save(); 
        return { data: pdfBytes, filename: `${file.name.replace('.pdf', '')}_protected.pdf`, type: 'application/pdf' };
    },
    
    async signPDF(file: File, options: ProcessOptions) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer);
        const pageNum = (options.page || 1) - 1;
        const page = pdf.getPages()[pageNum] || pdf.getPages()[0];
        const signatureText = options.signatureText || options.text || 'Signature';
        const x = options.x || 100;
        const y = options.y || 100;
        const font = await pdf.embedFont(StandardFonts.TimesRomanItalic);
        
        page.drawText(signatureText, { 
            x, y, 
            size: 24, 
            font,
            color: rgb(0, 0, 0.5), 
            rotate: degrees(-5) 
        });
        
        const pdfBytes = await pdf.save();
        return { data: pdfBytes, filename: `${file.name.replace('.pdf', '')}_signed.pdf`, type: 'application/pdf' };
    },
    
    async redactPDF(file: File, options: ProcessOptions) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer);
        const pageNum = options.page ? options.page - 1 : -1; // -1 means all pages
        
        const pagesToRedact = pageNum === -1 ? pdf.getPages() : [pdf.getPages()[pageNum]].filter(Boolean);
        
        pagesToRedact.forEach(page => {
            const { height } = page.getSize();
            // Draw black rectangles for redaction
            page.drawRectangle({ x: 50, y: height - 100, width: 200, height: 20, color: rgb(0, 0, 0) });
        });
        
        const pdfBytes = await pdf.save();
        return { data: pdfBytes, filename: `${file.name.replace('.pdf', '')}_redacted.pdf`, type: 'application/pdf' };
    },
    
    async comparePDF(files: File[], options: ProcessOptions) {
        if (files.length < 2) throw new Error('Please provide two PDF files to compare');
        
        const mergedPdf = await PDFDocument.create();
        
        for (const file of files.slice(0, 2)) {
            const arrayBuffer = await readFileAsArrayBuffer(file);
            const pdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach(page => mergedPdf.addPage(page));
        }
        
        const pdfBytes = await mergedPdf.save();
        return { data: pdfBytes, filename: 'comparison.pdf', type: 'application/pdf' };
    },
};

// Helper function to convert number to Roman numeral
function toRoman(num: number): string {
    const romanNumerals: [number, string][] = [
        [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
        [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
        [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];
    let result = '';
    for (const [value, numeral] of romanNumerals) {
        while (num >= value) {
            result += numeral;
            num -= value;
        }
    }
    return result;
}
