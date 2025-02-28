import { Input, InputProps } from "@heroui/react";
import styles from "./index.module.scss";
import { FC } from "react";

type CommonInputProps = InputProps;
const CommonInput: FC<CommonInputProps> = (props) => {
  return (
    <Input
      classNames={{
        base: styles["input-base"],
        label: styles["input-label"],
        mainWrapper: styles["input-main-wrapper"],
        inputWrapper: styles["input-wrapper"],
        innerWrapper: styles["input-inner-wrapper"],
        input: styles["input"],
        clearButton: styles["input-clear-button"],
        helperWrapper: styles["input-helper-wrapper"],
      }}
      {...props}
    />
  );
};

export default CommonInput;
