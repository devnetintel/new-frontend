# Design System Documentation (Dark Mode)

## Overview

This document captures the complete design system for the Personal Network Intelligence (PNI) application, including colors, typography, spacing, components, and all visual details - optimized for dark mode background.

---

## Color System

### Dark Mode Colors (Primary Theme)

#### Primary Colors

- **Primary (Purple)**: `hsl(266.4, 80.8%, 51.0%)` - `#761DE7` (Purple-500)
  - Used for: Primary buttons, active states, links, highlights
  - Foreground: `hsl(0, 0%, 100%)` - White
  - Lighter variants:
    - **Light Purple (20%)**: `#5010A1` - `hsl(266.5, 81.9%, 34.7%)`
    - **Light Purple (40%)**: `#761DE7` - `hsl(266.4, 80.8%, 51.0%)`
    - **Light Purple (60%)**: `#A468EF` - `hsl(266.7, 80.8%, 67.3%)`

#### Background Colors

- **Background**: `hsl(240, 15.2%, 6.5%)` - Very dark purple-gray (`#0E0E13` or `rgb(14, 14, 19)`)
- **Card**: `hsl(276.5, 67.6%, 13.3%)` - Dark purple (`#270B39` or `rgb(39, 11, 57)`)
- **Muted Background**: `hsl(266.5, 81.1%, 18.6%)` - Medium dark purple (`#2B0956` or `rgb(43, 9, 86)`)
- **Lighter Purple (20%)**: `#5010A1` or `rgb(80, 16, 161)` - `hsl(266.5, 81.9%, 34.7%)`
- **Lighter Purple (40%)**: `#761DE7` or `rgb(118, 29, 231)` - `hsl(266.4, 80.8%, 51.0%)`
- **Lighter Purple (60%)**: `#A468EF` or `rgb(164, 104, 239)` - `hsl(266.7, 80.8%, 67.3%)`

#### Text Colors

- **Foreground**: `hsl(0, 0%, 95%)` - Off-white (`#F2F2F2` or `rgb(242, 242, 242)`)
- **Muted Foreground**: `hsl(220, 5%, 60%)` - Light gray (`#93979E` or `rgb(147, 151, 158)`)
- **Card Foreground**: `hsl(0, 0%, 95%)` - Off-white (`#F2F2F2` or `rgb(242, 242, 242)`)

#### Border Colors

- **Border**: `hsl(266.5, 81.1%, 18.6%)` - Medium dark purple (`#2B0956` or `rgb(43, 9, 86)`)
- **Input Border**: `hsl(266.5, 81.1%, 18.6%)` - Medium dark purple (`#2B0956` or `rgb(43, 9, 86)`)
- **Ring/Focus**: `hsl(266.4, 80.8%, 51.0%)` - Primary purple (`#761DE7` or `rgb(118, 29, 231)`)

#### Semantic Colors

- **Destructive**: `hsl(0, 62.8%, 30.6%)` - Dark red (`#7F1D1D` or `rgb(127, 29, 29)`)
- **Destructive Foreground**: `hsl(0, 0%, 98%)` - Off-white (`#F9F9F9` or `rgb(249, 249, 249)`)
- **Secondary**: `hsl(266.5, 81.1%, 18.6%)` - Medium dark purple (`#2B0956` or `rgb(43, 9, 86)`)
- **Accent**: `hsl(266.5, 81.1%, 18.6%)` - Medium dark purple (`#2B0956` or `rgb(43, 9, 86)`)

### Light Mode Colors (Reference)

#### Primary Colors

- **Primary (Purple)**: `hsl(266.4, 80.8%, 51.0%)` - `#761DE7` (Purple-500)
  - Used for: Primary buttons, active states, links, highlights
  - Foreground: `hsl(0, 0%, 100%)` - White
  - Lighter variants:
    - **Light Purple (20%)**: `#5010A1` - `hsl(266.5, 81.9%, 34.7%)`
    - **Light Purple (40%)**: `#761DE7` - `hsl(266.4, 80.8%, 51.0%)`
    - **Light Purple (60%)**: `#A468EF` - `hsl(266.7, 80.8%, 67.3%)`

#### Background Colors

