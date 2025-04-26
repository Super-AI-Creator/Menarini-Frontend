import { Badge, Table, Dropdown, Progress, Checkbox, Button, Modal } from 'flowbite-react';
import * as basicTable4 from '../../tables/tableData.ts';
import { IconDotsVertical } from '@tabler/icons-react';
import { Icon } from '@iconify/react';
import { IconArrowBackUp, IconCheck, IconX } from '@tabler/icons-react';
import TitleCard from 'src/components/shared/TitleBorderCard.tsx';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axios';
import { useState, useEffect, useContext } from 'react';
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
  const [openErrorModal, setOpenError] = useState(false);
  const [attachmentData, setAttachmentData] = useState([]);
  const [errorData, setErrorData] = useState([]);

  const [alertState, setAlertState] = useState(false)
  const [alertColor, setAlertColor] = useState("")
  const [alertMessage, setAlertMessage] = useState("")

  const [modalDN,setModalDN] = useState("")
  const [modalData,setModalData] = useState([])
  const [modalDocument,setModalDocument] = useState("")
  const [OCRFlag ,setOCRFlag] = useState(false)
  const [docType,setModalDocType] = useState("")
  const navigate = useNavigate();
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
  const openEmail =(email: any) =>{
    console.log(email)
    navigate(`/email/${email}`);
  }
  const openAttachmentinfo = async (docType: any, dn: any, status: any) => {
    if (status == 1 || status == -1) {
      setOpenAttachmentModal(true);

      const response = await axios.post('/api2/dn/attachment_info', {
        'DN#': dn,
        'Doc Type': docType,
      });
      setModalDN(dn)
      setModalDocType(docType)
      if(response.data)
        setModalDocument(response.data[0]["Document"])
      setModalData(response.data)
      setAttachmentData(response.data);
      // console.log(response.data);
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
    console.log(response.data); // or setTableData(response.data);
  };

  const logsheet = async (logType :any,email :any,Detail :any)=>{
    const response = await axios.post('/api2/logsheet/new_logsheet', {
      "type":logType,
      "email":email,
      "detail":Detail
    });
    console.log("------------")
    console.log(response.data)
  }
  const openOCRView = () => {
    navigate(`/ocr_viewer/${modalDN}/${docType}/${encodeURIComponent(modalDocument)}`);
  };
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
      logsheet('New DN# Case',user['email'],data["DN#"])
    });
    socket.on('new_attachment_detect',(data)=>{
      setAlertState(true)
      setAlertMessage("New attachment detected.")
      setAlertColor("success")
      
      setTimeout(() => {
        setAlertState(false);
      }, 5000);
      getAllDNInfo();
    })
    socket.on('ocr_finished',(data)=>{
      setAlertState(true)
      setAlertMessage(`DN - ${data["DN#"]} case is completed.`)
      setAlertColor("success")
      
      setTimeout(() => {
        setAlertState(false);
      }, 5000);
      getAllDNInfo();
    })
  }, [socket, isConnected]);

  const table_data = [
    {
      'DN#': '192342',
      DN: 1,
      INV: 1,
      COA: 1,
      BOL: 1,
      AWB: 0,
      Date: '2024-3-6',
      status: 'Complete',
      Supplier: 'F.I.S',
      progress: 80,
    },
    {
      'DN#': '192334',
      DN: 1,
      INV: -1,
      COA: 0,
      BOL: 1,
      AWB: 0,
      Date: '2024-3-6',
      Supplier: 'KKS',
      status: 'Error',
      progress: 40,
    },
    {
      'DN#': '192325',
      DN: 1,
      INV: -1,
      COA: 1,
      BOL: 1,
      AWB: 0,
      Date: '2024-3-6',
      Supplier: 'F.I.S',
      status: 'Complete',
      progress: 60,
    },
    {
      'DN#': '193324',
      DN: -2,
      INV: 0,
      COA: 0,
      BOL: 1,
      AWB: 0,
      Date: '2024-3-6',
      Supplier: 'F.I.S',
      status: 'Error',
      progress: 20,
    },
    {
      'DN#': '325433',
      DN: 1,
      INV: 0,
      COA: 0,
      BOL: 1,
      AWB: 0,
      Date: '2024-3-6',
      Supplier: 'Phadiag',
      status: 'Incomplete',
      progress: 40,
    },
    {
      'DN#': '2333322',
      DN: 1,
      INV: 1,
      COA: 1,
      BOL: 1,
      AWB: 0,
      Date: '2024-3-6',
      Supplier: 'Phadiag',
      status: 'Posted',
      progress: 100,
    },
  ];
  const attachment_data = [
    {
      'PO#': '123334',
      'Vendor Part Code': 'TTTT',
      'Customer Part Code': '12312',
      'GIC Code': '12312',
      'Packing Slip*': '12312',
      Quantity: '12312',
      'Batch*': '12312',
      'Manufacturing Date': '12312',
      'Expiry Date': '12312',
      'Document Date': '12312',
      Incoterms: '12312',
      'Item Description': '12312',
    },
    {
      'PO#': '123334',
      'Vendor Part Code': 'TTTT',
      'Customer Part Code': '12312',
      'GIC Code': '12312',
      'Packing Slip*': '12312',
      Quantity: '12312',
      'Batch*': '12312',
      'Manufacturing Date': '12312',
      'Expiry Date': '12312',
      'Document Date': '12312',
      Incoterms: '12312',
      'Item Description': '12312',
    },
  ];
  return (
    <>
      <TitleCard title="DN List">
        <div className="border rounded-md border-ld overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="">
              <Table.Head>
                <Table.HeadCell className="text-base font-semibold py-3">DN</Table.HeadCell>
                <Table.HeadCell className="text-base font-semibold py-3">Date</Table.HeadCell>
                <Table.HeadCell className="text-base font-semibold py-3">Status</Table.HeadCell>
                <Table.HeadCell className="text-base font-semibold py-3">Doc List</Table.HeadCell>
                <Table.HeadCell className="text-base font-semibold py-3">Progress</Table.HeadCell>
                <Table.HeadCell className="text-base font-semibold py-3">Supplier</Table.HeadCell>
                <Table.HeadCell className="text-base font-semibold py-3"></Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y divide-border dark:divide-darkborder ">
                {tableData &&
                  tableData.map((item, index) => (
                    <Table.Row key={index}>
                      <Table.Cell className="whitespace-nowrap">
                        <h6 className="text-sm">{item['DN#']}</h6>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">
                        <h6 className="text-sm">{item['Date']}</h6>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">
                        <Badge
                          color={`light${
                            item['Status'] == 'Posted'
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
                              item['DN'] == 1 ? 'secondary' : item['DN'] == 0 ? 'primary' : 'error'
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
                                ? 'primary'
                                : 'error'
                            }
                          >
                            INV
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openAttachmentinfo('COA', item['DN#'], item['COA'])}
                            color={
                              item['COA'] == 1
                                ? 'secondary'
                                : item['COA'] == 0
                                ? 'primary'
                                : 'error'
                            }
                          >
                            COA
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openAttachmentinfo('BOL', item['DN#'], item['BOL'])}
                            color={
                              item['BOL'] == 1
                                ? 'secondary'
                                : item['BOL'] == 0
                                ? 'primary'
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
                                ? 'primary'
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
        </div>

        <Modal show={openAttachmentModal} onClose={() => setOpenAttachmentModal(false)}>
          <Modal.Header>OCR Result</Modal.Header>
          <Modal.Body>
          {attachmentData &&
            attachmentData.map((item, key) => {
              const orderedEntries = Object.keys(item).map(k => [k, item[k]]);
              return (
                <div key={key} className="mb-6 p-4 border rounded-lg shadow-sm bg-white">
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
              );
            })}
          </Modal.Body>
          <Modal.Footer className="flex justify-end">
            <Button onClick = {()=>openOCRView()}>OCR Viewer</Button>
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
                  <Button style={{ marginLeft: '20px' }} variant="contained" color="primary" onClick = {()=>openEmail(item["emailID"])}>
                    Look Email
                  </Button>
                </div>
              ))}
          </Modal.Body>
          <Modal.Footer></Modal.Footer>
        </Modal>
      </TitleCard>
      
      <AlertComponent alert = {alertState} message={alertMessage} color={alertColor} />
    </>
  );
};

export default index;
