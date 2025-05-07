import { Badge, Table, Dropdown, Pagination, TextInput } from "flowbite-react";
import { IconDotsVertical, IconArrowUp, IconArrowDown } from "@tabler/icons-react";
import { Icon } from "@iconify/react";
import TitleCard from "src/components/shared/TitleBorderCard.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import axios from "../../../utils/axios";
import { AlertComponent } from 'src/Alert/alert';
import { parseCustomDate, formatDateForInput } from 'src/utils/dateUtils';

const Index = () => {
  const navigate = useNavigate();
  const { dn } = useParams<{ dn: string }>();
  const [poData, setPOData] = useState([]);
  const [alertState, setAlertState] = useState(false);
  const [alertColor, setAlertColor] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({
    from: "",
    to: ""
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ 
    key: string; 
    direction: 'ascending' | 'descending' 
  }>({ 
    key: 'date', 
    direction: 'descending' 
  });

  const tableActionData = [
    {
      id: 1,
      icon: "tabler:plus",
      listtitle: "View Quantity",
    },
    {
      id: 2,
      icon: "tabler:edit",
      listtitle: "OCR Viewer",
    },
  ];

  // Sorting function
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Handle date filter change
  const handleDateFilterChange = (type: 'from' | 'to', value: string) => {
    setDateFilter(prev => ({
      ...prev,
      [type]: value
    }));
  };

  // Get sorted and filtered data
  const sortedData = useMemo(() => {
    if (!poData.length) return [];
    
    let filteredItems = [...poData];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        String(item["PO#"]).toLowerCase().includes(term) ||
        String(item["supplier_name"]).toLowerCase().includes(term) ||
        String(item["status"]).toLowerCase().includes(term)
      );
    }
    
    // Apply date filter
    if (dateFilter.from || dateFilter.to) {
      filteredItems = filteredItems.filter(item => {
        if (!item["date"]) return false;
        
        const itemDate = parseCustomDate(item["date"]);
        if (!itemDate) return true; // If we can't parse, include it
        
        // Normalize dates for comparison
        itemDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
        
        if (dateFilter.from) {
          const fromDate = new Date(dateFilter.from);
          fromDate.setHours(0, 0, 0, 0);
          if (itemDate < fromDate) return false;
        }
        
        if (dateFilter.to) {
          const toDate = new Date(dateFilter.to);
          toDate.setHours(23, 59, 59, 999);
          if (itemDate > toDate) return false;
        }
        
        return true;
      });
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filteredItems.sort((a, b) => {
        // Special handling for date sorting
        if (sortConfig.key === 'date') {
          const dateA = parseCustomDate(a['date'])?.getTime() || 0;
          const dateB = parseCustomDate(b['date'])?.getTime() || 0;
          return sortConfig.direction === 'ascending' 
            ? dateA - dateB 
            : dateB - dateA;
        }
        
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredItems;
  }, [poData, sortConfig, searchTerm, dateFilter]);

  // Get current items for pagination
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  // Total pages for pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleActionButton = async (po: any, document: any, type: number) => {
    if (type == 1) {
      const response = await axios.post("/api2/ax09/get_status", {"DN#": dn, "PO#": po});
      if (response.data == "") {
        navigate(`/dn-list/${dn}/${po}`);
      } else {
        setAlertState(true);
        setAlertMessage(response.data);
        setAlertColor("error");
        
        setTimeout(() => {
          setAlertState(false);
        }, 5000);
      }
    }
    if (type == 2) {
      navigate(`/ocr_viewer/${dn}/DN/${encodeURIComponent(document)}`);
    }
  };

  useEffect(() => {
    const get_basic_po_info = async () => {
      const response = await axios.post("/api2/dn/get_po_list", {"DN#": dn});
      setPOData(response.data);
    };
    get_basic_po_info();
  }, [dn]);

  return (
    <>
      <h1>{`${dn}/ PO List`}</h1>
      <br></br>
      <hr></hr>
      <br></br>
        <div className="flex justify-between mb-4">
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input
                type="date"
                className="rounded border-gray-300"
                value={dateFilter.from}
                onChange={(e) => handleDateFilterChange('from', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                type="date"
                className="rounded border-gray-300"
                value={dateFilter.to}
                onChange={(e) => handleDateFilterChange('to', e.target.value)}
              />
            </div>
          </div>
          <div className="w-64">
            <TextInput
              id="search"
              placeholder="Search PO, supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={() => <Icon icon="solar:magnifer-line-duotone" height={18} />}
            />
          </div>
        </div>

        <div className="border rounded-md border-ld overflow-hidden">
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell className="text-base font-semibold py-3">
                  PO
                </Table.HeadCell>
                <Table.HeadCell className="text-base font-semibold py-3">
                  Status
                </Table.HeadCell>
                <Table.HeadCell 
                  className="text-base font-semibold py-3 cursor-pointer"
                  onClick={() => requestSort('date')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    {sortConfig.key === 'date' && (
                      sortConfig.direction === 'ascending' ? 
                        <IconArrowUp size={16} /> : 
                        <IconArrowDown size={16} />
                    )}
                  </div>
                </Table.HeadCell>
                <Table.HeadCell 
                  className="text-base font-semibold py-3 cursor-pointer"
                  onClick={() => requestSort('supplier_name')}
                >
                  <div className="flex items-center gap-1">
                    Supplier
                    {sortConfig.key === 'supplier_name' && (
                      sortConfig.direction === 'ascending' ? 
                        <IconArrowUp size={16} /> : 
                        <IconArrowDown size={16} />
                    )}
                  </div>
                </Table.HeadCell>
                <Table.HeadCell className="text-base font-semibold py-3">
                  Actions
                </Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {currentItems.map((item, index) => (
                  <Table.Row key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {item["PO#"]}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        color={item["status"] == "Complete" ? "success" : "failure"}
                        className="capitalize"
                      >
                        {item["status"]}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      {item["date"]}
                    </Table.Cell>
                    <Table.Cell>
                      {item["supplier_name"]}
                    </Table.Cell>
                    <Table.Cell>
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
                          <Dropdown.Item 
                            key={index1} 
                            className="flex gap-3" 
                            onClick={() => handleActionButton(item["PO#"], item["document"], items.id)}
                          >
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
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, sortedData.length)}
                </span>{' '}
                of <span className="font-medium">{sortedData.length}</span> results
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                showIcons
                className="mt-4"
              />
            </div>
          )}
        </div>
      <AlertComponent alert={alertState} message={alertMessage} color={alertColor} />
    </>
  );
};

export default Index;