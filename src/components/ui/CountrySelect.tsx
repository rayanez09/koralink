'use client'

import { useState, useRef, useEffect } from 'react'

interface Country {
    code: string
    name: string
    currency: string
    flag?: string
}

interface CountrySelectProps {
    countries: Country[]
    value: string
    onChange: (code: string) => void
    label?: string
    disabled?: boolean
    id?: string
}

export function CountrySelect({ countries, value, onChange, label, disabled = false, id }: CountrySelectProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const ref = useRef<HTMLDivElement>(null)

    const selected = countries.find(c => c.code === value)

    const filtered = search.trim()
        ? countries.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.currency.toLowerCase().includes(search.toLowerCase())
        )
        : countries

    // Close on click outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
                setSearch('')
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const handleSelect = (code: string) => {
        onChange(code)
        setOpen(false)
        setSearch('')
    }

    return (
        <div ref={ref} className="relative" id={id}>
            {label && <p className="text-xs text-zinc-500 font-medium mb-1.5">{label}</p>}

            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !disabled && setOpen(!open)}
                disabled={disabled}
                className={`flex items-center gap-2 h-11 w-full rounded-lg border bg-white px-3 text-left transition-all
                    ${disabled
                        ? 'border-zinc-200 cursor-default bg-zinc-50'
                        : 'border-zinc-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    }
                    ${open ? 'border-blue-500 ring-2 ring-blue-200' : ''}
                `}
            >
                {selected && (
                    <img
                        src={`https://flagcdn.com/24x18/${selected.code}.png`}
                        alt={selected.name}
                        className="w-6 h-4 rounded-sm object-cover flex-shrink-0 shadow-sm"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                )}
                <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-zinc-900 block truncate">
                        {selected?.currency || '—'}
                    </span>
                    <span className="text-[10px] text-zinc-500 block truncate leading-none">
                        {selected?.name || ''}
                    </span>
                </div>
                {!disabled && (
                    <svg
                        className={`w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-1 w-64 bg-white rounded-xl shadow-xl border border-zinc-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Search */}
                    <div className="p-2 border-b border-zinc-100">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Rechercher un pays..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full text-sm px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 placeholder:text-zinc-400"
                        />
                    </div>

                    {/* Options */}
                    <div className="max-h-52 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <p className="text-center text-sm text-zinc-400 py-4">Aucun résultat</p>
                        ) : filtered.map(country => (
                            <button
                                key={country.code}
                                type="button"
                                onClick={() => handleSelect(country.code)}
                                className={`flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-blue-50 transition-colors
                                    ${country.code === value ? 'bg-blue-50 text-blue-700' : 'text-zinc-900'}
                                `}
                            >
                                <img
                                    src={`https://flagcdn.com/24x18/${country.code}.png`}
                                    alt={country.name}
                                    className="w-6 h-4 rounded-sm object-cover flex-shrink-0 shadow-sm"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                />
                                <span className="flex-1 text-sm font-medium truncate">{country.name}</span>
                                <span className="text-xs font-bold text-zinc-500 flex-shrink-0">{country.currency}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
