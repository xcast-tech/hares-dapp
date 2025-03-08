import { Input, InputProps } from "@heroui/react";
import styles from "./index.module.scss";
import { FC } from "react";
import Link from "next/link";

type CommonInputProps = InputProps & {
  disabledLink?: string;
};
const CommonInput: FC<CommonInputProps> = (props) => {
  return props.disabledLink ? (
    <Link href={props.disabledLink} target="_blank">
      <Input
        classNames={{
          base: `${styles["input-base"]} ${
            props.disabled ? styles["input-base-disabled"] : ""
          }`,
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
    </Link>
  ) : (
    <Input
      classNames={{
        base: `${styles["input-base"]} ${
          props.disabled ? styles["input-base-disabled"] : ""
        }`,
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
