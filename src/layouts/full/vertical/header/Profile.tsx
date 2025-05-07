import { Icon } from '@iconify/react';
import { Badge, Dropdown } from 'flowbite-react';
import * as profileData from './Data';
import SimpleBar from 'simplebar-react';
import profileImg from '/src/assets/images/profile/user-1.jpg';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from 'src/context/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthContext must be used within AuthContextProvider');
  const { user, logout } = context;

  const handleDropDown = (title: string, url?: string) => {
    if (title === 'Sign Out') {
      logout();
    } else if (url) {
      navigate('/user_profile');
    }
  };

  return (
    <div className="relative">
      <Dropdown
        label=""
        className="w-screen sm:w-[360px] pb-4 rounded-sm"
        dismissOnClick={false}
        renderTrigger={() => (
          <div className="flex items-center gap-1">
            <span className="h-10 w-10 hover:text-primary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
              <img src={profileImg} alt="logo" height="35" width="35" className="rounded-full" />
            </span>
            <Icon
              icon="solar:alt-arrow-down-bold"
              className="hover:text-primary dark:text-primary group-hover/menu:text-primary"
              height={12}
            />
          </div>
        )}
      >
        <div className="px-6">
          <div className="flex items-center gap-6 pb-5 border-b dark:border-darkborder mt-5 mb-3">
            <img src={profileImg} alt="logo" height="56" width="56" className="rounded-full" />
            <div>
              <h5 className="text-15 font-semibold">
                <p className="text-success">{user?.name}</p>
              </h5>
              <h5 className="text-15 font-semibold">
                <p className="text-warning">{user?.role}</p>
              </h5>
              <p className="text-sm text-ld opacity-80">{user?.email}</p>
            </div>
          </div>
        </div>
        <SimpleBar>
          {profileData.profileDD.map((item, index) => (
            <div key={index} className="px-6 mb-2">
              <Dropdown.Item
                onClick={() => handleDropDown(item.title, item.url)}
                className="px-3 py-2 flex justify-between items-center bg-hover group/link w-full rounded-md"
              >
                <div className="flex items-center w-full">
                  <div className="flex gap-3 w-full">
                    <h5 className="text-15 font-normal group-hover/link:text-primary">
                      {item.title}
                    </h5>
                    {item.url === '/apps/invoice' && (
                      <Badge color={'lightprimary'}>4</Badge>
                    )}
                  </div>
                </div>
              </Dropdown.Item>
            </div>
          ))}
        </SimpleBar>
      </Dropdown>
    </div>
  );
};

export default Profile;
