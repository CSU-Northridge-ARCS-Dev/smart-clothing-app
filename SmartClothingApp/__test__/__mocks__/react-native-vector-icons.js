import React from 'react';

// This is a mock for any call to MaterialIcons
const MaterialIconsMock = ({ name, size, color }) => (
  <text>{`Icon: ${name}`}</text>
);


// Mock for FontAwesome5
const FontAwesome5Mock = ({ name, size, color }) => (
  <text>{`FontAwesome5: ${name}`}</text>
);

// Exporting both mocks
module.exports = {
  MaterialIcons: MaterialIconsMock,
  FontAwesome5: FontAwesome5Mock,
};