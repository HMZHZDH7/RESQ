import { forwardRef } from "react";


const Img = forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
    ({ src, ...props }, ref) => {
        return (
            <img
                ref={ref}
                src={process.env.NEXT_PUBLIC_BASE_PATH ? `${process.env.NEXT_PUBLIC_BASE_PATH.toLocaleLowerCase()}${src}` : src}
                {...props}
            />
        );
    }
);
Img.displayName = "Img";

export { Img };
