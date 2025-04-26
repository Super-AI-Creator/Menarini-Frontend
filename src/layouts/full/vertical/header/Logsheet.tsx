import { Icon } from '@iconify/react';
import { Badge, Button, Dropdown } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';

const Logsheet = () => {
  const navigate = useNavigate();
  const openLogsheet = () =>{
    navigate(`/logsheet`);
  }
  return (
    <div className="relative group/menu" onClick={()=>openLogsheet()}>
      <span className="h-10 w-10 hover:bg-lightprimary text-darklink  dark:text-white rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
        <Icon icon="solar:notebook-bookmark-broken" height={20}  />
      </span>
    </div>
  );
};

export default Logsheet;
