import { useState, useRef, useMemo  } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Worker setup
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface OcrMatch {
  key: string;
  value: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence?: number;
}

interface OcrPageData {
  page: number;
  matches: OcrMatch[];
}

interface PdfViewerProps {
  pdfUrl: string;
  ocrData?: OcrPageData[];
}

const PdfViewerWithOcr = ({ pdfUrl, ocrData = [] }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageDimensions, setPageDimensions] = useState<{width: number, height: number}[]>([]);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const file = useMemo(() => ({
    url: pdfUrl,
    httpHeaders: { 'Accept': 'application/pdf' },
    withCredentials: false,
  }), [pdfUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onPageLoadSuccess = (pageIndex: number) => {
    return ({ width, height }: { width: number; height: number }) => {
      setPageDimensions(prev => {
        const newDimensions = [...prev];
        newDimensions[pageIndex] = { width, height };
        return newDimensions;
      });
    };
  };

  const getFieldPosition = (field: OcrMatch, pageIndex: number) => {
    if (!pageDimensions[pageIndex] || !pageRefs.current[pageIndex]) {
      return { display: 'none' };
    }
    
    const { width: pageWidth, height: pageHeight } = pageDimensions[pageIndex];
    const viewportWidth = pageRefs.current[pageIndex]?.clientWidth || 0;
    const scale = viewportWidth / pageWidth;
    
    return {
      position: 'absolute',
      left: `${field.x * scale}px`,
      top: `${(pageHeight - field.y - field.height) * scale}px`,
      width: `${field.width * scale}px`,
      height: `${field.height * scale}px`,
      backgroundColor: `rgba(255, 255, 0, ${field.confidence ? field.confidence/100 : 0.3})`,
      border: '1px solid red',
      zIndex: 1,
    };
  };

  const getMatchesForPage = (pageNum: number): OcrMatch[] => {
    if (!ocrData || !Array.isArray(ocrData)) return [];
    const pageData = ocrData.find(item => item?.page === pageNum);
    return pageData?.matches || [];
  };

  return (
    <div style={{ position: 'relative' }}>
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<div>Loading PDF...</div>}
        error={<div>Failed to load PDF</div>}
        noData={<div>No PDF file selected</div>}
        externalLinkTarget="_blank"
      >
        {Array.from({ length: numPages || 0 }, (_, index) => (
          <div key={`page-${index}`} style={{ position: 'relative', marginBottom: '40px' }}>
            <Page
              pageNumber={index + 1}
              onLoadSuccess={onPageLoadSuccess(index)}
              inputRef={el => (pageRefs.current[index] = el)}
              width={800}
              loading={<div>Loading page {index + 1}...</div>}
              error={<div>Failed to load page {index + 1}</div>}
              renderTextLayer={false} // Disable default text layer
              renderAnnotationLayer={false} // Disable default annotations
            />
            
            {getMatchesForPage(index + 1).map((field, i) => (
              <div
                key={`field-${index}-${i}`}
                style={getFieldPosition(field, index)}
              >
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  left: 0,
                  fontSize: '10px',
                  color: 'blue',
                  backgroundColor: 'white',
                  padding: '2px',
                  zIndex: 2,
                }}>
                  {field.key}
                </div>
                <input
                  type="text"
                  value={field.value}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid #ccc',
                    padding: '2px',
                    fontSize: '14px',
                  }}
                  readOnly
                />
              </div>
            ))}
          </div>
        ))}
      </Document>
    </div>
  );
};

export default PdfViewerWithOcr;