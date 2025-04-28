import React, { useState } from "react";
import { Alert, Button, Chip, Link } from "@heroui/react";

type ExpirationAlertProps = {
  expiringItems: string[];
  expiredItems: string[];
};

const ExpirationAlert = ({ expiringItems }: ExpirationAlertProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleMaybeLater = () => {
    setIsVisible(false);
  };

  const displayItems =
    expiringItems.length > 2
      ? [...expiringItems.slice(0, 2), `+${expiringItems.length - 2} more`]
      : expiringItems;

  return (
    <div className="space-y-2">
      {isVisible && expiringItems.length > 0 && (
        <Alert
          title="Expiration Alert"
          description={
            "You have items in your pantry that are about to expire."
          }
          color="danger"
          variant="faded"
          className="max-w-xl mx-auto"
        >
          <div className="flex flex-wrap gap-1 m-2">
            {displayItems.map((item, index) => (
              <Chip color="warning" variant="flat" size="sm" key={index}>
                {item}
              </Chip>
            ))}
          </div>

          <div className="flex gap-2 mt-2">
            <Button
              as={Link}
              href="/mypantry"
              size="sm"
              variant="flat"
              color="primary"
            >
              View my pantry
            </Button>
            <Button
              size="sm"
              variant="light"
              className="text-warning-500"
              onPress={handleMaybeLater}
            >
              Maybe later
            </Button>
          </div>
        </Alert>
      )}
    </div>
  );
};

export default ExpirationAlert;
