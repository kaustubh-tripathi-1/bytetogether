import DeleteIcon from '../../assets/icons/format.svg?react';

/**
 * Delete Icon component for delete file action.
 * @param {Object} props - SVG props (e.g., width, height).
 * @param {Object} props.width - Width of the svg.
 * @param {Object} props.height - Height of the svg.
 * @param {Object} props.className - CSS className for the svg.
 * @returns {JSX.Element} The delete icon.
 */
export default function Delete({
    width = 1.5,
    height = 1.5,
    className = ``,
    ...props
}) {
    return (
        <DeleteIcon
            width={`${width}rem`}
            height={`${height}rem`}
            className={className}
            {...props}
        />
    );
}