- **Background**: `hsl(0, 0%, 100%)` - Pure white
- **Card**: `hsl(0, 0%, 100%)` - White
- **Muted Background**: `hsl(220, 5%, 96%)` - Light gray

#### Text Colors

- **Foreground**: `hsl(220, 2%, 10%)` - Near black (`#1A1A1A`)
- **Muted Foreground**: `hsl(220, 5%, 45%)` - Medium gray
- **Card Foreground**: `hsl(220, 2%, 10%)` - Near black

#### Border Colors

- **Border**: `hsl(220, 5%, 90%)` - Light gray
- **Input Border**: `hsl(220, 5%, 90%)` - Light gray
- **Ring/Focus**: `hsl(266.4, 80.8%, 51.0%)` - Primary purple (`#761DE7`)

#### Semantic Colors

- **Destructive**: `hsl(0, 84%, 60%)` - Red
- **Destructive Foreground**: `hsl(0, 0%, 98%)` - Off-white
- **Secondary**: `hsl(220, 5%, 96%)` - Light gray
- **Accent**: `hsl(220, 5%, 96%)` - Light gray

### Admin Section Colors (Light Mode Only)

- **Background**: `#f9fafb` - `bg-gray-50`
- **Card/White**: `#ffffff` - `bg-white`
- **Text Primary**: `#111111` - `text-gray-900`
- **Text Secondary**: `#666666` - `text-gray-600`
- **Border**: `#e5e7eb` - `border-gray-200`
- **Table Header**: `#f8f9fa` - `bg-gray-50`
- **Table Border**: `#dee2e6` - `border-gray-300`
- **Success Green**: `#155724` - `text-green-800`
- **Success Background**: `#d4edda` - `bg-green-100`
- **Warning Yellow**: `#856404` - `text-yellow-800`
- **Warning Background**: `#fff3cd` - `bg-yellow-100`
- **Error Red**: `#721c24` - `text-red-800`
- **Error Background**: `#f8d7da` - `bg-red-100`
- **Primary Action**: `#761DE7` - Purple
- **Purple Primary**: `#761DE7` - `bg-[#761DE7]`

### Workspace Network Colors

- **Purple Primary**: `bg-[#2B0956]/10`, `border-[#2B0956]/50`, `text-[#A468EF]`, `bg-[#761DE7]`
- **Purple Secondary**: `bg-[#270B39]/10`, `border-[#270B39]/50`, `text-[#8C27CD]`, `bg-[#591983]`
- **Purple Light**: `bg-[#5010A1]/10`, `border-[#5010A1]/50`, `text-[#A468EF]`, `bg-[#761DE7]`
- **Purple Accent**: `bg-[#A468EF]/10`, `border-[#A468EF]/50`, `text-[#A468EF]`, `bg-[#A468EF]`
- **Green**: `bg-green-500/10`, `border-green-500/50`, `text-green-400`, `bg-green-500`
- **Orange**: `bg-orange-500/10`, `border-orange-500/50`, `text-orange-400`, `bg-orange-500`
- **Pink**: `bg-pink-500/10`, `border-pink-500/50`, `text-pink-400`, `bg-pink-500`

### Background Orbs (Animated Blurred Blobs)

- **Orb 1 (Purple)**: `#761DE7` - 400px × 400px, top-left, blur(80px), opacity 0.4
- **Orb 2 (Dark Purple)**: `#2B0956` - 300px × 300px, bottom-right, blur(80px), opacity 0.4
- **Animation**: `drift` - 20s infinite alternate, translates 30px, 50px

---

## Typography

### Font Family

- **Primary Font**: Outfit (Google Fonts)
- **CSS Variable**: `--font-outfit`
- **Font Stack**: `var(--font-outfit), system-ui, -apple-system, sans-serif`
- **Font Sans**: `var(--font-outfit)`

### Font Sizes

#### Headings

- **H1 (Greeting)**: `text-4xl md:text-5xl` - 36px / 48px

  - Weight: `font-medium`
  - Tracking: `tracking-tight`
  - Color: `text-foreground/90`

- **H2 (Page Titles)**: `text-2xl` - 24px

  - Weight: `font-semibold`
  - Color: `text-gray-900` (admin) / `text-foreground` (main)

