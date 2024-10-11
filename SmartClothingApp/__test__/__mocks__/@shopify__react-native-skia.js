import React from 'react';

export const Canvas = ({ children, style }) => (
  <div style={style}>{children}</div>
);

export const Fill = () => null; // Replace with appropriate mock

export const vec = () => ({ x: 0, y: 0 }); // Replace with appropriate mock values

export const Skia = {
    RuntimeEffect: {
      Make: jest.fn().mockImplementation(() => ({
        // Mock the expected properties and methods of the RuntimeEffect object
      })),
    },
    // ... other mocked Skia functionalities if needed ...
  };