import React from 'react';

interface IconProps {
  className?: string;
  title?: string;
}

interface OverlayIconProps extends IconProps {
  isActive?: boolean;
}

export const AddImageIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor">
        {title && <title>{title}</title>}
        <path d="M19 2.5A1.5 1.5 0 0017.5 1h-15A1.5 1.5 0 001 2.5v15A1.5 1.5 0 002.5 19H10v-2H3.497c-.41 0-.64-.46-.4-.79l3.553-4.051c.19-.21.52-.21.72-.01L9 14l3.06-4.781a.5.5 0 01.84.02l.72 1.251A5.98 5.98 0 0116 10h3V2.5zm-11.5 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm12.207 10.793A1 1 0 0019 15h-2v-2a1 1 0 00-2 0v2h-2a1 1 0 000 2h2v2a1 1 0 102 0v-2h2a1 1 0 00.707-1.707z" />
    </svg>
);


export const AiBotIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={className} xmlSpace="preserve">
        {title && <title>{title}</title>}
        <path style={{fill:"#9ED368"}} d="M512,256.006C512,397.402,397.394,512.004,256.004,512C114.606,512.004,0,397.402,0,256.006	C-0.007,114.61,114.606,0,256.004,0C397.394,0,512,114.614,512,256.006z"/>
        <path style={{fill:"#8BC052"}} d="M512,256.005c0-21.556-2.695-42.478-7.712-62.478c-0.109-0.105-0.21-0.217-0.32-0.32	c-0.541-0.576-91.175-91.212-91.751-91.751c-6.811-7.254-16.413-11.856-27.124-11.856H126.908	c-20.571,0-37.308,16.737-37.308,37.307v258.186c0,10.709,4.599,20.309,11.852,27.12c0.541,0.577,91.179,91.214,91.756,91.756	c0.105,0.112,0.218,0.213,0.323,0.323c19.998,5.015,40.918,7.71,62.473,7.709C397.394,512.004,512,397.401,512,256.005z"/>
        <g>
            <path style={{fill:"#F4F6F9"}} d="M385.092,89.6H126.908c-20.571,0-37.308,16.737-37.308,37.308v258.186		c0,20.57,16.737,37.307,37.308,37.307h258.186c20.57,0,37.307-16.737,37.307-37.308V126.908		C422.4,106.337,405.663,89.6,385.092,89.6z M408.533,385.092c0,12.926-10.515,23.441-23.441,23.441H126.908		c-12.926,0-23.441-10.515-23.441-23.441V126.908c0-12.926,10.515-23.441,23.441-23.441h258.186c12.925,0,23.44,10.515,23.44,23.441		V385.092z"/>
            <path style={{fill:"#F4F6F9"}} d="M229.97,186.667l-43.303,138.667h17.991l12.973-42.998h44.346l13.388,42.998h18.407l-43.092-138.667		H229.97z M220.975,268.752l11.924-38.678c2.513-8.64,4.604-18.103,6.483-26.951h0.634c1.879,8.64,3.97,17.903,6.694,27.158		l12.128,38.471H220.975z"/>
            <path style={{fill:"#F4F6F9"}} d="M321.385,187.283c-6.272,0-10.876,4.729-10.876,11.111c0,6.169,4.393,10.903,10.671,10.903h0.205		c6.693,0,10.882-4.735,10.882-10.903C332.267,192.012,327.874,187.283,321.385,187.283z"/>
            <rect x="312.811" y="225.749" style={{fill:"#F4F6F9"}} width="17.569" height="99.584"/>
        </g>
    </svg>
);

