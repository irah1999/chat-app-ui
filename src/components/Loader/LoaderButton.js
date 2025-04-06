import React from "react";

const LoaderButton = ({ isLoading, text, loadingText, ...props }) => {
    return (
        <button 
            className="w-full bg-blue-950 text-white py-2 rounded hover:bg-primary-dark flex items-center justify-center disabled:opacity-50"
            type="submit"
            disabled={isLoading} 
            {...props} // Spread additional props (like onClick)
        >
            {isLoading ? (
                <>
                    <span className="loader"></span> {loadingText || "Processing..."}
                </>
            ) : (
                text
            )}
        </button>
    );
};

export default LoaderButton;
