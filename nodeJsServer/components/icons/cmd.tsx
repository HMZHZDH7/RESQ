const CmdIcon = ({
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
            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7.5 10l2.5 2.5L7.5 15m4.5 0h4M6 5h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2" />
        </svg>
    );
};

export default CmdIcon;