- **H3 (Section Titles)**: `text-lg` - 18px
  - Weight: `font-semibold`

#### Body Text

- **Base**: `text-sm` - 14px (default)
- **Large**: `text-lg` - 18px (search input)
- **Small**: `text-xs` - 12px (labels, metadata)
- **Extra Small**: `text-[10px]` - 10px (badges, network labels)
- **Tiny**: `text-[11px]` - 11px (table metadata)

#### Special Sizes

- **Table Text**: `text-[13px]` - 13px
- **Query Text (Editable)**: `text-xl` - 20px
- **Stats Numbers**: `text-[32px]` - 32px (workspace stats)

### Font Weights

- **Bold**: `font-bold` - 700 (names, important text)
- **Semibold**: `font-semibold` - 600 (headings, labels)
- **Medium**: `font-medium` - 500 (buttons, secondary headings)
- **Normal**: Default - 400 (body text)

### Line Heights

- **Tight**: `leading-tight` (headings)
- **Loose**: `leading-loose` (body text, descriptions)
- **Relaxed**: `leading-relaxed` (chat messages)

### Text Colors

- **Primary**: `text-foreground` (theme-aware)
- **Muted**: `text-muted-foreground` (theme-aware)
- **Primary Purple**: `text-primary` (theme-aware)
- **Black (Admin)**: `text-black` (explicit, light mode only)
- **Gray Scale**: `text-gray-900`, `text-gray-600`, `text-gray-400`, `text-gray-500`

### Text Transforms

- **Uppercase**: `uppercase` (network labels, section headers)
- **Tracking**: `tracking-wide`, `tracking-wider` (uppercase text)

---

## Spacing System

### Padding

#### Component Padding

- **Card Content**: `p-6` - 24px
- **Card Footer**: `p-4` - 16px
- **Search Input Container**: `p-4` - 16px
- **Modal Content**: `p-4`, `p-5` - 16px / 20px
- **Admin Header**: `px-8 py-5` - 32px horizontal, 20px vertical
- **Admin Content**: `px-8 py-5` - 32px horizontal, 20px vertical
- **Admin Table Cells**: `px-3 py-2.5` / `px-3 py-3` - 12px horizontal, 10px/12px vertical
- **Sidebar**: `py-4` - 16px vertical
- **Page Container**: `p-4 md:p-8` - 16px / 32px

#### Small Padding

- **Badge/Pill**: `px-2 py-1` - 8px horizontal, 4px vertical
- **Button Small**: `px-3 py-2` - 12px horizontal, 8px vertical
- **Button Default**: `px-4 py-2` - 16px horizontal, 8px vertical
- **Button Large**: `px-8 py-2` - 32px horizontal, 8px vertical
- **Input**: `px-3 py-2` / `px-4 py-3` - 12px/16px horizontal, 8px/12px vertical

### Margins

#### Vertical Margins

- **Section Spacing**: `mb-4`, `mb-6`, `mb-8` - 16px, 24px, 32px
- **Element Spacing**: `mt-1`, `mt-2`, `mt-4` - 4px, 8px, 16px
- **Large Spacing**: `mb-20` - 80px (greeting to search)
- **Centered Content**: `py-12`, `py-16`, `py-[60px]` - 48px, 64px, 60px

#### Horizontal Margins

- **Container**: `mx-auto` - Auto (centered)
- **Icon Spacing**: `mr-1`, `mr-2` - 4px, 8px

### Gaps

#### Flex/Grid Gaps

- **Small**: `gap-1`, `gap-2` - 4px, 8px
- **Medium**: `gap-2.5`, `gap-3`, `gap-4` - 10px, 12px, 16px
- **Large**: `gap-5`, `gap-6` - 20px, 24px
- **Extra Large**: `gap-8` - 32px

---

## Border Radius

### Standard Radius

- **Small**: `rounded` / `rounded-md` - 6px / 8px
- **Medium**: `rounded-lg` - 12px
- **Large**: `rounded-xl` - 16px
- **Extra Large**: `rounded-2xl` - 20px
- **Full Circle**: `rounded-full` - 9999px

### Special Radius

