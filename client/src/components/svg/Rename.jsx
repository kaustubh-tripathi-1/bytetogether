import RenameIcon from '../../assets/icons/edit.svg?react';

/**
 * Rename Icon component for rename file action.
 * @param {Object} props - SVG props (e.g., width, height).
 * @param {Object} props.width - Width of the svg.
 * @param {Object} props.height - Height of the svg.
 * @param {Object} props.className - CSS className for the svg.
 * @returns {JSX.Element} The rename icon.
 */
export default function Rename({
    width = 1.5,
    height = 1.5,
    className = ``,
    ...props
}) {
    return (
        <RenameIcon
            width={`${width}rem`}
            height={`${height}rem`}
            className={className}
            {...props}
        />
    );
}
