export const cls = {
    // App & Layout
    appContainer: "max-w-7xl mx-auto px-4 py-8 space-y-12 animate-fade-in",
    appHeader: "text-center space-y-4",
    appTitle: "text-4xl font-extrabold text-slate-900 tracking-tight",
    appSubtitle: "text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed",
    appLangToggleContainer: "flex justify-center mt-6",
    appLangToggleInner: "inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200",
    appRootLoading: "text-center text-slate-400 py-20",
    diagramLayout: "flex flex-col lg:flex-row gap-6 h-[75vh] min-h-[600px]",
    diagramMain: "mermaid-container w-full lg:w-3/4 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden relative",
    diagramSidebar: "w-full lg:w-1/4 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col h-full",
    
    // Zoom Controls
    zoomControlContainer: "absolute bottom-4 right-4 z-20 flex bg-white/90 shadow-sm border border-slate-200 rounded-md p-1 backdrop-blur-sm gap-1",
    zoomBtn: "custom-zoom-btn flex items-center justify-center w-8 h-8 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors",
    zoomDivider: "w-px bg-slate-200 mx-0.5 my-1",
    zoomDropdownGroup: "relative group flex items-center",
    zoomDropdownToggle: "flex items-center justify-center px-2 min-w-[3rem] h-8 text-xs font-semibold rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors",
    zoomDropdownIcon: "w-3 h-3 ml-1",
    zoomDropdownMenu: "absolute bottom-full right-0 pb-1 hidden group-hover:block z-50",
    zoomDropdownMenuInner: "w-36 bg-white border border-slate-200 rounded-md shadow-lg py-1",
    zoomMenuBtn: "custom-zoom-btn w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    zoomMenuDivider: "h-px bg-slate-200 my-1 mx-2",
    zoomMenuLabel: "flex items-center w-full px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer",
    zoomMenuCheckbox: "mr-2 rounded border-slate-300 text-blue-600 focus:ring-blue-500",

    // Sidebar Shell
    sidebarHeader: "p-4 border-b border-slate-100 bg-slate-50 rounded-t-lg",
    sidebarTitle: "text-lg font-bold text-slate-800 flex items-center gap-2",
    sidebarTitleIcon: "w-5 h-5 text-blue-600 flex-shrink-0",
    sidebarTitleText: "truncate",
    sidebarLangBadge: "ml-auto text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full flex-shrink-0",
    sidebarContent: "p-6 flex-grow overflow-y-auto",
    sidebarFooter: "p-4 border-t border-slate-100 bg-slate-50 rounded-b-lg flex justify-between items-center",
    sidebarNavBtn: "text-sm px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
    sidebarNavCounter: "text-xs text-slate-500 font-medium whitespace-nowrap px-2",

    // Sidebar Detail (Node Info)
    detailContainer: "animate-fade-in space-y-4",
    detailHeader: "border-b border-slate-200 pb-3",
    detailTitle: "text-2xl font-bold text-blue-700",
    detailIdBadge: "inline-flex items-center mt-2 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-100",
    detailSection: "mb-4",
    sectionTitleBase: "text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1",
    sectionBodyBase: "text-slate-700 leading-relaxed text-sm",

    // Sidebar Big Picture
    bpContainer: "animate-fade-in space-y-4",
    bpHeader: "border-b border-indigo-100 pb-3",
    bpBadgeContainer: "flex items-center gap-2 mb-1",
    bpBadge: "text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide",
    bpTitle: "text-lg font-bold",
    bpRole: "text-sm font-semibold text-slate-600 mt-1",
    bpSectionTitle: "text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1",
    bpSectionBody: "text-slate-700 leading-relaxed text-sm",

    // Modal
    modalOverlay: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm",
    modalContent: "bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative",
    modalCloseBtn: "absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors",
    modalTitle: "text-xl font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2",
    modalBody: "text-slate-600 leading-relaxed text-sm",
    modalFooter: "mt-6 flex justify-end",
    modalActionBtn: "px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors",

    // Typography & Blocks
    codeBlock: "bg-slate-800 text-green-400 p-4 rounded-md text-sm overflow-x-auto font-mono shadow-inner",
    codeBlockSm: "bg-slate-800 text-green-400 p-4 rounded-md text-xs overflow-x-auto font-mono shadow-inner",
    codeSnippetContainer: "bg-slate-800 p-4 rounded-lg border border-slate-700 mt-5 shadow-inner",
    codeSnippetTitle: "text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2",
    codeSnippetText: "font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all",
    pill: "inline-flex items-center mt-2 px-2.5 py-0.5 rounded-md text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity",
    
    // Callouts (Structural only)
    calloutBase: "p-3 rounded-lg border",
    calloutFlex: "mt-4 p-4 rounded-lg border flex items-start gap-3",
    calloutTitle: "text-slate-900 block mb-1",
    journeyStepCard: "bg-slate-800 px-4 py-3 rounded-lg flex items-start gap-3",
    journeyStepText: "text-xs font-mono leading-relaxed",
    
    // Content Sections
    sectionCard: "bg-white p-6 rounded-lg shadow-sm border border-slate-200",
    sectionHeading: "text-xl font-semibold mb-4 text-slate-800",
    sectionHeadingIcon: "text-xl font-semibold mb-4 text-slate-800 flex items-center gap-2",
    sectionGrid: "grid md:grid-cols-2 gap-6 text-sm text-slate-600",
    sectionSubheading: "font-bold text-slate-800 mb-2 border-b pb-1",
    sectionTextSpace: "text-sm text-slate-600 space-y-4",
    sectionGridInner: "grid md:grid-cols-2 gap-6 mt-4",
    sectionBulletList: "list-disc pl-5 space-y-1.5 text-sm",
    
    // Lang Controls
    langBtnActive: "lang-btn px-3 py-1.5 text-xs font-semibold rounded-md transition-all bg-white shadow-sm text-blue-700",
    langBtnInactive: "lang-btn px-3 py-1.5 text-xs font-semibold rounded-md transition-all text-slate-600",
    facadeContainerActive: "facade-code",
    facadeContainerInactive: "facade-code hidden",
    toolingContainerActive: "tooling-content mt-6 animate-fade-in",
    toolingContainerInactive: "tooling-content hidden mt-6 animate-fade-in",
    toolingCard: "bg-slate-50 p-5 rounded-lg border border-slate-200",
    toolingTitle: "font-bold text-slate-800 mb-2 flex items-center gap-2",
    toolingBody: "mb-3",

    // Error State
    errorContainer: "text-center py-20 text-red-500",
    errorTitle: "font-bold text-lg",
    errorMessage: "text-sm mt-2",
    errorHint: "text-xs mt-1 text-slate-500",

    // Placeholder
    placeholderContainer: "h-full flex flex-col items-center justify-center text-center text-slate-400",
    placeholderIcon: "w-12 h-12 mb-4 text-slate-300 animate-pulse",
    placeholderText: "text-sm"
};
