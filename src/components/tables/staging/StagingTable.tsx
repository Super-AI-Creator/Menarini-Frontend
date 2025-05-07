import { Table } from "flowbite-react";
import { useState, useEffect } from "react";
import { Alert, Button, TextInput } from "flowbite-react";
import { AlertComponent } from 'src/Alert/alert';
import CardBox from "src/components/shared/CardBox";

const StagingTable = (props) => {
  const { 
    stagingData = [], 
    dnData = [], 
    invData = [], 
    coaData = [], 
    bolData = [],
    onUpdate,
    onGetChanges
  } = props;
  
  const [alertState, setAlertState] = useState(false);
  const [alertColor, setAlertColor] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [changes, setChanges] = useState({});
  const [showCurrentStaging, setShowCurrentStaging] = useState(false);

  // Initialize local states with props
  const [localStaging, setLocalStaging] = useState(stagingData);
  const [localDn, setLocalDn] = useState(dnData);
  const [localInv, setLocalInv] = useState(invData);
  const [localCoa, setLocalCoa] = useState(coaData);
  const [localBol, setLocalBol] = useState(bolData);

  // Update local state when props change
  useEffect(() => {
    setLocalStaging([...stagingData]);
    setLocalDn([...dnData]);
    setLocalInv([...invData]);
    setLocalCoa([...coaData]);
    setLocalBol([...bolData]);
  }, [stagingData, dnData, invData, coaData, bolData]);

  // Define editable fields for each source
  const editableFields = {
    dn: ['Batch#', 'Item Description', 'Manufacturing Date', 'Expiry Date','Packing Slip#','Document Date'],
    inv: ['Batch#', 'Item Description', 'Manufacturing Date', 'Expiry Date','Packing Slip#','Document Date','INV NO#'],
    coa: ['Manufacturing Date', 'Expiry Date'],
    bol: []
  };

  // Define the fields to display in order
  const fields = [
    { key: 'Data Area Id', label: 'Data Area Id' },
    { key: 'PO Number', label: 'PO Number' },
    { key: 'PO Line Number', label: 'PO Line Number' },
    { key: 'Item Code', label: 'Item Code', dnKey: 'Customer Part Code', invKey: 'Customer Part Code'},
    { key: 'Item Name', label: 'Item Name', dnKey: 'Item Description', invKey: 'Item Description' },
    { key: 'Open PO Quantity', label: 'Open PO Quantity' },
    { key: 'Unit Price', label: 'Unit Price' },
    { key: 'Packing Slip No', label: 'Packing Slip No', dnKey: 'Packing Slip#', invKey: 'Packing Slip#' },
    { key: 'Invoice No', label: 'Invoice No', invKey: 'INV NO#' },
    { key: 'Posting Date', label: 'Posting Date' },
    { key: 'Shipped Quantity', label: 'Shipped Quantity', dnKey: 'Quantity', invKey: 'Quantity' },
    { key: 'Batch Number', label: 'Batch Number', dnKey: 'Batch#', invKey: 'Batch#' },
    { key: 'Manufacturing Date', label: 'Manufacturing Date', dnKey: 'Manufacturing Date', invKey: 'Manufacturing Date' },
    { key: 'Expiry Date', label: 'Expiry Date', dnKey: 'Expiry Date', invKey: 'Expiry Date' },
    { key: 'Vendor Code', label: 'Vendor Code' },
    { key: 'Vendor Name', label: 'Vendor Name' },
    { key: 'No of Item code in PO', label: 'No of Item code in PO' },
    { key: 'Incoterm', label: 'Incoterm', dnKey: 'Incoterms', invKey: 'Incoterms', bolKey: 'Incoterms' },
    { key: 'Document Date', label: 'Document Date', dnKey: 'Document Date', invKey: 'Document Date' },
    { key: 'Prepared By', label: 'Prepared By' },
  ];

  // Helper to get item or first item if index is beyond array length
  const getItem = (array, index) => {
    return array[Math.min(index, array.length - 1)] || {};
  };

  const startEditing = (itemIndex, fieldKey, source, currentValue) => {
    setEditing({ itemIndex, field: fieldKey, source });
    setEditValue(currentValue);
  };

  const cancelEditing = () => {
    setEditing(null);
    setEditValue('');
  };

  const saveEdit = async () => {
    if (!editing) return;

    try {
      const { itemIndex, field: fieldKey, source } = editing;
      const newValue = editValue;

      // Update local state immediately
      switch(source) {
        case 'dn':
          setLocalDn(prev => {
            const newData = [...prev];
            const updateIndex = Math.min(itemIndex, newData.length - 1);
            newData[updateIndex] = { ...newData[updateIndex], [fieldKey]: newValue };
            return newData;
          });
          break;
        case 'inv':
          setLocalInv(prev => {
            const newData = [...prev];
            const updateIndex = Math.min(itemIndex, newData.length - 1);
            newData[updateIndex] = { ...newData[updateIndex], [fieldKey]: newValue };
            return newData;
          });
          break;
        case 'coa':
          setLocalCoa(prev => {
            const newData = [...prev];
            const updateIndex = Math.min(itemIndex, newData.length - 1);
            newData[updateIndex] = { ...newData[updateIndex], [fieldKey]: newValue };
            return newData;
          });
          break;
        case 'bol':
          setLocalBol(prev => {
            const newData = [...prev];
            const updateIndex = Math.min(itemIndex, newData.length - 1);
            newData[updateIndex] = { ...newData[updateIndex], [fieldKey]: newValue };
            return newData;
          });
          break;
      }

      // Track changes with ID
      setChanges(prev => {
        const sourceChanges = prev[source] || {};
        const actualIndex = Math.min(itemIndex, source === 'dn' ? localDn.length - 1 : 
                                      source === 'inv' ? localInv.length - 1 :
                                      source === 'coa' ? localCoa.length - 1 : 
                                      localBol.length - 1);
        const itemChanges = sourceChanges[actualIndex] || { id: getRecordId(source, actualIndex) };
        
        return {
          ...prev,
          [source]: {
            ...sourceChanges,
            [actualIndex]: {
              ...itemChanges,
              [fieldKey]: newValue
            }
          }
        };
      });

      setAlertState(true);
      setAlertColor('success');
      setAlertMessage('Update successful!');
      setEditing(null);
      setEditValue('');

      setTimeout(() => setAlertState(false), 3000);
    } catch (error) {
      setAlertState(true);
      setAlertColor('failure');
      setAlertMessage('Update failed!');
      console.error('Update error:', error);
    }
  };

  const getRecordId = (source, itemIndex) => {
    const actualIndex = Math.min(itemIndex, 
      source === 'dn' ? localDn.length - 1 : 
      source === 'inv' ? localInv.length - 1 :
      source === 'coa' ? localCoa.length - 1 : 
      localBol.length - 1);
    
    switch(source) {
      case 'dn': return localDn[actualIndex]?.id;
      case 'inv': return localInv[actualIndex]?.id;
      case 'coa': return localCoa[actualIndex]?.id;
      case 'bol': return localBol[actualIndex]?.id;
      default: return null;
    }
  };

  const handleValueClick = (itemIndex, field, source, value) => {
    if (!value) return;
    
    const stagingFieldMap = {
      'Batch#': 'Batch Number',
      'Quantity': 'Shipped Quantity',
      'Manufacturing Date': 'Manufacturing Date',
      'Expiry Date': 'Expiry Date',
      'Incoterms': 'Incoterm',
      'Item Description': 'Item Name',
      'Customer Part Code': 'Item Code',
      'Packing Slip#': 'Packing Slip No',
      'INV NO#': 'Invoice No'
    };
    
    const stagingField = stagingFieldMap[field];
    if (stagingField) {
      setLocalStaging(prev => {
        const newData = [...prev];
        newData[itemIndex] = { ...newData[itemIndex], [stagingField]: value };
        return newData;
      });
      
      setAlertState(true);
      setAlertColor('info');
      setAlertMessage(`Staging ${stagingField} updated from ${source}`);
      setTimeout(() => setAlertState(false), 3000);
    }
  };

  const handleShowCurrentStaging = () => {
    setShowCurrentStaging(!showCurrentStaging);
    setAlertState(true);
    setAlertColor('info');
    setAlertMessage(showCurrentStaging ? 'Hiding staging data' : 'Showing current staging data');
    setTimeout(() => setAlertState(false), 3000);
  };

  const handleGetChanges = () => {
    if (onGetChanges) {
      // Filter out empty changes
      const nonEmptyChanges = Object.fromEntries(
        Object.entries(changes)
          .filter(([_, items]) => Object.keys(items).length > 0)
          .map(([source, items]) => [
            source,
            Object.fromEntries(
              Object.entries(items)
                .filter(([_, changes]) => Object.keys(changes).length > 1) // More than just ID
            )
          ])
      );
      
      onGetChanges(nonEmptyChanges);
      setAlertState(true);
      setAlertColor('info');
      setAlertMessage('Changes collected!');
      setTimeout(() => setAlertState(false), 3000);
    }
  };

  const renderCell = (itemIndex, source, field, currentValue) => {
    const sourceKey = field[`${source}Key`] || field.key;
    const isEditable = editableFields[source]?.includes(sourceKey);
    const isEditing = editing?.itemIndex === itemIndex && 
                     editing?.field === sourceKey && 
                     editing?.source === source;
    
    if (isEditable && isEditing) {
      return (
        <div className="flex items-center gap-2">
          <TextInput 
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-32"
          />
          <Button size="xs" onClick={saveEdit}>Save</Button>
          <Button size="xs" color="gray" onClick={cancelEditing}>Cancel</Button>
        </div>
      );
    }

    return (
      <div 
        className={`flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded`}
        onClick={() => {
          handleValueClick(itemIndex, sourceKey, source, currentValue);
        }}
      >
        <span>{currentValue || ''}</span>
        {isEditable && (
          <Button 
            size="xs" 
            onClick={(e) => {
              e.stopPropagation();
              startEditing(itemIndex, sourceKey, source, currentValue);
            }}
          >
            Edit
          </Button>
        )}
      </div>
    );
  };

  return (
    <div>
      <CardBox>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-lg font-semibold">Quantity Table</h4>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleShowCurrentStaging}>
              {showCurrentStaging ? 'Hide Staging' : 'Upload Staging'}
            </Button>
            <Button size="sm" onClick={handleGetChanges}>
              Update Field
            </Button>
          </div>
        </div>
        {showCurrentStaging && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium mb-2">Current Staging Data</h5>
            <pre className="text-xs bg-white p-2 rounded overflow-auto">
              {JSON.stringify(localStaging, null, 2)}
            </pre>
          </div>
        )}
        <div className="text-sm text-gray-500 mb-2">
          Click on values to update Staging data. Edit buttons appear for editable fields.
        </div>
        <div className="overflow-x-auto">
          <Table>
            <Table.Head>
              <Table.HeadCell>Field</Table.HeadCell>
              <Table.HeadCell>Staging</Table.HeadCell>
              <Table.HeadCell>DN</Table.HeadCell>
              <Table.HeadCell>INV</Table.HeadCell>
              <Table.HeadCell>COA</Table.HeadCell>
              <Table.HeadCell>BOL</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {localStaging.map((stagingItem, index) => (
                <>
                  <Table.Row key={`header-${index}`} className="bg-gray-50">
                    <Table.Cell colSpan={6} className="font-bold">
                      COA{index + 1}
                    </Table.Cell>
                  </Table.Row>
                  {fields.map((field) => (
                    <Table.Row key={`${index}-${field.key}`}>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900">
                        {field.label}
                      </Table.Cell>
                      <Table.Cell>{stagingItem[field.key] || ''}</Table.Cell>
                      <Table.Cell>
                        {renderCell(index, 'dn', field, getItem(localDn, index)[field.dnKey || field.key])}
                      </Table.Cell>
                      <Table.Cell>
                        {renderCell(index, 'inv', field, getItem(localInv, index)[field.invKey || field.key])}
                      </Table.Cell>
                      <Table.Cell>
                        {renderCell(index, 'coa', field, getItem(localCoa, index)[field.coaKey || field.key])}
                      </Table.Cell>
                      <Table.Cell>
                        {renderCell(index, 'bol', field, getItem(localBol, index)[field.bolKey || field.key])}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </>
              ))}
            </Table.Body>
          </Table>
        </div>
      </CardBox>
      <AlertComponent alert={alertState} message={alertMessage} color={alertColor} />
    </div>
  );
};

export default StagingTable;