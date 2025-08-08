import HamburgerIcon from '../../assets/icons/hamburger-menu.svg?react';

/**
 * Hamburger Icon component for hamburger menu.
 * @param {Object} props - SVG props (e.g., width, height).
 * @param {Object} props.width - Width of the svg.
 * @param {Object} props.height - Height of the svg.
 * @param {Object} props.className - CSS className for the svg.
 * @returns {JSX.Element} The Hamburger icon.
 */
export default function Hamburger({
    width = 1.5,
    height = 1.5,
    className = ``,
    ...props
}) {
    return (
        <HamburgerIcon
            width={`${width}rem`}
            height={`${height}rem`}
            className={className}
            {...props}
        />
    );
}
