import {
  Drawer,
  DrawerContent,
  DrawerBody,
  useDisclosure,
} from "@heroui/react";

import styles from "./index.module.scss";

interface DrawerBottomProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children: React.ReactNode;
}
const DrawerBottom: React.FC<DrawerBottomProps> = ({
  isOpen,
  onOpenChange,
  children,
}) => {
  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={true}
      isKeyboardDismissDisabled={true}
      hideCloseButton
      placement="bottom"
      classNames={{
        base: styles["drawer-base"],
        wrapper: styles["drawer-wrapper"],
        backdrop: styles["drawer-backdrop"],
        header: styles["drawer-header"],
        body: styles["drawer-body"],
        footer: styles["drawer-footer"],
        closeButton: styles["drawer-close-button"],
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

export default DrawerBottom;
