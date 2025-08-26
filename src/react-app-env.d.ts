/// <reference types="react-scripts" />

// This file is used to provide type definitions for JSX elements
import 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Add any custom element types here if needed
      [elemName: string]: any;
    }
  }
}