- **Workspace Stats Cards**: `rounded-[10px]` - 10px
- **Profile Cards**: `rounded-lg` - 12px
- **Search Input**: `rounded-xl` - 16px
- **Buttons**: `rounded-md` (default), `rounded-lg` (large), `rounded-full` (icon buttons)
- **Chat Bubbles**: `rounded-2xl` - 20px
- **Modal**: `rounded-xl` - 16px

---

## Shadows

### Box Shadows

- **None**: `shadow-none` (default cards)
- **Small**: `shadow-sm` - Subtle shadow
- **Medium**: `shadow-md` - `hover:shadow-md` (cards on hover)
- **Glow Effect**: `shadow-[0_0_10px_rgba(118,29,231,0.2)]` - Purple glow (active sidebar items)
- **Workspace Selected**: `shadow-[0_0_15px_rgba(118,29,231,0.15)]` - Purple glow

### Text Shadows

- None used

---

## Layout

### Container

- **Max Width**: `max-w-3xl` (search input), `max-w-4xl` (voice discovery), `max-w-6xl` (page)
- **Container Utility**: `max-width: 1400px` at `width >= 1400px`
- **Padding**: `padding-inline: 2rem` (32px)

### Sidebar

- **Width**: `w-16` - 64px (main sidebar)
- **Width (Admin)**: `w-[250px]` - 250px
- **Position**: `fixed left-0 top-0`
- **Height**: `h-screen`
- **Z-Index**: `z-40`
- **Border**: `border-r border-border/10`
- **Padding**: `py-4` - 16px vertical

### Main Content

- **Padding Left (Desktop)**: `md:pl-16` - 64px (to account for sidebar)
- **Min Height**: `min-h-screen`
- **Flex Layout**: `flex flex-col`

### Grid Layouts

- **Profile Cards Grid**: Responsive grid (auto-fit, minmax)
- **Workspace Cards**: `flex gap-3 flex-wrap`
- **Admin Dashboard**: `grid grid-cols: repeat(auto-fit, minmax(320px, 1fr)) gap-24px`

---

## Components

### Buttons

#### Sizes

- **Icon**: `h-8 w-8` (small), `h-10 w-10` (default), `h-9 w-9` (medium)
- **Small**: `h-9 px-3` - 36px height, 12px horizontal padding
- **Default**: `h-10 px-4 py-2` - 40px height, 16px horizontal, 8px vertical
- **Large**: `h-11 px-8` - 44px height, 32px horizontal
- **Extra Large**: `h-14` - 56px height (voice button)

#### Variants

- **Default**: `bg-primary text-primary-foreground hover:bg-primary/90`
- **Destructive**: `bg-destructive text-destructive-foreground hover:bg-destructive/90`
- **Outline**: `border border-input bg-background hover:bg-accent`
- **Secondary**: `bg-secondary text-secondary-foreground hover:bg-secondary/80`
- **Ghost**: `hover:bg-accent hover:text-accent-foreground`
- **Link**: `text-primary underline-offset-4 hover:underline`

#### Special Button Styles

- **Recording Button**: `bg-destructive text-destructive-foreground` with pulsing dot
- **Microphone Button**: `bg-primary text-primary-foreground` (same as send)
- **Send Button**: `bg-primary text-primary-foreground hover:bg-primary/90`
- **Find People Button**: `bg-primary text-primary-foreground hover:bg-primary/90` with `px-6` padding
- **Refresh Button**: `bg-[#761DE7]` (admin) / `bg-[#761DE7]` (admin database)

### Cards

#### Profile Card

- **Background**: `bg-card/50` - 50% opacity card color
- **Border**: `border-transparent` default, `hover:border-border/50` on hover
- **Shadow**: `shadow-none` default, `hover:shadow-md` on hover
- **Padding**: `p-6` (content), `p-4` (footer)
- **Border Radius**: `rounded-lg` - 12px (inherited from Card component)
- **Height**: `h-full` (flex column)
- **Transition**: `transition-all duration-300`

#### Network Workspace Card

- **Selected State**:
  - Background: Color-specific with 10% opacity (`bg-[#2B0956]/10`, etc.)
  - Border: Color-specific with 50% opacity (`border-[#2B0956]/50`, etc.)
  - Text: Color-specific (`text-[#A468EF]`, etc.)
  - Shadow: `shadow-[0_0_15px_rgba(118,29,231,0.15)]`
