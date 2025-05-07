import { Badge, Table, Dropdown, Progress, Checkbox, Button, Modal, Pagination } from 'flowbite-react';
import * as basicTable4 from '../../tables/tableData.ts';
import { IconDotsVertical } from '@tabler/icons-react';
import { Icon } from '@iconify/react';
import { IconArrowBackUp, IconCheck, IconX, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import TitleCard from 'src/components/shared/TitleBorderCard.tsx';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axios';
import { useState, useEffect, useContext, useMemo } from 'react';
import { stat } from 'fs';
import { AuthContext } from 'src/context/AuthContext';
import { useSocket } from 'src/SokcetProvider';
import { AlertComponent } from 'src/Alert/alert';
import { resolve } from 'path';
import PdfViewerWithOcr from './PdfViewComponent';

const index = () => {
  const { socket, isConnected } = useSocket();
  const context = useContext(AuthContext);
  const { user } = context;
  const [openAttachmentModal, setOpenAttachmentModal] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [duplicatedError, setDuplicatedError] = useState(false);
  const [duplicatedData, setDuplicatedData] = useState([]);
  const [openErrorModal, setOpenError] = useState(false);
  const [attachmentData, setAttachmentData] = useState([]);
  const [duplicatedDocument, setDuplicatedDocument] = useState("")
  const [errorData, setErrorData] = useState([]);
  const [currentDocType, setCurrentDocType] = useState("")
  const [currentDN, setCurrentDN] = useState("")
  const [coaLength, setCoaLength] = useState(0)
  const [coaFlagCheck, setCOAFlagCheck] = useState({})
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Adjust as needed

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({
    key: 'Date',
    direction: 'descending'
  });

  const [alertState, setAlertState] = useState(false)
  const [alertColor, setAlertColor] = useState("")
  const [alertMessage, setAlertMessage] = useState("")

  const [modalDN, setModalDN] = useState("")
  const [modalData, setModalData] = useState([])
  const [modalDocument, setModalDocument] = useState("")
  const [OCRFlag, setOCRFlag] = useState(false)
  const [docType, setModalDocType] = useState("")
  const navigate = useNavigate();

  // Sorting function
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get sorted data
  const handleDateChange = (from: string, to: string) => {
    setDateRange({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined
    });
  };

  // Update your sortedData memo to include proper date filtering
  const sortedData = useMemo(() => {
    if (!tableData.length) return [];

    let filteredItems = [...tableData];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(item =>
        String(item['DN#']).toLowerCase().includes(term) ||
        String(item['Supplier']).toLowerCase().includes(term) ||
        String(item['Status']).toLowerCase().includes(term)
      );
    }

    // Apply date filter
    if (dateRange.from && dateRange.to) {
      filteredItems = filteredItems.filter(item => {
        if (!item['Date']) return false;

        const itemDate = new Date(item['Date']);
        // Reset time components for accurate date comparison
        itemDate.setHours(0, 0, 0, 0);

        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);

        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999); // Include entire end day

        return itemDate >= fromDate && itemDate <= toDate;
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      filteredItems.sort((a, b) => {
        // Special handling for date sorting
        if (sortConfig.key === 'Date') {
          const dateA = new Date(a['Date']).getTime();
          const dateB = new Date(b['Date']).getTime();
          return sortConfig.direction === 'ascending'
            ? dateA - dateB
            : dateB - dateA;
        }

        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredItems;
  }, [tableData, sortConfig, searchTerm, dateRange]);

  // Get current items for pagination
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  // Total pages for pagination
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  const updateDuplicatedDocument = async () => {
    const response = await axios.post('/api2/dn/update_duplicated_state', {
      'duplicatedDocument': duplicatedDocument,
      'DN#': currentDN,
      'Doc Type': currentDocType,
      'email': user['email'],
    });
    setAlertState(true)
    setAlertMessage("Attachment information has changed. Wait a moment while the server processing new information...")
    setAlertColor("success")

    setTimeout(() => {
      setAlertState(false);
    }, 5000);
    setOpenAttachmentModal(false)
  }

  /*Table Action*/
  const tableActionData = [
    {
      id: 2,
      icon: 'tabler:note',
      listtitle: 'Error',
    },
    {
      id: 1,
      icon: 'tabler:plus',
      listtitle: 'PO List',
    },
  ];

  const handleActionButton = (id: any, type: number) => {
    if (type == 1) {
      navigate(`/dn-list/${id}`);
    }
    if (type == 2) {
      openError(id);
    }
  };

  const openEmail = (email: any) => {
    navigate(`/email/${email}`);
  }

  const openAttachmentinfo = async (docType: any, dn: any, status: any) => {
    if (status == 1 || status == -1) {
      setDuplicatedError(false)
      setDuplicatedData([])
      setOpenAttachmentModal(true);
      setCurrentDocType(docType)
      setCurrentDN(dn)
      const duplicated_response = await axios.post('/api2/dn/duplicated_test', {
        'DN#': dn,
        'Doc Type': docType,
      });
      if (duplicated_response.data.length >= 2) {
        setDuplicatedError(true)
        setDuplicatedData(duplicated_response.data)
        return
      }
      const response = await axios.post('/api2/dn/attachment_info', {
        'DN#': dn,
        'Doc Type': docType,
      });
      setModalDN(dn)
      setModalDocType(docType)
      if (response.data)
        setModalDocument(response.data[0]["Document"])
      setModalData(response.data)
      if (docType === "COA") {
        const flags = {};
        response.data.forEach((item) => {
          if (item["flag"] === 1) {
            flags[item["id"]] = true;
          }
          else{
            flags[item["id"]] = false;
          }
        });
        setCOAFlagCheck(flags);
      }
      setAttachmentData(response.data);
    }
  };

  const openError = async (dn: any) => {
    setOpenError(true);
    const response = await axios.post('/api2/dn/error_info', {
      'DN#': dn,
    });
    setErrorData(response.data);
  };

  const getAllDNInfo = async () => {
    const response = await axios.post('/api2/dn/all_dn', {
      email: user['email'],
      role: user['role'],
    });
    setTableData(response.data);
    // const response1 = await axios.post('/api2/dn/attachment_info', {
    //   'DN#': dn,
    //   'Doc Type': "docType",
    // });
    console.log(response.data);
  };

  const logsheet = async (logType: any, email: any, Detail: any) => {
    const response = await axios.post('/api2/logsheet/new_logsheet', {
      "type": logType,
      "email": email,
      "detail": Detail
    });
    console.log("------------")
    console.log(response.data)
  }

  const openOCRView = () => {
    navigate(`/ocr_viewer/${modalDN}/${docType}/${encodeURIComponent(modalDocument)}`);
  };
  const openCOAOCRView = (document,index) =>{
    // alert(document)
    // alert(index)
    navigate(`/ocr_viewer/${modalDN}/${docType}/${encodeURIComponent(document)}/${index}`);
  }
  useEffect(() => {
    getAllDNInfo();
  }, []);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('new_dn_turn', (data) => {
      setAlertState(true)
      setAlertMessage("New DN has started. Please wait a moment till finish the process.")
      setAlertColor("success")

      setTimeout(() => {
        setAlertState(false);
      }, 5000);
      getAllDNInfo();
      logsheet('New DN# Case', user['email'], data["DN#"])
    });
    socket.on('new_attachment_detect', (data) => {
      setAlertState(true)
      setAlertMessage("New attachment detected.")
      setAlertColor("success")

      setTimeout(() => {
        setAlertState(false);
      }, 5000);
      getAllDNInfo();
    })
    socket.on('ocr_finished', (data) => {
      setAlertState(true)
      setAlertMessage(`DN - ${data["DN#"]} case is completed.`)
      setAlertColor("success")

      setTimeout(() => {
        setAlertState(false);
      }, 5000);
      getAllDNInfo();
    })
  }, [socket, isConnected]);

  const checkCOAFlag = async (id)=>{
    const response = await axios.post('/api2/dn/check_coa_flag', {
      "id":id
    });
    let checked_flag = {
      ...coaFlagCheck,              // copy existing state
      [id]: !coaFlagCheck?.[id]     // toggle the flag
    };
    setCOAFlagCheck(checked_flag);
    setAlertState(true)
    setAlertMessage("The COA status updated successfully.")
    setAlertColor("success")

    setTimeout(() => {
      setAlertState(false);
    }, 5000);
  }
  const handleOpenPDF = (file_name: string) => {
    window.open(`http://127.0.0.1:5005/download/${file_name}`, '_blank');
  };

  return (
    <>
      <TitleCard title="DN List"
        onSearch={setSearchTerm}
        onDateChange={handleDateChange}>
        <div className="border rounded-md border-ld overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="">
              <Table.Head>
                <Table.HeadCell className="text-base font-semibold py-3">DN</Table.HeadCell>
                <Table.HeadCell
                  className="text-base font-semibold py-3 cursor-pointer"
                  onClick={() => requestSort('Date')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    {sortConfig.key === 'Date' && (
                      sortConfig.direction === 'ascending' ?
                        <IconArrowUp size={16} /> :
                        <IconArrowDown size={16} />
                    )}
                  </div>
                </Table.HeadCell>
                <Table.HeadCell className="text-base font-semibold py-3">Status</Table.HeadCell>
                <Table.HeadCell className="text-base font-semibold py-3">Doc List</Table.HeadCell>
                <Table.HeadCell className="text-base font-semibold py-3">Progress</Table.HeadCell>
                <Table.HeadCell className="text-base font-semibold py-3">Supplier</Table.HeadCell>
                <Table.HeadCell className="text-base font-semibold py-3"></Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y divide-border dark:divide-darkborder ">
                {currentItems.map((item, index) => (
                  <Table.Row key={index}>
                    <Table.Cell className="whitespace-nowrap">
                      <h6 className="text-sm">{item['DN#']}</h6>
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap">
                      <h6 className="text-sm">{item['Date']}</h6>
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap">
                      <Badge
                        color={`light${item['Status'] == 'Posted'
                          ? 'primary'
                          : item['Status'] == 'Complete'
                            ? 'secondary'
                            : item['Status'] == 'Error'
                              ? 'error'
                              : 'warning'
                          }`}
                        className="capitalize"
                        icon={() => {
                          return item['Status'] === 'Posted' ? (
                            <IconCheck size={15} className="me-1" />
                          ) : item['Status'] === 'Complete' ? (
                            <IconCheck size={15} className="me-1" />
                          ) : item['Status'] === 'Error' ? (
                            <IconX size={15} className="me-1" />
                          ) : (
                            <IconArrowBackUp size={15} className="me-1" />
                          );
                        }}
                      >
                        {item.Status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap">
                      <div className="flex gap-1 items-center">
                        <Button
                          size="sm"
                          onClick={() => openAttachmentinfo('DN', item['DN#'], item['DN'])}
                          color={
                            item['DN'] == 1 ? 'secondary' : item['DN'] == 0 ? 'dark' : 'error'
                          }
                        >
                          DN
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openAttachmentinfo('INV', item['DN#'], item['INV'])}
                          color={
                            item['INV'] == 1
                              ? 'secondary'
                              : item['INV'] == 0
                                ? 'dark'
                                : 'error'
                          }
                        >
                          INV
                        </Button>
                        <div style={{display:'flex'}}>
                          <Button
                            size="sm"
                            style={{zIndex:'5'}}
                            onClick={() => openAttachmentinfo('COA', item['DN#'], item['COA'])}
                            color={
                              item['COA'] == 1
                                ? 'secondary'
                                : item['COA'] == 0
                                  ? 'dark'
                                  : 'error'
                            }
                          >
                            COA
                          </Button>
                          <Badge color={'primary'} style={{zIndex:'10',marginLeft:'-15px',marginTop:'-10px'}}>{item["coa_count"]}</Badge>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => openAttachmentinfo('BOL', item['DN#'], item['BOL'])}
                          color={
                            item['BOL'] == 1
                              ? 'secondary'
                              : item['BOL'] == 0
                                ? 'dark'
                                : 'error'
                          }
                        >
                          BOL
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openAttachmentinfo('AWB', item['DN#'], item['AWB'])}
                          color={
                            item['AWB'] == 1
                              ? 'secondary'
                              : item['AWB'] == 0
                                ? 'dark'
                                : 'error'
                          }
                        >
                          AWB
                        </Button>
                      </div>
                    </Table.Cell>

                    <Table.Cell className="whitespace-nowrap">
                      <div className="text-bodytext text-sm flex items-center gap-3">
                        <div className="w-full">
                          <Progress
                            progress={item.Progress}
                            className="w-full"
                            color="primary"
                            size={'sm'}
                          />
                        </div>
                        {item.Progress}%
                      </div>
                    </Table.Cell>

                    <Table.Cell className="whitespace-nowrap">
                      <h6 className="text-sm">{item['Supplier']}</h6>
                    </Table.Cell>

                    <Table.Cell className="whitespace-nowrap">
                      <Dropdown
                        label=""
                        dismissOnClick={false}
                        renderTrigger={() => (
                          <span className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-lightprimary hover:text-primary cursor-pointer">
                            <IconDotsVertical size={22} />
                          </span>
                        )}
                      >
                        {tableActionData.map((items, index1) => (
                          <Dropdown.Item
                            key={index1}
                            className="flex gap-3"
                            onClick={() => handleActionButton(item['DN#'], items.id)}
                          >
                            <Icon icon={`${items.icon}`} height={18} />
                            <span>{items.listtitle}</span>
                          </Dropdown.Item>
                        ))}
                      </Dropdown>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, tableData.length)}
                </span>{' '}
                of <span className="font-medium">{tableData.length}</span> results
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                showIcons
                className="mt-4"
              />
            </div>
          )}
        </div>

        <Modal show={openAttachmentModal} onClose={() => setOpenAttachmentModal(false)}>
          <Modal.Header>OCR Result</Modal.Header>
          <Modal.Body>
            {!duplicatedError && attachmentData &&
              attachmentData.map((item, key) => {
                const orderedEntries = Object.keys(item).map(k => [k, item[k]]);
                return (
                  <div>
                    <div key={key} className="mb-6 p-4 border rounded-lg shadow-sm bg-white">
                      <div  className="flex justify-end">
                        {docType == "COA" && <Checkbox checked={!!coaFlagCheck?.[item["id"]]} onClick={()=>checkCOAFlag(item["id"])}></Checkbox>}
                      </div>
                      {attachmentData.length >= 2 && (
                        <h2 className="text-lg font-semibold mb-3">Item {key + 1}</h2>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {orderedEntries.map(([fieldKey, value], idx) =>
                          fieldKey !== "Document" && fieldKey !== "id" ? (
                            <div key={idx} className="text-sm">
                              <span className="font-medium">{fieldKey}:</span> {value}
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                    <div  className="flex justify-end">
                      {docType == "COA" && <Button style={{margin:'5px',marginBottom:'30px'}} onClick={() => openCOAOCRView(item["Document"], key+1)}>OCR Viewer</Button>}
                    </div>
                  </div>
                );
              })}
            <div>
              {duplicatedError && duplicatedData &&
                duplicatedData.map((item, key) => {
                  const isSelected = item.id === duplicatedDocument;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 mb-2 rounded-lg cursor-pointer transition-all duration-200 
                                  ${isSelected ? 'bg-blue-100 border border-blue-500' : 'bg-white hover:bg-gray-100'}`}
                      onClick={() => setDuplicatedDocument(item.id)}
                    >
                      <Button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent onClick
                          handleOpenPDF(item.source);
                        }}
                      >
                        {item.source}
                      </Button>
                    </div>
                  );
                })
              }
            </div>
          </Modal.Body>
          <Modal.Footer className="flex justify-end">
            {!duplicatedError && docType!="COA" && <Button onClick={() => openOCRView()}>OCR Viewer</Button>}
            {duplicatedError && <Button onClick={() => updateDuplicatedDocument()}>Save State</Button>}
          </Modal.Footer>
        </Modal>

        <Modal show={openErrorModal} onClose={() => setOpenError(false)}>
          <Modal.Header>Error</Modal.Header>
          <Modal.Body>
            {errorData &&
              errorData.map((item, key) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#f9f9f9',
                    padding: '12px 16px',
                    marginBottom: '10px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>{item['message']}</h3>
                  <Button style={{ marginLeft: '20px' }} variant="contained" color="primary" onClick={() => openEmail(item["emailID"])}>
                    Look Email
                  </Button>
                </div>
              ))}
          </Modal.Body>
          <Modal.Footer></Modal.Footer>
        </Modal>
      </TitleCard>

      <AlertComponent alert={alertState} message={alertMessage} color={alertColor} />
    </>
  );
};

export default index;