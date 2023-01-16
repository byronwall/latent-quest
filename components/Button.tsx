import React, { forwardRef } from "react";

type ButtonProps = React.HTMLProps<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => (
    <button
      ref={ref}
      {...props}
      className="inline-block rounded bg-blue-600 px-2 py-2  font-semibold    text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
      type="button"
    >
      {props.children}
    </button>
  )
);

Button.displayName = "Button";
