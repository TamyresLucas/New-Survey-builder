import React from 'react';

// Generic props for icons
type IconProps = { className?: string };

// Base component for rendering a Google Material Symbol
const MaterialSymbol: React.FC<IconProps & { icon: string; filled?: boolean }> = ({ icon, className, filled }) => {
    const style: React.CSSProperties = filled ? { fontVariationSettings: "'FILL' 1" } : {};
    return <span style={style} className={`material-symbols-outlined ${className}`}>{icon}</span>;
};

export const GridIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="apps" className={className} />;
export const LinkIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="link" className={className} />;
export const BellIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="notifications" className={className} />;
export const QuestionIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="help_outline" className={className} />;
export const ChevronDownIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="expand_more" className={className} />;
export const EyeIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="visibility" className={className} />;
export const ArrowSplitIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="alt_route" className={className} />;
export const PlusIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="add" className={className} />;
export const BrushIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="palette" className={className} />;
export const GlobeIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="language" className={className} />;
export const TuneIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="tune" className={className} />;
export const ClockIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="schedule" className={className} />;
export const SearchIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="search" className={className} />;
export const XIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="close" className={className} />;
export const PinIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="push_pin" className={className} />;
export const BlockIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="rectangle" className={className} />;
export const PageBreakIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="insert_page_break" className={className} />;
export const CheckboxOutlineIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="check_box_outline_blank" className={className} />;
export const DotsHorizontalIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="more_horiz" className={className} />;
export const CheckmarkIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="check" className={className} />;
export const ClockSolidIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="schedule" className={className} />;
export const ArrowRightAltIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="arrow_right_alt" className={className} />;
export const WarningIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="warning" className={className} />;
export const DragIndicatorIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="drag_indicator" className={className} />;

// Updated Icons for better matching
export const DescriptionIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="format_paragraph" className={className} />;
export const CheckboxFilledIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="check_box" className={className} filled />;
export const RadioIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="radio_button_checked" className={className} />;
export const RadioButtonUncheckedIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="radio_button_unchecked" className={className} />;
export const TextAnswerIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="title" className={className} />;
export const ChoiceGridIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="apps" className={className} />;
export const AutocompleteIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="spellcheck" className={className} />;
export const CardSortIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="style" className={className} />;
export const CustomQuestionIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="settings_suggest" className={className} />;
export const DateTimeIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="event" className={className} />;
export const DragDropIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="back_hand" className={className} />;
export const DrillDownIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="waterfall_chart" className={className} />;
export const DropDownIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="format_list_bulleted" className={className} />;
export const EmailIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="alternate_email" className={className} />;
export const HybridGridIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="grid_on" className={className} />;

// New Icons
export const FileUploadIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="upload_file" className={className} />;
export const ImageAreaEvaluatorIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="image_aspect_ratio" className={className} />;
export const ImageAreaSelectorIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="image_aspect_ratio" className={className} />;
export const ImageChoiceGridIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="imagesmode" className={className} />;
export const ImageSelectorIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="image" className={className} />;
export const LookupTableIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="table_view" className={className} />;
export const NpsIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="sentiment_satisfied" className={className} />;
export const NumericRankingIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="format_list_numbered" className={className} />;
export const NumericAnswerIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="pin" className={className} />;
export const OpenEndAnswerIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="edit_note" className={className} />;
export const RespondentEmailIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="mail" className={className} />;
export const RespondentLanguageIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="translate" className={className} />;
export const RespondentMetadataIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="group" className={className} />;
export const RespondentPhoneIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="call" className={className} />;
export const RunningTotalIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="summarize" className={className} />;
export const SecuredVariableIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="shield_lock" className={className} />;
export const SignatureIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="draw" className={className} />;
export const SliderIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="linear_scale" className={className} />;
export const StarRatingIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="star" className={className} />;
export const TextHighlighterIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="format_ink_highlighter" className={className} />;
export const TimerIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="timer" className={className} />;
export const HeatmapIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="local_fire_department" className={className} />;
export const CarrouselIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="view_carousel" className={className} />;
export const SunIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="light_mode" className={className} />;
export const MoonIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="dark_mode" className={className} />;
export const SparkleIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="auto_awesome" className={className} />;
// Fix: Add missing icon definitions for GeminiPanel
export const SendIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="send" className={className} />;
export const LoaderIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="progress_activity" className={className} />;
export const AccountCircleIcon: React.FC<IconProps> = ({ className }) => <MaterialSymbol icon="account_circle" className={className} />;