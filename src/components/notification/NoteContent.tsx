import { useContext, useState, useEffect } from 'react';
import { TbCheck } from 'react-icons/tb';
import { NotificationContext } from 'src/context/NotificationContext';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertComponent } from 'src/Alert/alert';
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
import axios from "../../utils/axios";

interface colorsType {
  lineColor: string;
  disp: string | any;
  id: number;
}

// interface Props {
//   toggleNoteSidebar: (event: React.MouseEvent<HTMLElement>) => void;
// }
const NoteContent = () => {
  const navigate = useNavigate();
  const { notes, selectedNoteId }: any = useContext(NotificationContext);
  const noteDetails = Array.isArray(notes)
    ? notes.find((note: { _id: any }) => note._id === selectedNoteId)
    : null;

  // Initialize state for updatedTitle, initialTitle, and isEditing status
  const [initialTitle, setInitialTitle] = useState('');
  const [initialType, setInitialType] = useState('');
  const [initialKey, setInitialKey] = useState('');
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [initialDetail, setInitialDetail] = useState('');
  const [dateFormat, setDateFormat] = useState('');
  const [incoterm, setIncoterm] = useState('');
  const [isEditing, setIsEditing] = useState(false); // State to track whether editing is in progress
  const [alertState, setAlertState] = useState(false);
  const [alertColor, setAlertColor] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // Effect to update initialTitle when noteDetails changes
  useEffect(() => {
    console.log(noteDetails)
    if (noteDetails) {
      setInitialTitle(noteDetails.header);
      setInitialType(noteDetails.type);
      setInitialDetail(noteDetails.message);
      setInitialKey(noteDetails.id);
    }
  }, [noteDetails]);

  const colorvariation: colorsType[] = [
    {
      id: 1,
      lineColor: 'warning',
      disp: 'warning',
    },
    {
      id: 2,
      lineColor: 'primary',
      disp: 'primary',
    },
    {
      id: 3,
      lineColor: 'error',
      disp: 'error',
    },
    {
      id: 4,
      lineColor: 'success',
      disp: 'success',
    },
    {
      id: 5,
      lineColor: 'secondary',
      disp: 'secondary',
    },
  ];
  const openNotificationDetail = () => {
    if (initialType == "multi-doc" || initialType == "supplier-name")
      navigate(`/email/${initialKey}`)
    else{
      setOpenDetailModal(true)
    }
  }
  const updateIntervention = async () =>{
    const response  = axios.post('/api2/notification/user_intervention',{"type":initialType, "incoterm":incoterm, "dateFormat":dateFormat,"DN#":initialKey})
    setOpenDetailModal(false)
    setAlertState(true);
    setAlertMessage('Updated succeessfully.');
    setAlertColor('success');
    setTimeout(() => {
      setAlertState(false);
    }, 5000);
  }
  return (
    <>
      <div className="flex flex-grow p-6">
        {/* ------------------------------------------- */}
        {/* Edit notes */}
        {/* ------------------------------------------- */}
        {noteDetails ? (
          <div className="bg-white p-4 rounded-lg shadow flex flex-col gap-3 w-full ">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-600 w-20">Title:</span>
              <span className="text-gray-800">{initialTitle}</span>
            </div>

            <div className="flex items-start gap-2">
              <span className="font-medium text-gray-600 w-20">Detail:</span>
              <span className="text-gray-800 whitespace-pre-line">{initialDetail}</span>
            </div>


            <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center', }}>
              <div className="flex gap-3">
                {colorvariation.map((color1) => (
                  <div
                    key={color1.id}
                    className={`h-7 w-7 rounded-full cursor-pointer flex items-center justify-center bg-${color1.disp}`}
                  >
                    {noteDetails.color === color1.disp && (
                      <TbCheck className="text-white" size={16} />
                    )}
                  </div>
                ))}
              </div>
              <Button
                color={"lightprimary"}
                onClick={() => { openNotificationDetail(); }}
              >
                Look Detail
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center w-full py-6 text-2xl text-darklink dark:text-bodytext">
            Select a Note
          </div>
        )}
      </div>
      <Modal show={openDetailModal} onClose={() => setOpenDetailModal(false)}>
        <Modal.Header>DN - {initialKey}</Modal.Header>
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
              {
                initialType && initialType == 'incoterms' ?
                <input
                  type="text"
                  style={{width:'100%'}}
                  value={incoterm}
                  onChange={(e)=>{setIncoterm(e.target.value)}}
                  className="border border-gray-300 p-2 rounded"
                />
                :
                <select
                  style={{width:'100%'}}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="border border-gray-300 p-2 rounded"
                >
                  <option value=""></option>
                  <option value="mmddyyyy">MM-DD-YYYY</option>
                  <option value="ddmmyyyy">DD-MM-YYYY</option>
              </select>
              }
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex w-full">
            <Button
              style={{width:'100%'}}
              color="primary"
              onClick = {()=>{updateIntervention()}}
            >
              Upload Data
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      <AlertComponent alert={alertState} message={alertMessage} color={alertColor} />
    </>
  );
};

export default NoteContent;
