const fs = require("fs");
const path = require("path");
const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} = require("@firebase/rules-unit-testing");
const {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  getDocs,
  query,
  where,
  arrayUnion,
  arrayRemove,
} = require("firebase/firestore");

const ATHLETE_A = "athleteA";
const ATHLETE_B = "athleteB";
const COACH = "coach1";
const OTHER_COACH = "coach2";
const DATE = "2026-11-06";

let testEnv;

const dbAs = (uid) => testEnv.authenticatedContext(uid).firestore();
const anonDb = () => testEnv.unauthenticatedContext().firestore();

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-rules-test",
    firestore: {
      rules: fs.readFileSync(
        path.join(__dirname, "..", "..", "firestore.rules"),
        "utf8"
      ),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "Users", ATHLETE_A), {
      email: "a@example.com",
      firstName: "A",
      expoPushToken: "tokenA",
      coachList: [doc(db, "Users", COACH)],
      pendingPermissions: [],
    });
    await setDoc(doc(db, "Users", ATHLETE_B), {
      email: "b@example.com",
      firstName: "B",
      coachList: [],
      pendingPermissions: [],
    });
    await setDoc(doc(db, "Users", COACH), {
      email: "coach@example.com",
      authorizedAthletes: [],
      invitationsSent: [],
    });
    await setDoc(doc(db, "Users", OTHER_COACH), {
      email: "coach2@example.com",
      authorizedAthletes: [],
    });
    await setDoc(doc(db, "Users", ATHLETE_B, "DailyStats", DATE), {
      date: DATE,
      steps: 9000,
    });
    await setDoc(doc(db, "Users", ATHLETE_B, "AIFeedback", DATE), {
      date: DATE,
      headline: "Easy day",
    });
    await setDoc(doc(db, "Users", ATHLETE_A, "CoachInsights", DATE), {
      summary: "ok",
    });
    await setDoc(doc(db, "OldCollection", "x"), { a: 1 });
  });
});

describe("health subcollections are owner only", () => {
  test.each(["DailyStats", "AIFeedback"])(
    "an athlete reads and writes their own %s",
    async (sub) => {
      const db = dbAs(ATHLETE_A);
      const ref = doc(db, "Users", ATHLETE_A, sub, DATE);
      await assertSucceeds(setDoc(ref, { date: DATE }));
      await assertSucceeds(getDoc(ref));
    }
  );

  test.each(["DailyStats", "AIFeedback"])(
    "an athlete cannot read or write another athlete's %s",
    async (sub) => {
      const db = dbAs(ATHLETE_A);
      const ref = doc(db, "Users", ATHLETE_B, sub, DATE);
      await assertFails(getDoc(ref));
      await assertFails(setDoc(ref, { date: DATE }));
      await assertFails(getDocs(collection(db, "Users", ATHLETE_B, sub)));
    }
  );

  test("a coach cannot read an athlete's DailyStats directly", async () => {
    const db = dbAs(COACH);
    await assertFails(
      getDoc(doc(db, "Users", ATHLETE_A, "DailyStats", DATE))
    );
  });

  test("the older health subcollections stay owner only", async () => {
    const own = dbAs(ATHLETE_A);
    await assertSucceeds(
      getDocs(
        query(
          collection(own, "Users", ATHLETE_A, "SleepData"),
          where("startDate", ">=", "2026-11-01")
        )
      )
    );
    await assertFails(
      getDocs(collection(own, "Users", ATHLETE_B, "HeartRateData"))
    );
  });

  test("a signed-out client is denied", async () => {
    const db = anonDb();
    await assertFails(getDoc(doc(db, "Users", ATHLETE_B, "DailyStats", DATE)));
    await assertFails(getDoc(doc(db, "Users", ATHLETE_B)));
  });
});

