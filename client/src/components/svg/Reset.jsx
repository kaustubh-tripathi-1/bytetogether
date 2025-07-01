import ResetIcon from '../../assets/icons/reset.svg?react';

/**
 * ResetIcon component for resetting the code to language default.
 * @param {Object} props - SVG props (e.g., width, height, color).
 * @param {Object} props.width - Width of the svg.
 * @param {Object} props.height - Height of the svg.
 * @param {Object} props.className - CSS className for the svg.
 * @returns {JSX.Element} The Reset icon.
 */
export default function Reset({
    width = 1.5,
    height = 1.5,
    className = ``,
    ...props
}) {
    return (
        <ResetIcon
            width={`${width}rem`}
            height={`${height}rem`}
            className={className}
            {...props}
        />
    );
}
