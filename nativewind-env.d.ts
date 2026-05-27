/// <reference types="nativewind/types" />

// Allow CSS module imports (used by animated-icon.module.css in the default template)
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Allow plain CSS side-effect imports (e.g. import '@/global.css')
declare module '*.css' {}
