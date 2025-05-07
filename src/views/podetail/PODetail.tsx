import BreadcrumbComp from "src/layouts/full/shared/breadcrumb/BreadcrumbComp";
import POList from '../../components/tables/polist'
import { useParams } from "react-router-dom";
import { Card, TextInput, Datepicker } from "flowbite-react";
import { Icon } from "@iconify/react";
import Quantity from "src/components/tables/staging/Quantity";
import StagingTable from "src/components/tables/staging/StagingTable";
import { useEffect, useState } from "react";
import axios from "../../utils/axios";
const CheckboxTables = () => {
    const { dn } = useParams<{ dn: string }>();
    const { po } = useParams<{ po: string }>();
    const [ax09Data, setAX09Data] = useState([])
    const [DnData, setDnData] = useState([])
    const [InvData, setInvData] = useState([])
    const [CoaData, setCoaData] = useState([])
    const [BolData, setBolData] = useState([])
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
    const get_staging_data = async () => {
        const response = await axios.post("/api2/ax09/get_po_data", { "DN#": dn, "PO#": po })
        const dn_response = await axios.post("/api2/ax09/dn_table_data", { "DN#": dn, "PO#": po })
        const inv_response = await axios.post("/api2/ax09/inv_table_data", { "DN#": dn, "PO#": po })
        const coa_response = await axios.post("/api2/ax09/coa_table_data", { "DN#": dn, "PO#": po })
        const bol_response = await axios.post("/api2/ax09/bol_table_data", { "DN#": dn, "PO#": po })
        setAX09Data(response.data)
        setDnData(dn_response.data)
        setInvData(inv_response.data)
        setCoaData(coa_response.data)
        setBolData(bol_response.data)

        console.log(dn_response.data)
        console.log(inv_response.data)
        console.log(coa_response.data)
        console.log(bol_response.data)

    }
    useEffect(() => {
        get_staging_data()
    }, [])

    const handleRefreshStaging = async () => {
        // Implement your API call to get latest staging data
        // const response = await axios.get('/api/get-latest-staging');
        // setAx09Data([response.data]); // Update your staging data state
    };

    const handleGetChanges = async (changes) => {
        const dn_update = await axios.post("/api2/dn/update_dn_table",{data:changes})
        // changes contains all modifications grouped by source
        // console.log('Changes to process:', changes);
        // Implement your API calls to save these changes
        // Example:
        // Object.entries(changes).forEach(([source, changes]) => {
        //   if (Object.keys(changes).length > 0) {
        //     axios.post(`/api/update-${source}`, changes);
        //   }
        // });
    };

    return (
        <>
            <BreadcrumbComp title="AX09 Staging Table" items={BCrumb} />
            <Quantity data={ax09Data} dn={dn} po={po} refresh={get_staging_data} />
            <StagingTable stagingData={ax09Data} dn={dn} po={po} dnData={DnData} invData={InvData} coaData={CoaData} bolData={BolData} onRefreshStaging={handleRefreshStaging} onGetChanges={handleGetChanges} />
        </>
    );
};

export default CheckboxTables;
