import { motion } from 'framer-motion';

export default function CheckMark({ checkmarkVariants }) {
    return (
        <svg
            className="mx-auto h-16 w-16 text-green-500 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M5 13l4 4L19 7"
                variants={checkmarkVariants}
                initial="hidden"
                animate="visible"
            />
        </svg>
    );
}
