import { TFunction } from 'i18next'
import { useTranslation as useI18nTranslation } from 'react-i18next'
import TRANSLATE from 'src/locales/Translate'

type Namespace = 'common' | 'translation'

type NestedKeys<T> = T extends object
    ? {
          [K in keyof T]: K extends string
              ? T[K] extends object
                  ? `${K}` | `${K}.${NestedKeys<T[K]>}`
                  : `${K}`
              : never
      }[keyof T]
    : never

type TranslationKeys = NestedKeys<typeof TRANSLATE>

export type UseTranslationResponse<Ns extends Namespace, KPrefix = undefined> = [
    t: TFunction<Ns, KPrefix>,
    i18n: i18n,
    ready: boolean
] & {
    t: TFunction<Ns, KPrefix>
    i18n: i18n
    ready: boolean
}

export function useTranslation<Ns extends Namespace>(ns?: Ns): UseTranslationResponse<Ns> {
    return useI18nTranslation(ns) as UseTranslationResponse<Ns>
}