export const TalkToAiIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg fill="currentColor" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 70 70" enable-background="new 0 0 70 70" className={className}>
        {title && <title>{title}</title>}
        <g>
            <path d="M46.857,8.583H24.099c-11.197,0-21.516,9.339-21.516,20.535v0.8c0,9.596,7.292,17.658,16.251,19.77l-0.966,7.311
                c-0.28,1.615,0.606,3.238,2.004,4.095c0.643,0.394,1.442,0.589,2.164,0.589c0.847,0,1.729-0.591,2.438-1.122l14.247-10.977h8.137
                c11.197,0,19.726-8.467,19.726-19.665v-0.8C66.583,17.922,58.055,8.583,46.857,8.583z M62.583,29.918
                c0,9.007-6.721,15.665-15.726,15.665h-9.47L22.112,57.36l1.382-11.295c-9.006,0-16.912-7.141-16.912-16.147v-0.8
                c0-9.005,8.51-16.535,17.516-16.535H46l0.231,0.076c9.006,0,16.352,7.454,16.352,16.459V29.918z"/>
            <path d="M19.441,18.422c0.573-0.098,1.164-0.147,1.756-0.147c0.553,0,1-0.447,1-1s-0.447-1-1-1c-0.704,0-1.407,0.059-2.092,0.175
                c-0.544,0.093-0.91,0.609-0.818,1.154c0.083,0.487,0.507,0.832,0.985,0.832C19.328,18.436,19.385,18.431,19.441,18.422z"/>
            <path d="M16.284,17.092c-4.357,1.95-7.701,6.568-7.701,11.491v0.152c0,0.553,0.447,1,1,1s1-0.447,1-1v-0.152
                c0-4.147,2.816-8.032,6.464-9.665c0.505-0.226,0.887-0.817,0.661-1.321C17.482,17.093,16.786,16.867,16.284,17.092z"/>
            <path d="M23.361,26.247c-2.481,0-4.5,2.019-4.5,4.5s2.019,4.5,4.5,4.5s4.5-2.019,4.5-4.5S25.843,26.247,23.361,26.247z
                 M23.361,33.247c-1.379,0-2.5-1.121-2.5-2.5s1.121-2.5,2.5-2.5s2.5,1.121,2.5,2.5S24.74,33.247,23.361,33.247z"/>
            <path d="M35.361,26.247c-2.481,0-4.5,2.019-4.5,4.5s2.019,4.5,4.5,4.5s4.5-2.019,4.5-4.5S37.843,26.247,35.361,26.247z
                 M35.361,33.247c-1.379,0-2.5-1.121-2.5-2.5s1.121-2.5,2.5-2.5s2.5,1.121,2.5,2.5S36.74,33.247,35.361,33.247z"/>
            <path d="M47.361,26.247c-2.481,0-4.5,2.019-4.5,4.5s2.019,4.5,4.5,4.5s4.5-2.019,4.5-4.5S49.843,26.247,47.361,26.247z
                 M47.361,33.247c-1.379,0-2.5-1.121-2.5-2.5s1.121-2.5,2.5-2.5s2.5,1.121,2.5,2.5S48.74,33.247,47.361,33.247z"/>
        </g>
    </svg>
);

export const EditDrawerIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {title && <title>{title}</title>}
        <path d="M20.4445 6.88859C18.7779 7.4441 16.5559 5.22205 17.1114 3.55551M16.9766 3.6903L13.3862 7.28073C11.8253 8.84163 10.718 10.7974 10.1826 12.9389L10.0091 13.6329C9.95503 13.8491 10.1509 14.045 10.3671 13.9909L11.0611 13.8174C13.2026 13.282 15.1584 12.1747 16.7193 10.6138L20.3097 7.02338C20.7517 6.58139 21 5.98192 21 5.35684C21 4.05519 19.9448 3 18.6432 3C18.0181 3 17.4186 3.24831 16.9766 3.6903Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 3C10.9767 3 9.95334 3.11763 8.95043 3.35288C6.17301 4.00437 4.00437 6.17301 3.35288 8.95043C2.88237 10.9563 2.88237 13.0437 3.35288 15.0496C4.00437 17.827 6.17301 19.9956 8.95044 20.6471C10.9563 21.1176 13.0437 21.1176 15.0496 20.6471C17.827 19.9956 19.9956 17.827 20.6471 15.0496C20.8824 14.0466 21 13.0233 21 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
);


export const FrameIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        {title && <title>{title}</title>}
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
    </svg>
);

export const FeedIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        {title && <title>{title}</title>}
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.00216 8.29141V18.2514C5.00216 19.7614 6.24216 21.0014 7.75216 21.0014H16.2522C17.7622 21.0014 19.0022 19.7614 19.0022 18.2514V8.29141L13.1422 3.17141C12.4222 2.53141 11.4122 2.53141 10.6922 3.17141L5.00216 8.29141Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.0023 15.251H9.00234" />
    </svg>
);

export const CurrencyDollarIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 11.21 12.75 11 12 11c-.75 0-1.536.21-2.121.558l-1.061.794a2.25 2.25 0 01-3.182 0l-.879-.659m7.5 0a2.25 2.25 0 00-3.182 0l-.879.659" />
    </svg>
);

