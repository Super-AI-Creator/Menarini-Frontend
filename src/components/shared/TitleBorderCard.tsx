// TitleBorderCard.tsx
import { CustomizerContext } from "src/context/CustomizerContext";
import { Card, TextInput } from "flowbite-react";
import { useContext } from "react";
import React from "react";
import { Icon } from "@iconify/react";

interface TitleCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: string;
  onSearch?: (searchTerm: string) => void;
  onDateChange?: (fromDate: string, toDate: string) => void;
}

const TitleCard: React.FC<TitleCardProps> = ({
  children,
  className,
  title,
  onSearch,
  onDateChange,
}) => {
  const { isCardShadow, isBorderRadius } = useContext(CustomizerContext);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleDateChange = (type: 'from' | 'to', value: string) => {
    if (type === 'from') {
      setFromDate(value);
      if (!value && toDate) {
        // If clearing from date, also clear the filter
        onDateChange?.('', '');
      }
    } else {
      setToDate(value);
      if (!value && fromDate) {
        // If clearing to date, also clear the filter
        onDateChange?.('', '');
      }
    }
    
    // Only trigger date change when both dates are set
    if (fromDate && toDate && value) {
      onDateChange?.(fromDate, toDate);
    }
  };

  return (
    <Card
      className={`card ${className} ${
        isCardShadow
          ? "dark:shadow-dark-md shadow-md p-0"
          : "shadow-none border border-ld p-0"
      }`}
      style={{
        borderRadius: `${isBorderRadius}px`,
        backgroundColor: "transparent"
      }}
    >
      <div className="flex justify-between items-center border-b border-ld px-6 py-4">
        <h5 className="text-xl font-semibold">{title}</h5>
        <div className="flex">
          <div>
            <p className="text-black">From</p>
            <input 
              type="date" 
              className="rounded-sm border-1 border-gray-300" 
              onChange={(e) => handleDateChange('from', e.target.value)}
              value={fromDate}
            />
          </div>
          <div className="ml-4">
            <p className="text-black">To</p>
            <input 
              type="date" 
              className="rounded-sm border-1 border-gray-300" 
              onChange={(e) => handleDateChange('to', e.target.value)}
              value={toDate}
            />
          </div>
          <div className="flex items-end pl-4">
            <TextInput
              id="search"
              placeholder="Search DNs..."
              className="form-control w-full bg-white"
              sizing="md"
              value={searchTerm}
              onChange={handleSearch}
              icon={() => (
                <Icon icon="solar:magnifer-line-duotone" height={18} />
              )}
            />
          </div>
        </div>
      </div>
      <div className="pt-4 p-6">{children}</div>
    </Card>
  );
};

export default TitleCard;