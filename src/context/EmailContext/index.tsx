
import  { createContext, useState, Dispatch, SetStateAction, useEffect, useContext } from 'react';
import { AuthContext } from 'src/context/AuthContext';
import axios from "../../utils/axios";
import { EmailType } from '../../types/apps/email';
import {PODNType} from '../../types/apps/po_dn';
import React from "react";
import user2 from '/src/assets/images/profile/user-2.jpg';
import { io, Socket } from 'socket.io-client';
import { useSocket } from 'src/SokcetProvider';

interface EmailContextType {
  emails: EmailType[];
  selectedEmail: EmailType | null;
  setSelectedEmail: (email: EmailType | null) => void;
  emailDataWithID:(emailID: number | null) =>void;
  deleteEmail: (emailId: number) => void;
  toggleStar: (emailId: number) => void;
  toggleImportant: (emailId: number) => void;
  setFilter: Dispatch<SetStateAction<string>>;
  filter: string,
  searchQuery: string,
  setSearchQuery: Dispatch<SetStateAction<string>>;
  startOCR: (emailId: number) => void;
  getIntervention: (emailId:number) => void;
  update_multi_doc_type: (emailId:number , updated_doc_list:number) => void;
  setUpdatedSupplierName: (updated_supplier:number) => void;
  newPO:PODNType | null;
}

const initialEmailContext: EmailContextType = {
  emails: [],
  newPO: null,
  selectedEmail: null,
  filter: 'inbox',
  searchQuery: '',
  setSelectedEmail: () => {},
  startOCR: () => {},
  getIntervention: () => {},
  update_multi_doc_type: ()=>{},
  deleteEmail: () => { },
  toggleStar: () => { },
  toggleImportant: () => { },
  setFilter: () => { },
  setSearchQuery: () => { },
  setUpdatedSupplierName: () => {}
};

export const EmailContext = createContext<EmailContextType>(initialEmailContext);

type EmailContextProviderProps = {
  children: React.ReactNode;
  emailID: string; // or whatever type emailID is
};

