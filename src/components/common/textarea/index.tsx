import { Textarea, TextAreaProps } from "@heroui/react";
import styles from "./index.module.scss";
import { FC } from "react";

type CommonTextareaProps = TextAreaProps;
const CommonTextarea: FC<CommonTextareaProps> = (props) => {
  return (
    <Textarea
      classNames={{
        base: styles["textarea-base"],
        label: styles["textarea-label"],
        mainWrapper: styles["textarea-main-wrapper"],
        inputWrapper: styles["textarea-input-wrapper"],
        innerWrapper: styles["textarea-inner-wrapper"],
        input: styles["textarea-input"],
        clearButton: styles["textarea-clear-button"],
      }}
      {...props}
    />
  );
};

export default CommonTextarea;
