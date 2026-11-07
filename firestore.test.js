const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const { test, before, after, beforeEach } = require("node:test");
const fs = require("node:fs");

let testEnv;
const PROJECT_ID = process.env.GCP_PROJECT || "demo-no-project";
const ALICE_UID = "teacher_alice";
const BOB_UID = "teacher_bob";

const [emulatorHost, emulatorPortStr] = (process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8085").split(":");
const emulatorPort = parseInt(emulatorPortStr, 10);

before(async () => {
  const rules = fs.readFileSync("./firestore.rules", "utf8");
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: emulatorHost,
      port: emulatorPort,
    },
  });
});

after(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

beforeEach(async () => {
  if (testEnv) {
    await testEnv.clearFirestore();
  }
});

// 1. Connection & Unauthenticated Checks
test("1. Unauthenticated user: cannot read user documents or projects", async () => {
  const unauthDb = testEnv.unauthenticatedContext().firestore();
  await assertFails(unauthDb.collection("users").doc(ALICE_UID).get());
  await assertFails(unauthDb.collection("users").doc(ALICE_UID).collection("projects").get());
});

test("2. Unauthenticated user: cannot create projects", async () => {
  const unauthDb = testEnv.unauthenticatedContext().firestore();
  await assertFails(
    unauthDb.collection("users").doc(ALICE_UID).collection("projects").doc("proj_1").set({
      title: "Hacked Project",
      topic: "Unauthenticated write",
      userId: ALICE_UID
    })
  );
});

// 2. Creating and Saving a Project
test("3. Authenticated user: can create and save a new project in their collection", async () => {
  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();
  await assertSucceeds(
    aliceDb.collection("users").doc(ALICE_UID).collection("projects").doc("proj_101").set({
      userId: ALICE_UID,
      title: "Mastering Conditionals in 3D Space",
      topic: "Hypothetical Dilemmas",
      schoolLevel: "Upper-Intermediate (B2)",
      durationMinutes: 4,
      sceneCount: 3,
      status: "Ready"
    })
  );
});

// 3. Retrieving Saved Projects
test("4. Authenticated user: can retrieve their saved projects list and project document", async () => {
  // Pre-seed project as admin
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().collection("users").doc(ALICE_UID).collection("projects").doc("proj_101").set({
      userId: ALICE_UID,
      title: "Mastering Conditionals in 3D Space",
      topic: "Hypothetical Dilemmas",
      schoolLevel: "Upper-Intermediate (B2)"
    });
  });

  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();
  await assertSucceeds(aliceDb.collection("users").doc(ALICE_UID).collection("projects").doc("proj_101").get());
  await assertSucceeds(aliceDb.collection("users").doc(ALICE_UID).collection("projects").get());
});

// 4. Editing and Deleting Projects
test("5. Authenticated user: can edit and update their existing project", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().collection("users").doc(ALICE_UID).collection("projects").doc("proj_101").set({
      userId: ALICE_UID,
      title: "Draft Title",
      status: "Draft"
    });
  });

  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();
  await assertSucceeds(
    aliceDb.collection("users").doc(ALICE_UID).collection("projects").doc("proj_101").update({
      title: "Final Polished Title",
      status: "Ready"
    })
  );
});

test("6. Authenticated user: can delete their project", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().collection("users").doc(ALICE_UID).collection("projects").doc("proj_101").set({
      userId: ALICE_UID,
      title: "To Be Deleted"
    });
  });

  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();
  await assertSucceeds(
    aliceDb.collection("users").doc(ALICE_UID).collection("projects").doc("proj_101").delete()
  );
});

// 5. Cross-User Security Rules Bounds
test("7. Cross-User isolation: Bob cannot read or modify Alice's projects", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().collection("users").doc(ALICE_UID).collection("projects").doc("alice_secret_proj").set({
      userId: ALICE_UID,
      title: "Alice's Curriculum",
      status: "Confidential"
    });
  });

  const bobDb = testEnv.authenticatedContext(BOB_UID).firestore();
  // Bob tries to read Alice's project
  await assertFails(
    bobDb.collection("users").doc(ALICE_UID).collection("projects").doc("alice_secret_proj").get()
  );
  // Bob tries to update Alice's project
  await assertFails(
    bobDb.collection("users").doc(ALICE_UID).collection("projects").doc("alice_secret_proj").update({
      title: "Hacked by Bob"
    })
  );
  // Bob tries to delete Alice's project
  await assertFails(
    bobDb.collection("users").doc(ALICE_UID).collection("projects").doc("alice_secret_proj").delete()
  );
});