- **Unselected State**:
  - Background: `bg-card`
  - Border: `border-border/50`
  - Opacity: `opacity-60`
  - Hover: `hover:border-border hover:bg-muted/50`
- **Padding**: `p-4` - 16px
- **Border Radius**: `rounded-xl` - 16px
- **Min Width**: `min-w-[200px]`
- **Transition**: `transition-all duration-200`

### Input Fields

#### Search Input

- **Container**:
  - Background: `bg-card`
  - Border: `border border-border/50`
  - Border Radius: `rounded-xl` - 16px
  - Padding: `p-4` - 16px
  - Shadow: `shadow-sm`
  - Focus: `focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50`
- **Textarea**:
  - Min Height: `min-h-[60px]` - 60px
  - Max Height: `max-h-[200px]` - 200px
  - Font Size: `text-lg` - 18px
  - Placeholder: `placeholder:text-muted-foreground/70`
  - Background: `bg-transparent`
  - Border: `border-none`
- **Button Container**: `mt-2` - 8px top margin

#### Text Input (Voice Discovery)

- **Background**: `bg-card`
- **Border**: `border border-border`
- **Border Radius**: `rounded-lg` - 12px
- **Padding**: `px-4 py-3` - 16px horizontal, 12px vertical
- **Font Size**: `text-sm` - 14px

### Tables (Admin)

#### Table Container

- **Background**: `bg-white`
- **Border Radius**: `rounded-lg` - 12px
- **Shadow**: `shadow-sm`
- **Overflow**: `overflow-x-auto`
- **Width**: `w-max min-w-full` (database), `w-max` (logs)

#### Table Header

- **Background**: `bg-gray-50`
- **Border**: `border-b-2 border-gray-300`
- **Padding**: `px-3 py-3` - 12px
- **Font**: `font-semibold text-black`
- **Text Align**: `text-left`
- **White Space**: `whitespace-nowrap`

#### Table Body

- **Border**: `border-b border-gray-100` (rows)
- **Padding**: `px-3 py-2.5` - 12px horizontal, 10px vertical
- **Text Color**: `text-black` (explicit)
- **Vertical Align**: `align-top`

### Modals/Dialogs

#### Dialog Container

- **Max Width**: `sm:max-w-[500px]` - 500px on small screens and up
- **Background**: Theme-aware (card background)
- **Border Radius**: Inherited from Dialog component (typically `rounded-lg`)

#### Dialog Content

- **Padding**: `py-4` - 16px vertical
- **Gap**: `gap-4` - 16px between elements

### Avatar

#### Profile Avatar

- **Size**: `h-16 w-16` - 64px × 64px
- **Border**: `border-2 border-background`
- **Shadow**: `shadow-sm`
- **Border Radius**: `rounded-full`
- **Fallback Background**: `bg-primary/10`
- **Fallback Text**: `text-primary font-bold text-lg`

### Badges/Pills

#### Network Label Badge

- **Font Size**: `text-[10px]` - 10px
- **Font Weight**: `font-bold`
- **Padding**: `px-2 py-1` - 8px horizontal, 4px vertical
- **Border Radius**: `rounded-full`
- **Background**: `bg-[#2B0956]/10` (example)
- **Text**: `text-[#A468EF]` (example)
- **Border**: `border border-[#2B0956]/20` (example)
- **Tracking**: `tracking-wider`
- **Uppercase**: `uppercase`

#### Status Badges

- **Success**: `bg-green-100 text-green-800`
- **Warning**: `bg-yellow-100 text-yellow-800`
- **Error**: `bg-red-100 text-red-800`
- **Info**: `bg-[#A468EF]/20 text-[#761DE7]`
- **Padding**: `px-2 py-1` or `px-2.5 py-1`
- **Border Radius**: `rounded` (4px) or `rounded-full` (12px)
- **Font Size**: `text-xs` - 12px

---

## Icons

### Icon Library

- **Library**: Lucide React (`lucide-react`)
- **Version**: `^0.554.0`

### Icon Sizes

