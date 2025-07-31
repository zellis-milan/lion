import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  {
  input: 'packages/ui/exports/define/lion-input-datepicker.js',
  output: {
    file: 'dist/lion-datepicker-bundle.js',
    format: 'esm',
    inlineDynamicImports: true,
  },
  plugins: [
    resolve(),
    commonjs(),
  ],
},
 {
  input: 'packages/ui/components/form-core/src/validate/validators/DateValidators.js',
  output: {
    file: 'dist/lion-datepicker-date-validators.js',
    format: 'esm',
    inlineDynamicImports: true,
  },
  plugins: [
    resolve(),
    commonjs(),
  ],
},
];
