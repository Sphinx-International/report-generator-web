interface sideBarItem {
  title: string;
  svg: string;
  activeSvg: string;
  link: string;
  access: "admin" | "all";
  subItem?: sideBarItem[];
}

export const sideBarTab: sideBarItem[] = [
  {
    title: "Dashboard",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" fill="none">
<path d="M1.875 1.47437V16.1619H19.0625C19.3111 16.1619 19.5496 16.2606 19.7254 16.4365C19.9012 16.6123 20 16.8507 20 17.0994C20 17.348 19.9012 17.5865 19.7254 17.7623C19.5496 17.9381 19.3111 18.0369 19.0625 18.0369H0.9375C0.68886 18.0369 0.450403 17.9381 0.274587 17.7623C0.098772 17.5865 0 17.348 0 17.0994L0 1.47437C0 1.22572 0.098772 0.987268 0.274587 0.811453C0.450403 0.635637 0.68886 0.536865 0.9375 0.536865C1.18614 0.536865 1.4246 0.635637 1.60041 0.811453C1.77623 0.987268 1.875 1.22572 1.875 1.47437ZM19.725 4.63687L13.1625 11.1994C12.9867 11.3749 12.7484 11.4735 12.5 11.4735C12.2516 11.4735 12.0133 11.3749 11.8375 11.1994L8.75 8.11187L5.35 11.5119C5.17217 11.6774 4.93711 11.7675 4.69421 11.7633C4.45132 11.7591 4.2195 11.6609 4.0475 11.4894C3.87595 11.3174 3.77775 11.0855 3.77356 10.8427C3.76936 10.5998 3.85949 10.3647 4.025 10.1869L8.0875 6.12436C8.26328 5.9488 8.50156 5.85019 8.75 5.85019C8.99844 5.85019 9.23672 5.9488 9.4125 6.12436L12.5 9.21187L18.4 3.31187C18.5778 3.14635 18.8129 3.05623 19.0558 3.06042C19.2987 3.06462 19.5305 3.16281 19.7025 3.33437C19.8741 3.50637 19.9722 3.73818 19.9764 3.98108C19.9806 4.22397 19.8905 4.45904 19.725 4.63687Z" fill="#6F6C90"/>
</svg>`,
    activeSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" fill="none">
<path d="M1.875 1.47437V16.1619H19.0625C19.3111 16.1619 19.5496 16.2606 19.7254 16.4365C19.9012 16.6123 20 16.8507 20 17.0994C20 17.348 19.9012 17.5865 19.7254 17.7623C19.5496 17.9381 19.3111 18.0369 19.0625 18.0369H0.9375C0.68886 18.0369 0.450403 17.9381 0.274587 17.7623C0.098772 17.5865 0 17.348 0 17.0994L0 1.47437C0 1.22572 0.098772 0.987268 0.274587 0.811453C0.450403 0.635637 0.68886 0.536865 0.9375 0.536865C1.18614 0.536865 1.4246 0.635637 1.60041 0.811453C1.77623 0.987268 1.875 1.22572 1.875 1.47437ZM19.725 4.63687L13.1625 11.1994C12.9867 11.3749 12.7484 11.4735 12.5 11.4735C12.2516 11.4735 12.0133 11.3749 11.8375 11.1994L8.75 8.11187L5.35 11.5119C5.17217 11.6774 4.93711 11.7675 4.69421 11.7633C4.45132 11.7591 4.2195 11.6609 4.0475 11.4894C3.87595 11.3174 3.77775 11.0855 3.77356 10.8427C3.76936 10.5998 3.85949 10.3647 4.025 10.1869L8.0875 6.12436C8.26328 5.9488 8.50156 5.85019 8.75 5.85019C8.99844 5.85019 9.23672 5.9488 9.4125 6.12436L12.5 9.21187L18.4 3.31187C18.5778 3.14635 18.8129 3.05623 19.0558 3.06042C19.2987 3.06462 19.5305 3.16281 19.7025 3.33437C19.8741 3.50637 19.9722 3.73818 19.9764 3.98108C19.9806 4.22397 19.8905 4.45904 19.725 4.63687Z" fill="#4A3AFF"/>
</svg>`,
    link: "/dashboard",
    access: "admin",
  },
  {
    title: "Users",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
<path d="M8.73499 9.02187C7.53394 9.02187 6.50576 8.59421 5.65045 7.73892C4.79516 6.88361 4.3675 5.85542 4.3675 4.65436C4.3675 3.45331 4.79516 2.42511 5.65045 1.56982C6.50576 0.714517 7.53394 0.286865 8.73499 0.286865C9.93606 0.286865 10.9642 0.714517 11.8195 1.56982C12.6748 2.42511 13.1025 3.45331 13.1025 4.65436C13.1025 5.85542 12.6748 6.88361 11.8195 7.73892C10.9642 8.59421 9.93606 9.02187 8.73499 9.02187ZM0 17.7569V14.6996C0 14.0809 0.159232 13.5122 0.477695 12.9936C0.796158 12.4749 1.21926 12.0791 1.747 11.8061C2.87527 11.242 4.02174 10.8189 5.18641 10.5368C6.35108 10.2548 7.53394 10.1137 8.73499 10.1137C9.93606 10.1137 11.1189 10.2548 12.2836 10.5368C13.4483 10.8189 14.5947 11.242 15.723 11.8061C16.2507 12.0791 16.6738 12.4749 16.9923 12.9936C17.3108 13.5122 17.47 14.0809 17.47 14.6996V17.7569H0ZM2.18374 15.5731H15.2862V14.6996C15.2862 14.4994 15.2362 14.3175 15.1361 14.1537C15.036 13.9899 14.9041 13.8625 14.7403 13.7715C13.7576 13.2802 12.7658 12.9117 11.7649 12.666C10.7641 12.4203 9.75408 12.2975 8.73499 12.2975C7.71592 12.2975 6.70593 12.4203 5.70504 12.666C4.70417 12.9117 3.71238 13.2802 2.72969 13.7715C2.56591 13.8625 2.43396 13.9899 2.33389 14.1537C2.2338 14.3175 2.18374 14.4994 2.18374 14.6996V15.5731ZM8.73499 6.8381C9.33553 6.8381 9.84962 6.62429 10.2773 6.19663C10.7049 5.76899 10.9188 5.2549 10.9188 4.65436C10.9188 4.05382 10.7049 3.53975 10.2773 3.11209C9.84962 2.68444 9.33553 2.47062 8.73499 2.47062C8.13447 2.47062 7.62038 2.68444 7.19272 3.11209C6.76507 3.53975 6.55125 4.05382 6.55125 4.65436C6.55125 5.2549 6.76507 5.76899 7.19272 6.19663C7.62038 6.62429 8.13447 6.8381 8.73499 6.8381Z" fill="#6F6C8F"s"/>
</svg>`,
    activeSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
<path d="M8.73499 9.02187C7.53394 9.02187 6.50576 8.59421 5.65045 7.73892C4.79516 6.88361 4.3675 5.85542 4.3675 4.65436C4.3675 3.45331 4.79516 2.42511 5.65045 1.56982C6.50576 0.714517 7.53394 0.286865 8.73499 0.286865C9.93606 0.286865 10.9642 0.714517 11.8195 1.56982C12.6748 2.42511 13.1025 3.45331 13.1025 4.65436C13.1025 5.85542 12.6748 6.88361 11.8195 7.73892C10.9642 8.59421 9.93606 9.02187 8.73499 9.02187ZM0 17.7569V14.6996C0 14.0809 0.159232 13.5122 0.477695 12.9936C0.796158 12.4749 1.21926 12.0791 1.747 11.8061C2.87527 11.242 4.02174 10.8189 5.18641 10.5368C6.35108 10.2548 7.53394 10.1137 8.73499 10.1137C9.93606 10.1137 11.1189 10.2548 12.2836 10.5368C13.4483 10.8189 14.5947 11.242 15.723 11.8061C16.2507 12.0791 16.6738 12.4749 16.9923 12.9936C17.3108 13.5122 17.47 14.0809 17.47 14.6996V17.7569H0ZM2.18374 15.5731H15.2862V14.6996C15.2862 14.4994 15.2362 14.3175 15.1361 14.1537C15.036 13.9899 14.9041 13.8625 14.7403 13.7715C13.7576 13.2802 12.7658 12.9117 11.7649 12.666C10.7641 12.4203 9.75408 12.2975 8.73499 12.2975C7.71592 12.2975 6.70593 12.4203 5.70504 12.666C4.70417 12.9117 3.71238 13.2802 2.72969 13.7715C2.56591 13.8625 2.43396 13.9899 2.33389 14.1537C2.2338 14.3175 2.18374 14.4994 2.18374 14.6996V15.5731ZM8.73499 6.8381C9.33553 6.8381 9.84962 6.62429 10.2773 6.19663C10.7049 5.76899 10.9188 5.2549 10.9188 4.65436C10.9188 4.05382 10.7049 3.53975 10.2773 3.11209C9.84962 2.68444 9.33553 2.47062 8.73499 2.47062C8.13447 2.47062 7.62038 2.68444 7.19272 3.11209C6.76507 3.53975 6.55125 4.05382 6.55125 4.65436C6.55125 5.2549 6.76507 5.76899 7.19272 6.19663C7.62038 6.62429 8.13447 6.8381 8.73499 6.8381Z" fill="#4A3AFF"s"/>
</svg>`,
    link: "/users",
    access: "admin",
  },
  {
    title: "Workorders",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="23" height="24" viewBox="0 0 23 24" fill="none">
<path d="M21.0837 5.8776C21.0837 4.82344 20.2212 3.96094 19.167 3.96094H3.83366C2.77949 3.96094 1.91699 4.82344 1.91699 5.8776V17.3776C1.91699 18.4318 2.77949 19.2943 3.83366 19.2943H19.167C20.2212 19.2943 21.0837 18.4318 21.0837 17.3776V5.8776ZM19.167 5.8776L11.5003 10.6693L3.83366 5.8776H19.167ZM19.167 17.3776H3.83366V7.79427L11.5003 12.5859L19.167 7.79427V17.3776Z" fill="#6F6C8F"/>
</svg>`,
    activeSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="23" height="24" viewBox="0 0 23 24" fill="none">
<path d="M21.0837 5.8776C21.0837 4.82344 20.2212 3.96094 19.167 3.96094H3.83366C2.77949 3.96094 1.91699 4.82344 1.91699 5.8776V17.3776C1.91699 18.4318 2.77949 19.2943 3.83366 19.2943H19.167C20.2212 19.2943 21.0837 18.4318 21.0837 17.3776V5.8776ZM19.167 5.8776L11.5003 10.6693L3.83366 5.8776H19.167ZM19.167 17.3776H3.83366V7.79427L11.5003 12.5859L19.167 7.79427V17.3776Z" fill="#4A3AFF"/>
</svg>`,
    link: "/missions",
    access: "all",
  },

  {
    title: "Emails",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="23" viewBox="0 0 22 23" fill="none">
<g clip-path="url(#clip0_234_730)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.75 2.12012C14.0718 2.12013 14.388 2.20484 14.6667 2.36575C14.9454 2.52666 15.1768 2.75809 15.3377 3.03678H16.5C16.9863 3.03678 17.4526 3.22994 17.7964 3.57375C18.1402 3.91757 18.3334 4.38389 18.3334 4.87012V15.8701C18.3334 17.0857 17.8505 18.2515 16.9909 19.111C16.1314 19.9706 14.9656 20.4535 13.75 20.4535H5.50002C5.01379 20.4535 4.54747 20.2603 4.20366 19.9165C3.85984 19.5727 3.66669 19.1063 3.66669 18.6201V4.87012C3.66669 4.38389 3.85984 3.91757 4.20366 3.57375C4.54747 3.22994 5.01379 3.03678 5.50002 3.03678H6.66235C6.82326 2.75809 7.05469 2.52666 7.33338 2.36575C7.61207 2.20484 7.92821 2.12013 8.25002 2.12012H13.75ZM6.41669 4.87012H5.50002V18.6201H13.75C14.4794 18.6201 15.1788 18.3304 15.6946 17.8147C16.2103 17.2989 16.5 16.5995 16.5 15.8701V4.87012H15.5834C15.5834 5.35635 15.3902 5.82266 15.0464 6.16648C14.7026 6.5103 14.2363 6.70345 13.75 6.70345H8.25002C7.76379 6.70345 7.29747 6.5103 6.95366 6.16648C6.60984 5.82266 6.41669 5.35635 6.41669 4.87012ZM14.8849 8.8842C15.0567 9.0561 15.1532 9.28922 15.1532 9.53228C15.1532 9.77535 15.0567 10.0085 14.8849 10.1804L10.3474 14.7179C10.1755 14.8897 9.94234 14.9863 9.69927 14.9863C9.4562 14.9863 9.22309 14.8897 9.05119 14.7179L7.10785 12.7727C6.94488 12.5992 6.85582 12.369 6.85952 12.131C6.86321 11.8929 6.95938 11.6656 7.12766 11.4972C7.29595 11.3288 7.52315 11.2325 7.76119 11.2287C7.99923 11.2248 8.22944 11.3137 8.4031 11.4765L9.70019 12.7727L13.5887 8.8842C13.7606 8.71235 13.9937 8.61581 14.2368 8.61581C14.4798 8.61581 14.713 8.71235 14.8849 8.8842ZM13.75 3.95345H8.25002V4.87012H13.75V3.95345Z" fill="#6F6C8F"/>
</g>
<defs>
<clipPath id="clip0_234_730">
<rect width="22" height="22" fill="white" transform="translate(0 0.286621)"/>
</clipPath>
</defs>
</svg>`,
    activeSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="23" viewBox="0 0 22 23" fill="none">
<g clip-path="url(#clip0_234_730)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.75 2.12012C14.0718 2.12013 14.388 2.20484 14.6667 2.36575C14.9454 2.52666 15.1768 2.75809 15.3377 3.03678H16.5C16.9863 3.03678 17.4526 3.22994 17.7964 3.57375C18.1402 3.91757 18.3334 4.38389 18.3334 4.87012V15.8701C18.3334 17.0857 17.8505 18.2515 16.9909 19.111C16.1314 19.9706 14.9656 20.4535 13.75 20.4535H5.50002C5.01379 20.4535 4.54747 20.2603 4.20366 19.9165C3.85984 19.5727 3.66669 19.1063 3.66669 18.6201V4.87012C3.66669 4.38389 3.85984 3.91757 4.20366 3.57375C4.54747 3.22994 5.01379 3.03678 5.50002 3.03678H6.66235C6.82326 2.75809 7.05469 2.52666 7.33338 2.36575C7.61207 2.20484 7.92821 2.12013 8.25002 2.12012H13.75ZM6.41669 4.87012H5.50002V18.6201H13.75C14.4794 18.6201 15.1788 18.3304 15.6946 17.8147C16.2103 17.2989 16.5 16.5995 16.5 15.8701V4.87012H15.5834C15.5834 5.35635 15.3902 5.82266 15.0464 6.16648C14.7026 6.5103 14.2363 6.70345 13.75 6.70345H8.25002C7.76379 6.70345 7.29747 6.5103 6.95366 6.16648C6.60984 5.82266 6.41669 5.35635 6.41669 4.87012ZM14.8849 8.8842C15.0567 9.0561 15.1532 9.28922 15.1532 9.53228C15.1532 9.77535 15.0567 10.0085 14.8849 10.1804L10.3474 14.7179C10.1755 14.8897 9.94234 14.9863 9.69927 14.9863C9.4562 14.9863 9.22309 14.8897 9.05119 14.7179L7.10785 12.7727C6.94488 12.5992 6.85582 12.369 6.85952 12.131C6.86321 11.8929 6.95938 11.6656 7.12766 11.4972C7.29595 11.3288 7.52315 11.2325 7.76119 11.2287C7.99923 11.2248 8.22944 11.3137 8.4031 11.4765L9.70019 12.7727L13.5887 8.8842C13.7606 8.71235 13.9937 8.61581 14.2368 8.61581C14.4798 8.61581 14.713 8.71235 14.8849 8.8842ZM13.75 3.95345H8.25002V4.87012H13.75V3.95345Z" fill="#4A3AFF"/>
</g>
<defs>
<clipPath id="clip0_234_730">
<rect width="22" height="22" fill="white" transform="translate(0 0.286621)"/>
</clipPath>
</defs>
</svg>`,
    link: "/mails",
    access: "admin",
    subItem: [
      {
        title: "Individuals",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
<g clip-path="url(#clip0_1651_3486)">
<path d="M9 7.50781C10.6569 7.50781 12 6.16467 12 4.50781C12 2.85096 10.6569 1.50781 9 1.50781C7.34315 1.50781 6 2.85096 6 4.50781C6 6.16467 7.34315 7.50781 9 7.50781Z" stroke="#6F6C8F" stroke-width="1.8"/>
<path d="M14.9985 13.5078C14.9995 13.3848 15 13.2598 15 13.1328C15 11.2691 12.3135 9.75781 9 9.75781C5.6865 9.75781 3 11.2691 3 13.1328C3 14.9966 3 16.5078 9 16.5078C10.6732 16.5078 11.88 16.3901 12.75 16.1801" stroke="#6F6C8F" stroke-width="1.8" stroke-linecap="round"/>
</g>
<defs>
<clipPath id="clip0_1651_3486">
<rect width="18" height="18" fill="white" transform="translate(0 0.0078125)"/>
</clipPath>
</defs>
</svg>`,
        activeSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
<g clip-path="url(#clip0_1651_3486)">
<path d="M9 7.50781C10.6569 7.50781 12 6.16467 12 4.50781C12 2.85096 10.6569 1.50781 9 1.50781C7.34315 1.50781 6 2.85096 6 4.50781C6 6.16467 7.34315 7.50781 9 7.50781Z" stroke="#6F6C8F" stroke-width="1.8"/>
<path d="M14.9985 13.5078C14.9995 13.3848 15 13.2598 15 13.1328C15 11.2691 12.3135 9.75781 9 9.75781C5.6865 9.75781 3 11.2691 3 13.1328C3 14.9966 3 16.5078 9 16.5078C10.6732 16.5078 11.88 16.3901 12.75 16.1801" stroke="#4A3AFF" stroke-width="1.8" stroke-linecap="round"/>
</g>
<defs>
<clipPath id="clip0_1651_3486">
<rect width="18" height="18" fill="white" transform="translate(0 0.0078125)"/>
</clipPath>
</defs>
</svg>`,
        link: "/mails/individuals",
        access: "admin",
      },




      {
        title: "Groups",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
<path d="M11.2498 14.3538C11.8895 14.5394 12.5524 14.6333 13.2185 14.6328C14.2899 14.6354 15.3475 14.391 16.3093 13.9188C16.3113 13.8758 16.3123 13.8326 16.3123 13.7891C16.3123 13.1275 16.1003 12.4833 15.7073 11.9511C15.3143 11.4189 14.7611 11.0266 14.1288 10.832C13.4965 10.6373 12.8184 10.6505 12.1942 10.8695C11.5699 11.0886 11.0323 11.502 10.6603 12.0491M11.2498 14.3538V14.3516C11.2498 13.5168 11.036 12.7316 10.6603 12.0491M11.2498 14.3538V14.4333C9.80666 15.3033 8.15282 15.7613 6.46777 15.7578C4.71952 15.7578 3.08377 15.2741 1.68727 14.4333L1.68652 14.3516C1.68595 13.2899 2.03873 12.2583 2.68926 11.4193C3.33979 10.5803 4.25105 9.98164 5.27939 9.71776C6.30773 9.45389 7.39464 9.53977 8.36877 9.96188C9.3429 10.384 10.1496 11.1183 10.6603 12.0491M8.99977 4.78906C8.99977 5.46039 8.73309 6.10422 8.25839 6.57893C7.78369 7.05363 7.13985 7.32031 6.46852 7.32031C5.79719 7.32031 5.15336 7.05363 4.67866 6.57893C4.20396 6.10422 3.93727 5.46039 3.93727 4.78906C3.93727 4.11773 4.20396 3.4739 4.67866 2.9992C5.15336 2.5245 5.79719 2.25781 6.46852 2.25781C7.13985 2.25781 7.78369 2.5245 8.25839 2.9992C8.73309 3.4739 8.99977 4.11773 8.99977 4.78906ZM15.1873 6.47656C15.1873 6.99871 14.9799 7.49947 14.6106 7.86868C14.2414 8.23789 13.7407 8.44531 13.2185 8.44531C12.6964 8.44531 12.1956 8.23789 11.8264 7.86868C11.4572 7.49947 11.2498 6.99871 11.2498 6.47656C11.2498 5.95442 11.4572 5.45366 11.8264 5.08445C12.1956 4.71523 12.6964 4.50781 13.2185 4.50781C13.7407 4.50781 14.2414 4.71523 14.6106 5.08445C14.9799 5.45366 15.1873 5.95442 15.1873 6.47656Z" stroke="#6F6C8F" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
        activeSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
<path d="M11.2498 14.3538C11.8895 14.5394 12.5524 14.6333 13.2185 14.6328C14.2899 14.6354 15.3475 14.391 16.3093 13.9188C16.3113 13.8758 16.3123 13.8326 16.3123 13.7891C16.3123 13.1275 16.1003 12.4833 15.7073 11.9511C15.3143 11.4189 14.7611 11.0266 14.1288 10.832C13.4965 10.6373 12.8184 10.6505 12.1942 10.8695C11.5699 11.0886 11.0323 11.502 10.6603 12.0491M11.2498 14.3538V14.3516C11.2498 13.5168 11.036 12.7316 10.6603 12.0491M11.2498 14.3538V14.4333C9.80666 15.3033 8.15282 15.7613 6.46777 15.7578C4.71952 15.7578 3.08377 15.2741 1.68727 14.4333L1.68652 14.3516C1.68595 13.2899 2.03873 12.2583 2.68926 11.4193C3.33979 10.5803 4.25105 9.98164 5.27939 9.71776C6.30773 9.45389 7.39464 9.53977 8.36877 9.96188C9.3429 10.384 10.1496 11.1183 10.6603 12.0491M8.99977 4.78906C8.99977 5.46039 8.73309 6.10422 8.25839 6.57893C7.78369 7.05363 7.13985 7.32031 6.46852 7.32031C5.79719 7.32031 5.15336 7.05363 4.67866 6.57893C4.20396 6.10422 3.93727 5.46039 3.93727 4.78906C3.93727 4.11773 4.20396 3.4739 4.67866 2.9992C5.15336 2.5245 5.79719 2.25781 6.46852 2.25781C7.13985 2.25781 7.78369 2.5245 8.25839 2.9992C8.73309 3.4739 8.99977 4.11773 8.99977 4.78906ZM15.1873 6.47656C15.1873 6.99871 14.9799 7.49947 14.6106 7.86868C14.2414 8.23789 13.7407 8.44531 13.2185 8.44531C12.6964 8.44531 12.1956 8.23789 11.8264 7.86868C11.4572 7.49947 11.2498 6.99871 11.2498 6.47656C11.2498 5.95442 11.4572 5.45366 11.8264 5.08445C12.1956 4.71523 12.6964 4.50781 13.2185 4.50781C13.7407 4.50781 14.2414 4.71523 14.6106 5.08445C14.9799 5.45366 15.1873 5.95442 15.1873 6.47656Z" stroke="#4A3AFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
        link: "/mails/groups",
        access: "admin",
      },
    ],
  },
];
