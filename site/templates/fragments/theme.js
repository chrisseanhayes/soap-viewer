export const theme = {
    colors: {
        // Layout surfaces and borders
        surface: {
            main: "bg-white",
            subtle: "bg-slate-50",
            inset: "bg-slate-100",
            dark: "bg-slate-800",
            border: "border-slate-200",
            borderLight: "border-slate-100",
            borderDark: "border-slate-700",
            overlay: "bg-slate-900/60",
            transparent: "bg-white/90"
        },

        // Typography
        text: {
            h1: "text-slate-900",
            h2: "text-slate-800",
            body: "text-slate-700",
            muted: "text-slate-600",
            light: "text-slate-500",
            placeholder: "text-slate-400",
            inverseTitle: "text-slate-300",
            code: "text-green-400",
            error: "text-red-500",
            brand: "text-blue-700"
        },

        // Interactive / Accents
        interactive: {
            hoverBg: "hover:bg-slate-100",
            hoverBgSubtle: "hover:bg-slate-50",
            hoverText: "hover:text-slate-900",
            hoverTextLight: "hover:text-slate-600",
            btnBg: "bg-slate-100",
            btnHover: "hover:bg-slate-200",
            ring: "focus:ring-blue-500",
            controlBorder: "border-slate-300",
            controlText: "text-blue-600",
            divider: "bg-slate-200"
        },

        // Specific Elements
        badge: {
            bg: "bg-blue-100",
            text: "text-blue-700",
            idBg: "bg-blue-50",
            idText: "text-blue-800",
            idBorder: "border-blue-100"
        },

        // Semantic section colors
        overview: { text: "text-blue-500", icon: "text-blue-500" },
        handledBy: { text: "text-indigo-500", icon: "text-indigo-500" },
        considerations: { text: "text-teal-500", icon: "text-teal-500", bg: "bg-teal-50", border: "border-teal-100" },
        devImpact: { text: "text-purple-500", icon: "text-purple-500", bg: "bg-slate-50", border: "border-slate-100" },
        interaction: { text: "text-green-500", icon: "text-green-500" },
        branching: { text: "text-orange-500", icon: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" },
        
        bigPicture: {
            text: "text-indigo-700",
            icon: "text-indigo-500",
            iconAlt: "text-indigo-400",
            badgeText: "text-indigo-700",
            badgeBg: "bg-indigo-100",
            bg: "bg-indigo-50",
            border: "border-indigo-100",
            headerBorder: "border-indigo-100",
            stepText: "text-indigo-300"
        },
        
        code: { text: "text-emerald-400", icon: "text-emerald-400" },
        
        developerView: { icon: "text-indigo-500", bg: "bg-indigo-50", border: "border-indigo-100" },
        hiddenComplexity: { icon: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
        leakyAbstraction: { icon: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" },
        cicdCallout: { icon: "text-slate-500", bg: "bg-slate-100", border: "border-slate-200" },
        
        langToggle: {
            containerBg: "bg-slate-100",
            containerBorder: "border-slate-200",
            btnActiveBg: "bg-white",
            btnActiveText: "text-blue-700",
            btnInactiveText: "text-slate-600"
        },
        
        definition: {
            pill: "bg-slate-50 text-slate-800 border border-slate-200"
        }
    }
};
