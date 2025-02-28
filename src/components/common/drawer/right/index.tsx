import {
  Drawer,
  DrawerContent,
  DrawerBody,
  useDisclosure,
} from "@heroui/react";

import styles from "./index.module.scss";

interface DrawerRightProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children: React.ReactNode;
}
const DrawerRight: React.FC<DrawerRightProps> = ({
  isOpen,
  onOpenChange,
  children,
}) => {
  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      classNames={{
        base: styles["drawer1-base"],
        wrapper: styles["drawer1-wrapper"],
        backdrop: styles["drawer1-backdrop"],
        header: styles["drawer1-header"],
        body: styles["drawer1-body"],
        footer: styles["drawer1-footer"],
        closeButton: styles["drawer1-close-button"],
      }}
    >
      <DrawerContent>
        {(onClose) => (
          <>
            <DrawerBody>{children}</DrawerBody>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerRight;
