import React from 'react';

// Generic props for icons
type IconProps = {
  className?: string;
  style?: React.CSSProperties;
};

// Base component for rendering a Google Material Symbol
const MaterialSymbol: React.FC<IconProps & { icon: string; fill?: number }> = ({ icon, className, style, fill = 0 }) => {
  const fillStyle = { fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' 24`, ...style };
  return <span className={`material-symbols-rounded ${className}`} style={fillStyle}>{icon}</span>;
};

export const GridIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="apps" className={className} style={style} />;
export const LinkIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="link" className={className} style={style} />;
export const BellIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="notifications" className={className} style={style} />;
export const QuestionIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="help_outline" className={className} style={style} />;
export const AsteriskIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="asterisk" className={className} style={style} />;
export const ChevronDownIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="expand_more" className={className} style={style} />;
export const ChevronUpIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="expand_less" className={className} style={style} />;
export const EyeIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="visibility" className={className} style={style} />;
export const ArrowSplitIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="alt_route" className={className} style={style} />;
export const PlusIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="add" className={className} style={style} />;
export const BrushIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="palette" className={className} style={style} />;
export const GlobeIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="language" className={className} style={style} />;
export const TuneIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="tune" className={className} style={style} />;
export const ClockIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="schedule" className={className} style={style} />;
export const SearchIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="search" className={className} style={style} />;
export const XIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="close" className={className} style={style} />;
export const PinIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="push_pin" className={className} style={style} />;
export const BlockIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="rectangle" className={className} style={style} fill={0} />;
export const PageBreakIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="insert_page_break" className={className} style={style} />;
export const CheckboxOutlineIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="check_box_outline_blank" className={className} style={style} />;
export const DotsHorizontalIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="more_horiz" className={className} style={style} />;
export const CheckmarkIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="check" className={className} style={style} />;
export const ClockSolidIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="schedule" className={className} style={style} />;
export const ArrowRightAltIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="arrow_right_alt" className={className} style={style} />;
export const WarningIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="warning" className={className} style={style} />;
export const DragIndicatorIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="drag_indicator" className={className} style={style} />;
export const ExpandIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="right_panel_open" className={className} style={style} />;
export const CollapseIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="right_panel_close" className={className} style={style} />;
export const PanelLeftIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="left_panel_close" className={className} style={style} />;
export const PanelRightIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="left_panel_open" className={className} style={style} />;

export const PageIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="description" className={className} style={style} />;


// Updated Icons for better matching
export const DescriptionIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="format_paragraph" className={className} style={style} />;
export const CheckboxFilledIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="check_box" className={className} style={style} />;
export const RadioIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="radio_button_checked" className={className} style={style} />;
export const RadioButtonUncheckedIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="radio_button_unchecked" className={className} style={style} />;
export const TextAnswerIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="title" className={className} style={style} />;
export const ChoiceGridIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="apps" className={className} style={style} />;
export const AutocompleteIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="spellcheck" className={className} style={style} />;
export const CardSortIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="style" className={className} style={style} />;
export const CustomQuestionIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="settings_suggest" className={className} style={style} />;
export const DateTimeIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="event" className={className} style={style} />;
export const DragDropIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="back_hand" className={className} style={style} />;
export const DrillDownIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="waterfall_chart" className={className} style={style} />;
export const DropDownIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="format_list_bulleted" className={className} style={style} />;
export const EmailIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="alternate_email" className={className} style={style} />;
export const HybridGridIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="grid_on" className={className} style={style} />;
export const OpenEndAnswerIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="edit_note" className={className} style={style} />;

// New Icons
export const FileUploadIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="upload_file" className={className} style={style} />;
export const LookupTableIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="table_view" className={className} style={style} />;
export const NpsIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="sentiment_satisfied" className={className} style={style} />;
export const NumericRankingIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="format_list_numbered" className={className} style={style} />;
export const NumericAnswerIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="pin" className={className} style={style} />;
export const RespondentEmailIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="mail" className={className} style={style} />;
export const RespondentLanguageIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="translate" className={className} style={style} />;
export const RespondentMetadataIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="group" className={className} style={style} />;
export const RespondentPhoneIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="call" className={className} style={style} />;
export const RunningTotalIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="summarize" className={className} style={style} />;
export const SecuredVariableIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="shield_lock" className={className} style={style} />;
export const SignatureIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="draw" className={className} style={style} />;
export const SliderIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="linear_scale" className={className} style={style} />;
export const StarRatingIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="star" className={className} style={style} />;
export const TextHighlighterIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="format_ink_highlighter" className={className} style={style} />;
export const TimerIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="timer" className={className} style={style} />;
export const SunIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="light_mode" className={className} style={style} />;
export const MoonIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="dark_mode" className={className} style={style} />;
export const SparkleIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="auto_awesome" className={className} style={style} />;
export const SendIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="send" className={className} style={style} />;
export const LoaderIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="progress_activity" className={className} style={style} />;
export const AccountCircleIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="account_circle" className={className} style={style} />;

// Icons for Bulk Edit Panel
export const ContentCopyIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="content_copy" className={className} style={style} />;
export const LibraryAddIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="library_add" className={className} style={style} />;
export const DriveFileMoveIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="drive_file_move" className={className} style={style} />;
export const CreateNewFolderIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="create_new_folder" className={className} style={style} />;
export const VisibilityOffIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="visibility_off" className={className} style={style} />;
export const HideSourceIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="hide_source" className={className} style={style} />;
export const TaskAltIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="task_alt" className={className} style={style} />;
export const DeleteIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="delete" className={className} style={style} />;
export const ToggleOffIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="toggle_off" className={className} style={style} />;

export const ChevronRightIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="chevron_right" className={className} style={style} />;
export const MoreVertIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="more_vert" className={className} style={style} />;
export const CheckCircleIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="check_circle" className={className} style={style} />;

// Preview Icons
export const ComputerIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="computer" className={className} style={style} />;
export const TabletIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="tablet_mac" className={className} style={style} />;
export const SmartphoneIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="smartphone" className={className} style={style} />;
export const SignalIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="signal_cellular_alt" className={className} style={style} />;
export const BatteryIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="battery_full" className={className} style={style} />;
export const InfoIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="info" className={className} style={style} />;
export const ErrorIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="error" className={className} style={style} />;


// More new icons from spec
export const LockIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="lock" className={className} style={style} />;
export const LockOpenIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="lock_open" className={className} style={style} />;
export const ContentPasteIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="content_paste" className={className} style={style} />;
export const ShuffleIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="shuffle" className={className} style={style} />;
export const CarryForwardIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="subdirectory_arrow_right" className={className} style={style} />;
export const CallSplitIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="arrow_split" className={className} style={style} />;
export const DoubleArrowRightIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="keyboard_double_arrow_right" className={className} style={style} />;
export const PublishIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="publish" className={className} style={style} />;
export const HistoryIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="history" className={className} style={style} />;
export const CalendarIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="calendar_today" className={className} style={style} />;
export const EditIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="edit" className={className} style={style} />;
export const DownloadIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="download" className={className} style={style} />;
export const FileExportIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="file_export" className={className} style={style} />;
export const PrintIcon: React.FC<IconProps> = ({ className, style }) => <MaterialSymbol icon="print" className={className} style={style} />;