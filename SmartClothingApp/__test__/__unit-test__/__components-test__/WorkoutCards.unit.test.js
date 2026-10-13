/**
 * @file WorkoutCards.unit.test.js
 * The Workout page cards: route map, heart rate chart, stats and the month
 * calendar, plus tappable rows in WorkoutList.
 */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';

import RouteMap from '../../../src/components/fitbit/RouteMap';
import HeartRateTimeline from '../../../src/components/fitbit/HeartRateTimeline';
import WorkoutStats, {
  workoutStatTiles,
} from '../../../src/components/fitbit/WorkoutStats';
import WorkoutCalendar, {
  workoutMarkedDates,
} from '../../../src/components/fitbit/WorkoutCalendar';
import WorkoutList from '../../../src/components/fitbit/WorkoutList';
import { ZONE_COLORS } from '../../../src/components/fitbit/styles';

// The row chevron is a Paper Icon, which loads fonts through expo-font
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

const POINTS = [
  { t: 0, lat: 34.24, lon: -118.53, bpm: 110, zone: 'outOfRange' },
  { t: 60, lat: 34.245, lon: -118.53, bpm: 150, zone: 'cardio' },
  { t: 120, lat: 34.25, lon: -118.53, bpm: 180, zone: 'peak' },
];

const RUN = {
  logId: 74512345678,
  type: 'Run',
  startTime: '2026-10-11T07:00:00.000-07:00',
  durationMin: 12,
  avgHeartRate: 160,
  calories: 164,
  steps: 1932,
  distanceKm: 1.6,
  paceMinPerKm: 7.5,
  zones: { fatBurn: 3, cardio: 6, peak: 2 },
};

// Fires the chart View's layout so the SVG gets a width
const layout = (utils, width = 300) =>
  fireEvent(utils.getByTestId('heart-rate-timeline').children[1], 'layout', {
    nativeEvent: { layout: { width, height: 140 } },
  });

describe('RouteMap', () => {
  it('draws the route in a map page, one color per zone run, with a legend', () => {
    const { getByTestId, getByText } = renderWithPaper(
      <RouteMap points={POINTS} />
    );
    const { html } = getByTestId('route-webview').props.source;
    expect(html).toContain(`"color":"${ZONE_COLORS.outOfRange}"`);
    expect(html).toContain(`"color":"${ZONE_COLORS.cardio}"`);
    expect(html).toContain(`"color":"${ZONE_COLORS.peak}"`);
    expect(getByText('Out of Range')).toBeTruthy();
    expect(getByText('Peak')).toBeTruthy();
  });

  it('renders nothing without GPS points', () => {
    const { queryByTestId } = renderWithPaper(
      <RouteMap points={[{ t: 0, lat: null, lon: null, bpm: 100 }]} />
    );
    expect(queryByTestId('route-map')).toBeNull();
  });
});

describe('HeartRateTimeline', () => {
  it('shows the bpm range and minutes in each zone once laid out', () => {
    const utils = renderWithPaper(
      <HeartRateTimeline points={POINTS} zones={RUN.zones} />
    );
    layout(utils);
    expect(utils.getByText('180')).toBeTruthy();
    expect(utils.getByText('110')).toBeTruthy();
    expect(utils.getByText('6m')).toBeTruthy();
    expect(utils.getByText('2m')).toBeTruthy();
  });

  it('says so when there is no heart rate', () => {
    const utils = renderWithPaper(<HeartRateTimeline points={[]} zones={null} />);
    layout(utils);
    expect(utils.getByText('No heart rate recorded for this workout.')).toBeTruthy();
  });
});

describe('WorkoutStats', () => {
  it('shows every stat the run has', () => {
    const { getByText } = renderWithPaper(<WorkoutStats workout={RUN} />);
    expect(getByText('12m')).toBeTruthy();
    expect(getByText('164 cal')).toBeTruthy();
    expect(getByText('1.0 mi')).toBeTruthy();
    expect(getByText('12:04 /mi')).toBeTruthy();
    expect(getByText('1,932')).toBeTruthy();
    expect(getByText('160 bpm')).toBeTruthy();
  });

  it('leaves out stats a weights session does not have', () => {
    const labels = workoutStatTiles({
      durationMin: 45,
      calories: 0,
      avgHeartRate: 110,
    }).map((t) => t.label);
    expect(labels).toEqual(['Duration', 'Energy burned', 'Avg heart rate']);
  });
});

describe('WorkoutCalendar', () => {
  const monthState = {
    loading: false,
    error: null,
    data: [
      { date: '2026-10-01', logId: 1, type: 'Walk' },
      { date: '2026-10-11', logId: 2, type: 'Run' },
    ],
  };

  it('marks workout days and fills in the selected one', () => {
    expect(workoutMarkedDates(monthState.data, '2026-10-11')).toEqual({
      '2026-10-01': { marked: true, dotColor: expect.any(String) },
      '2026-10-11': {
        marked: true,
        dotColor: expect.any(String),
        selected: true,
        selectedColor: expect.any(String),
      },
    });
  });

  it('reports month changes as YYYY-MM and only opens workout days', () => {
    const onMonthChange = jest.fn();
    const onDayPress = jest.fn();
    const { UNSAFE_getByType } = renderWithPaper(
      <WorkoutCalendar
        current="2026-10-11"
        selectedDate="2026-10-11"
        monthState={monthState}
        onMonthChange={onMonthChange}
        onDayPress={onDayPress}
      />
    );
    const calendar = UNSAFE_getByType(Calendar);
    calendar.props.onMonthChange({ dateString: '2026-09-01' });
    expect(onMonthChange).toHaveBeenCalledWith('2026-09');
    calendar.props.onDayPress({ dateString: '2026-10-02' });
    expect(onDayPress).not.toHaveBeenCalled();
    calendar.props.onDayPress({ dateString: '2026-10-01' });
    expect(onDayPress).toHaveBeenCalledWith('2026-10-01');
  });

  it('says when the month failed to load', () => {
    const { getByText } = renderWithPaper(
      <WorkoutCalendar
        current="2026-10-11"
        monthState={{ loading: false, error: 'FITBIT_API_ERROR', data: null }}
        onMonthChange={jest.fn()}
        onDayPress={jest.fn()}
      />
    );
    expect(getByText("Couldn't load this month's workouts.")).toBeTruthy();
  });
});

describe('WorkoutList rows', () => {
  it('opens a workout that has a logId', () => {
    const onPressWorkout = jest.fn();
    const { getByTestId } = renderWithPaper(
      <WorkoutList workouts={[RUN]} onPressWorkout={onPressWorkout} />
    );
    fireEvent.press(getByTestId('workout-row-74512345678'));
    expect(onPressWorkout).toHaveBeenCalledWith(RUN);
  });

  it('is not tappable without a handler or a logId', () => {
    const { queryByTestId, rerender } = renderWithPaper(
      <WorkoutList workouts={[RUN]} />
    );
    expect(queryByTestId('workout-row-74512345678')).toBeNull();
    rerender(
      <PaperProvider>
        <WorkoutList workouts={[{ ...RUN, logId: null }]} onPressWorkout={jest.fn()} />
      </PaperProvider>
    );
    expect(queryByTestId('workout-row-null')).toBeNull();
  });
});
