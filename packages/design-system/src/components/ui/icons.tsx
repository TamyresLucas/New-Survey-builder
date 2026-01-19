import { Icon } from "./icon"
import { cn } from "@/lib/utils"

// Shim for Lucide icons to Google Material Symbols

const createIcon = (name: string, defaultClass?: string) => {
    return ({ className, ...props }: any) => (
        <Icon name={name} className={cn(defaultClass, className)} {...props} />
    )
}

export const X = createIcon("close")
export const Check = createIcon("check")
export const ChevronDown = createIcon("expand_more")
export const ChevronUp = createIcon("expand_less")
export const ChevronLeft = createIcon("chevron_left")
export const ChevronRight = createIcon("chevron_right")
export const ChevronsUpDown = createIcon("unfold_more")
export const Circle = createIcon("radio_button_unchecked") // Outline circle
export const CircleFilled = createIcon("circle") // Filled circle for radio indicators
export const Search = createIcon("search")
export const MoreHorizontal = createIcon("more_horiz")
export const CloudUpload = createIcon("cloud_upload")
export const File = createIcon("description")
export const Image = createIcon("image")
export const Dot = createIcon("fiber_manual_record", "text-[0.5em]") // Scale down dot
export const GripVertical = createIcon("drag_indicator")
export const Play = createIcon("play_arrow")
export const Pipette = createIcon("colorize")
export const ArrowLeft = createIcon("arrow_back")
export const ArrowRight = createIcon("arrow_forward")
export const Calendar = createIcon("calendar_today")
export const Upload = createIcon("upload")
export const Trash = createIcon("delete")
export const Plus = createIcon("add")
export const Settings = createIcon("settings")
export const User = createIcon("person")
export const Mail = createIcon("mail")
export const Bell = createIcon("notifications")
export const Home = createIcon("home")
export const Menu = createIcon("menu")
export const Loader2 = createIcon("progress_activity", "animate-spin")
export const Eye = createIcon("visibility")
export const EyeOff = createIcon("visibility_off")
export const Moon = createIcon("dark_mode")
export const Sun = createIcon("light_mode")
export const Sparkles = createIcon("auto_awesome")
export const Paperclip = createIcon("attach_file")
export const Send = createIcon("send")
export const Globe = createIcon("public") // or language
export const Clock = createIcon("schedule")

// Aliases for compatibility
export const FileIcon = File
export const ImageIcon = Image
export const CalendarIcon = Calendar

export const ChevronLeftIcon = ChevronLeft
export const ChevronRightIcon = ChevronRight
export const ChevronDownIcon = ChevronDown

export const AlertTriangle = createIcon("warning")
export const CheckCircle = createIcon("check_circle")
export const Info = createIcon("info")
export const TrendingUp = createIcon("trending_up")
export const TrendingDown = createIcon("trending_down")
export const Minus = createIcon("remove")

export const LayoutDashboard = createIcon("dashboard")
export const Users = createIcon("group")
export const LogOut = createIcon("logout")
export const Filter = createIcon("filter_list")

// Additional icons for stories
export const FileText = createIcon("description")
export const BarChart3 = createIcon("bar_chart")
export const Calculator = createIcon("calculate")
export const CreditCard = createIcon("credit_card")
export const Smile = createIcon("sentiment_satisfied")
export const Rocket = createIcon("rocket_launch")
export const Laptop = createIcon("laptop")

// Text formatting icons
export const Bold = createIcon("format_bold")
export const Italic = createIcon("format_italic")
export const Underline = createIcon("format_underlined")

// Alignment icons
export const AlignLeft = createIcon("format_align_left")
export const AlignCenter = createIcon("format_align_center")
export const AlignRight = createIcon("format_align_right")
export const AlignJustify = createIcon("format_align_justify")

// List icons
export const List = createIcon("format_list_bulleted")
export const ListOrdered = createIcon("format_list_numbered")

// Grid icons
export const Grid2X2 = createIcon("grid_view")
export const Grid3X3 = createIcon("apps")
export const LayoutGrid = createIcon("dashboard")

// Device icons
export const Smartphone = createIcon("smartphone")
export const Monitor = createIcon("desktop_windows")

// UI icons
export const HelpCircle = createIcon("help")
export const PanelLeftClose = createIcon("left_panel_close")
export const Slash = createIcon("remove")
export const Type = createIcon("title")
export const Square = createIcon("check_box_outline_blank")

// Chart icons
export const PieChart = createIcon("pie_chart")
export const BarChart = createIcon("bar_chart")

// Alert/Status icons
export const CheckCircle2 = createIcon("check_circle")
export const AlertCircle = createIcon("error")

// Action icons
export const Trash2 = createIcon("delete")
export const CalendarDays = createIcon("calendar_month")

// Additional icons
export const Terminal = createIcon("terminal")
export const XCircle = createIcon("error") // Same as AlertCircle for error states
export const Lightbulb = createIcon("lightbulb")
