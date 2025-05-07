
import { Icon } from "@iconify/react";
import  { useState, useContext, useEffect } from "react";
import { Alert, Button, TextInput, Tooltip } from "flowbite-react";
import { NotificationContext } from "src/context/NotificationContext";
import { NotificationType } from "src/types/apps/notification";




const Notelist = () => {

  const { notes, selectNote }: any = useContext(NotificationContext);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeNoteId, setActiveNoteId] = useState<any | null>(null);


  useEffect(() => {
    if (notes.length > 0) {
      const firstNoteId = notes[0]._id;
      setActiveNoteId(firstNoteId);
    }
  }, [notes]);


  const filterNotes = (notes: NotificationType[], nSearch: string) => {
    if (nSearch !== "")
      return notes.filter(
        (t: any) =>
          !t.deleted &&
          t.header
            .toLocaleLowerCase()
            .concat(" ")
            .includes(nSearch.toLocaleLowerCase())
      );

    return notes.filter((t) => !t.deleted);
  };

  const filteredNotes = Array.isArray(notes) ? filterNotes(notes, searchTerm) : [];

  const handleNoteClick = (noteId: any) => {
    setActiveNoteId(noteId);
    selectNote(noteId);
  };

  return (
    <>
      <div>
        <TextInput
          id="search"
          value={searchTerm}
          placeholder="Search Notification"
          className="form-control"
          sizing="md"
          required
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <h6 className="text-base mt-6">All Notifications</h6>
        <div className="flex flex-col gap-3 mt-4">
          {filteredNotes && filteredNotes.length ? (
            filteredNotes.map((note,key) => (
              <div key={note._id}>
                <div
                  className={`cursor-pointer relative p-4 rounded-md bg-light${note.color} dark:bg-dark${note.color}
                  ${activeNoteId === note._id ? "scale-100" : "scale-95"} transition-transform duration-200`}
                  onClick={() => {handleNoteClick(note._id);}}
                >
                  <h6 className={`text-base truncate text-${note.color}`}>
                    {note.header}
                  </h6>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-ld">
                      {new Date(note.date).toLocaleDateString()}
                    </p>
                    <div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>
              <Alert color="error" icon={() => <Icon icon="solar:info-circle-linear" className="me-2" height={20} />}>
                <span className="font-medium"> No Notification Found!</span>
              </Alert>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default Notelist;





