// Health Connect is available and nothing is granted by default. Tests set
// what each call returns with mockResolvedValue.
const SdkAvailabilityStatus = {
  SDK_UNAVAILABLE: 1,
  SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED: 2,
  SDK_AVAILABLE: 3,
};

module.exports = {
  SdkAvailabilityStatus,
  getSdkStatus: jest.fn(async () => SdkAvailabilityStatus.SDK_AVAILABLE),
  initialize: jest.fn(async () => true),
  requestPermission: jest.fn(async () => []),
  getGrantedPermissions: jest.fn(async () => []),
  revokeAllPermissions: jest.fn(async () => {}),
  openHealthConnectSettings: jest.fn(),
  readRecords: jest.fn(async () => ({ records: [] })),
  aggregateRecord: jest.fn(async () => ({})),
};
