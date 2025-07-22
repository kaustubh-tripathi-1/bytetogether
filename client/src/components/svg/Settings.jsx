import SettingsIcon from '../../assets/icons/settings.svg?react';

/**
 * Settings Icon component for opening settings modal.
 * @param {Object} props - SVG props (e.g., width, height).
 * @param {Object} props.width - Width of the svg.
 * @param {Object} props.height - Height of the svg.
 * @param {Object} props.className - CSS className for the svg.
 * @returns {JSX.Element} The Settings icon.
 */
export default function Settings({
    width = 1.5,
    height = 1.5,
    className = ``,
    ...props
}) {
    return (
        <SettingsIcon
            width={`${width}rem`}
            height={`${height}rem`}
            className={className}
            {...props}
        />
    );
}
