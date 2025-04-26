
import { CustomizerContext } from "src/context/CustomizerContext";
import { Card, TextInput, Datepicker } from "flowbite-react";
import { useContext } from "react";
import React from "react";
import { Icon } from "@iconify/react";
interface TitleCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: string;
  onDownload?: () => void;
}

const TitleCard: React.FC<TitleCardProps> = ({
  children,
  className,
  title,
}) => {
  const { isCardShadow, isBorderRadius } =
    useContext(CustomizerContext);

  return (
    <Card
      className={`card ${className} ${isCardShadow
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
            <p className="text-black">
              From
            </p>
            {/* <Datepicker
              className="form-control"
              dateFormat="MM/dd/yy"
            /> */}
            <input type="date" className="rounded-sm border-1 border-gray-300" />
          </div>
          <div className="ml-4">
            <p className="text-black">
              To
            </p>
            {/* <Datepicker
              className="form-control"
              dateFormat="MM/dd/yy"
            /> */}
            <input type="date" className="rounded-sm border-1 border-gray-300" />
          </div>
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
      </div>
      <div className="pt-4 p-6">{children}</div>
    </Card>
  );
};

export default TitleCard;
