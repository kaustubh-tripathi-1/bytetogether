import InviteIcon from '../../assets/icons/share.svg?react';

/**
 * InviteIcon component for saving a file to DB.
 * @param {Object} props - SVG props (e.g., width, height, color).
 * @param {Object} props.width - Width of the svg.
 * @param {Object} props.height - Height of the svg.
 * @param {Object} props.className - CSS className for the svg.
 * @returns {JSX.Element} The Invite icon.
 */
export default function Invite({
    width = 1.5,
    height = 1.5,
    className = ``,
    ...props
}) {
    return (
        <InviteIcon
            width={`${width}rem`}
            height={`${height}rem`}
            className={className}
            {...props}
        />
    );
}
