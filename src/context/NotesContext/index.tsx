
import  { createContext, useState, useEffect,useContext } from 'react';
import axios from "../../utils/axios";
import { NotesType } from '../../types/apps/notes';
import React from "react";
import { AuthContext } from 'src/context/AuthContext';

// Define context type
interface NotesContextType {
    notes: NotesType[];
    loading: boolean;
    error: Error | null;
    selectedNoteId: number;
    selectNote: (id: number) => void;
    addNote: (newNote: NotesType) => Promise<void>;
    updateNote: (id: number, title: string, color: string) => Promise<void>;
    deleteNote: (id: number) => Promise<void>;
}

// Initial context values
const initialContext: NotesContextType = {
    notes: [],
    loading: true,
    error: null,
    selectedNoteId: 1,
    selectNote: () => { },
    addNote: async () => { },
    updateNote: async (_id: number, _title: string) => { },
    deleteNote: async () => { },
};

// Create context
export const NotesContext = createContext<NotesContextType>(initialContext);

// Provider component
export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('AuthContext must be used within AuthContextProvider');
    const { user } = context;
    const [notes, setNotes] = useState<NotesType[]>(initialContext.notes);
    const [loading, setLoading] = useState<boolean>(initialContext.loading);
    const [error] = useState<Error | null>(initialContext.error);
    const [selectedNoteId, setSelectedNoteId] = useState<number>(initialContext.selectedNoteId);

    // Fetch notes from the server
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await axios.post('/api2/logsheet/get_all_data',{"email":user["email"]});
                setNotes(response.data);
                setLoading(false);
                console.log(response.data)
            } catch (err) {
                // setError(err);
                setLoading(false);
            }
        };
        fetchNotes();
    }, []);

    // Select a note by its ID
    const selectNote = (id: number) => {
        setSelectedNoteId(id);
    };

    // Add a new note
    const addNote = async (newNote: NotesType) => {
        try {
            const response = await axios.post<NotesType>('/api/notes/add', newNote);
            setNotes((prevNotes) => [...prevNotes, response.data]);
        } catch (error) {
            console.error('Error adding note:', error);
            // Handle error as needed
        }
    };

    // Update a note by its ID
    const updateNote = async (id: number, title: string, color: string) => {
        try {
            const response = await axios.put<NotesType>('/api/notes/update', { id, title, color });
            const updatedNote = response.data;

            // Update notes state with the updated note
            setNotes((prevNotes) =>
                prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
            );

            // Optionally update selectedNoteId if needed
            if (selectedNoteId === updatedNote.id) {
                setSelectedNoteId(updatedNote.id);
            }
        } catch (error) {
            console.error('Error updating note:', error);
            // Handle error as needed
        }
    };

    // Delete a note by its ID
    const deleteNote = async (id: number) => {
        try {
            await axios.delete('/api2/logsheet/delete', { params: { id } });
            setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
        } catch (error) {
            console.error('Error deleting note:', error);
            // Handle error as needed
        }
    };

    return (
        <NotesContext.Provider
            value={{
                notes,
                loading,
                error,
                selectedNoteId,
                selectNote,
                addNote,
                updateNote,
                deleteNote,
            }}
        >
            {children}
        </NotesContext.Provider>
    );
};