export const LanguageIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C13.18 7.061 14.289 7.5 15.5 7.5c1.211 0 2.32-.439 3.166-1.136m0-1.414A48.664 48.664 0 0118 7.5c-2.636 0-5.143-.306-7.5-1.025m0 0V3m-3.5 18c-2.836 0-5.433-.34-7.5-1.025m0 0V3" />
    </svg>
);

export const CrossPostIcon: React.FC<IconProps> = ({ className = "w-5 h-5", title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);


export const GenerateIcon: React.FC<IconProps> = ({ className = "w-5 h-5", title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.875 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12a6.375 6.375 0 11-12.75 0 6.375 6.375 0 0112.75 0z" />
  </svg>
);

export const DownloadIcon: React.FC<IconProps> = ({ className = "w-5 h-5", title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export const DownloadAllIcon: React.FC<IconProps> = ({ className = "w-5 h-5", title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 13.5l3 3m0 0l3-3m-3 3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
);


export const TrashIcon: React.FC<IconProps> = ({ className = "w-5 h-5", title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09.92-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

export const SunIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.95-4.243l-1.59-1.59M3.75 12H6m4.243-4.95l1.59-1.59" />
  </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);

export const PaletteIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
        {title && <title>{title}</title>}
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402a3.75 3.75 0 00-.625-6.25a3.75 3.75 0 00-6.25-.625l-6.402 6.401a3.75 3.75 0 000 5.304m7.496-9.75l-6.402 6.402a3.75 3.75 0 000 5.304l6.402-6.402a3.75 3.75 0 00-5.304-5.304z" />
    </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const ChevronUpIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        {title && <title>{title}</title>}
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        {title && <title>{title}</title>}
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);
  
export const ChevronRightIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);

export const ChevronDoubleLeftIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
  </svg>
);

export const DocumentTextIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
        {title && <title>{title}</title>}
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

const baseOverlayIconClasses = "w-8 h-8 p-1 rounded-md transition-colors";
const activeOverlayIconClasses = "bg-blue-500 text-white";
const inactiveOverlayIconClasses = "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700";

export const OverlayTopIcon: React.FC<OverlayIconProps> = ({ isActive, title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${baseOverlayIconClasses} ${isActive ? activeOverlayIconClasses : inactiveOverlayIconClasses}`}>
    {title && <title>{title}</title>}
    <path d="M4 3h16v6H4V3zm0 18v-2h16v2H4zM4 15V11h16v4H4z" opacity="0.3"/><path d="M4 3h16v6H4V3z"/>
  </svg>
);
export const OverlayBottomIcon: React.FC<OverlayIconProps> = ({ isActive, title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${baseOverlayIconClasses} ${isActive ? activeOverlayIconClasses : inactiveOverlayIconClasses}`}>
    {title && <title>{title}</title>}
    <path d="M4 3h16v2H4V3zm0 4h16v4H4V7zM4 15h16v6H4v-6z" opacity="0.3"/><path d="M4 15h16v6H4v-6z"/>
  </svg>
);
export const OverlayLeftIcon: React.FC<OverlayIconProps> = ({ isActive, title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${baseOverlayIconClasses} ${isActive ? activeOverlayIconClasses : inactiveOverlayIconClasses}`}>
    {title && <title>{title}</title>}
    <path d="M21 4v16h-2V4h2zM17 4H5v16h12V4zm-4 0H3v16h4V4z" opacity="0.3"/><path d="M3 4h6v16H3V4z"/>
  </svg>
);
export const OverlayRightIcon: React.FC<OverlayIconProps> = ({ isActive, title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${baseOverlayIconClasses} ${isActive ? activeOverlayIconClasses : inactiveOverlayIconClasses}`}>
    {title && <title>{title}</title>}
    <path d="M3 4v16h2V4H3zm4 0h12v16H7V4zm10 0h4v16h-4V4z" opacity="0.3"/><path d="M15 4h6v16h-6V4z"/>
  </svg>
);

export const EditIcon: React.FC<IconProps> = ({ className = "w-5 h-5", title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

export const UploadIcon: React.FC<IconProps> = ({ className = "w-5 h-5", title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

export const CollageIcon: React.FC<IconProps> = ({ className = "w-5 h-5", title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);

export const RefreshIcon: React.FC<IconProps> = ({ className = "w-5 h-5", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-11.664 0l3.181-3.183a8.25 8.25 0 0111.664 0l3.181 3.183" />
    </svg>
);

export const MenuIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className={className}>
        {title && <title>{title}</title>}
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

export const BellIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
        {title && <title>{title}</title>}
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
        {title && <title>{title}</title>}
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const XCircleIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
        {title && <title>{title}</title>}
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const InformationCircleIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
        {title && <title>{title}</title>}
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const SortDescendingIcon: React.FC<IconProps> = ({ className = "w-5 h-5", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        {title && <title>{title}</title>}
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
    </svg>
);

export const ClipboardListIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
        {title && <title>{title}</title>}
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export const ThumbsUpIcon: React.FC<IconProps> = ({ className = "w-5 h-5", title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.25a2.25 2.25 0 01-2.25-2.25v-2.5a2.25 2.25 0 012.25-2.25h1.383z" />
  </svg>
);

export const ChatBubbleIcon: React.FC<IconProps> = ({ className = "w-5 h-5", title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.435l-4.285 1.297a.75.75 0 01-.927-.927l1.297-4.285A9.764 9.764 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  </svg>
);

export const ChatBubbleLeftRightIcon: React.FC<IconProps> = ({ className = "w-5 h-5", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        {title && <title>{title}</title>}
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.537a5.25 5.25 0 01-4.494-2.298l-2.034-3.05a.75.75 0 00-1.238 0l-2.034 3.05a5.25 5.25 0 01-4.494 2.298l-3.722-.537A2.25 2.25 0 012.25 15v-4.286c0-.97.616-1.813 1.5-2.097m16.5 0a2.25 2.25 0 00-1.88-2.097l-3.722-.537a5.25 5.25 0 00-4.494 2.298l-2.034 3.05a.75.75 0 01-1.238 0l-2.034-3.05a5.25 5.25 0 00-4.494-2.298L3.187 6.411A2.25 2.25 0 001.5 8.511" />
    </svg>
);

export const ChatBubbleBottomCenterTextIcon: React.FC<IconProps> = ({ className = "w-5 h-5", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
);

export const EyeIcon: React.FC<IconProps> = ({ className = "w-5 h-5", title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const KeyIcon: React.FC<IconProps> = ({ className = "w-5 h-5", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        {title && <title>{title}</title>}
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
);

export const Cog6ToothIcon: React.FC<IconProps> = ({ className = "w-5 h-5", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.242 1.417l-1.07 1.07c-.108.108-.186.244-.223.386a4.492 4.492 0 010 .98c.037.142.115.278.223.386l1.07 1.07c.484.483.633 1.16.242 1.417l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.332.183-.582.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.242-1.417l1.07-1.07c.108-.108.186-.244.223.386a4.492 4.492 0 010-.98 4.492 4.492 0 01-.223-.386l-1.07-1.07a1.125 1.125 0 01-.242-1.417l1.296-2.247a1.125 1.125 0 011.37.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.213-1.28z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const ShieldCheckIcon: React.FC<IconProps> = ({ className = "w-5 h-5", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM14.898 6.44a.75.75 0 00-1.22-.872l-3.236 4.53L8.442 8.23a.75.75 0 00-1.114 1.004l2.25 2.5a.75.75 0 001.114 0l3.75-5.25z" clipRule="evenodd" />
    </svg>
  );

export const ClipboardIcon: React.FC<IconProps> = ({ className = "w-5 h-5", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export const UserGroupIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 00-12 0m12 0a9.094 9.094 0 00-12 0m12 0A9.094 9.094 0 0112 21a9.094 9.094 0 01-6-2.28m12 0A9.094 9.094 0 0012 3a9.094 9.094 0 00-6 2.28M15 9.75a3 3 0 11-6 0 3 3 0 016 0zm-9.75 4.5a3 3 0 11-6 0 3 3 0 016 0zm19.5 0a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const LockClosedIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      {title && <title>{title}</title>}
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
);

export const ArrowLeftOnRectangleIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-3 0l-3-3m0 0l3-3m-3 3h12.75" />
  </svg>
);

export const EyeSlashIcon: React.FC<IconProps> = ({ className = "w-5 h-5", title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243" />
  </svg>
);

export const MapPinIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
);

export const TagIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
);

export const SparklesIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.875 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12a6.375 6.375 0 11-12.75 0 6.375 6.375 0 0112.75 0z" />
    </svg>
);

export const HashtagIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
    </svg>
);

export const NewsIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        {title && <title>{title}</title>}
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
    </svg>
);

export const FacebookIcon: React.FC<IconProps> = ({ className = "w-6 h-6", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        {title && <title>{title}</title>}
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
);

export const UserCircleIcon: React.FC<IconProps> = ({ className = "w-5 h-5", title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        {title && <title>{title}</title>}
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
