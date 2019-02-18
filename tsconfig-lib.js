//*** configuration for compiling the library ****

{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "declaration": true,
    "outDir": "./lib",
    "strict": true,
    "sourceMap": true,
    "jsx": "react"
  },
  "include": ["src"],
  "exclude": ["node_modules", "**/__tests__/*"],
  "typedocOptions": {
    "mode": "file",
    "out": "docs"
  }
}
