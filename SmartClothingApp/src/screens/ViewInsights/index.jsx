const ViewInsights = ({ route }) => {
  const { previousScreenTitle } = route.params;
  const dispatch = useDispatch();
  const activityRingsData = useSelector((state) => state.app.activityRingsData);
  const [currentRingData, setCurrentRingData] = useState({
    ring1: {
      currentValue: 0,
      goalValue: 800, // Initial cap.
    },
    ring2: {
      currentValue: 0,
      goalValue: 90, // Initial cap.
    },
    ring3: {
      currentValue: 0,
      goalValue: 16, // Initial cap.
    },
  });

  // const maxCal = 800;
  // const maxMin = 30;
  // const maxHrs = 12;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      console.log(selectedDate);
      setCurrentDate(selectedDate);
    }
  };

  const setFocusedRingData = (day) => {
    const currentRingData = {
      ring1: activityRingsData[day].ring1,
      ring2: activityRingsData[day].ring2,
      ring3: activityRingsData[day].ring3,
    };

    setCurrentRingData(currentRingData);
  };

  const handleRingPress = (day) => {
    setFocusedRingData(day);
  };

  const handleUpdate = async () => {
    await dispatch(updateActivityRings());
  };

  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
  });

  useEffect(() =>{
    setFocusedRingData(formattedDate);
  },[activityRingsData[formattedDate]]);


  useEffect(() => {
    setCurrentDate(currentDate);
  }, [currentDate]);

  return (
    <ScrollView style={[{ flex: 1 }]}>
      <AppHeader title={previousScreenTitle} back={true} />
      <View style={{ padding: 10 }}>
        <DateToolbar />
        <DailyInsights
          fromDashboard={false}
          handleRingPress={handleRingPress}
        />
      </View>
      <ActivityRings //big ring
        scale={0.9}
        canvasWidth={400}
        canvasHeight={220}
        horiPos={2}
        vertPos={2}
        totalProgress={{ ...currentRingData }}
      />
      <ActivityChart
        color={AppColor.ringMove}
        name="Move"
        type="CAL"
        goal={currentRingData.ring1.goalValue}  // Already rounded by Apple.
        progress={currentRingData.ring1.currentValue}
      ></ActivityChart>
      <ActivityChart
        color={AppColor.ringExercise}
        name="Exercise"
        type="MIN"
        goal={currentRingData.ring2.goalValue}  // Already rounded by Apple.
        progress={currentRingData.ring2.currentValue}
      ></ActivityChart>
      <ActivityChart
        color={AppColor.ringStand}
        name="Stand"
        type="HRS"
        goal={currentRingData.ring3.goalValue}
        progress={currentRingData.ring3.currentValue}
      ></ActivityChart>
      {showDatePicker && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}
      <Button
        title="Update Activity Rings Data"
        onPress={() => {
          handleUpdate();
          // updateDataAtIndex(7, 5);
        }}
      />
    </ScrollView>
  );
};

export default ViewInsights;
