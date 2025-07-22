import FormatIcon from '../../assets/icons/format.svg?react';

/**
 * Format Icon component for code formatting action.
 * @param {Object} props - SVG props (e.g., width, height).
 * @param {Object} props.width - Width of the svg.
 * @param {Object} props.height - Height of the svg.
 * @param {Object} props.className - CSS className for the svg.
 * @returns {JSX.Element} The format icon.
 */
export default function Format({
    width = 1.5,
    height = 1.5,
    className = ``,
    ...props
}) {
    return (
        <FormatIcon
            width={`${width}rem`}
            height={`${height}rem`}
            className={className}
            {...props}
        />
    );
}
