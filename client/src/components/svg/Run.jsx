import RunIcon from '../../assets/icons/run.svg?react';

/**
 * Run Icon component for running code action.
 * @param {Object} props - SVG props (e.g., width, height).
 * @param {Object} props.width - Width of the svg.
 * @param {Object} props.height - Height of the svg.
 * @param {Object} props.className - CSS className for the svg.
 * @returns {JSX.Element} The Run icon.
 */
export default function Run({
    width = 1.5,
    height = 1.5,
    className = ``,
    ...props
}) {
    return (
        <RunIcon
            width={`${width}rem`}
            height={`${height}rem`}
            className={className}
            {...props}
        />
    );
}
