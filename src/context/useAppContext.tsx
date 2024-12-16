import { useState } from "react";
import constate from "constate";

function useAppState() {
  const [count, setCount] = useState(0);

  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);

  return { count, increment, decrement };
}

export const [AppProvider, useAppContext] = constate(useAppState);
