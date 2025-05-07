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
      <BreadcrumbComp title={"DN - "+dn} items={BCrumb} />
      <POList />
    </>
  );
};

export default CheckboxTables;
