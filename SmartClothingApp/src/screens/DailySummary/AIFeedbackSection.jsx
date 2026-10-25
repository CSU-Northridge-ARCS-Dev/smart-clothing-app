import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useDispatch } from "react-redux";
import { ActivityIndicator, Button, Text } from "react-native-paper";

import FeedbackCard from "../../components/FeedbackCard";
import ConsentModal from "../../components/ConsentModal";
import { fitbitCardStyles as card } from "../../components/fitbit/styles";
import { startGenerateFeedback } from "../../actions/insightActions";
import {
  getAIConsent,
  setAIConsent,
  getCachedFeedback,
} from "../../utils/localStorage";

const ERROR_MESSAGES = {
  COACH_API_ERROR: "The AI coach didn't respond. Try again in a moment.",
  COACH_REFUSED: "The AI coach couldn't write feedback for this day.",
  COACH_NOT_CONFIGURED: "AI feedback isn't set up on the insights service yet.",
  FITBIT_API_ERROR: "Fitbit didn't respond. Try again in a moment.",
  "Network Error": "Can't reach the insights service. Is it running?",
};

// The AI feedback card at the bottom of DailySummary
const AIFeedbackSection = ({ date }) => {
  const dispatch = useDispatch();
  const [consent, setConsent] = useState(false);
  const [consentVisible, setConsentVisible] = useState(false);
  const [status, setStatus] = useState("idle");
  const [insight, setInsight] = useState(null);
  const [error, setError] = useState(null);
  const currentDate = useRef(date);

  useEffect(() => {
    getAIConsent().then(setConsent);
  }, []);

  useEffect(() => {
    currentDate.current = date;
    setStatus("idle");
    setInsight(null);
    setError(null);
    getCachedFeedback(date).then((cached) => {
      if (cached && currentDate.current === date) {
        setInsight(cached);
        setStatus("result");
      }
    });
  }, [date]);

  const generate = async (force) => {
    const forDate = date;
    setStatus("loading");
    setError(null);
    try {
      const result = await dispatch(startGenerateFeedback(forDate, { force }));
      if (currentDate.current !== forDate) return;
      if (result.insight) {
        setInsight(result.insight);
        setStatus("result");
      } else {
        setStatus("no_data");
      }
    } catch (e) {
      if (currentDate.current !== forDate) return;
      setError(e.message);
      setStatus("error");
    }
  };

  const onGetFeedback = () => {
    if (consent) generate(false);
    else setConsentVisible(true);
  };

  const onAgree = async () => {
    setConsentVisible(false);
    setConsent(true);
    await setAIConsent(true);
    generate(false);
  };

  if (status === "result" || (status === "loading" && insight)) {
    return (
      <FeedbackCard
        insight={insight}
        onRegenerate={() => generate(true)}
        regenerating={status === "loading"}
      />
    );
  }

  return (
    <View style={card.card} testID="ai-feedback-section">
      <Text style={card.title}>AI Feedback</Text>
      {status === "loading" ? (
        <ActivityIndicator style={{ marginTop: 12 }} testID="feedback-loading" />
      ) : (
        <>
          <Text style={[card.empty, { marginBottom: 10 }]}>
            {status === "no_data"
              ? "There's no sleep or workout recorded for this day, so there's nothing to give feedback on yet."
              : status === "error"
              ? ERROR_MESSAGES[error] || `Something went wrong (${error}).`
              : "Get personalised feedback on this day's sleep, heart rate and workouts."}
          </Text>
          <Button mode="contained" icon="robot-outline" onPress={onGetFeedback}>
            {status === "error" ? "Try again" : "Get feedback"}
          </Button>
        </>
      )}
      <ConsentModal
        visible={consentVisible}
        onAgree={onAgree}
        onDecline={() => setConsentVisible(false)}
      />
    </View>
  );
};

export default AIFeedbackSection;
