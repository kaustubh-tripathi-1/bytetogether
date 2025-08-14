import FilesIcon from '../../assets/icons/files.svg?react';

/**
 * Files Icon component for File Explorer.
 * @param {Object} props - SVG props (e.g., width, height).
 * @param {Object} props.width - Width of the svg.
 * @param {Object} props.height - Height of the svg.
 * @param {Object} props.className - CSS className for the svg.
 * @returns {JSX.Element} The Files icon.
 */
export default function Files({
    width = 1.5,
    height = 1.5,
    className = ``,
    ...props
}) {
    return (
        <FilesIcon
            width={`${width}rem`}
            height={`${height}rem`}
            className={className}
            {...props}
        />
    );
}
