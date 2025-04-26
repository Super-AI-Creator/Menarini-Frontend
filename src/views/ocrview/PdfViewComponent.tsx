import { useState, useRef, useMemo, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface OcrMatch {
  key: string;
  value: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page_width?: number;
  page_height?: number;
}

interface PdfViewerProps {
  pdfUrl: string;
  ocrData: Array<{ 
    page: number; 
    matches: OcrMatch[];
    page_width: number;
    page_height: number;
  }>;
  scale?: number;
  highlightedField?: { key: string; page: number };
}

const PdfViewerWithOcr = ({ 
  pdfUrl, 
  ocrData = [], 
  scale = 1.0,
  highlightedField 
}: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const pdfViewerWidth = 1200; // Fixed width as requested

  const getFieldPosition = (field: OcrMatch, pageNumber: number) => {
    const pageData = ocrData.find(p => p.page === pageNumber);
    if (!pageData) return { display: 'none' };

    // Calculate scale factor (1000px viewer vs original PDF width)
    const scaleFactor = pdfViewerWidth / pageData.page_width;
    
    let height = 20;
    let width = 100;
    return {
      position: 'absolute' as const,
      left: `${field.x * scaleFactor}px`,
      top: `${field.y * scaleFactor}px`,
      width: `${field.width * scaleFactor + 10}px`,
      height: `${height}px`,
      zIndex: 1,
      margin:'-3px'
    };
  };
  const scrollToHighlightedField = () => {
    if (highlightedField) {
      const element = document.getElementById(`page-${highlightedField.page}`);
      if (element) {
        // Temporarily add scroll-margin to prevent top-edge issues
        element.style.scrollMarginTop = '100px';
        
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'  // Changed from 'center' to 'start'
        });
        
        // Remove scroll-margin after scrolling completes
        setTimeout(() => {
          element.style.scrollMarginTop = '';
        }, 1000);
      }
    }
  };

  useEffect(() => {
    scrollToHighlightedField();
  }, [highlightedField]);

  return (
    <div style={{ 
      width: `${pdfViewerWidth}px`, 
      margin: '0 auto',
      position: 'relative'
    }}>
      <Document
        file={pdfUrl}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={<div>Loading PDF...</div>}
        error={<div style={{ color: 'red' }}>Failed to load PDF</div>}
      >
        {Array.from({ length: numPages || 0 }, (_, index) => {
          const pageNumber = index + 1;
          const pageData = ocrData.find(p => p.page === pageNumber);
          
          return (
            <div 
              key={`page-${index}`} 
              id={`page-${pageNumber}`}
              style={{ 
                position: 'relative',
                marginBottom: '20px',
                height: pageData 
                  ? `${(pdfViewerWidth * pageData.page_height) / pageData.page_width}px`
                  : 'auto'
              }}
            >
              <Page
                pageNumber={pageNumber}
                width={pdfViewerWidth}
                loading={<div>Loading page {pageNumber}...</div>}
                error={<div>Failed to load page {pageNumber}</div>}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
              
              {pageData?.matches.map((field, i) => (
                <div
                  key={`field-${i}`}
                  style={getFieldPosition(field, pageNumber)}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: highlightedField?.key === field.key && highlightedField?.page === pageNumber 
                        ? 'rgba(255, 0, 0, 0.3)' 
                        : 'transparent',
                      border: highlightedField?.key === field.key && highlightedField?.page === pageNumber 
                        ? '2px solid red' 
                        : 'none',
                      boxSizing: 'border-box',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </Document>
    </div>
  );
};

export default PdfViewerWithOcr;