- **Extra Small**: `h-3 w-3` - 12px (checkmarks, dots)
- **Small**: `h-4 w-4` - 16px (default buttons, inline icons)
- **Medium**: `h-5 w-5` - 20px (sidebar, larger buttons)
- **Large**: `h-6 w-6` - 24px (sidebar plus button)
- **Extra Large**: `h-10 w-10` - 40px (loading spinners, large displays)

### Common Icons

- **Mic**: Microphone (voice input)
- **ArrowRight**: Send/submit
- **UserPlus**: Request intro
- **MapPin**: Location
- **Briefcase**: Job/company
- **Search**: Search action
- **RefreshCw**: Refresh/reload
- **X**: Close/cancel
- **Check**: Selected/confirmed
- **Plus**: Add
- **Sparkles**: AI/voice features
- **Keyboard**: Text input mode
- **Home**: Home page
- **Library**: Dashboard/library
- **Settings**: Settings
- **Filter**: Filter/search
- **Database**: Database viewer
- **FileText**: Logs viewer
- **ChevronLeft/Right**: Navigation
- **ArrowUp**: Send/confirm
- **Edit2**: Edit
- **CheckCircle2**: Success
- **AlertCircle**: Error/warning
- **Users**: Networks/people

---

## Animations & Transitions

### Transitions

- **Default**: `transition-all duration-200` - 200ms
- **Slow**: `transition-all duration-300` - 300ms
- **Fast**: `transition-colors` - Color changes only

### Animations

#### Spinning

- **Keyframes**: `@keyframes spin` (0deg to 360deg)
- **Duration**: `1s linear infinite`
- **Usage**: Loading spinners, refresh buttons

#### Pulse

- **Class**: `animate-pulse`
- **Usage**: Loading states, recording indicators
- **Recording Dot**: `h-3 w-3 rounded-full bg-white animate-pulse`

#### Bounce

- **Class**: `animate-bounce`
- **Usage**: Loading dots, thinking indicators
- **Staggered**: `animationDelay: "0ms"`, `"150ms"`, `"300ms"`

#### Fade In

- **Class**: `animate-in fade-in`
- **Variants**: `slide-in-from-top-4`, `slide-in-from-bottom-2`, `slide-in-from-bottom-4`
- **Duration**: `duration-300`, `duration-500`

#### Drift (Background Orbs)

- **Keyframes**: `@keyframes drift` (translate 0,0 to 30px,50px)
- **Duration**: `20s infinite alternate`
- **Usage**: Animated background orbs

### Hover Effects

- **Cards**: `hover:shadow-md hover:border-border/50`
- **Buttons**: `hover:bg-primary/90`, `hover:opacity-100`
- **Sidebar Items**: `hover:bg-muted`, `hover:opacity-100`
- **Workspace Cards**: `hover:border-border hover:bg-muted/50`

---

## States & Interactions

### Focus States

- **Input Focus**: `focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50`
- **Button Focus**: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- **Disabled**: `disabled:pointer-events-none disabled:opacity-50`

### Active States

- **Sidebar Active**: `bg-primary/10 text-primary opacity-100 shadow-[0_0_10px_rgba(118,29,231,0.2)]`
- **Workspace Selected**: Color-specific background with glow shadow

### Loading States

- **Thinking**: `animate-pulse` with "Thinking..." text
- **Transcribing**: `animate-pulse` with "Transcribing..." text
- **Processing**: Three bouncing dots with staggered delays

### Recording States

- **Recording Button**: Red background (`bg-destructive`) with pulsing white dot
- **Recording Indicator**: Red dot with ping animation
- **Duration Display**: Tabular numbers, medium font weight

---

## Special Components

### Profile Card

#### Structure

1. **Network Badge** (if workspace_id exists)

   - Position: Top, right-aligned
   - Size: `text-[10px]`, `px-2 py-1`
   - Dot: `h-1.5 w-1.5 rounded-full bg-[#761DE7]`

2. **Profile Section**

   - Avatar: `h-16 w-16` (64px)
   - Name: `font-bold text-lg`
   - Title: `text-sm text-muted-foreground`
   - Location: `text-sm text-muted-foreground`

3. **Spacer**: `flex-1` (pushes content to bottom)

