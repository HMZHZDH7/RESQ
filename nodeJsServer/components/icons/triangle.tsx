const TriangleIcon = ({
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
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g clipPath="url(#clip0_683_115)">
                <path d="M8.98201 1.56595C8.88302 1.39352 8.74028 1.25025 8.56821 1.15062C8.39615 1.051 8.20084 0.998535 8.00201 0.998535C7.80318 0.998535 7.60787 1.051 7.4358 1.15062C7.26373 1.25025 7.121 1.39352 7.02201 1.56595L0.165007 13.233C-0.291993 14.011 0.256007 15 1.14501 15H14.858C15.747 15 16.296 14.01 15.838 13.233L8.98201 1.56595ZM8.00001 4.99995C8.53501 4.99995 8.95401 5.46195 8.90001 5.99495L8.55001 9.50195C8.53825 9.63972 8.47521 9.76806 8.37336 9.86159C8.27152 9.95511 8.13828 10.007 8.00001 10.007C7.86173 10.007 7.7285 9.95511 7.62665 9.86159C7.5248 9.76806 7.46177 9.63972 7.45001 9.50195L7.10001 5.99495C7.08744 5.86919 7.10135 5.74218 7.14085 5.62212C7.18035 5.50206 7.24456 5.3916 7.32935 5.29786C7.41414 5.20413 7.51762 5.12919 7.63313 5.07788C7.74864 5.02657 7.87361 5.00002 8.00001 4.99995ZM8.00201 11C8.26722 11 8.52158 11.1053 8.70911 11.2928C8.89665 11.4804 9.00201 11.7347 9.00201 12C9.00201 12.2652 8.89665 12.5195 8.70911 12.7071C8.52158 12.8946 8.26722 13 8.00201 13C7.73679 13 7.48244 12.8946 7.2949 12.7071C7.10736 12.5195 7.00201 12.2652 7.00201 12C7.00201 11.7347 7.10736 11.4804 7.2949 11.2928C7.48244 11.1053 7.73679 11 8.00201 11Z" fill="#58151C" />
            </g>
            <defs>
                <clipPath id="clip0_683_115">
                    <rect width="16" height="16" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
};

export default TriangleIcon;