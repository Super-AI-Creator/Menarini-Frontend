
import { useContext, useState,useEffect } from "react";
import { Drawer } from "flowbite-react";
import CardBox from "src/components/shared/CardBox";
import {EmailContextProvider } from "src/context/EmailContext";
import EmailContent from "./EmailContent";
import EmailFilter from "./EmailFilter";
import EmailList from "./EmailList";
import EmailSearch from "./EmailSearch";


const AdminEmailApp = (props) => {
  const [isOpenEmail, setIsOpenEmail] = useState(false);
  const handleCloseEmail = () => setIsOpenEmail(false);
  const [isOpenMail, setIsOpenMail] = useState(false);
  return (
    <>
      <EmailContextProvider emailID={props.emailID}>
        <CardBox className="p-0 overflow-hidden">
          <div className="flex">
            {/* ------------------------------------------- */}
            {/* Left Part */}
            {/* ------------------------------------------- */}
            {/* ------------------------------------------- */}
            {/* Middle part */}
            {/* ------------------------------------------- */}
            <div className="left-part lg:max-w-[340px] max-w-full md:border-e md:border-ld border-e-0  w-full px-0 pt-0">
              <EmailSearch onClick={() => setIsOpenEmail(true)} />
              <EmailList openMail={setIsOpenMail} />
            </div>
            {/* ------------------------------------------- */}
            {/* Detail part */}
            {/* ------------------------------------------- */}
            <EmailContent openMailValue={isOpenMail} onCloseMail={() => setIsOpenMail(false)} />
          </div>
        </CardBox>
      </EmailContextProvider>
    </>
  );
};
export default AdminEmailApp;
