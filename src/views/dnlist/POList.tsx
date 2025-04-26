import BreadcrumbComp from "src/layouts/full/shared/breadcrumb/BreadcrumbComp";
import POList from '../../components/tables/polist'
import { useParams } from "react-router-dom";



const CheckboxTables = () => {
  const { dn } = useParams<{ dn: string }>();
  const BCrumb = [
    {
      to: "/",
      title: "Home",
    },
    {
      title: "AX09 Staging Table",
    },
    {
      title: "DN #" + dn,
    },
  ];
  return (
    <>
      <BreadcrumbComp title="AX09 Staging Table" items={BCrumb} />
      <div className="flex justify-between items-center border-b border-ld px-6 py-4 my-5">
        <div className="flex gap-3 items-center">
          <img
            src="/src/assets/images/profile/user-4.jpg"
            alt="icon"
            className="h-10 w-10 rounded-full"
          />
          <div className="truncat line-clamp-2 max-w-56">
            <h6 className="text-base">Evelyn Pope</h6>
            <p className="text-sm text-bodytext">steele@ui.com</p>
          </div>
        </div>

      </div>
      <POList />
    </>
  );
};

export default CheckboxTables;
