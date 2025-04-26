import { useContext, useState, useEffect } from 'react';
import { TbCheck } from 'react-icons/tb';
import { Textarea } from 'flowbite-react';
import { NotesContext } from 'src/context/NotesContext';
import React from 'react';

interface colorsType {
  lineColor: string;
  disp: string | any;
  id: number;
}

// interface Props {
//   toggleNoteSidebar: (event: React.MouseEvent<HTMLElement>) => void;
// }
const NoteContent = () => {
  const { notes, updateNote, selectedNoteId }: any = useContext(NotesContext);
  const noteDetails = Array.isArray(notes)
    ? notes.find((note: { id: any }) => note.id === selectedNoteId)
    : null;

  // Initialize state for updatedTitle, initialTitle, and isEditing status
  const [initialTitle, setInitialTitle] = useState('');
  const [initialEmail, setInitialEmail] = useState('');
  const [initialDetail, setInitialDetail] = useState('');
  const [isEditing, setIsEditing] = useState(false); // State to track whether editing is in progress

  // Effect to update initialTitle when noteDetails changes
  useEffect(() => {
    if (noteDetails) {
      setInitialTitle(noteDetails.title);
      setInitialEmail(noteDetails.email);
      setInitialDetail(noteDetails.detail);
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

  return (
    <>
      <div className="flex flex-grow p-6">
        {/* ------------------------------------------- */}
        {/* Edit notes */}
        {/* ------------------------------------------- */}
        {noteDetails ? (
          <div className="bg-white p-4 rounded-lg shadow flex flex-col gap-3 w-full max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-600 w-20">Title:</span>
              <span className="text-gray-800">{initialTitle}</span>
            </div>

            <div className="flex items-start gap-2">
              <span className="font-medium text-gray-600 w-20">Detail:</span>
              <span className="text-gray-800 whitespace-pre-line">{initialDetail}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-600 w-20">Email:</span>
              <span className="text-gray-800">{initialEmail}</span>
            </div>

            <div>
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
            </div>
          </div>
        ) : (
          <div className="text-center w-full py-6 text-2xl text-darklink dark:text-bodytext">
            Select a Note
          </div>
        )}
      </div>
    </>
  );
};

export default NoteContent;
