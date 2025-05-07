
import { Icon } from "@iconify/react";
import { Badge, Button, Dropdown } from "flowbite-react";

import * as Notification from "./Data";
import SimpleBar from "simplebar-react";
import { Link } from "react-router";
import { useEffect, useState,useContext  } from "react";
import { useNavigate } from 'react-router-dom';
import { useSocket } from 'src/SokcetProvider';
import { AlertComponent } from 'src/Alert/alert';
import { AuthContext } from 'src/context/AuthContext';
import axios from "../../../../utils/axios";

const Notifications = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthContext must be used within AuthContextProvider');
  const { user } = context;
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();
  const openLogsheet = (id) =>{
    navigate(`/email/${id}`);
  }
  const openNotification = () =>{
    navigate(`/notification`);
  }
  const [newNotifications, setNewNotifications] = useState([]);
  const [newNotificationBadge, setNewNotificationBadge] = useState(0);
  const [alertState, setAlertState] = useState(false)
  const [alertColor, setAlertColor] = useState("")
  const [alertMessage, setAlertMessage] = useState("")
  const get_all_notification = async ()=>{
    const notificationData = []
    const response = await axios.post('/api2/notification/get_all_data',{"email":user["email"]});
    const notifications = response.data;
    let count = 0
    for (let i = notifications.length - 1; i >= 0; i--) {
        if(count>=newNotificationBadge)
          continue
        const notification = notifications[i];
        notificationData.push(notification);
        count = count + 1
    }

    console.log(notificationData)
    setNewNotifications(notificationData)
  }
  useEffect(()=>{
    get_all_notification()
  },[newNotificationBadge])
  
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('no_date_format',(data)=>{
      setNewNotificationBadge((prev) => prev + 1);
      setAlertState(true)
      setAlertMessage(`DN - ${data["DN#"]} has no data-format. Check it.`)
      setAlertColor("error")
      
      setTimeout(() => {
        setAlertState(false);
      }, 5000);
    })
    
    socket.on('no_exact_incoterms',(data)=>{
      setNewNotificationBadge((prev) => prev + 1);
      setAlertState(true)
      setAlertMessage(`DN - ${data["DN#"]} has no Incoterms. Check it.`)
      setAlertColor("error")
      
      setTimeout(() => {
        setAlertState(false);
      }, 5000);
    })
    
    socket.on('duplicated-document',(data)=>{
      setNewNotificationBadge((prev) => prev + 1);
      setAlertState(true)
      setAlertMessage(`DN - ${data["DN#"]} has duplicated ${data["doc"]} document. Ignored that.`)
      setAlertColor("error")
      setTimeout(() => {
        setAlertState(false);
      }, 5000);
    })
    
    socket.on('new-same-document',(data)=>{
      setNewNotificationBadge((prev) => prev + 1);
      setAlertState(true)
      setAlertMessage(`DN - ${data["DN#"]} has new ${data["doc"]} document. Check it.`)
      setAlertColor("error")
      setTimeout(() => {
        setAlertState(false);
      }, 5000);
    })
  }, [socket, isConnected]);
  return (
    <div className="relative group/menu">
      <Dropdown
        label=""
        className="w-screen sm:w-[360px] py-6  rounded-sm"
        dismissOnClick={false}
        
        renderTrigger={() => (
          <div className="relative">
            <span onClick={()=>{get_all_notification();}} className="h-10 w-10 hover:bg-lightprimary text-darklink  dark:text-white rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
              <Icon icon="solar:bell-bing-line-duotone" height={20} />
            </span>
            <span className="rounded-full absolute end-1 top-1 bg-error text-[10px] h-4 w-4 flex justify-center items-center text-white">
              {newNotificationBadge}
            </span>
          </div>
        )}
      >
        <div className="flex items-center px-6 justify-between">
          <h3 className="mb-0 text-lg font-semibold text-ld">Notifications</h3>
        </div>

        <SimpleBar className="max-h-80 mt-3">
          {newNotifications && newNotifications.map((item, index) => (
            <Dropdown.Item
              as={Link}
              to="#"
              className="px-6 py-3 flex justify-between items-center bg-hover group/link w-full"
              key={index}
              onClick={()=>openLogsheet(item.id)}
            >
              <div className="flex items-center w-full">
                <div
                  className={`h-11 w-11 flex-shrink-0 rounded-full flex justify-center items-center ${item.type=="multi-doc" ? "bg-lighterror dark:bg-lighterror" : "bg-lightprimary dark:bg-lightprimary"} `}
                >
                  <Icon icon={item.type == "multi-doc" ? "solar:notes-bold-duotone" : "solar:widget-6-bold-duotone"} height={20} className={item.type == "multi-doc" ? "text-error" : "text-primary"} />
                </div>
                <div className="ps-4 flex justify-between w-full">
                  <div className="w-3/4 text-start">
                    <h5 className="mb-1 text-15 font-semibold group-hover/link:text-primary">
                      {item.header}
                    </h5>
                    <div className="text-sm text-bodytext line-clamp-1">
                      {item.message}
                    </div>
                  </div>

                  <div className="text-xs block self-start pt-1.5">
                    {item.date}
                  </div>
                </div>
              </div>
            </Dropdown.Item>
          ))}
        </SimpleBar>
        <div className="pt-5 px-6">
          <Button
            color={"primary"}
            className="w-full"
            onClick={()=>openNotification()}
          >
            See All Notifications
          </Button>
        </div>
      </Dropdown>
          <AlertComponent alert = {alertState} message={alertMessage} color={alertColor} />
    </div>
  );
};

export default Notifications;
