import AdminEmailApp from "src/components/email";
import BreadcrumbComp from "src/layouts/full/shared/breadcrumb/BreadcrumbComp";



const BCrumb = [
  {
    to: "/",
    title: "Home",
  },
  {
    title: "Email",
  },
];
const AdminEmail = (props) => {
  return (
    <>
      <BreadcrumbComp title="Email App" items={BCrumb} />
      <AdminEmailApp emailID = {props.emailID}/>
    </>
  );
};
export default AdminEmail;
