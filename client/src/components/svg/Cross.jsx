import CrossIcon from '../../assets/icons/cross-circle-solid.svg?react';

/**
 * Cross Icon component for closing actions.
 * @param {Object} props - SVG props (e.g., width, height).
 * @param {Object} props.width - Width of the svg.
 * @param {Object} props.height - Height of the svg.
 * @param {Object} props.className - CSS className for the svg.
 * @returns {JSX.Element} The Cross icon.
 */
export default function Cross({
    width = 1.5,
    height = 1.5,
    className = ``,
    ...props
}) {
    return (
        <CrossIcon
            width={`${width}rem`}
            height={`${height}rem`}
            className={className}
            {...props}
        />
    );
}
