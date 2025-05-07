

import NotificationApp from "src/components/notification";
import BreadcrumbComp from "src/layouts/full/shared/breadcrumb/BreadcrumbComp";


const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Notification',
  },
];

const Notification = () => {
  return (
    <>
        <BreadcrumbComp title="Notification" items={BCrumb} />
        <NotificationApp/>
    </>
  );
};

export default Notification;
