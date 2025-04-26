import EmaiilApp from "src/components/userEmail";
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
const UserEmail = () => {
  return (
    <>
      <BreadcrumbComp title="Email App" items={BCrumb} />
      <EmaiilApp />
    </>
  );
};
export default UserEmail;
