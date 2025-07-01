import SaveIcon from '../../assets/icons/save.svg?react';

/**
 * SaveIcon component for saving a file to DB.
 * @param {Object} props - SVG props (e.g., width, height, color).
 * @param {Object} props.width - Width of the svg.
 * @param {Object} props.height - Height of the svg.
 * @param {Object} props.className - CSS className for the svg.
 * @returns {JSX.Element} The Save icon.
 */
export default function Save({
    width = 1.5,
    height = 1.5,
    className = ``,
    ...props
}) {
    return (
        <SaveIcon
            width={`${width}rem`}
            height={`${height}rem`}
            className={className}
            {...props}
        />
    );
}
