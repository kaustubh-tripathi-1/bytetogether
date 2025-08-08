import AddFileIcon from '../../assets/icons/add-file.svg?react';

/**
 * AddFile Icon component for creating file action.
 * @param {Object} props - SVG props (e.g., width, height).
 * @param {Object} props.width - Width of the svg.
 * @param {Object} props.height - Height of the svg.
 * @param {Object} props.className - CSS className for the svg.
 * @returns {JSX.Element} The AddFile icon.
 */
export default function AddFile({
    width = 1.5,
    height = 1.5,
    className = ``,
    ...props
}) {
    return (
        <AddFileIcon
            width={`${width}rem`}
            height={`${height}rem`}
            className={className}
            {...props}
        />
    );
}
