import BreadcrumbComp from "src/layouts/full/shared/breadcrumb/BreadcrumbComp";
import POList from '../../components/tables/polist'
import { useParams } from "react-router-dom";
import { Card, TextInput, Datepicker } from "flowbite-react";
import { Icon } from "@iconify/react";
import DefaultTable from "src/components/Table/DefaultTable";
const CheckboxTables = () => {
    const { dn } = useParams<{ dn: string }>();
    const { po } = useParams<{ po: string }>();
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
        {
            title: po,
        },
    ];
    return (
        <>
            <BreadcrumbComp title="AX09 Staging Table" items={BCrumb} />
            <div className="flex justify-between items-center border-b border-ld px-6 py-4">
                <h5 className="text-xl font-semibold">{po}</h5>
                <div className="flex items-end pl-4">
                    <TextInput
                        id="search"
                        placeholder="Search contacts"
                        className="form-control w-full bg-white"
                        sizing="md"
                        required
                        icon={() => (
                            <Icon icon="solar:magnifer-line-duotone" height={18} />
                        )}
                    />
                </div>
            </div>
            <DefaultTable />
        </>
    );
};

export default CheckboxTables;
