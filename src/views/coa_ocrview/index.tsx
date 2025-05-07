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
  const [pdfData, setPdfData] = useState<any[]>([]);
  const [pdfpath, setPdfPath] = useState<string | null>(null);
  const [documentData, setDocumentData] = useState<DocumentItem[] | null>(null);
  const [updatedDocumentData, setUpdatedDocumentData] = useState<DocumentItem[] | null>(null);
  const [highlightedField, setHighlightedField] = useState<{ key: string; page: number; index?: string } | null>(null);
  const [isSelectingRegion, setIsSelectingRegion] = useState(false);
  const [currentSelectingField, setCurrentSelectingField] = useState<{key: string, index: string} | null>(null);
  const { dn, doc_type, document,index } = useParams();
  const [alertState, setAlertState] = useState(false);
  const [alertColor, setAlertColor] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const decodedDocument = decodeURIComponent(document || '');

  useEffect(() => {
    const fetchAttachmentInfo = async () => {
      try {
        const response = await axios.post('/api2/dn/coa_attachment_info', {
          'DN#': dn,
          'Doc Type': doc_type,
          'index':index,
        });
        setDocumentData(response.data);
        setUpdatedDocumentData(JSON.parse(JSON.stringify(response.data)));
      } catch (error) {
        console.error('Error fetching attachment info:', error);
      }
    };

    fetchAttachmentInfo();
  }, [dn, doc_type]);

  useEffect(() => {
    const fetchOCRInfo = async () => {
      try {
        const response = await axios.post('/api2/dn/coa_ocr_info', {
          'DN#': dn,
          "Doc Type":doc_type,
          "document" : document,
        });
        setPdfData(response.data);
        const originalPath = response.data[0]?.pdf_path || null;
        if (originalPath) {
          const fileName = originalPath.split(/[\\/]/).pop(); // Extract filename from path
          const relativePath = `ocr_downloads/${fileName}`;
          setPdfPath(relativePath);
        } else {
          setPdfPath(null);
        }
      } catch (error) {
        console.error('Error fetching OCR info:', error);
      }
    };

    if (documentData) {
      fetchOCRInfo();
    }
  }, [documentData, dn, decodedDocument]);

  const handleFieldClick = (key: string, page: number, index: string) => {
    if (highlightedField?.key === key && highlightedField?.page === page && highlightedField?.index === index) {
      setHighlightedField(null);
    } else {
      setHighlightedField({ key, page, index });
    }
  };

  const handleRegionSelect = (fieldKey: string, index: string, region: {x: number, y: number, width: number, height: number, page: number}) => {
    setIsSelectingRegion(false);
    setCurrentSelectingField(null);

    // Check if this field already has position data
    const existingField = pdfData.find(f => 
      f.key === fieldKey && f.index === index
    );

    if (existingField) {
      // Update existing position
      updateFieldPosition(existingField.id, region);
    } else {
      // Create new position
      createFieldPosition(fieldKey, index, region);
    }
  };

  const updateFieldPosition = async (id: number, region: {x: number, y: number, width: number, height: number, page: number}) => {
    try {
      const response = await axios.post('/api2/dn/update_field_position', {
        id,
        x: region.x,
        y: region.y,
        width: region.width,
        height: region.height,
        page: region.page
      });

      // Update local state
      setPdfData(prev => 
        prev.map(field => 
          field.id === id ? {...field, ...region} : field
        )
      );

      setAlertState(true);
      setAlertMessage("Field position updated successfully.");
      setAlertColor("success");
      
      setTimeout(() => {
        setAlertState(false);
      }, 5000);
    } catch (error) {
      setAlertState(true);
      setAlertMessage("Failed to update field position.");
      setAlertColor("error");
      
      setTimeout(() => {
        setAlertState(false);
      }, 5000);
    }
  };

  const createFieldPosition = async (fieldKey: string, index: string, region: {x: number, y: number, width: number, height: number, page: number}) => {
    try {
      const response = await axios.post('/api2/dn/create_field_position', {
        'DN#': dn,
        'Doc Type': doc_type,
        pdf_path: decodedDocument,
        key: fieldKey,
        index,
        x: region.x,
        y: region.y,
        width: region.width,
        height: region.height,
        page: region.page,
        page_width: pdfData[0]?.page_width,
        page_height: pdfData[0]?.page_height
      });

      // Update local state
      setPdfData(prev => [...prev, {
        ...region,
        id: response.data.id,
        key: fieldKey,
        index,
        page_width: pdfData[0]?.page_width,
        page_height: pdfData[0]?.page_height,
        pdf_path: pdfData[0]?.pdf_path
      }]);

      setAlertState(true);
      setAlertMessage("Field position created successfully.");
      setAlertColor("success");
      
      setTimeout(() => {
        setAlertState(false);
      }, 5000);
    } catch (error) {
      setAlertState(true);
      setAlertMessage("Failed to create field position.");
      setAlertColor("error");
      
      setTimeout(() => {
        setAlertState(false);
      }, 5000);
    }
  };

  const startRegionSelection = (fieldKey: string, index: string) => {
    setIsSelectingRegion(true);
    setCurrentSelectingField({key: fieldKey, index});
    setHighlightedField(null);
  };

  const cancelRegionSelection = () => {
    setIsSelectingRegion(false);
    setCurrentSelectingField(null);
  };

  const handleSaveChanges = async () => {
    if (!updatedDocumentData) return;

    try {
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

      await axios.post('/api2/dn/update_fields', {
        "DN#": dn,
        "DocType": doc_type,
        "data": changes
      });

      setAlertState(true);
      setAlertMessage("The change updated successfully.");
      setAlertColor("success");
      
      setTimeout(() => {
        setAlertState(false);
      }, 5000);
    } catch (error) {
      setAlertState(true);
      setAlertMessage("There was an error.");
      setAlertColor("error");
      
      setTimeout(() => {
        setAlertState(false);
      }, 5000);
    }
  };

  return (
    <div style={{ height: '85vh', display: 'flex', justifyContent: 'space-between', gap: '5' }}>
      {/* PDF Viewer Section */}
      <div style={{ flex: 1, marginRight: '30px' }}>
        {pdfData.length > 0 && pdfpath ? (
          <div style={{ marginTop: '20px', border: '1px solid #ddd', borderRadius: '4px', height: '100%', overflow: 'auto' }}>
            <PdfViewerWithOcr
              pdfUrl={`http://127.0.0.1:5005/${pdfpath}`}
              ocrData={pdfData}
              highlightedField={highlightedField}
              documentData={updatedDocumentData || []}
              onSelectRegion={handleRegionSelect}
              isSelectingRegion={isSelectingRegion}
              currentSelectingField={currentSelectingField}
            />
          </div>
        ) : 'Waiting...'}
      </div>

      {/* Form Section */}
      <div style={{ width: '15%', backgroundColor: 'white', overflow: 'auto', padding: '10px' }}>
        {isSelectingRegion && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg flex justify-between items-center">
            <span className="text-blue-700">Select area on PDF for {currentSelectingField?.key}</span>
            <button 
              onClick={cancelRegionSelection}
              className="text-red-500 hover:text-red-700"
            >
              <Icon icon="mdi:close" width="20" height="20" />
            </button>
          </div>
        )}
        
        {documentData && updatedDocumentData && documentData.map((item, index) => {
          const itemIndex = index + 1;
          const orderedEntries = Object.entries(item).filter(([k]) => k !== 'Document' && k !== 'id');
          
          return (
            <div key={index} className="mb-6 p-4 bg-white">
              {documentData.length >= 2 && <h2 className="text-lg font-semibold mb-3">Item {itemIndex}</h2>}
              
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
                {orderedEntries.map(([fieldKey, originalValue], idx) => {
                  const hasPosition = pdfData.some(f => f.key === fieldKey && f.index === itemIndex.toString());
                  
                  return (
                    <div key={`${index}-${fieldKey}`} className="text-sm group relative">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1" style={{ textAlign: 'left' }}>
                          <span className="font-medium text-gray-700"><b>{fieldKey}</b>:</span>
                          <input
                            type="text"
                            value={updatedDocumentData[index]?.[fieldKey] ?? ''}
                            onChange={(e) => {
                              if (!updatedDocumentData) return;
                              const newData = [...updatedDocumentData];
                              newData[index] = { ...newData[index], [fieldKey]: e.target.value };
                              setUpdatedDocumentData(newData);
                            }}
                            className={`w-full p-1 border rounded text-gray-900 font-normal ${
                              updatedDocumentData[index]?.[fieldKey] !== documentData[index]?.[fieldKey]
                                ? 'border-yellow-400 bg-yellow-50'
                                : 'border-gray-300'
                            }`}
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          {/* Highlight button */}
                          <button
                            onClick={() => {
                              const fieldMatch = pdfData.find((match: any) => 
                                match.key === fieldKey && match.index === itemIndex.toString()
                              );
                              if (fieldMatch) {
                                handleFieldClick(fieldKey, fieldMatch.page, fieldMatch.index);
                              }
                            }}
                            className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 hover:shadow-sm ${
                              highlightedField?.key === fieldKey && 
                              highlightedField?.index === itemIndex.toString()
                                ? 'bg-blue-100/80 text-blue-600 hover:bg-blue-200/80'
                                : 'bg-gray-100/50 text-gray-500 hover:bg-gray-200/50'
                            }`}
                            title={
                              highlightedField?.key === fieldKey && 
                              highlightedField?.index === itemIndex.toString()
                                ? 'Remove highlight' 
                                : 'Highlight in document'
                            }
                          >
                            <Icon
                              icon={
                                highlightedField?.key === fieldKey && 
                                highlightedField?.index === itemIndex.toString()
                                  ? "clarity:eye-hide-solid" 
                                  : "clarity:eye-show-solid"
                              }
                              width="20"
                              height="20"
                            />
                          </button>
                          
                          {/* Create/Change position button */}
                          <button
                            onClick={() => startRegionSelection(fieldKey, itemIndex.toString())}
                            className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 hover:shadow-sm ${
                              hasPosition
                                ? 'bg-purple-100/80 text-purple-600 hover:bg-purple-200/80'
                                : 'bg-green-100/80 text-green-600 hover:bg-green-200/80'
                            }`}
                            title={hasPosition ? 'Change position' : 'Create position'}
                          >
                            <Icon
                              icon={hasPosition ? "mdi:pencil" : "mdi:plus"}
                              width="20"
                              height="20"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
      <AlertComponent alert={alertState} message={alertMessage} color={alertColor} />
    </div>
  );
};

export default OCRViewer;

// {
//     'matches': [
  // {'data': [{'page': 1, 'page_width': 2381, 'page_height': 3366, 'matches': [{'key': 'Packing Slip#', 'value': '191419', 'x': 1774, 'y': 687, 'width': 128, 'height': 25}, {'key': 'Packing Slip#', 'value
  //   ': '191419', 'x': 1774, 'y': 687, 'width': 128, 'height': 25}, {'key': 'Batch#', 'value': '6004-11231-20', 'x': 247, 'y': 1145, 'width': 1223, 'height': 29}, {'key': 'Quantity', 'value': '5000', 'x': 
  //   1546, 'y': 1144, 'width': 83, 'height': 25}, {'key': 'Batch#', 'value': '6004-11231-20', 'x': 247, 'y': 1145, 'width': 1223, 'height': 29}, {'key': 'Expiry Date', 'value': '15/07/2027', 'x': 566, 'y':
  //    1259, 'width': 219, 'height': 30}, {'key': 'Expiry Date', 'value': '15/07/2027', 'x': 566, 'y': 1259, 'width': 219, 'height': 30}, {'key': 'Batch#', 'value': '6004-11231-20', 'x': 130, 'y': 1451, 'wi
  //   dth': 405, 'height': 27}, {'key': 'Batch#', 'value': '6004-11231-20', 'x': 130, 'y': 1451, 'width': 405, 'height': 27}, {'key': 'Quantity', 'value': '8080', 'x': 1546, 'y': 1448, 'width': 83, 'height'
  //   : 25}, {'key': 'Expiry Date', 'value': '15/07/2027', 'x': 566, 'y': 1563, 'width': 219, 'height': 29}, {'key': 'Expiry Date', 'value': '15/07/2027', 'x': 566, 'y': 1563, 'width': 219, 'height': 29}, {
  //   'key': 'Document Date', 'value': '29-OCT-2024', 'x': 565, 'y': 2322, 'width': 242, 'height': 26}, {'key': 'Document Date', 'value': '29-OCT-2024', 'x': 565, 'y': 2322, 'width': 242, 'height': 26}, {'k
  //   ey': 'Incoterms', 'value': 'CIP', 'x': 564, 'y': 2553, 'width': 64, 'height': 23}, {'key': 'Incoterms', 'value': 'CIP', 'x': 564, 'y': 2553, 'width': 64, 'height': 23}]}], 'pdf_path': 'ocr_downloads/Z
  //   UELLIG PHARMA VIETNAM LTD_191419_P01-006452_!DN!_.pdf'}
    
// [
//       {'id':1,'index': '1', 'key': 'Batch#', 'x': 502, 'y': 1959, 'width': 124, 'height': 25, 'page': 1, 'page_width': 2380, 'page_height': 3368,'pdf_path': 'ocr_downloads/MENARINI AUSTRALIA PTY LTD_2510898671_0052PO-001157_!DN!_.pdf'},
//       {'id':2,'index': '2', 'key': 'Batch#',  'x': 502, 'y': 2389, 'width': 123, 'height': 25, 'page': 1, 'page_width': 2380, 'page_height': 3368,'pdf_path': 'ocr_downloads/MENARINI AUSTRALIA PTY LTD_2510898671_0052PO-001157_!DN!_.pdf'},
//       {'id':3,'index': '1', 'key': 'Document Date',  'x': 443, 'y': 414, 'width': 151, 'height': 24, 'page': 1, 'page_width': 2380, 'page_height': 3368,'pdf_path': 'ocr_downloads/MENARINI AUSTRALIA PTY LTD_2510898671_0052PO-001157_!DN!_.pdf'},
//       {'id':4,'index': '2', 'key': 'Document Date', 'x': 443, 'y': 414, 'width': 151, 'height': 24, 'page': 1, 'page_width': 2380, 'page_height': 3368,'pdf_path': 'ocr_downloads/MENARINI AUSTRALIA PTY LTD_2510898671_0052PO-001157_!DN!_.pdf'},
//       {'id':5,'index': '1', 'key': 'Expiry Date', 'x': 1053, 'y': 1960, 'width': 107, 'height': 24, 'page': 1, 'page_width': 2380, 'page_height': 3368,'pdf_path': 'ocr_downloads/MENARINI AUSTRALIA PTY LTD_2510898671_0052PO-001157_!DN!_.pdf'},
//       {'id':6,'index': '2', 'key': 'Expiry Date',  'x': 1053, 'y': 2390, 'width': 107, 'height': 24, 'page': 1, 'page_width': 2380, 'page_height': 3368,'pdf_path': 'ocr_downloads/MENARINI AUSTRALIA PTY LTD_2510898671_0052PO-001157_!DN!_.pdf'},
//       {'id':7,'index': '1', 'key': 'Incoterms',  'x': 312, 'y': 1244, 'width': 236, 'height': 35, 'page': 1, 'page_width': 2380, 'page_height': 3368,'pdf_path': 'ocr_downloads/MENARINI AUSTRALIA PTY LTD_2510898671_0052PO-001157_!DN!_.pdf'},
//       {'id':8,'index': '2', 'key': 'Incoterms',  'x': 312, 'y': 1244, 'width': 236, 'height': 35, 'page': 1, 'page_width': 2380, 'page_height': 3368,'pdf_path': 'ocr_downloads/MENARINI AUSTRALIA PTY LTD_2510898671_0052PO-001157_!DN!_.pdf'},
//       {'id':9,'index': '1', 'key': 'Item Code',  'x': 1096, 'y': 1798, 'width': 135, 'height': 24, 'page': 1, 'page_width': 2380, 'page_height': 3368,'pdf_path': 'ocr_downloads/MENARINI AUSTRALIA PTY LTD_2510898671_0052PO-001157_!DN!_.pdf'},
//       {'id':10,'index': '2', 'key': 'Item Code',  'x': 1096, 'y': 2228, 'width': 135, 'height': 24, 'page': 1, 'page_width': 2380, 'page_height': 3368,'pdf_path': 'ocr_downloads/MENARINI AUSTRALIA PTY LTD_2510898671_0052PO-001157_!DN!_.pdf'},
//       {'id':11,'index': '1', 'key': 'Manufacturing Date',  'x': 730, 'y': 1960, 'width': 152, 'height': 24, 'page': 1, 'page_width': 2380, 'page_height': 3368,'pdf_path': 'ocr_downloads/MENARINI AUSTRALIA PTY LTD_2510898671_0052PO-001157_!DN!_.pdf'},
//       {'id':12,'index': '2', 'key': 'Manufacturing Date','x': 730, 'y': 2390, 'width': 152, 'height': 24, 'page': 1, 'page_width': 2380, 'page_height': 3368,'pdf_path': 'ocr_downloads/MENARINI AUSTRALIA PTY LTD_2510898671_0052PO-001157_!DN!_.pdf'},
//       {'id':13,'index': '1', 'key': 'Packing Slip#', 'x': 309, 'y': 366, 'width': 168, 'height': 24, 'page': 1, 'page_width': 2380, 'page_height': 3368,'pdf_path': 'ocr_downloads/MENARINI AUSTRALIA PTY LTD_2510898671_0052PO-001157_!DN!_.pdf'},
//       {'id':14,'index': '2', 'key': 'Packing Slip#', 'x': 309, 'y': 366, 'width': 168, 'height': 24, 'page': 1, 'page_width': 2380, 'page_height': 3368,'pdf_path': 'ocr_downloads/MENARINI AUSTRALIA PTY LTD_2510898671_0052PO-001157_!DN!_.pdf'}
// ]
      // ],
//     'pdf_path': 'ocr_downloads/MENARINI AUSTRALIA PTY LTD_2510898671_0052PO-001157_!DN!_.pdf'
//   }

// {'data': [{'page': 1, 'page_width': 2380, 'page_height': 3368, 'matches': [{'key': 'Packing Slip#', 'value': '2510898671', 'x': 309, 'y': 366, 'width': 168, 'height': 24}, {'key': 'Packing Slip#', 'v
//   alue': '2510898671', 'x': 309, 'y': 366, 'width': 168, 'height': 24}, {'key': 'Document Date', 'value': '12.04.2024', 'x': 443, 'y': 414, 'width': 151, 'height': 24}, {'key': 'Document Date', 'value'
//   : '12.04.2024', 'x': 443, 'y': 414, 'width': 151, 'height': 24}, {'key': 'Incoterms', 'value': 'Export Standard', 'x': 312, 'y': 1244, 'width': 236, 'height': 35}, {'key': 'Incoterms', 'value': 'Expo
//   rt Standard', 'x': 312, 'y': 1244, 'width': 236, 'height': 35}, {'key': 'Item Code', 'value': '50000974', 'x': 1096, 'y': 1798, 'width': 135, 'height': 24}, {'key': 'Item Code', 'value': '50000974', 
//   'x': 1096, 'y': 1798, 'width': 135, 'height': 24}, {'key': 'Batch#', 'value': 'E0132E6', 'x': 502, 'y': 1959, 'width': 124, 'height': 25}, {'key': 'Expiry Date', 'value': '11.2025', 'x': 1053, 'y': 1
//   960, 'width': 107, 'height': 24}, {'key': 'Manufacturing Date', 'value': '21.12.2023', 'x': 730, 'y': 1960, 'width': 152, 'height': 24}, {'key': 'Expiry Date', 'value': '11.2025', 'x': 1053, 'y': 196
//   0, 'width': 107, 'height': 24}, {'key': 'Item Code', 'value': '50000974', 'x': 1096, 'y': 2228, 'width': 135, 'height': 24}, {'key': 'Item Code', 'value': '50000974', 'x': 1096, 'y': 2228, 'width': 1
//   35, 'height': 24}, {'key': 'Batch#', 'value': 'E0133E3', 'x': 502, 'y': 2389, 'width': 123, 'height': 25}, {'key': 'Expiry Date', 'value': '11.2025', 'x': 1053, 'y': 2390, 'width': 107, 'height': 24}
//   , {'key': 'Expiry Date', 'value': '11.2025', 'x': 1053, 'y': 2390, 'width': 107, 'height': 24}, {'key': 'Manufacturing Date', 'value': '22.12.2023', 'x': 730, 'y': 2390, 'width': 152, 'height': 24}]}
//   ], 'pdf_path': 'ocr_downloads/MENARINI AUSTRALIA PTY LTD_2510898671_0052PO-001157_!DN!_.pdf'}