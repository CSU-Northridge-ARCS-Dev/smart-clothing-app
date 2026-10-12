/**
 * @file FitbitCards.unit.test.js
 * HeartCard, SleepCard and WorkoutList , and the Connect button on
 * DeviceCard.
 */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';

import HeartCard from '../../../src/components/fitbit/HeartCard';
import SleepCard from '../../../src/components/fitbit/SleepCard';
import WorkoutList from '../../../src/components/fitbit/WorkoutList';
import DeviceCard from '../../../src/components/AppCards/DeviceCard';

const renderWithPaper = (ui) => render(<PaperProvider>{ui}</PaperProvider>);

const HEART = {
  restingHeartRate: 56,
  previousRestingHeartRate: 59,
  zones: { fatBurn: 45, cardio: 22, peak: 4 },
};

const SLEEP = {
  totalMinutes: 412,
  efficiency: 93,
  deep: 70,
  light: 240,
  rem: 102,
  wake: 38,
  bedTime: '2026-10-09T23:10:00.000',
  wakeTime: '2026-10-10T06:40:00.000',
  levels: [
    { dateTime: '2026-10-09T23:10:00.000', level: 'wake', seconds: 600 },
    { dateTime: '2026-10-09T23:20:00.000', level: 'light', seconds: 1800 },
  ],
};

describe('HeartCard', () => {
  it('shows resting HR, the change since yesterday and the zones', () => {
    const { getByText } = renderWithPaper(<HeartCard heart={HEART} />);
    expect(getByText('56')).toBeTruthy();
    expect(getByText('▼ 3 bpm from yesterday')).toBeTruthy();
    expect(getByText('Cardio')).toBeTruthy();
    expect(getByText('Peak')).toBeTruthy();
    expect(getByText('22m')).toBeTruthy();
  });

  it('leaves out the Fat Burn zone', () => {
    const { queryByText } = renderWithPaper(<HeartCard heart={HEART} />);
    expect(queryByText('Fat Burn')).toBeNull();
    expect(queryByText('45m')).toBeNull();
  });

  it('shows an increase and no change', () => {
    const up = renderWithPaper(
      <HeartCard heart={{ ...HEART, previousRestingHeartRate: 50 }} />
    );
    expect(up.getByText('▲ 6 bpm from yesterday')).toBeTruthy();
    const same = renderWithPaper(
      <HeartCard heart={{ ...HEART, previousRestingHeartRate: 56 }} />
    );
    expect(same.getByText('No change from yesterday')).toBeTruthy();
  });

  it('hides the change without yesterday and shows -- without resting HR', () => {
    const { getByText, queryByTestId } = renderWithPaper(
      <HeartCard
        heart={{ ...HEART, restingHeartRate: null, previousRestingHeartRate: null }}
      />
    );
    expect(getByText('--')).toBeTruthy();
    expect(queryByTestId('resting-delta')).toBeNull();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderWithPaper(
      <HeartCard heart={HEART} onPress={onPress} />
    );
    fireEvent.press(getByTestId('heart-card'));
    expect(onPress).toHaveBeenCalled();
  });
});

describe('SleepCard', () => {
  it('shows totals, times, the hypnogram and stages', () => {
    const { getByText, getByTestId } = renderWithPaper(<SleepCard sleep={SLEEP} />);
    expect(getByText('6h 52m')).toBeTruthy();
    expect(getByText('93% efficiency')).toBeTruthy();
    expect(getByText('11:10 PM - 6:40 AM')).toBeTruthy();
    expect(getByTestId('hypnogram')).toBeTruthy();
    expect(getByText('Deep 1h 10m')).toBeTruthy();
  });

  it('hides stages and the hypnogram for a classic log without levels', () => {
    const classic = {
      ...SLEEP,
      deep: null,
      light: null,
      rem: null,
      wake: null,
      levels: [],
    };
    const { queryByTestId, queryByText } = renderWithPaper(
      <SleepCard sleep={classic} />
    );
    expect(queryByTestId('hypnogram')).toBeNull();
    expect(queryByText(/^Deep/)).toBeNull();
  });

  it('says so when no sleep was recorded', () => {
    const { getByText } = renderWithPaper(<SleepCard sleep={null} />);
    expect(getByText('No sleep recorded for this night.')).toBeTruthy();
  });
});

describe('WorkoutList', () => {
  it('lists each workout with its details', () => {
    const { getByText } = renderWithPaper(
      <WorkoutList
        workouts={[
          {
            type: 'Run',
            startTime: '2026-10-10T07:00:00.000-07:00',
            durationMin: 30,
            avgHeartRate: 152,
            distanceKm: 5,
            paceMinPerKm: 6,
          },
          { type: 'Weights', startTime: '2026-10-10T17:00:00.000-07:00', durationMin: 45 },
        ]}
      />
    );
    expect(getByText('Run')).toBeTruthy();
    expect(getByText('30m · avg 152 bpm · 3.1 mi · 9:39 /mi')).toBeTruthy();
    expect(getByText('Weights')).toBeTruthy();
    expect(getByText('45m')).toBeTruthy();
  });

  it('shows an empty message', () => {
    const { getByText } = renderWithPaper(<WorkoutList workouts={[]} />);
    expect(getByText('No workouts recorded on the watch.')).toBeTruthy();
  });
});

describe('DeviceCard Connect button', () => {
  const device = { id: 3, name: 'Pixel Watch', device: 'Google Pixel Watch 3' };

  it('uses the label and handler it is given', () => {
    const onConnect = jest.fn();
    const { getByText } = renderWithPaper(
      <DeviceCard device={device} onConnect={onConnect} connectLabel="Disconnect" />
    );
    fireEvent.press(getByText('Disconnect'));
    expect(onConnect).toHaveBeenCalled();
  });

  it('keeps the plain Connect label for the demo devices', () => {
    const { getByText } = renderWithPaper(<DeviceCard device={{ ...device, id: 1 }} />);
    expect(getByText('Connect')).toBeTruthy();
  });
});
