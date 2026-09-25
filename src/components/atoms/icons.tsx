import {
  AudioLines,
  BookUser,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Copy,
  Database,
  Ellipsis,
  Eye,
  EyeOff,
  House,
  Inbox,
  LogOut,
  Mic,
  Monitor,
  Moon,
  PanelLeft,
  Phone,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Users,
  Wrench,
  type LucideProps,
} from 'lucide-react'

/**
 * Íconos de Lucide con el tamaño y trazo del panel. Los componentes importan desde aquí y no desde
 * lucide-react: cambiar un ícono o el trazo de todos se hace en un solo lugar.
 */
const base = { className: 'size-5', strokeWidth: 1.75, 'aria-hidden': true } satisfies LucideProps

export const HomeIcon = (props: LucideProps) => <House {...base} {...props} />
export const PhoneIcon = (props: LucideProps) => <Phone {...base} {...props} />
export const PlusIcon = (props: LucideProps) => <Plus {...base} {...props} />
export const LogOutIcon = (props: LucideProps) => <LogOut {...base} {...props} />
export const SunIcon = (props: LucideProps) => <Sun {...base} {...props} />
export const MonitorIcon = (props: LucideProps) => <Monitor {...base} {...props} />
export const MoonIcon = (props: LucideProps) => <Moon {...base} {...props} />
export const ChevronLeftIcon = (props: LucideProps) => <ChevronLeft {...base} {...props} />
export const ChevronRightIcon = (props: LucideProps) => <ChevronRight {...base} {...props} />
export const EyeIcon = (props: LucideProps) => <Eye {...base} {...props} />
export const EyeOffIcon = (props: LucideProps) => <EyeOff {...base} {...props} />
export const PanelLeftIcon = (props: LucideProps) => <PanelLeft {...base} {...props} />
export const SettingsIcon = (props: LucideProps) => <SlidersHorizontal {...base} {...props} />
export const CopyIcon = (props: LucideProps) => <Copy {...base} {...props} />
export const BookIcon = (props: LucideProps) => <BookUser {...base} {...props} />
export const SearchIcon = (props: LucideProps) => <Search {...base} {...props} />
export const InboxIcon = (props: LucideProps) => <Inbox {...base} {...props} />
export const ClipboardIcon = (props: LucideProps) => <ClipboardList {...base} {...props} />
export const MicIcon = (props: LucideProps) => <Mic {...base} {...props} />
export const MoreIcon = (props: LucideProps) => <Ellipsis {...base} {...props} />
export const SparklesIcon = (props: LucideProps) => <Sparkles {...base} {...props} />
export const DatabaseIcon = (props: LucideProps) => <Database {...base} {...props} />
export const WrenchIcon = (props: LucideProps) => <Wrench {...base} {...props} />
export const UsersIcon = (props: LucideProps) => <Users {...base} {...props} />
export const WaveIcon = (props: LucideProps) => <AudioLines {...base} {...props} />
