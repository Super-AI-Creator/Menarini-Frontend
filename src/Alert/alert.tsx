import { Alert } from "flowbite-react";
import { Icon } from "@iconify/react";

export function AlertComponent(props: any) {
  return (
    <>
      {props.alert && (
        <div>
          <Alert
            color={props.color}
            rounded
            className="fixed mx-auto start-0 end-0 top-3 w-fit z-50"
            icon={() => (
              <Icon
                icon="solar:archive-minimalistic-broken"
                className="text-white"
                height={22}
              />
            )}
          >
            <span className="ms-2 font-medium">{props.message}</span>
          </Alert>
        </div>
      )}
    </>
  );
}
