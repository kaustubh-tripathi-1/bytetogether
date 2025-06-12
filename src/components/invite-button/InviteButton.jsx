export default function InviteButton({ projectId }) {
    async function copyInviteLink() {
        const url = `${window.location.origin}/project/${projectId}`;
        try {
            await navigator.clipboard.writeText(url);
            alert('Invite link copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    }

    return (
        <button
            onClick={copyInviteLink}
            className="rounded bg-blue-500 p-2 text-white"
            aria-label="Copy invite link"
        >
            Invite Collaborators
        </button>
    );
}
