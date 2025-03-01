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

export default DrawerRight;
