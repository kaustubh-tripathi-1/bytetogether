import { motion } from 'framer-motion';

export default function AuthLayout({ children }) {
    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-blue-400 via-indigo-300 to-teal-400 p-4 dark:from-black dark:via-sky-900 dark:to-indigo-900"
        >
            {children}
        </motion.main>
    );
}