export const EmailContextProvider: React.FC<EmailContextProviderProps> = ({ children, emailID }) => {
  const context = useContext(AuthContext);
  const { socket, isConnected } = useSocket();
  const [emails, setEmails] = useState<EmailType[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailType | null>(null);
  const [newPO, setNewPO] = useState<PODNType | null>(null);
  const [EmailError, setEmailError] = useState<PODNType | null>(null);
  const [DocumentError, setDocumentError] = useState<PODNType | null>(null);
  const [supplierIntervention, setSupplierIntervention] = useState<PODNType | null>(null);
  const [multiDocIntervention, setMultiDocIntervention] = useState<PODNType | null>(null);
  const [supplier_name_list, setSupplierNameList] = useState<PODNType | null>(null);
  
  const [newturn, setNewTurn] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>('inbox');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (emailID) {
      if(emails.length){
        const foundEmail = emails.find(email => email.id === emailID);
        if (foundEmail) {
          setSelectedEmail(foundEmail);
        }
      }
      // Call your fetch function here if needed
    }
  }, [emailID,emails]);
  const emailDataWithID = (emailID: number | null) => {
    if (emailID === null) {
      setSelectedEmail(null);
      return;
    }
  
    const foundEmail = emails.find(email => email.id === emailID);
    if (foundEmail) {
      setSelectedEmail(foundEmail);
    } else {
      console.warn("Email not found with ID:", emailID);
    }
  };

  if (!context) throw new Error('AuthContext must be used within AuthContextProvider');
  const { user } = context;
  
  useEffect(() => {

    const fetchData = async () => {
      try {
        const response = await axios.post('/api2/email/all_email',{"email":user["email"], "role":user["role"]});
        let email_list = []
        if(response.data)
          email_list = response.data.data;
        
        let email_data = []
        email_data = email_list.map((email, index)=>{
          return(
            {
              id: email.id,
              from: email.sender,
              subject: email.subject,
              time: email.date,
              thumbnail: user2,
              To: 'abc@company.com',
              emailExcerpt: email.excerpt,
              emailContent: email.body,
              unread: true,
              attachment: false,
              starred: false,
              important: false,
              inbox: true,
              sent: false,
              draft: false,
              spam: false,
              trash: false,
              label: email.status === 1 ? "Complete" : "Pending",
              attchments: email.attachments,
            }
          )
        })
        if (email_data.length > 0) {
          setEmails(email_data)
          setSelectedEmail(email_data[0]);
        }
      } catch (error) {
        console.error('Error fetching email data:', error);
      }
    };
    fetchData();
  },[]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('new_email', (data) => {
      if (!data) return;
      console.log("New email event received:", data.id);
      setEmails(prevEmails => {
        const alreadyExists = prevEmails.some(email => email.id === data.id);
        if (alreadyExists) return prevEmails;
    
        return [
          ...prevEmails,
          {
            id: data.id,
            from: data.sender,
            subject: data.subject,
            time: data.date,
            thumbnail: user2,
            To: 'abc@company.com',
            emailExcerpt: data.excerpt,
            emailContent: data.body,
            unread: true,
            attachment: false,
            starred: false,
            important: false,
            inbox: true,
            sent: false,
            draft: false,
            spam: false,
            trash: false,
            label: "Pending",
            attchments: data.attachments,
          }
        ];
      });
    });

  }, [socket, isConnected]);  // Add proper dependencies

  const deleteEmail = async (emailId: number) => {
    try {
      // Make DELETE request to mock API endpoint
      await axios.delete('/api/data/email/delete', { data: { emailId } });
      // Remove deleted email from state
      setEmails(emails.filter(email => email.id !== emailId));
      // If the deleted email was selected, clear selectedEmail
      if (selectedEmail && selectedEmail.id === emailId) {
        setSelectedEmail(null);
      }
    } catch (error) {
      console.error('Error deleting email:', error);
    }
  };
  
  const startOCR = async (emailId: number) =>{
    try{
      const response = await axios.post('/api2/email/get_attachment_list_from_email', {"EmailID": emailId });
      const email_error_response = await axios.post('/api2/email/get_error', {"EmailID": emailId });
      const document_error_response = await axios.post('/api2/email/get_document_error_with_email', {"EmailID": emailId });
      console.log(email_error_response.data.data)
      setNewPO(response.data)
      setEmailError(email_error_response.data.data)
      setDocumentError(document_error_response.data.data)
    }catch(error){
      console.error('Error starting OCR:', error
      )
    }
  }
  const getIntervention = async (emailId: number) =>{
    try{
      const supplier_intervention = await axios.post('/api2/intervention/supplier_intervention', {"EmailID": emailId });
      const multi_doc_intervention = await axios.post('/api2/intervention/multi_doc_intervention', {"EmailID": emailId });
      const supplier_name_list = await axios.post('/api2/supplier/supplier_name', {"EmailID": emailId });
      console.log(supplier_intervention.data.data)
      console.log(multi_doc_intervention.data.data)
      setSupplierIntervention(supplier_intervention.data.data)
      setMultiDocIntervention(multi_doc_intervention.data.data)
      setSupplierNameList(supplier_name_list.data.data)
      // setNewPO(response.data)
      // setEmailError(email_error_response.data.data)
    }catch(error){
      console.error('Error starting Intervention:', error)
    }
  }

  const logsheet = async (logType :any,email :any,Detail :any)=>{
    const response = await axios.post('/api2/logsheet/new_logsheet', {
      "type":logType,
      "email":email,
      "detail":Detail
    });
    console.log("------------")
    console.log(response.data)
  }
  const update_multi_doc_type = async (emailId:number , updated_doc_list: number)=>{
    try{
      console.log(emailId)
      const update_multi_doc = await axios.post('/api2/intervention/set_multi_doc', {"EmailID": emailId ,"data": updated_doc_list });
      logsheet("Multi Document Intervention",user["email"], updated_doc_list)
      socket.emit('update_multi_doc_google_drive', {
        updated_doc_list,
      });
      console.log(updated_doc_list)
    }
    catch(error){
      console.log('Error starting Intervention:', error)
    }
  }

  const setUpdatedSupplierName = async (updated_supplier: number)=>{
    try{
      console.log("-------------")
      const update_supplier_name = await axios.post('/api2/intervention/set_supplier_name', {"vendor_domain": updated_supplier.domain ,"old_vendor_name": updated_supplier.old_vendor_name, "new_vendor_name": updated_supplier.vendor_name, "DN#": updated_supplier["DN#"] });
      console.log(updated_supplier)
      logsheet("Update Supplier Name",user["email"], updated_supplier)
      socket.emit('update_supplier_name_google_drive', {
        updated_supplier,
      });
    }
    catch(error){
      console.log('Error starting Intervention:', error)
    }
  }
  const toggleStar = (emailId: number) => {
    setEmails(prevEmails =>
      prevEmails.map(email =>
        email.id === emailId ? { ...email, starred: !email.starred } : email
      )
    );

    if (selectedEmail?.id === emailId) {
      setSelectedEmail((prevEmail: any) => ({
        ...(prevEmail as EmailType),
        starred: !(prevEmail as EmailType).starred
      }));
    }
  };

  const toggleImportant = (emailId: number) => {
    setEmails(prevEmails =>
      prevEmails.map(email =>
        email.id === emailId ? { ...email, important: !email.important } : email
      )
    );

    if (selectedEmail?.id === emailId) {
      setSelectedEmail((prevEmail: any) => ({
        ...(prevEmail as EmailType),
        important: !(prevEmail as EmailType).important
      }));
    }
  };

  return (
    <EmailContext.Provider value={{ emails, emailDataWithID,selectedEmail, setSelectedEmail, deleteEmail, toggleStar, toggleImportant, setFilter, filter, searchQuery, setSearchQuery, startOCR, newPO, EmailError, DocumentError, getIntervention ,multiDocIntervention,supplierIntervention, update_multi_doc_type, setUpdatedSupplierName, supplier_name_list}}>
      {children}
    </EmailContext.Provider>
  );
};
