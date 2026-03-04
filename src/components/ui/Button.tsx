import * as React from "react"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', isLoading = false, children, disabled, ...props }, ref) => {

        let variantStyles = ''
        switch (variant) {
            case 'primary':
                variantStyles = 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                break
            case 'secondary':
                variantStyles = 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                break
            case 'danger':
                variantStyles = 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                break
            case 'ghost':
                variantStyles = 'bg-transparent text-zinc-700 hover:bg-zinc-100'
                break
        }

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none data-[state=open]:bg-zinc-100 h-10 py-2 px-4 ${variantStyles} ${className || ''}`}
                {...props}
            >
                {isLoading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {children}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
