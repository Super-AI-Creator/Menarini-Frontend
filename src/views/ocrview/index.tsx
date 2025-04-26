import PdfViewerWithOcr from './PdfViewComponent';
import { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { AlertComponent } from 'src/Alert/alert';

interface DocumentItem {
  [key: string]: any;
  id?: string;
  Document?: string;
}

const OCRViewer = () => {
  const [pdfData, setPdfData] = useState(null);
  const [pdfpath, setPdfPath] = useState(null);
  const [documentData, setDocumentData] = useState<DocumentItem[] | null>(null);
  const [updatedDocumentData, setUpdatedDocumentData] = useState<DocumentItem[] | null>(null);
  const [highlightedField, setHighlightedField] = useState<{ key: string; page: number } | null>(null);
  const { dn, doc_type, document } = useParams();
  const [alertState, setAlertState] = useState(false)
  const [alertColor, setAlertColor] = useState("")
  const [alertMessage, setAlertMessage] = useState("")
  const decodedDocument = decodeURIComponent(document);

  useEffect(() => {
    const fetchAttachmentInfo = async () => {
      try {
        const response = await axios.post('/api2/dn/attachment_info', {
          'DN#': dn,
          'Doc Type': doc_type,
        });
        setDocumentData(response.data);
        setUpdatedDocumentData(JSON.parse(JSON.stringify(response.data))); // Deep copy
      } catch (error) {
        console.error('Error fetching attachment info:', error);
      }
    };

    fetchAttachmentInfo();
  }, [dn, doc_type]);

  useEffect(() => {
    const fetchOCRInfo = async () => {
      try {
        const response = await axios.post('/api2/dn/ocr_info', {
          'DN#': dn,
          pdf_path: decodedDocument,
          data: documentData,
        });
        setPdfData(response.data['data']);
        setPdfPath(response.data['pdf_path']);
      } catch (error) {
        console.error('Error fetching OCR info:', error);
      }
    };

    if (documentData) {
      fetchOCRInfo();
    }
  }, [documentData, dn, decodedDocument]);

  const handleFieldClick = (key: string, page: number) => {
    if (highlightedField?.key === key && highlightedField?.page === page) {
      setHighlightedField(null);
    } else {
      setHighlightedField({ key, page });
    }
  };

  const handleSaveChanges = async () => {
    if (!updatedDocumentData) return;

    try {
      // Find all changed fields
      const changes = updatedDocumentData.map((updatedItem, index) => {
        const originalItem = documentData?.[index] || {};
        const changedFields: Record<string, any> = {};

        Object.keys(updatedItem).forEach(key => {
          if (updatedItem[key] !== originalItem[key] && key !== 'id' && key !== 'Document') {
            changedFields[key] = updatedItem[key];
          }
        });

        return {
          id: updatedItem.id,
          changes: changedFields
        };
      }).filter(item => Object.keys(item.changes).length > 0);

      // Send changes to server
      await axios.post('/api2/dn/update_fields', {
        "DN#":dn,
        "DocType":doc_type,
        "data":changes
      });

      setAlertState(true)
      setAlertMessage("The change updated successfully.")
      setAlertColor("success")
      
      setTimeout(() => {
        setAlertState(false);
      }, 5000);
    } catch (error) {
      setAlertState(true)
      setAlertMessage("There was error.")
      setAlertColor("error")
      
      setTimeout(() => {
        setAlertState(false);
      }, 5000);
    }
  };

  return (
    <div style={{ height: '85vh', display: 'flex', justifyContent: 'space-between', gap: '5' }}>
      {/* PDF Viewer Section */}
      <div style={{ flex: 1, marginRight: '30px' }}>
        {pdfData && pdfpath ? '' : 'Waiting...'}
        {pdfData && pdfpath && (
          <div style={{ marginTop: '20px', border: '1px solid #ddd', borderRadius: '4px', height: '100%', overflow: 'auto' }}>
            <PdfViewerWithOcr
              pdfUrl={`http://127.0.0.1:5005/${pdfpath}`}
              ocrData={pdfData}
              highlightedField={highlightedField}
            />
          </div>
        )}
      </div>

      {/* Form Section */}
      <div style={{ width: '15%', backgroundColor: 'white', overflow: 'auto', padding: '10px' }}>
        {documentData && updatedDocumentData && documentData.map((item, key) => {
          const orderedEntries = Object.entries(item).filter(([k]) => k !== 'Document' && k !== 'id');
          
          return (
            <div key={key} className="mb-6 p-4 bg-white">
              {documentData.length >= 2 && <h2 className="text-lg font-semibold mb-3">Item {key + 1}</h2>}
              
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
                {orderedEntries.map(([fieldKey, originalValue], idx) => (
                  <div key={`${key}-${fieldKey}`} className="text-sm group relative">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1" style={{ textAlign: 'left' }}>
                        <span className="font-medium text-gray-700"><b>{fieldKey}</b>:</span>
                        <input
                          type="text"
                          value={updatedDocumentData[key]?.[fieldKey] ?? ''}
                          onChange={(e) => {
                            if (!updatedDocumentData) return;
                            const newData = [...updatedDocumentData];
                            newData[key] = { ...newData[key], [fieldKey]: e.target.value };
                            setUpdatedDocumentData(newData);
                          }}
                          className={`w-full p-1 border rounded text-gray-900 font-normal ${
                            updatedDocumentData[key]?.[fieldKey] !== documentData[key]?.[fieldKey]
                              ? 'border-yellow-400 bg-yellow-50'
                              : 'border-gray-300'
                          }`}
                        />
                      </div>

                      {pdfData && (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => {
                              const pageData = pdfData.find((page: any) => 
                                page.matches.some((match: any) => match.key === fieldKey)
                              );
                              if (pageData) {
                                handleFieldClick(fieldKey, pageData.page);
                              }
                            }}
                            className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 hover:shadow-sm ${
                              highlightedField?.key === fieldKey
                                ? 'bg-blue-100/80 text-blue-600 hover:bg-blue-200/80'
                                : 'bg-gray-100/50 text-gray-500 hover:bg-gray-200/50'
                            }`}
                            title={highlightedField?.key === fieldKey ? 'Remove highlight' : 'Highlight in document'}
                          >
                            <Icon
                              icon={highlightedField?.key === fieldKey ? "clarity:eye-hide-solid" : "clarity:eye-show-solid"}
                              width="20"
                              height="20"
                            />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <button
          onClick={handleSaveChanges}
          disabled={!updatedDocumentData || JSON.stringify(updatedDocumentData) === JSON.stringify(documentData)}
          className={`w-full mt-4 p-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
            !updatedDocumentData || JSON.stringify(updatedDocumentData) === JSON.stringify(documentData)
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-green-100/80 text-green-600 hover:bg-green-200/80'
          }`}
          title={
            !updatedDocumentData || JSON.stringify(updatedDocumentData) === JSON.stringify(documentData)
              ? "No changes to save"
              : "Save all changes"
          }
        >
          <Icon icon="carbon:save" width="20" height="20" />
          Save Changes
        </button>
      </div>
      <AlertComponent alert = {alertState} message={alertMessage} color={alertColor} />
    </div>
  );
};

export default OCRViewer;