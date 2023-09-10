import { GET_DEVICES } from "./../actions/types";

const dummyDevicesData = [
  {
    id: 1,
    name: "Smart Sock",
    device: "Smart sock v2.0 & Sensoria Core",
    image: require("./../../assets/images/sock.jpeg"),
    details:
      "Sensoria® Running System Utilize this complete system to enhance your training from head to toe. The Smart Upper Garments provide real-time heart rate monitoring capabilities while the Smart Socks can help improve your running form by measuring cadence, impact forces and foot landing. All connected by the Sensoria Run App which provides AI coaching and dashboard tracking.",
  },
  {
    id: 2,
    name: "Smart Shirt",
    device: "HEXOSKIN PROSHIRT V1",
    image: require("./../../assets/images/shirt.jpeg"),
    details:
      "The Hexoskin Smart Garments include textile sensors embedded into comfortable garments for precise and continuous cardiac, respiratory, and activity monitoring. Hexoskin users can visualize, report, and analyse their data with the leading Hexoskin Connected Health Platform. The Hexoskin Smart Garments have been used in over 180 scientific publications, more than all the smart clothing competition combined. Order Today! ",
  },
];

const initialState = {
  devicesData: dummyDevicesData,
};

const deviceReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_DEVICES:
      return state.devicesData;
    default:
      return state;
  }
};

export default deviceReducer;
