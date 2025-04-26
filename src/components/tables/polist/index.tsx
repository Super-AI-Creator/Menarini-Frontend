
import { Badge, Table, Dropdown, Progress } from "flowbite-react";
import * as basicTable4 from "../../tables/tableData.ts";
import { IconDotsVertical } from "@tabler/icons-react";
import { Icon } from "@iconify/react";
import TitleCard from "src/components/shared/TitleBorderCard.tsx";
import { useNavigate, useParams } from "react-router-dom";
const index = () => {
  const navigate = useNavigate();
  /*Table Action*/
  const { dn } = useParams<{ dn: string }>();

  const tableActionData = [
    {
      id: 1,
      icon: "tabler:plus",
      listtitle: "View DN",
    },
    {
      id: 2,
      icon: "tabler:edit",
      listtitle: "Email",
    },
    {
      id: 3,
      icon: "tabler:search",
      listtitle: "Search",
    }
  ];
  const handleActionButton = (id: any, type: number) => {
    if (type == 1) {
      navigate(`/dn-list/${dn}/${id}`);
    }
  }
  return (
    <>
      <TitleCard title="PO List">
        <div className="border rounded-md border-ld overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="">
              <Table.Head>
                <Table.HeadCell className="text-base font-semibold py-3">
                  PO
                </Table.HeadCell>
                <Table.HeadCell className="text-base font-semibold py-3">
                  Status
                </Table.HeadCell>
                <Table.HeadCell className="text-base font-semibold py-3">
                  Date
                </Table.HeadCell>
                <Table.HeadCell className="text-base font-semibold py-3"></Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y divide-border dark:divide-darkborder ">
                {basicTable4.basicTableData4.map((item, index) => (
                  <Table.Row key={index}>
                    <Table.Cell className="whitespace-nowrap">
                      <h6 className="text-sm">PO1-006792</h6>
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap">
                      <Badge
                        color={`light${item.statuscolor}`}
                        className="capitalize "
                        icon={() => (
                          <item.statusicon size={15} className="me-1" />
                        )}
                      >
                        {item.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap">
                      11/29/2024
                    </Table.Cell>


                    <Table.Cell className="whitespace-nowrap">
                      <Dropdown
                        label=""
                        dismissOnClick={false}
                        renderTrigger={() => (
                          <span className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-lightprimary hover:text-primary cursor-pointer">
                            <IconDotsVertical size={22} />
                          </span>
                        )}
                      >
                        {tableActionData.map((items, index1) => (
                          <Dropdown.Item key={index1} className="flex gap-3" onClick={() => handleActionButton("PO1-006792", items.id)}>
                            <Icon icon={`${items.icon}`} height={18} />
                            <span>{items.listtitle}</span>
                          </Dropdown.Item>
                        ))}
                      </Dropdown>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </div>
      </TitleCard>
    </>
  );
};

export default index;
