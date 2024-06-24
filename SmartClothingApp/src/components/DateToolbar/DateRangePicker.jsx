import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import { Calendar } from "react-native-calendars";
const XDate = require("xdate");

class DateRangePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFromDatePicked: false,
      isToDatePicked: false,
      markedDates: {},
    };
  }

  componentDidMount() {
    this.setupInitialRange();
  }

  onDayPress = (day) => {
    if (
      !this.state.isFromDatePicked ||
      (this.state.isFromDatePicked && this.state.isToDatePicked)
    ) {
      this.setupStartMarker(day);
    } else if (!this.state.isToDatePicked) {
      let markedDates = { ...this.state.markedDates };
      let [mMarkedDates, range] = this.setupMarkedDates(
        this.state.fromDate,
        day.dateString,
        markedDates
      );
      if (range >= 0) {
        this.setState({
          isFromDatePicked: true,
          isToDatePicked: true,
          markedDates: mMarkedDates,
        });
        const fromDate = new Date(this.state.fromDate);
        const toDate = new Date(day.dateString);
        if (fromDate.toDateString() === toDate.toDateString()) {
            toDate.setHours(39);
            toDate.setMinutes(59);
            toDate.setSeconds(59);
            toDate.setMilliseconds(999);
        }
        // if (fromDate.toDateString() === toDate.toDateString()) {
        //   // Set toDate to the end of the day by adding 24 hours
        //     toDate.setDate(toDate.getDate() + 1);
        // }
        const localOffset = fromDate.getTimezoneOffset();
        const localDate = new Date(fromDate.getTime() + (localOffset * 60000));
        const localEndDate = new Date(toDate.getTime() + (localOffset * 60000));
        this.props.onSuccess(localDate, localEndDate);
      } else {
        this.setupStartMarker(day);
      }
    }
  };

  setupStartMarker = (day) => {
    let markedDates = {
      [day.dateString]: {
        startingDay: true,
        color: this.props.theme.markColor,
        textColor: this.props.theme.markTextColor,
      },
    };
    this.setState({
      isFromDatePicked: true,
      isToDatePicked: false,
      fromDate: day.dateString,
      markedDates: markedDates,
    });
  };

  setupMarkedDates = (fromDate, toDate, markedDates) => {
    let mFromDate = new XDate(fromDate);
    let mToDate = new XDate(toDate);
    let range = mFromDate.diffDays(mToDate);
    if (range >= 0) {
      if (range === 0) {
        markedDates = {
          [toDate]: {
            color: this.props.theme.markColor,
            textColor: this.props.theme.markTextColor,
          },
        };
      } else {
        for (let i = 1; i <= range; i++) {
          let tempDate = mFromDate.addDays(1).toString("yyyy-MM-dd");
          if (i < range) {
            markedDates[tempDate] = {
              color: this.props.theme.markColor,
              textColor: this.props.theme.markTextColor,
            };
          } else {
            markedDates[tempDate] = {
              endingDay: true,
              color: this.props.theme.markColor,
              textColor: this.props.theme.markTextColor,
            };
          }
        }
      }
    }
    return [markedDates, range];
  };

  setupInitialRange = () => {
    if (!this.props.initialRange) return;
    let [fromDate, toDate] = this.props.initialRange;
    let markedDates = {
      [fromDate]: {
        startingDay: true,
        color: this.props.theme.markColor,
        textColor: this.props.theme.markTextColor,
      },
    };
    let [mMarkedDates, range] = this.setupMarkedDates(
      fromDate,
      toDate,
      markedDates
    );
    this.setState({ markedDates: mMarkedDates, fromDate: fromDate });
  };

  render() {
    return (
      <Calendar
        {...this.props}
        markingType={"period"}
        current={this.state.fromDate}
        markedDates={this.state.markedDates}
        onDayPress={(day) => {
          this.onDayPress(day);
        }}
      />
    );
  }
}

DateRangePicker.defaultProps = {
  theme: { markColor: "#00adf5", markTextColor: "#ffffff" },
};

export default DateRangePicker;
