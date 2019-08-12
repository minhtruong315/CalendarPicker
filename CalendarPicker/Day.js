import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import PropTypes from 'prop-types';
import { Utils } from './Utils';
import moment from 'moment';

export default function Day(props) {
  const {
    day,
    month,
    year,
    styles,
    customDatesStyles,
    onPressDay,
    selectedStartDate,
    selectedEndDate,
    allowRangeSelection,
    selectedDayStyle,
    selectedRangeStartStyle,
    selectedRangeStyle,
    selectedRangeEndStyle,
    textStyle,
    todayTextStyle,
    minDate,
    maxDate,
    disabledDates,
    minRangeDuration,
    maxRangeDuration,
    enableDateChange,
    badge,
    bagdeStyle,
    bagdeTextStyle
  } = props;

  const thisDay = moment({ year, month, day });
  const today = moment();

  let dateOutOfRange;
  let daySelectedStyle = styles.dayButton; // may be overridden depending on state
  let selectedDayColorStyle = {};
  let propSelectedDayStyle;
  let dateIsBeforeMin = false;
  let dateIsAfterMax = false;
  let dateIsDisabled = false;
  let dateIsBeforeMinDuration = false;
  let dateIsAfterMaxDuration = false;
  let customContainerStyle, customDateStyle, customTextStyle;

  // First let's check if date is out of range
  // Check whether props maxDate / minDate are defined. If not supplied,
  // don't restrict dates.
  if (maxDate) {
    dateIsAfterMax = thisDay.isAfter(maxDate, 'day');
  }
  if (minDate) {
    dateIsBeforeMin = thisDay.isBefore(minDate, 'day');
  }

  if (disabledDates && disabledDates.indexOf(thisDay.valueOf()) >= 0) {
    dateIsDisabled = true;
  }

  if (allowRangeSelection && minRangeDuration && selectedStartDate && thisDay.isAfter(moment(selectedStartDate), 'day')) {
    if (Array.isArray(minRangeDuration)) {
      let i = minRangeDuration.findIndex(i => moment(i.date).isSame(moment(selectedStartDate, 'day')));
      if (i >= 0 && moment(selectedStartDate).add(minRangeDuration[i].minDuration, 'day').isAfter(thisDay, 'day')) {
        dateIsBeforeMinDuration = true;
      }
    } else if (moment(selectedStartDate).add(minRangeDuration, 'day').isAfter(thisDay, 'day')) {
      dateIsBeforeMinDuration = true;
    }
  }

  if (allowRangeSelection && maxRangeDuration && selectedStartDate && thisDay.isAfter(moment(selectedStartDate), 'day')) {
    if (Array.isArray(maxRangeDuration)) {
      let i = maxRangeDuration.findIndex(i => moment(i.date).isSame(moment(selectedStartDate, 'day')));
      if (i >= 0 && moment(selectedStartDate).add(maxRangeDuration[i].maxDuration, 'day').isBefore(thisDay, 'day')) {
        dateIsAfterMaxDuration = true;
      }
    } else if (moment(selectedStartDate).add(maxRangeDuration, 'day').isBefore(thisDay, 'day')) {
      dateIsAfterMaxDuration = true;
    }
  }

  dateOutOfRange = dateIsAfterMax || dateIsBeforeMin || dateIsDisabled || dateIsBeforeMinDuration || dateIsAfterMaxDuration;

  // If date is in range let's apply styles
  if (!dateOutOfRange) {
    // set today's style
    let isToday = thisDay.isSame(today, 'day');
    if (isToday) {
      daySelectedStyle = styles.selectedToday;
      // todayTextStyle prop overrides selectedDayTextColor (created via makeStyles)
      selectedDayColorStyle = todayTextStyle || styles.selectedDayLabel;
    }

    for (let cds of customDatesStyles) {
      if (thisDay.isSame(moment(cds.date), 'day')) {
        customContainerStyle = cds.containerStyle;
        customDateStyle = cds.style;
        customTextStyle = cds.textStyle;
        if (isToday && customDateStyle) {
          // Custom date style overrides 'today' style. It may be reset below
          // by date selection styling.
          daySelectedStyle = [daySelectedStyle, customDateStyle];
        }
        break;
      }
    }

    let isThisDaySameAsSelectedStart = thisDay.isSame(selectedStartDate, 'day');
    let isThisDaySameAsSelectedEnd = thisDay.isSame(selectedEndDate, 'day');

    // set selected day style
    if (!allowRangeSelection &&
      selectedStartDate &&
      isThisDaySameAsSelectedStart) {
      daySelectedStyle = styles.selectedDay;
      selectedDayColorStyle = [styles.selectedDayLabel, isToday && !isThisDaySameAsSelectedStart && todayTextStyle];
      // selectedDayStyle prop overrides selectedDayColor (created via makeStyles)
      propSelectedDayStyle = selectedDayStyle || styles.selectedDayBackground;
    }

    // Set selected ranges styles
    if (allowRangeSelection) {
      if (selectedStartDate && selectedEndDate) {
        // Apply style for start date
        if (isThisDaySameAsSelectedStart) {
          daySelectedStyle = [styles.startDayWrapper, selectedRangeStyle, selectedRangeStartStyle];
          selectedDayColorStyle = styles.selectedDayLabel;
        }
        // Apply style for end date
        if (isThisDaySameAsSelectedEnd) {
          daySelectedStyle = [styles.endDayWrapper, selectedRangeStyle, selectedRangeEndStyle];
          selectedDayColorStyle = styles.selectedDayLabel;
        }
        // Apply style if start date is the same as end date
        if (isThisDaySameAsSelectedEnd &&
          isThisDaySameAsSelectedStart &&
          selectedEndDate.isSame(selectedStartDate, 'day')) {
          daySelectedStyle = [styles.selectedDay, styles.selectedDayBackground, selectedRangeStyle];
          selectedDayColorStyle = styles.selectedDayLabel;
        }
        // Apply style if this day is in range
        if (thisDay.isBetween(selectedStartDate, selectedEndDate, 'day')) {
          daySelectedStyle = [styles.inRangeDay, selectedRangeStyle];
          selectedDayColorStyle = styles.selectedDayLabel;
        }
      }
      // Apply style if start date has been selected but end date has not
      if (selectedStartDate &&
        !selectedEndDate &&
        isThisDaySameAsSelectedStart) {
        daySelectedStyle = [styles.startDayWrapper, selectedRangeStyle, selectedRangeStartStyle];
        selectedDayColorStyle = styles.selectedDayLabel;
      }
    }

    return (
      <View style={[styles.dayWrapper, customContainerStyle]}>
        <TouchableOpacity
          disabled={!enableDateChange}
          style={[customDateStyle, daySelectedStyle, propSelectedDayStyle]}
          onPress={() => onPressDay(day)}>
          <Text style={[styles.dayLabel, textStyle, customTextStyle, selectedDayColorStyle]}>
            {day}
          </Text>
          {isToday && <View style={customStyles.today} />}
          {badge > 0 && (
            <View style={[customStyles.badge, bagdeStyle]}>
              <Text style={[customStyles.badgeTxt, bagdeTextStyle]}>{badge}</Text>
            </View>
          )}

        </TouchableOpacity>
      </View>
    );
  }
  else {  // dateOutOfRange = true
    return (
      <View style={styles.dayWrapper}>
        <Text style={[textStyle, styles.disabledText]}>
          {day}
        </Text>
      </View>
    )
  }
}

Day.defaultProps = {
  customDatesStyles: [],
}

Day.propTypes = {
  styles: PropTypes.shape({}),
  day: PropTypes.number,
  onPressDay: PropTypes.func,
  disabledDates: PropTypes.array,
  minRangeDuration: PropTypes.oneOfType([PropTypes.array, PropTypes.number]),
  maxRangeDuration: PropTypes.oneOfType([PropTypes.array, PropTypes.number]),
}


const customStyles = StyleSheet.create({
  today: { width: 20, height: 1, backgroundColor: "#4D8CF1", marginTop: 3, alignSelf: 'center' },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4D8CF1",
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    right: 0
  },
  badgeTxt: {
    fontSize: 11,
    color: "#fff"
  }
})