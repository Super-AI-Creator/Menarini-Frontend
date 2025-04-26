import BreadcrumbComp from "src/layouts/full/shared/breadcrumb/BreadcrumbComp";
import DNTable from '../../components/tables/dntable'

const BCrumb = [
  {
    to: "/",
    title: "Home",
  },
  {
    title: "AX09 Staging Table",
  },
];

const CheckboxTables = () => {

  return (
    <>
      <BreadcrumbComp title="AX09 Staging Table" items={BCrumb} />
      <DNTable />
    </>
  );
};

export default CheckboxTables;
