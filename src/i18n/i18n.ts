import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import enMessages from '../locales/en.json'
import viMessages from '../locales/vi.json'

export const locales = {
    en: 'English',
    vi: 'Tiếng Việt'
}

export const resources = {
    en: {
        common: enMessages
    },
    vi: {
        common: viMessages
    }
}

const i18n = i18next.createInstance()

i18n.use(initReactI18next).init({
    resources: resources,
    lng: 'vi',
    fallbackLng: ['vi', 'en'],
    ns: ['common', 'permission'],
    defaultNS: 'common',
    interpolation: {
        escapeValue: false
    },
    react: {
        useSuspense: false,
        bindI18n: 'languageChanged loaded'
    }
})

export default i18n
