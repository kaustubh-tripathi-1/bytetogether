import KeyboardIcon from '../../assets/icons/keyboard.svg?react';

/**
 * Keyboard Icon component for opening keyboard shortcuts modal.
 * @param {Object} props - SVG props (e.g., width, height, color).
 * @param {Object} props.width - Width of the svg.
 * @param {Object} props.height - Height of the svg.
 * @param {Object} props.className - CSS className for the svg.
 * @returns {JSX.Element} The Keyboard icon.
 */
export default function Keyboard({
    width = 1.5,
    height = 1.5,
    className = ``,
    ...props
}) {
    return (
        <KeyboardIcon
            width={`${width}rem`}
            height={`${height}rem`}
            className={className}
            {...props}
        />
    );
}
