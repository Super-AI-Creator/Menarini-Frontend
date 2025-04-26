import {
  Alert,
  Badge,
  Button,
  Drawer,
  HR,
  Textarea,
  Tooltip,
  Modal,
  Checkbox,
  Label,
} from 'flowbite-react';
import { useState, useContext, useRef, ChangeEvent, useEffect } from 'react';
import SimpleBar from 'simplebar-react';
import { Icon } from '@iconify/react';
import { EmailContext } from 'src/context/EmailContext';
import React from 'react';
import adobe from '/src/assets/images/chat/icon-adobe.svg';
import emailSv from '/src/assets/images/backgrounds/emailSv.png';
import Logo1 from '/src/assets/images/5.PNG';
import Logo2 from '/src/assets/images/6.PNG';
import axios from '../../utils/axios';
import { AlertComponent } from 'src/Alert/alert';

// Define the props interface
interface MailListItemProps {
  openMailValue: boolean;
  onCloseMail: () => void;
}

const EmailContent: React.FC<MailListItemProps> = ({ openMailValue, onCloseMail }) => {
  const [isTextboxVisible, setIsTextboxVisible] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [logoIntervention, setLogoIntervention] = useState(false);
  const [openInterventionModal, setOpenInterventionModal] = useState(false);
  const [openNewLogo, setOpenNewLogo] = useState(false);
  const [emailLogoList, setEmailLogoList] = useState([]);
  const [supplierDisplay, setSupplierDisplay] = useState({});
  const [logoList, setLogoList] = useState([]);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [alertState, setAlertState] = useState(false);
  const [alertColor, setAlertColor] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [supplierData, setSupplierData] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const {
    selectedEmail,
    deleteEmail,
    toggleStar,
    toggleImportant,
    startOCR,
    newPO,
    EmailError,
    DocumentError,
    getIntervention,
    multiDocIntervention,
    supplierIntervention,
    update_multi_doc_type,
    setUpdatedSupplierName,
    supplier_name_list,
  }: any = useContext(EmailContext);

  const [tempVendorName, setTempVendorName] = useState();

  // When user types, update temporary state only
  const handleVendorNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempVendorName(e.target.value);
  };

  // When you’re ready to apply the changes (e.g., on button click)
  const handleUpdateVendorName = () => {
    if (tempVendorName == '') {
      alert('Set the vendor name');
      return;
    }
    const updated = {
      ...supplierIntervention,
      old_vendor_name: supplierIntervention.vendor_name,
      vendor_name: tempVendorName,
    };

    setUpdatedSupplierName(updated);
    setOpenInterventionModal(false);
    // setSupplierIntervention(updated);
  };

  const [checkboxState, setCheckboxState] = useState({});
  useEffect(() => {
    if (multiDocIntervention && multiDocIntervention.length > 0) {
      const initialCheckboxState = multiDocIntervention.reduce((acc, doc) => {
        const list = doc.doc_list || '';
        acc[doc.file_name] = {
          DN: list.includes('DN'),
          INV: list.includes('INV'),
          COA: list.includes('COA'),
          BOL: list.includes('BOL'),
          AWB: list.includes('AWB'),
        };
        return acc;
      }, {});
      setCheckboxState(initialCheckboxState);
    }
  }, [multiDocIntervention]);
  useEffect(() => {
    if (supplierIntervention) {
      setTempVendorName(supplierIntervention.vendor_name);
    }
  }, [supplierIntervention]);
  useEffect(() => {
    const getAllSupplierInfo = async () => {
      const response = await axios.post('/api2/info/get_all_supplier_info', {});
      setSupplierData(response.data);
    };
    getAllSupplierInfo();
  }, []);
  const handleUpdateMultiDocument = () => {
    const updated = (multiDocIntervention || []).map((doc) => {
      const state = checkboxState[doc.file_name] || {}; // 🛡️ fallback to empty object
      const selectedDocs: string[] = [];

      if (state.DN) selectedDocs.push('DN');
      if (state.INV) selectedDocs.push('INV');
      if (state.COA) selectedDocs.push('COA');
      if (state.BOL) selectedDocs.push('BOL');
      if (state.AWB) selectedDocs.push('AWB');

      const new_doc_list = selectedDocs.join(' & ');
      return {
        ...doc,
        old_doc_list: doc.doc_list,
        doc_list: new_doc_list,
      };
    });

    update_multi_doc_type(selectedEmail.id, updated);

    setOpenInterventionModal(false);
  };
  const handleCheckboxChange = (file_name: string, flag: string) => {
    setCheckboxState((prevState) => ({
      ...prevState,
      [file_name]: {
        ...prevState[file_name],
        [flag]: !prevState[file_name][flag],
      },
    }));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleButtonClick = () => {
    setIsTextboxVisible(!isTextboxVisible);
  };

  const handleDelete = () => {
    if (selectedEmail) {
      deleteEmail(selectedEmail.id);
    }
  };

  const handleOCR = () => {
    if (selectedEmail) {
      startOCR(selectedEmail.id);
      setOpenModal(true);
    }
  };

  const openIntervention = () => {
    if (selectedEmail) {
      getIntervention(selectedEmail.id);
      setOpenInterventionModal(true);
    }
  };

  const newLogo = () => {
    setLogoIntervention(false);
    setOpenNewLogo(true);
  };
  const openLogoIntervention = () => {
    if (selectedEmail) {
      getLogoData(selectedEmail.id);
      setLogoIntervention(true);
    }
  };
  const updateLogoInfo = (item: any) => {
    setSupplierDisplay(item);
  };
  const getLogoData = async (emailID: any) => {
    const request = await axios.post('/api2/intervention/get_logo_intervention', {
      emailID: emailID,
    });
    const all_request = await axios.post('/api2/intervention/get_all_logo', { emailID: emailID });
    setEmailLogoList(request.data);
    setLogoList(all_request.data);
  };
  const handleOpenPDF = (file_name: string) => {
    window.open(`http://127.0.0.1:5005/download/${file_name}`, '_blank');
  };
  const handleUploadAttachment = () => {
    if (!fileInputRef || !fileInputRef.current) return;
    fileInputRef.current.click();
  };
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    console.log('Selected files:', files);
  };

  const update_supplier_info = async () => {
    // supplierDisplay
    if (!selectedEmail) return;

    const request = await axios.post('/api2/intervention/set_updated_logo_info', {
      data: supplierDisplay,
      email: selectedEmail.id,
    });
    setLogoIntervention(false);
    setAlertState(true);
    setAlertMessage('Supplier Info Updated successfully.');
    setAlertColor('success');
    setTimeout(() => {
      setAlertState(false);
    }, 5000);
    // console.log(supplierDisplay)
  };

  if (!selectedEmail) {
    return (
      <div className="w-full text-center p-5">
        <div className="px-6 pt-3">
          <Alert
            color="lighterror"
            icon={() => <Icon icon="solar:info-circle-broken" height={18} />}
          >
            <span className="ps-2 text-base"> Please Select an Email</span>
          </Alert>
        </div>
        <h4></h4>
        <img src={emailSv} alt="Email Icon" width="250" height="250" className="mx-auto" />
      </div>
    );
  }

  const hasAttachments = selectedEmail.attchments && selectedEmail.attchments.length > 0;
  return (
    <>
      <Drawer
        open={openMailValue}
        backdrop={false}
        onClose={onCloseMail}
        position="right"
        className="lg:relative lg:transform-none lg:h-auto lg:bg-transparent w-full lg:z-[0]"
      >
        <div className="lg:hidden block p-6 pb-2">
          <Button color={'outlineprimary'} onClick={onCloseMail} className="py-0">
            <Icon icon="solar:round-arrow-left-linear" height={18}></Icon>Back
          </Button>
        </div>
        <div className="w-full">
          <div className="w-fit">
            <div className="flex items-center gap-2 py-4 px-5">
              <Tooltip content={'Star'}>
                <div
                  className="btn-circle-hover cursor-pointer group"
                  onClick={() => toggleStar(selectedEmail.id)}
                >
                  {selectedEmail.starred === true ? (
                    <Icon icon="solar:star-bold" className="text-warning" height="18" />
                  ) : (
                    <Icon
                      icon="solar:star-line-duotone"
                      height="17"
                      className="text-dark dark:text-bodytext group-hover:text-primary"
                    />
                  )}
                </div>
              </Tooltip>
              <Tooltip content={'Important'}>
                <div className="btn-circle-hover cursor-pointer group">
                  <Icon
                    icon="solar:info-circle-outline"
                    className="text-dark dark:text-bodytext group-hover:text-primary"
                    height="18"
                    onClick={() => toggleImportant(selectedEmail.id)}
                    style={{
                      fill: selectedEmail.important ? '#FFD9E4' : '',
                    }}
                  />
                </div>
              </Tooltip>
              <Tooltip content={'Delete'}>
                <div className="btn-circle-hover cursor-pointer group">
                  <Icon
                    icon="solar:trash-bin-minimalistic-outline"
                    className="text-dark  dark:text-bodytext group-hover:text-primary"
                    height="18"
                    onClick={handleDelete}
                  />
                </div>
              </Tooltip>
            </div>
          </div>
          <SimpleBar className="max-h-[600px] h-[calc(100vh_-_100px)]">
            <div className="py-5 px-5">
              <div className="flex items-center w-full">
                <div className="flex items-center gap-2 w-full">
                  <img
                    alt="user"
                    src={selectedEmail.thumbnail}
                    height={48}
                    width={48}
                    className="rounded-full"
                  />
                  <div>
                    <h6 className="text-sm">{selectedEmail.from}</h6>
                    <p className="text-darklink dark:text-bodytext text-sm">{selectedEmail.To}</p>
                  </div>
                </div>
                <div>
                  {selectedEmail.label === 'Complete' ? (
                    <Badge color={'primary'}>{selectedEmail.label}</Badge>
                  ) : selectedEmail.label === 'Pending' ? (
                    <Badge color={'error'}>{selectedEmail.label}</Badge>
                  ) : selectedEmail.label === 'Processing' ? (
                    <Badge color={'success'}>{selectedEmail.label}</Badge>
                  ) : (
                    <Badge color={'primary'}>{selectedEmail.label}</Badge>
                  )}
                </div>
              </div>
              <div className="mt-8">
                <h5 className="text-xl">{selectedEmail.subject}</h5>
                <div
                  className="email-content"
                  dangerouslySetInnerHTML={{
                    __html: selectedEmail.emailContent,
                  }}
                ></div>
                {hasAttachments && (
                  <>
                    <HR className="my-6" />
                    <h6 className="text-sm">Attachments</h6>
                    <div className="grid grid-cols-12 gap-6 mt-4">
                      {selectedEmail.attchments.map((attach) => (
                        <div className="lg:col-span-4 md:col-span-6 col-span-12">
                          <div className="flex items-center gap-3 group cursor-pointer">
                            <div className="bg-muted dark:bg-darkmuted p-3 rounded-md">
                              <img src={adobe} height={24} width={24} alt="download" />
                            </div>
                            <div>
                              <h5 className="text-sm group-hover:text-primary">
                                {attach.length > 10 ? `${attach.substring(0, 10)}...` : attach}
                              </h5>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <HR className="my-4" />
                  </>
                )}
              </div>
            </div>
            <div className="px-5">
              <div className="flex gap-6 ">
                <span
                  className="cursor-pointer text-sm text-ld text-primary-ld flex items-center"
                  onClick={handleButtonClick}
                >
                  <Icon icon="solar:undo-left-outline" height={18} className="me-1" />
                  Reply
                </span>
                <span className="cursor-pointer text-sm text-ld text-primary-ld flex items-center">
                  <Icon icon="solar:undo-right-outline" height={18} className="me-1" />
                  Forward
                </span>
              </div>
              {isTextboxVisible && (
                <Textarea className="form-control-textarea mt-4" required rows={4}></Textarea>
              )}
              <div className="flex justify-center mt-5 gap-1">
                <Button color={'primary'} onClick={() => handleOCR()}>
                  Overview
                </Button>
                <Button color={'secondary'} onClick={() => openIntervention()}>
                  Invtervention
                </Button>
                <Button color={'warning'} onClick={() => openLogoIntervention()}>
                  Logo Check
                </Button>
              </div>
            </div>
          </SimpleBar>
        </div>
        <Modal show={openModal} onClose={() => setOpenModal(false)}>
          <Modal.Header>Process State</Modal.Header>
          <Modal.Body>
            <div style={{ display: 'flex', gap: '30' }}>
              <div>
                <div className="space-y-6">
                  Attachment State
                  <br></br>
                  <br></br>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="promotion1"
                      className="checkbox"
                      disabled
                      checked={newPO ? (newPO.data.DN == 1 ? true : false) : false}
                    />
                    <Label htmlFor="promotion1">Delivery Note</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="promotion1"
                      className="checkbox"
                      disabled
                      checked={newPO ? (newPO.data.INV == 1 ? true : false) : false}
                    />
                    <Label htmlFor="promotion1">Invoice</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="promotion1"
                      className="checkbox"
                      disabled
                      checked={newPO ? (newPO.data.COA == 1 ? true : false) : false}
                    />
                    <Label htmlFor="promotion1">Certification of Analysis</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="promotion1"
                      className="checkbox"
                      disabled
                      checked={newPO ? (newPO.data['Bill of Lading'] == 1 ? true : false) : false}
                    />
                    <Label htmlFor="promotion1">Bill of Lading</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="promotion1"
                      className="checkbox"
                      disabled
                      checked={newPO ? (newPO.data['Air Waybill'] == 1 ? true : false) : false}
                    />
                    <Label htmlFor="promotion1">Air Waybill</Label>
                  </div>
                </div>
              </div>
              <div>
                <div className="space-y-6">
                  Email Error
                  <br></br>
                  <br></br>
                </div>
                <div className="space-y-6">
                  {EmailError &&
                    EmailError.map((error, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <p style={{ color: error['error_type'] === 'warning' ? 'orange' : 'red' }}>
                          {error['error']}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <div className="space-y-6">
                  Document Error
                  <br></br>
                  <br></br>
                </div>
                <div className="space-y-6">
                  {DocumentError &&
                    DocumentError.map((error, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <p style={{ color: error['error_type'] === 'warning' ? 'orange' : 'red' }}>
                          {error['error']}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="w-full">
              <Button
                className="w-full mt-5"
                color="primary"
                disabled={newPO ? (newPO.success ? false : true) : true}
              >
                To Staging Table
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <Button
                className="w-full mt-5"
                color="primary"
                onClick={() => handleUploadAttachment()}
              >
                Upload Files
              </Button>
            </div>
          </Modal.Footer>
        </Modal>

        <Modal show={openInterventionModal} onClose={() => setOpenInterventionModal(false)}>
          <Modal.Header>User Intervention</Modal.Header>
          <Modal.Body>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ width: '50%', marginRight: '5%' }}>
                <div className="space-y-6">
                  Document Intervention
                  <br></br>
                  <br></br>
                </div>
                <div className="space-y-6">
                  {multiDocIntervention &&
                    multiDocIntervention.map((doc, index) => (
                      <div key={index} className="flex flex-col items-center gap-2">
                        <Button onClick={() => handleOpenPDF(doc.file_name)}>
                          {doc.file_name}
                        </Button>
                        <br></br>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`promotionDN-${doc.file_name}`}
                              className="checkbox"
                              checked={checkboxState[doc.file_name]?.DN || false}
                              onChange={() => handleCheckboxChange(doc.file_name, 'DN')}
                            />
                            <Label htmlFor={`promotionDN-${doc.file_name}`}>DN</Label>
                          </div>

                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`promotionINV-${doc.file_name}`}
                              className="checkbox"
                              checked={checkboxState[doc.file_name]?.INV || false}
                              onChange={() => handleCheckboxChange(doc.file_name, 'INV')}
                            />
                            <Label htmlFor={`promotionINV-${doc.file_name}`}>INV</Label>
                          </div>

                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`promotionCOA-${doc.file_name}`}
                              className="checkbox"
                              checked={checkboxState[doc.file_name]?.COA || false}
                              onChange={() => handleCheckboxChange(doc.file_name, 'COA')}
                            />
                            <Label htmlFor={`promotionCOA-${doc.file_name}`}>COA</Label>
                          </div>

                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`promotionBOL-${doc.file_name}`}
                              className="checkbox"
                              checked={checkboxState[doc.file_name]?.BOL || false}
                              onChange={() => handleCheckboxChange(doc.file_name, 'BOL')}
                            />
                            <Label htmlFor={`promotionBOL-${doc.file_name}`}>BOL</Label>
                          </div>

                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`promotionAWB-${doc.file_name}`}
                              className="checkbox"
                              checked={checkboxState[doc.file_name]?.AWB || false}
                              onChange={() => handleCheckboxChange(doc.file_name, 'AWB')}
                            />
                            <Label htmlFor={`promotionAWB-${doc.file_name}`}>AWB</Label>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div>
                <div className="space-y-6">
                  Supplier Name Intervention
                  <br></br>
                  <br></br>
                </div>
                <div className="space-y-6">
                  {supplierIntervention && supplierIntervention.vendor_name ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={tempVendorName}
                        onChange={handleVendorNameChange}
                        className="border border-gray-300 p-2 rounded"
                      />
                      <select
                        onChange={(e) => setTempVendorName(e.target.value)}
                        className="border border-gray-300 p-2 rounded"
                      >
                        <option value=""></option>
                        {supplier_name_list &&
                          supplier_name_list.map((name) => {
                            return <option value={name}>{name}</option>;
                          })}
                      </select>
                      <label className="text-sm text-gray-700">{tempVendorName}</label>
                    </div>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            </div>
          </Modal.Body>
          <hr></hr>
          <Modal.Footer>
            <hr></hr>
            <div className="flex w-full" style={{ justifyContent: 'space-between' }}>
              <Button
                style={{ width: '40%', marginRight: '5%' }}
                color="primary"
                onClick={handleUpdateMultiDocument}
                disabled={
                  multiDocIntervention &&
                  multiDocIntervention[0] &&
                  multiDocIntervention[0].doc_list
                    ? false
                    : true
                }
              >
                Update Multi-Document
              </Button>
              <Button
                style={{ width: '55%' }}
                onClick={handleUpdateVendorName}
                color="primary"
                disabled={supplierIntervention && supplierIntervention.vendor_name ? false : true}
              >
                Update SupplierName
              </Button>
            </div>
          </Modal.Footer>
        </Modal>

        <Modal show={logoIntervention} onClose={() => setLogoIntervention(false)}>
          <Modal.Header>Logo Intervention</Modal.Header>
          <Modal.Body>
            <div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ borderRight: '1px solid grey', padding: '15px' }}>
                  {emailLogoList &&
                    emailLogoList.map((item, key) => {
                      return (
                        <img
                          width={150}
                          height={50}
                          onClick={() => {
                            updateLogoInfo(item);
                            setSelectedLogo(item['img']);
                          }}
                          src={`http://127.0.0.1:5005/logos/${item['img']}`}
                          style={{
                            boxShadow:
                              selectedLogo === item.img ? '3px 3px 6px gray' : '1px 1px 3px gray',
                            borderRadius: '30px',
                            marginTop: '10px',
                            cursor: 'pointer',
                          }}
                        />
                      );
                    })}
                </div>
                <div style={{ padding: '15px' }}>
                  {logoList &&
                    logoList
                      .reduce((rows, item, index) => {
                        const rowIndex = Math.floor(index / 4);
                        if (!rows[rowIndex]) rows[rowIndex] = [];
                        rows[rowIndex].push(item);
                        return rows;
                      }, [])
                      .map((row, rowIndex) => (
                        <div className="flex" key={rowIndex}>
                          {row.map((item, key) => (
                            <img
                              key={key}
                              width={100}
                              height={30}
                              onClick={() => {
                                updateLogoInfo(item);
                                setSelectedLogo(item.img);
                              }}
                              src={`http://127.0.0.1:5005/logos/${item.img}`}
                              style={{
                                border:
                                  selectedLogo === item.img ? '3px solid blue' : '1px solid grey',
                                cursor: 'pointer',
                              }}
                            />
                          ))}
                        </div>
                      ))}
                </div>
              </div>
              <br></br>
              <hr></hr>
              <br></br>
              <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around' }}>
                <h1>{supplierDisplay && supplierDisplay['supplier_domain']}</h1>
                <h1>{supplierDisplay && supplierDisplay['supplier_name']}</h1>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="flex w-full" style={{ justifyContent: 'space-between' }}>
              <Button
                style={{ width: '40%', marginRight: '5%' }}
                color="primary"
                onClick={() => update_supplier_info()}
              >
                Update Supplier Info
              </Button>
              <Button style={{ width: '55%' }} color="primary" onClick={() => newLogo()}>
                New Logo
              </Button>
            </div>
          </Modal.Footer>
        </Modal>

        <Modal show={openNewLogo} onClose={() => setOpenNewLogo(false)}>
          <Modal.Header>New Logo</Modal.Header>
          <Modal.Body>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <div>
                <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
              </div>
              <br></br>
              <div style={{ display: 'flex', gap: '5px' }}>
                <select
                  className="border border-gray-300 p-2 rounded"
                  onChange={(e) => setSelectedDomain(e.target.value)}
                >
                  {[...new Set(supplierData.map((item) => item.domain))].map((domain, key) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
                <select
                  className="border border-gray-300 p-2 rounded"
                  onChange={(e) => setSelectedName(e.target.value)}
                >
                  <option value="">Select name</option>
                  {supplierData
                    .filter((item) => item.domain === selectedDomain)
                    .map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="flex w-full" style={{ justifyContent: 'space-between' }}>
              <Button
                style={{ width: '40%', marginRight: '5%' }}
                color="primary"
                onClick={async () => {
                  if (!selectedFile || !selectedDomain || !selectedName) {
                    alert('Please fill all fields and select a file.');
                    return;
                  }

                  const formData = new FormData();
                  formData.append('file', selectedFile);
                  formData.append('domain', selectedDomain);
                  formData.append('name', selectedName);
                  formData.append('email', selectedEmail.id);

                  try {
                    const response = await fetch('http://127.0.0.1:5005/upload-logo', {
                      method: 'POST',
                      body: formData,
                    });

                    if (response.ok) {
                      setAlertState(true);
                      setAlertMessage('New logo uploaded successfully.');
                      setAlertColor('success');
                      setTimeout(() => {
                        setAlertState(false);
                      }, 5000);
                      setOpenNewLogo(false);
                    } else {
                      setAlertState(true);
                      setAlertMessage('There was error.');
                      setAlertColor('error');
                      setTimeout(() => {
                        setAlertState(false);
                      }, 5000);
                    }
                  } catch (err) {
                    console.error('Error uploading logo:', err);
                    alert('Error uploading logo.');
                  }
                }}
              >
                Upload New Logo
              </Button>
            </div>
          </Modal.Footer>
        </Modal>

        <AlertComponent alert={alertState} message={alertMessage} color={alertColor} />
      </Drawer>
    </>
  );
};

export default EmailContent;
