const CrossCircleIcon = ({
    width,
    height,
    className,
}: {
    width: number;
    height: number;
    className?: string;
}) => {
    return (
        <svg
            className={className}
            width={`${width}`}
            height={`${height}`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M20 20L4 4m16 0L4 20" />
        </svg>
    );
};

export { CrossCircleIcon };