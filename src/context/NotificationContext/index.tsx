
import  { createContext, useState, useEffect,useContext } from 'react';
import axios from "../../utils/axios";
import { NotificationType } from '../../types/apps/notification';
import React from "react";
import { AuthContext } from 'src/context/AuthContext';

// Define context type
interface NotificationContextType {
    notes: NotificationType[];
    loading: boolean;
    error: Error | null;
    selectedNoteId: number;
    selectNote: (id: number) => void;
}

// Initial context values
const initialContext: NotificationContextType = {
    notes: [],
    loading: true,
    error: null,
    selectedNoteId: 1,
    selectNote: () => { },
};

// Create context
export const NotificationContext = createContext<NotificationContextType>(initialContext);

// Provider component
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('AuthContext must be used within AuthContextProvider');
    const { user } = context;
    const [notes, setNotes] = useState<NotificationType[]>(initialContext.notes);
    const [loading, setLoading] = useState<boolean>(initialContext.loading);
    const [error] = useState<Error | null>(initialContext.error);
    const [selectedNoteId, setSelectedNoteId] = useState<number>(initialContext.selectedNoteId);

    // Fetch notes from the server
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await axios.post('/api2/notification/get_all_data',{"email":user["email"]});
                console.log(response.data)
                // const notificationData = [
                //     {
                //     "id":"1",
                //     'type':'multi-doc',
                //     'header':'Multi-Doc Intervention',
                //     'color':'error',
                //     'message':'DN-192354 needs user intervention.',
                //     'date':'4/29/2025 3:13 AM',
                //     },
                //     {
                //     "id":"2",
                //     'type':'multi-doc',
                //     'header':'Multi-Doc Intervention',
                //     'color':'error',
                //     'message':'DN-18353 needs user intervention.',
                //     'date':'4/28/2025 4:05 AM',
                //     },
                //     {
                //     "id":"3",
                //     'type':'supplier-name',
                //     'header':'Supplier Name Intervention',
                //     'color':'success',
                //     'message':'DN-332213 needs user intervention.',
                //     'date':'4/28/2025 6:35 AM',
                //     },
                //     {
                //     "id":"4",
                //     'type':'multi-doc',
                //     'color':'error',
                //     'header':'Multi-Doc Intervention',
                //     'message':'DN-4323543 needs user intervention.',
                //     'date':'4/28/2025 7:55 AM',
                //     },
                //     {
                //     "id":"5",
                //     'type':'supplier-name',
                //     'color':'success',
                //     'header':'Supplier Name Intervention',
                //     'message':'DN-321231 needs user intervention.',
                //     'date':'4/28/2025 6:25 AM',
                //     },
                // ]
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


    return (
        <NotificationContext.Provider
            value={{
                notes,
                loading,
                error,
                selectedNoteId,
                selectNote,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};


