'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import i18n from '@/i18n/i18n'

const LanguageContext = createContext<{
    language: string
    setLanguage: (lang: string) => void
}>({
    language: 'vi',
    setLanguage: () => {}
})

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true)
    const [language, setLanguage] = useState('vi')

    useEffect(() => {
        const savedLanguage = localStorage.getItem('LANGUAGE_KEY')
        if (savedLanguage) {
            i18n.changeLanguage(savedLanguage)
            setLanguage(savedLanguage)
        }
        setIsLoading(false)
    }, [])

    const handleSetLanguage = (lang: string) => {
        i18n.changeLanguage(lang)
        setLanguage(lang)
        localStorage.setItem('LANGUAGE_KEY', lang)
    }

    if (isLoading) {
        return null
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => useContext(LanguageContext)
