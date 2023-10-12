import clsx from "clsx";
import { ComponentPropsWithRef, ReactNode, forwardRef } from "react";

export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  variant?: "solid" | "outline" | "ghost" | "link";
  /**
   * Used for buttons which initiate an asynchronous action
   * This can set a loading state and set the button to be busy
   */
  isLoading?: boolean;
  /**
   * When `isLoading` is true, this will be the content within the button
   */
  loadingText?: ReactNode;
  /**
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      isLoading = false,
      loadingText,
      variant,
      "aria-busy": ariaBusy,
      disabled,
      children,
      className,
      size = "md",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        {...props}
        disabled={isLoading || disabled}
        aria-busy={isLoading || ariaBusy}
        className={clsx(
          className,
          "rounded",
          "transition-all",
          "text-white",
          "bg-cyan-500",
          "disabled:opacity-50",
          "disabled:cursor-not-allowed",
          {
            "opacity-50": isLoading,
            "px-4 py-2": size === "md",
            "px-2 py-1": size === "sm",
          },
        )}
        ref={ref}
      >
        {isLoading ? loadingText : children}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
