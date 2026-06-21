import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDirection } from '@/context/direction-provider'
import { isRtl } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
] as const

export function LanguageSwitch() {
  const { i18n } = useTranslation()
  const { setDir } = useDirection()

  const changeLanguage = (code: string) => {
    void i18n.changeLanguage(code)
    setDir(isRtl(code) ? 'rtl' : 'ltr')
  }

  const current = i18n.language?.startsWith('ar') ? 'AR' : 'FR'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='scale-95 rounded-full'>
          <Languages className='size-[1.2rem]' />
          <span className='sr-only'>Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={current === lang.code.toUpperCase() ? 'bg-accent' : ''}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
