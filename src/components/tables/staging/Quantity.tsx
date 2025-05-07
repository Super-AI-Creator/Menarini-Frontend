
import { Table } from "flowbite-react";
import { useState, useEffect } from "react";
import { Alert, Button, TextInput, Tooltip } from "flowbite-react";
import { AlertComponent } from 'src/Alert/alert';

import CardBox from "src/components/shared/CardBox";
import axios from "../../../utils/axios";

const QuantityTable = (props) => {
  const [totalOrdered, setTotalOrdered] = useState(0)
  const [totalShipped, setTotalShipped] = useState(0)
  const [totalBalance, setTotalBalance] = useState(0)
  const [percent, setpercent] = useState(10)
  const [alertState, setAlertState] = useState(false);
  const [alertColor, setAlertColor] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [inputPercent, setInputpercent] = useState(0.1)
  useEffect(() => {
    if (!props.data) return;

    let totalOrder = 0;
    let totalShipped = 0;

    props.data.forEach(item => {
      totalOrder += Number(item["Open PO Quantity"]) || 0;
      totalShipped += Number(item["Shipped Quantity"]) || 0;
    });

    setTotalOrdered(totalOrder);
    setTotalShipped(totalShipped);
    setTotalBalance(totalShipped - totalOrder);
  }, [props.data]);

  const getpercent = async () => {
    const response = await axios.post('/api2/ax09/get_percent', { "DN#": props.dn, "PO#": props.po })
    setpercent(response.data.percent)
    setInputpercent(response.data.percent*100)
  }
  useEffect(() => {
    getpercent()
  }, [props.dn, props.po])
  const setPOPercent = async()=>{
    const response = await axios.post('/api2/ax09/update_percent', { "DN#": props.dn, "PO#": props.po,"percent":inputPercent})
    setAlertState(true);
    setAlertMessage('The percent changed successfully.');
    setAlertColor('success');
    setTimeout(() => {
      setAlertState(false);
    }, 5000);
    props.refresh()
    getpercent()
  }
  return (
    <div>
      <CardBox>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-lg font-semibold">Qunatity Table</h4>
          <div className="flex gap-3">
            <input
              type="text"
              value={inputPercent}
              onChange={(e) => { setInputpercent(e.target.value) }}
              className="border border-gray-300 p-2 rounded"
            />
            <Button
              color={"lightprimary"}
              onClick={() => setPOPercent()}
            >
              Save Change
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <Table.Head>
              <Table.HeadCell>PO Line</Table.HeadCell>
              <Table.HeadCell>Batch</Table.HeadCell>
              <Table.HeadCell>Ordered Quantity</Table.HeadCell>
              <Table.HeadCell>Shipped Quantity</Table.HeadCell>
              <Table.HeadCell>Balance Quantity</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {
                props.data && props.data.map((item, key) => {
                  return (
                    <Table.Row className="bg-white">
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {item["PO Line Number"]}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {item["Batch Number"]}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {item["Open PO Quantity"]}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {item["Shipped Quantity"]}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {item["Shipped Quantity"] - item["Open PO Quantity"] >= 0 ? item["Shipped Quantity"] - item["Open PO Quantity"] : 0}
                      </Table.Cell>
                    </Table.Row>
                  )
                })
              }
              <Table.Row className={totalBalance/totalShipped < percent ? "bg-success" : "bg-error"}>
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {totalOrdered}
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {totalShipped}
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {totalBalance >= 0 ? totalBalance : 0}
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </div>
      </CardBox>
      <AlertComponent alert={alertState} message={alertMessage} color={alertColor} />
    </div>
  );
};

export default QuantityTable;
