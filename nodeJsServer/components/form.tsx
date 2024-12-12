import { forwardRef } from "react";


const Form = forwardRef<HTMLFormElement, React.FormHTMLAttributes<HTMLFormElement>>(
    ({ action, ...props }, ref) => {
        return (
            <form
                ref={ref}
                action={process.env.NEXT_PUBLIC_BASE_PATH ? `${process.env.NEXT_PUBLIC_BASE_PATH.toLocaleLowerCase()}${action}` : action}
                {...props}
            />
        );
    }
);
Form.displayName = "Form";

export { Form };
