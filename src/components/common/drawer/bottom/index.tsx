import {
  Drawer,
  DrawerContent,
  DrawerBody,
  useDisclosure,
} from "@heroui/react";

import styles from "./index.module.scss";
import { useEffect } from "react";

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
  // useEffect(() => {
  //   const handleFocus = (event: any) => {
  //     if (event.target.tagName === "INPUT") {
  //       document.body.style.position = "fixed";
  //       document.body.style.top = `-${window.scrollY}px`;
  //     }
  //   };

  //   const handleBlur = () => {
  //     const scrollY = document.body.style.top;
  //     document.body.style.position = "";
  //     document.body.style.top = "";
  //     window.scrollTo(0, parseInt(scrollY || "0") * -1);
  //   };

  //   if (isOpen) {
  //     window.addEventListener("focusin", handleFocus);
  //     window.addEventListener("focusout", handleBlur);
  //   }

  //   return () => {
  //     window.removeEventListener("focusin", handleFocus);
  //     window.removeEventListener("focusout", handleBlur);
  //   };
  // }, [isOpen]);
  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={true}
      isKeyboardDismissDisabled={true}
      hideCloseButton
      placement="bottom"
      size="lg"
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
