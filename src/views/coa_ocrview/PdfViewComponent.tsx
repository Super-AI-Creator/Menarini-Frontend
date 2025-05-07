import { useState, useRef, useMemo, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface OcrMatch {
  id?: number;
  index: string;
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  page_width: number;
  page_height: number;
  pdf_path: string;
}

interface PdfViewerProps {
  pdfUrl: string;
  ocrData: OcrMatch[];
  scale?: number;
  highlightedField?: { key: string; page: number; index?: string };
  documentData: any[];
  onSelectRegion?: (fieldKey: string, index: string, region: {x: number, y: number, width: number, height: number, page: number}) => void;
  isSelectingRegion?: boolean;
  currentSelectingField?: {key: string, index: string};
}

const PdfViewerWithOcr = ({ 
  pdfUrl, 
  ocrData = [], 
  scale = 1.0,
  highlightedField,
  documentData,
  onSelectRegion,
  isSelectingRegion,
  currentSelectingField
}: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [selection, setSelection] = useState<{start: {x: number, y: number, page: number}, end: {x: number, y: number, page: number}} | null>(null);
  const pdfViewerWidth = 1200;
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Group OCR data by page
  const groupedOcrData = useMemo(() => {
    const grouped: Record<number, OcrMatch[]> = {};
    ocrData.forEach(match => {
      if (!grouped[match.page]) {
        grouped[match.page] = [];
      }
      grouped[match.page].push(match);
    });
    return grouped;
  }, [ocrData]);

  const getFieldPosition = (field: OcrMatch) => {
    const scaleFactor = pdfViewerWidth / field.page_width;
    
    return {
      position: 'absolute' as const,
      left: `${field.x * scaleFactor}px`,
      top: `${field.y * scaleFactor}px`,
      width: `${field.width * scaleFactor}px`,
      height: `${field.height * scaleFactor}px`,
      zIndex: 1,
    };
  };

  const handleMouseDown = (e: React.MouseEvent, pageNumber: number) => {
    if (!isSelectingRegion || !pdfContainerRef.current) return;
    
    const rect = pdfContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setSelection({
      start: { x, y, page: pageNumber },
      end: { x, y, page: pageNumber }
    });
  };

  const handleMouseMove = (e: React.MouseEvent, pageNumber: number) => {
    if (!isSelectingRegion || !selection || !pdfContainerRef.current) return;
    
    const rect = pdfContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setSelection({
      ...selection,
      end: { x, y, page: pageNumber }
    });
  };

  const handleMouseUp = () => {
    if (!isSelectingRegion || !selection || !currentSelectingField || !pdfContainerRef.current) {
      setSelection(null);
      return;
    }

    const startX = Math.min(selection.start.x, selection.end.x);
    const startY = Math.min(selection.start.y, selection.end.y);
    const width = Math.abs(selection.end.x - selection.start.x);
    const height = Math.abs(selection.end.y - selection.start.y);

    // Find the page data to get page dimensions
    const pageData = groupedOcrData[selection.start.page]?.[0];
    if (!pageData) {
      setSelection(null);
      return;
    }

    // Convert screen coordinates back to PDF coordinates
    const scaleFactor = pdfViewerWidth / pageData.page_width;
    const pdfX = startX / scaleFactor;
    const pdfY = startY / scaleFactor;
    const pdfWidth = width / scaleFactor;
    const pdfHeight = height / scaleFactor;

    if (onSelectRegion && currentSelectingField) {
      onSelectRegion(
        currentSelectingField.key,
        currentSelectingField.index,
        {
          x: pdfX,
          y: pdfY,
          width: pdfWidth,
          height: pdfHeight,
          page: selection.start.page
        }
      );
    }

    setSelection(null);
  };

  const renderSelection = () => {
    if (!selection || selection.start.page !== selection.end.page) return null;

    const startX = Math.min(selection.start.x, selection.end.x);
    const startY = Math.min(selection.start.y, selection.end.y);
    const width = Math.abs(selection.end.x - selection.start.x);
    const height = Math.abs(selection.end.y - selection.start.y);

    return (
      <div
        style={{
          position: 'absolute',
          left: `${startX}px`,
          top: `${startY}px`,
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: 'rgba(0, 0, 255, 0.3)',
          border: '2px solid blue',
          zIndex: 2,
          pointerEvents: 'none'
        }}
      />
    );
  };

  return (
    <div 
      ref={pdfContainerRef}
      style={{ 
        width: `${pdfViewerWidth}px`, 
        margin: '0 auto',
        position: 'relative',
        cursor: isSelectingRegion ? 'crosshair' : 'default'
      }}
    >
      <Document
        file={pdfUrl}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={<div>Loading PDF...</div>}
        error={<div style={{ color: 'red' }}>Failed to load PDF</div>}
      >
        {numPages && Array.from({ length: numPages }, (_, index) => {
          const pageNumber = index + 1;
          const pageMatches = groupedOcrData[pageNumber] || [];
          const firstMatch = pageMatches[0];
          
          return (
            <div 
              key={`page-${index}`} 
              id={`page-${pageNumber}`}
              style={{ 
                position: 'relative',
                marginBottom: '20px',
                height: firstMatch 
                  ? `${(pdfViewerWidth * firstMatch.page_height) / firstMatch.page_width}px`
                  : 'auto'
              }}
              onMouseDown={(e) => handleMouseDown(e, pageNumber)}
              onMouseMove={(e) => handleMouseMove(e, pageNumber)}
              onMouseUp={handleMouseUp}
            >
              <Page
                pageNumber={pageNumber}
                width={pdfViewerWidth}
                loading={<div>Loading page {pageNumber}...</div>}
                error={<div>Failed to load page {pageNumber}</div>}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
              
              {pageMatches.map((field, i) => (
                <div
                  key={`field-${field.id || i}`}
                  style={getFieldPosition(field)}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: highlightedField?.key === field.key && 
                                      highlightedField?.page === pageNumber && 
                                      highlightedField?.index === field.index
                        ? 'rgba(255, 0, 0, 0.3)' 
                        : 'transparent',
                      border: highlightedField?.key === field.key && 
                            highlightedField?.page === pageNumber && 
                            highlightedField?.index === field.index
                        ? '2px solid red' 
                        : 'none',
                      boxSizing: 'border-box',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              ))}
              
              {selection?.start.page === pageNumber && renderSelection()}
            </div>
          );
        })}
      </Document>
    </div>
  );
};

export default PdfViewerWithOcr;