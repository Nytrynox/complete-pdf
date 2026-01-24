import { useState, useCallback } from 'react';
import { PDFTools, type PDFTool, type ProcessOptions } from '@/lib/pdf-utils';

interface ProcessResult {
    data: ArrayBuffer | Uint8Array | Blob;
    filename: string;
    type: string;
}

export function usePDFTools() {
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ProcessResult | null>(null);

    const processPDF = useCallback(async (tool: string, files: File[], options: Record<string, any> = {}) => {
        setProcessing(true);
        setError(null);
        setProgress(0);
        setResult(null);

        try {
            // Parse options to match ProcessOptions interface
            const processOptions: ProcessOptions = {
                ...options,
                angle: options.angle ? parseInt(options.angle) : undefined,
                pages: options.pages ? parsePages(options.pages) : undefined,
                order: options.order ? parsePages(options.order) : undefined,
                opacity: options.opacity ? parseInt(options.opacity) : undefined,
                margin: options.margin ? parseInt(options.margin) : undefined,
                startFrom: options.startFrom ? parseInt(options.startFrom) : undefined,
                page: options.page ? parseInt(options.page) : undefined,
            };

            // Simulate progress for better UX
            const interval = setInterval(() => {
                setProgress(prev => Math.min(prev + Math.random() * 15, 90));
            }, 200);

            const processResult = await PDFTools.process(tool as PDFTool, files, processOptions);
            
            clearInterval(interval);
            setProgress(100);

            setResult({
                data: processResult.data,
                filename: processResult.filename,
                type: processResult.type
            });
            
        } catch (err: any) {
            console.error('PDF Processing Error:', err);
            setError(err.message || "An error occurred while processing");
        } finally {
            setProcessing(false);
        }
    }, []);

    const reset = useCallback(() => {
        setProcessing(false);
        setProgress(0);
        setError(null);
        setResult(null);
    }, []);

    return {
        processPDF,
        processing,
        progress: Math.round(progress),
        error,
        result,
        reset
    };
}

// Helper to parse page strings like "1, 3, 5-7" into number arrays
function parsePages(input: string | number[]): number[] {
    if (Array.isArray(input)) return input;
    if (typeof input !== 'string') return [];
    
    const pages: number[] = [];
    const parts = input.split(',').map(s => s.trim());
    
    for (const part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n.trim()));
            for (let i = start; i <= end; i++) {
                if (!isNaN(i)) pages.push(i);
            }
        } else {
            const num = parseInt(part);
            if (!isNaN(num)) pages.push(num);
        }
    }
    
    return pages;
}

export default usePDFTools;
