import AdminEmail from './AdminEmail';
import UserEmail from './UserEmail';

import { useParams } from "react-router-dom";
import { useContext } from 'react';
import { AuthContext } from 'src/context/AuthContext';
const Email = () => {
  const { emailID } = useParams<{ emailID: string }>();
  // alert(emailID)
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthContext must be used within AuthContextProvider');
  const { user } = context;

  return user.role == 'admin' ? <AdminEmail emailID = {emailID}/> : <UserEmail />;
};
export default Email;
