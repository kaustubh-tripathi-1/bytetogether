import './BounceLoader.css';

export default function BounceLoader({ className = '' }) {
    return (
        <div className={`relative z-1 h-15 w-30 ${className}`}>
            <div className="circle absolute h-5 w-5 rounded-full bg-blue-500 dark:bg-blue-900"></div>
            <div className="circle absolute h-5 w-5 rounded-full bg-blue-500 dark:bg-blue-900"></div>
            <div className="circle absolute h-5 w-5 rounded-full bg-blue-500 dark:bg-blue-900"></div>
            <div className="absolute h-1 w-5 rounded-full bg-gray-600 shadow dark:bg-black/90"></div>
            <div className="absolute h-1 w-5 rounded-full bg-gray-600 shadow dark:bg-black/90"></div>
            <div className="absolute h-1 w-5 rounded-full bg-gray-600 shadow dark:bg-black/90"></div>
        </div>
    );
}
