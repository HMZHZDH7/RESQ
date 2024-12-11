const SelectArrowIcon = ({
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
            viewBox="0 0 8 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M7.66669 1.00001H0.333354L4.00002 7.33334" fill="#A0AEC0" />
        </svg>
    );
};

export default SelectArrowIcon;