import React, { useState } from "react";
import styled from "@emotion/styled";

const StyledLabel = styled.label`
  display: flex;
  align-items: center;
  padding: 0 24px;
  // gap: 4px;
  user-select: none;
  height: 100%;
  cursor: pointer;
`;
// 使用styled组件创建Toggle容器
const ToggleContainer = styled.div`
  display: inline-block;
  position: relative;
  cursor: pointer;
`;

// 隐藏的checkbox输入
const HiddenCheckbox = styled.input`
  position: absolute;
  opacity: 0;
  height: 0;
  width: 0;
`;

interface Props {
  onChange?: (checked: boolean) => void;
  checked?: boolean;
  label?: string;
  children?: React.ReactNode;
}
const ToggleButton = ({ onChange, checked = false, children }: Props) => {
  const handleChange = () => {
    const newState = !checked;
    if (onChange) {
      onChange(newState);
    }
  };

  return (
    <StyledLabel>
      <ToggleContainer onClick={handleChange}>
        <HiddenCheckbox
          type="checkbox"
          checked={checked}
          onChange={handleChange}
        />
      </ToggleContainer>
      {children}
    </StyledLabel>
  );
};

export default ToggleButton;