4. **Why This Match Section**

   - Background: `bg-muted/30`
   - Border: `border border-border/50`
   - Padding: `p-4`
   - Border Radius: `rounded-lg`
   - Title: `text-xs uppercase tracking-wide font-semibold text-foreground/80`
   - Content: `text-muted-foreground leading-loose`
   - Keywords: `text-foreground font-medium bg-primary/10 px-0.5 rounded-sm`
   - Read More: `text-xs text-primary hover:text-primary/80 font-medium`

5. **Footer**
   - Background: `bg-muted/20`
   - Padding: `p-4`
   - Button: `size="sm"` with `UserPlus` icon

### Voice Discovery Overlay

#### Header

- **Network Pills**: Color-coded pills showing selected networks
- **Cancel Button**: Ghost variant, `gap-2`, right-aligned

#### Query Evolution Display

- **Background**: `bg-muted/30 border border-border/50`
- **Border Radius**: `rounded-xl`
- **Padding**: `p-4`
- **Icon**: `Sparkles h-4 w-4 text-primary`
- **Text**: `text-xs text-muted-foreground` (label), `text-sm font-medium text-foreground` (query)

#### Conversation Thread

- **User Messages**: Right-aligned, `bg-primary text-primary-foreground`, `max-w-[80%]`, `rounded-2xl px-5 py-4`
- **System Messages**: Left-aligned, `bg-muted`, `max-w-[80%]`, `rounded-2xl px-5 py-4`
- **Processing Indicator**: Three bouncing dots, `bg-muted rounded-2xl px-5 py-4`

#### Final Query Summary

- **Container**: Centered, `py-12`, gradient border effect
- **Card**: `bg-card border-2 border-primary/30 rounded-xl p-8`
- **Query Text**: `text-xl leading-relaxed font-medium`, editable with `contentEditable`
- **Button**: `size="lg"`, `flex-1 gap-2 text-base`

### Search Input

#### Container

- **Max Width**: `max-w-3xl`
- **Padding**: `p-4`
- **Border Radius**: `rounded-xl`
- **Focus Ring**: `focus-within:ring-2 focus-within:ring-primary/20`

#### Action Buttons

- **Size**: `h-8 w-8 rounded-full`
- **Microphone (Empty)**: `bg-primary text-primary-foreground`
- **Find People (With Text)**: `bg-primary text-primary-foreground` with `px-6` padding
- **Recording**: `bg-destructive text-destructive-foreground` with pulsing dot

### Thinking/Loading States

#### Thinking Messages

- **Messages**: Array of strings cycling through
- **Display**: Centered, large spinner
- **Text**: `text-foreground/90` or `text-muted-foreground`
- **Spinner**: Purple color, `animate-spin`

#### Steps

- "Analyzing request..."
- "Scanning networks..."
- "Identifying relevant skills..."
- "Ranking best matches..."
- "Curating introductions..."

### Admin Components

#### Logs Viewer

- **Header Background**: `bg-white`
- **Header Padding**: `px-8 py-5`
- **Stats Cards**: `px-5 py-3`, color-coded backgrounds
- **Table**: White background, gray headers, black text

#### Database Viewer

- **Sidebar Width**: `w-[250px]`
- **Sidebar Background**: `bg-white`
- **Table Item**: `p-3 mb-1.5 rounded-lg`
- **Selected Table**: `bg-[#761DE7] text-white`
- **Workspace Stats**: Gradient background `from-pink-400 to-red-500`

---

## Responsive Design

### Breakpoints

- **Mobile**: Default (< 768px)
- **Tablet/Desktop**: `md:` prefix (>= 768px)

### Responsive Patterns

- **Padding**: `p-4 md:p-8` - 16px mobile, 32px desktop
- **Text Size**: `text-4xl md:text-5xl` - 36px mobile, 48px desktop
- **Sidebar**: `hidden md:flex` - Hidden on mobile, visible on desktop
- **Content Padding**: `md:pl-16` - 64px left padding on desktop (for sidebar)
- **Network Filter**: `gap-1.5 md:gap-2`, `px-2.5 md:px-4`, `text-xs md:text-sm` - Smaller on mobile

---

## Accessibility

### Focus Indicators

- **Ring**: `focus-visible:ring-2 focus-visible:ring-ring`
- **Offset**: `focus-visible:ring-offset-2`
- **Color**: Primary purple

