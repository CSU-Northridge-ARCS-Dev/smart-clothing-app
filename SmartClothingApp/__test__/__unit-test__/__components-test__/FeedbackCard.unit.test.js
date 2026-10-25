/**
 * @file FeedbackCard.unit.test.js
 * FeedbackCard (Claude's feedback for a day) and ConsentModal.
 */
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { render, fireEvent } from '@testing-library/react-native';

import FeedbackCard from '../../../src/components/FeedbackCard';
import ConsentModal from '../../../src/components/ConsentModal';

jest.mock('expo-font', () => ({
  loadAsync: jest.fn().mockResolvedValue(true),
  isLoaded: jest.fn().mockReturnValue(true),
}));
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const MockIcon = ({ name }) => React.createElement('Icon', { name });
  return { MaterialCommunityIcons: MockIcon };
});

const renderWithPaper = (ui) => render(<PaperProvider>{ui}</PaperProvider>);

const INSIGHT = {
  headline: 'Good sleep set up your run',
  keySignals: ['7h 12m of sleep', 'Resting HR down 3 bpm'],
  focus: ["Keep tonight's bedtime before 11"],
};

describe('FeedbackCard', () => {
  it('shows the headline, key signals and focus', () => {
    const { getByText } = renderWithPaper(<FeedbackCard insight={INSIGHT} />);
    expect(getByText('Good sleep set up your run')).toBeTruthy();
    expect(getByText('Key signals')).toBeTruthy();
    expect(getByText('7h 12m of sleep')).toBeTruthy();
    expect(getByText('Resting HR down 3 bpm')).toBeTruthy();
    expect(getByText('Focus')).toBeTruthy();
    expect(getByText("Keep tonight's bedtime before 11")).toBeTruthy();
  });

  it('leaves out empty sections', () => {
    const { queryByText } = renderWithPaper(
      <FeedbackCard insight={{ headline: 'Rest day', keySignals: [], focus: [] }} />
    );
    expect(queryByText('Key signals')).toBeNull();
    expect(queryByText('Focus')).toBeNull();
  });

  it('calls onRegenerate', () => {
    const onRegenerate = jest.fn();
    const { getByText } = renderWithPaper(
      <FeedbackCard insight={INSIGHT} onRegenerate={onRegenerate} />
    );
    fireEvent.press(getByText('Regenerate'));
    expect(onRegenerate).toHaveBeenCalled();
  });

  it('has no Regenerate button without a handler', () => {
    const { queryByText } = renderWithPaper(<FeedbackCard insight={INSIGHT} />);
    expect(queryByText('Regenerate')).toBeNull();
  });
});

describe('ConsentModal', () => {
  it('explains what is sent and to whom', () => {
    const { getByText } = renderWithPaper(
      <ConsentModal visible onAgree={jest.fn()} onDecline={jest.fn()} />
    );
    expect(getByText('Share your data with AI?')).toBeTruthy();
    expect(getByText(/sleep, heart rate\s+and workouts/)).toBeTruthy();
    expect(getByText(/Anthropic/)).toBeTruthy();
  });

  it('calls onAgree and onDecline', () => {
    const onAgree = jest.fn();
    const onDecline = jest.fn();
    const { getByText } = renderWithPaper(
      <ConsentModal visible onAgree={onAgree} onDecline={onDecline} />
    );
    fireEvent.press(getByText('I agree'));
    fireEvent.press(getByText('Not now'));
    expect(onAgree).toHaveBeenCalled();
    expect(onDecline).toHaveBeenCalled();
  });

  it('renders nothing while hidden', () => {
    const { queryByText } = renderWithPaper(
      <ConsentModal visible={false} onAgree={jest.fn()} onDecline={jest.fn()} />
    );
    expect(queryByText('Share your data with AI?')).toBeNull();
  });
});