describe("Users documents", () => {
  test("a signed-in user can read any user doc and look one up by email", async () => {
    const db = dbAs(COACH);
    await assertSucceeds(getDoc(doc(db, "Users", ATHLETE_A)));
    await assertSucceeds(
      getDocs(
        query(collection(db, "Users"), where("email", "==", "a@example.com"))
      )
    );
  });

  test("a user creates, updates and deletes their own doc", async () => {
    const db = dbAs("newUser");
    const ref = doc(db, "Users", "newUser");
    await assertSucceeds(setDoc(ref, { email: "new@example.com" }));
    await assertSucceeds(updateDoc(ref, { expoPushToken: "t" }));
    await assertSucceeds(deleteDoc(ref));
  });

  test("a user cannot create or delete someone else's doc", async () => {
    const db = dbAs(ATHLETE_A);
    await assertFails(setDoc(doc(db, "Users", "someoneElse"), { a: 1 }));
    await assertFails(deleteDoc(doc(db, "Users", ATHLETE_B)));
  });

  test("a user cannot change another user's profile fields", async () => {
    const db = dbAs(ATHLETE_A);
    const ref = doc(db, "Users", ATHLETE_B);
    await assertFails(updateDoc(ref, { expoPushToken: "stolen" }));
    await assertFails(
      updateDoc(ref, { coachList: arrayUnion(doc(db, "Users", ATHLETE_A)) })
    );
    await assertFails(
      updateDoc(ref, {
        firstName: "X",
        pendingPermissions: arrayUnion(doc(db, "Users", ATHLETE_A)),
      })
    );
  });

  test("a coach can add an invite to an athlete's pendingPermissions", async () => {
    const db = dbAs(COACH);
    await assertSucceeds(
      updateDoc(doc(db, "Users", ATHLETE_B), {
        pendingPermissions: arrayUnion(doc(db, "Users", COACH)),
      })
    );
  });

  test("an athlete can add themselves to a coach's authorizedAthletes", async () => {
    const db = dbAs(ATHLETE_B);
    await assertSucceeds(
      updateDoc(doc(db, "Users", COACH), {
        authorizedAthletes: arrayUnion(doc(db, "Users", ATHLETE_B)),
      })
    );
  });

  test("an athlete accepts a coach on their own doc", async () => {
    const db = dbAs(ATHLETE_B);
    await assertSucceeds(
      updateDoc(doc(db, "Users", ATHLETE_B), {
        coachList: arrayUnion(doc(db, "Users", COACH)),
        pendingPermissions: arrayRemove(doc(db, "Users", COACH)),
      })
    );
  });
});

describe("CoachInsights", () => {
  const insight = (db) => doc(db, "Users", ATHLETE_A, "CoachInsights", DATE);

  test("the athlete can read their own", async () => {
    await assertSucceeds(getDoc(insight(dbAs(ATHLETE_A))));
  });

  test("a coach in the athlete's coachList can read", async () => {
    await assertSucceeds(getDoc(insight(dbAs(COACH))));
  });

  test("a coach not in the athlete's coachList cannot read", async () => {
    await assertFails(getDoc(insight(dbAs(OTHER_COACH))));
  });

  test("a coach only in authorizedAthletes cannot read", async () => {
    const db = dbAs(OTHER_COACH);
    await assertSucceeds(
      updateDoc(doc(db, "Users", OTHER_COACH), {
        authorizedAthletes: arrayUnion(doc(db, "Users", ATHLETE_A)),
      })
    );
    await assertFails(getDoc(insight(db)));
  });

  test("no client can write it, not even the athlete", async () => {
    await assertFails(setDoc(insight(dbAs(ATHLETE_A)), { summary: "x" }));
    await assertFails(setDoc(insight(dbAs(COACH)), { summary: "x" }));
  });
});

describe("Invitations and everything else", () => {
  test("a signed-in coach can create and read invitations", async () => {
    const db = dbAs(COACH);
    await assertSucceeds(
      addDoc(collection(db, "Invitations"), {
        coachId: COACH,
        athleteEmail: "b@example.com",
      })
    );
    await assertSucceeds(
      getDocs(query(collection(db, "Invitations"), where("coachId", "==", COACH)))
    );
  });

  test("a signed-out client cannot use invitations", async () => {
    await assertFails(getDocs(collection(anonDb(), "Invitations")));
  });

  test("a collection not named in the rules is denied", async () => {
    const db = dbAs(ATHLETE_A);
    await assertFails(getDoc(doc(db, "OldCollection", "x")));
    await assertFails(setDoc(doc(db, "OldCollection", "y"), { a: 1 }));
  });
});