### Screen Reader

- **Hidden Text**: `sr-only` class for icon-only buttons
- **Labels**: Proper `aria-label` attributes on icon buttons

### Color Contrast

- All text meets WCAG contrast requirements
- Primary purple on dark background: High contrast
- Muted text: Sufficient contrast in both themes

---

## Admin Section Specifics

### Theme

- **Forced Light Mode**: `light` class applied to containers
- **No Theme Toggle**: Hidden on `/admin` routes
- **Explicit Colors**: Uses explicit gray/black colors instead of theme variables

### Typography

- **Headers**: `text-2xl font-semibold text-gray-900`
- **Body**: `text-sm text-gray-600`
- **Table Text**: `text-[13px] text-black`

### Spacing

- **Consistent Padding**: `px-8 py-5` for headers
- **Table Padding**: `px-3 py-2.5` or `px-3 py-3`

### Colors

- **Background**: `bg-gray-50`
- **Cards**: `bg-white`
- **Borders**: `border-gray-200`, `border-gray-300`
- **Text**: `text-black`, `text-gray-900`, `text-gray-600`

---

## Notes

### Opacity Values

- **Card Background**: `/50` (50% opacity)
- **Border**: `/50` (50% opacity), `/20` (20% opacity), `/10` (10% opacity)
- **Text**: `/90` (90% opacity), `/80` (80% opacity), `/70` (70% opacity)
- **Muted Text**: `/70` (70% opacity placeholder)
- **Background Orbs**: `opacity: 0.4` (40% opacity)

### Z-Index Layers

- **Background Orbs**: `z-0`
- **Main Content**: `z-10`
- **Sidebar**: `z-40`
- **Modals**: Inherited from Dialog component (typically high z-index)
- **Overlays**: High z-index for voice discovery

### Custom Values

- **Specific Sizes**: `text-[10px]`, `text-[11px]`, `text-[13px]`, `text-[32px]`
- **Specific Widths**: `w-[250px]`, `w-[1550px]`
- **Specific Heights**: `h-[600px]`, `min-h-[60px]`, `max-h-[200px]`
- **Specific Padding**: `px-8`, `py-5`, `p-2.5`
- **Custom Colors**: `#761DE7` (admin primary), `#761DE7` (primary purple), `#761DE7` (orb 1), `#2B0956` (orb 2)

### Animation Durations

- **Fast**: 200ms
- **Medium**: 300ms
- **Slow**: 500ms
- **Infinite**: Spinning, pulsing animations
- **Drift**: 20s (background orbs)

---

## Component-Specific Details

### Profile Card "Why This Match" Section

- **Truncation**: 100 characters, then "Read More..."
- **Keyword Highlighting**: Words > 5 chars or starting with capital letter
- **Highlight Style**: `bg-primary/10 px-0.5 rounded-sm`
- **Read More Button**: `text-xs text-primary hover:text-primary/80 font-medium`

### Network Selection Cards

- **Checkmark**: `h-4 w-4 rounded-full` with white check icon
- **Connection Count**: `text-xs text-muted-foreground`
- **Hover State**: Border and background color changes

### Network Filter Pills

- **Mobile**: `px-2.5 py-1.5`, `text-xs`, `gap-1.5`
- **Desktop**: `px-4 py-2`, `text-sm`, `gap-2`
- **All Networks**: Shows "All" on mobile, "All Networks" on desktop
- **Text Truncation**: `max-w-[120px]` on mobile for long names

### Voice Discovery Input

- **Mode Toggle**: Two buttons, `size="sm"`, `gap-2`
- **Voice Button**: Disabled state, locked for future
- **Text Input**: Full width with microphone/send button on right
- **Transcribing State**: Shows animation in input field, not in chat

### Admin Tables

- **Row Hover**: Subtle background change (if implemented)
- **Sortable Headers**: Cursor pointer, shows arrow indicator
- **Expandable Cells**: Click to expand/collapse long content
- **Status Colors**: Green (success), Yellow (warning), Red (error)

---

This design system ensures consistency across the entire application while maintaining flexibility for theme switching and responsive design, optimized for the dark mode background with animated orbs.
