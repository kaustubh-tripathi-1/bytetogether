import SaveAllIcon from '../../assets/icons/save-all.svg?react';

/**
 * SaveAll Icon component for saving all files to DB.
 * @param {Object} props - SVG props (e.g., width, height, color).
 * @param {Object} props.width - Width of the svg.
 * @param {Object} props.height - Height of the svg.
 * @param {Object} props.className - CSS className for the svg.
 * @returns {JSX.Element} The SaveAll icon.
 */
export default function SaveAll({
    width = 1.5,
    height = 1.5,
    className = ``,
    ...props
}) {
    return (
        <SaveAllIcon
            width={`${width}rem`}
            height={`${height}rem`}
            className={className}
            {...props}
        />
    );
}
