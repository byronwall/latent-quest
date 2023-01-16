import React, { forwardRef } from "react";

type ButtonProps = React.HTMLProps<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => (
    <button
      ref={ref}
      {...props}
      className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
      type="button"
    >
      {props.children}
    </button>
  )
);

Button.displayName = "Button";
