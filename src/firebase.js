import moviesData from "./disneyPlusMoviesData.json";

// Check if valid Firebase env config exists
const hasValidConfig =
  process.env.REACT_APP_FIREBASE_API_KEY &&
  process.env.REACT_APP_FIREBASE_API_KEY !== "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

let auth;
let provider;
let storage;
let db;

// Mock user state stored in localStorage for instant seamless experience
const STORAGE_KEY = "disney_clone_active_user";
const authListeners = new Set();

const notifyAuthListeners = (user) => {
  authListeners.forEach((listener) => {
    try {
      listener(user);
    } catch (e) {
      console.error(e);
    }
  });
};

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
};

const mockAuth = {
  currentUser: getStoredUser(),
  onAuthStateChanged: (callback) => {
    authListeners.add(callback);
    // Execute immediately with current state
    const current = getStoredUser();
    setTimeout(() => callback(current), 10);
    return () => authListeners.delete(callback);
  },
  signInWithPopup: async () => {
    const demoUser = {
      displayName: "Ishant",
      email: "ishant@disneyplus.com",
      photoURL: "/user-avatar.png",
      uid: "user-ishant-disney-01",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
    mockAuth.currentUser = demoUser;
    notifyAuthListeners(demoUser);
    return { user: demoUser };
  },
  signOut: async () => {
    localStorage.removeItem(STORAGE_KEY);
    mockAuth.currentUser = null;
    notifyAuthListeners(null);
    return Promise.resolve();
  },
};

const mockDb = {
  collection: (collectionName) => {
    if (collectionName === "movies") {
      const moviesObj = moviesData.movies || {};
      const docs = Object.entries(moviesObj).map(([id, data]) => ({
        id,
        data: () => data,
      }));

      return {
        onSnapshot: (callback) => {
          setTimeout(() => {
            callback({ docs });
          }, 50);
          return () => {};
        },
        doc: (id) => ({
          get: async () => {
            const data = moviesObj[id];
            return {
              exists: !!data,
              data: () => data,
            };
          },
        }),
      };
    }

    return {
      onSnapshot: (cb) => {
        cb({ docs: [] });
        return () => {};
      },
      doc: () => ({
        get: async () => ({ exists: false, data: () => null }),
      }),
    };
  },
};

if (hasValidConfig) {
  try {
    const firebase = require("firebase/compat/app").default;
    require("firebase/compat/auth");
    require("firebase/compat/firestore");
    require("firebase/compat/storage");

    const firebaseConfig = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID,
      measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
    };

    const firebaseApp = firebase.initializeApp(firebaseConfig);
    db = firebaseApp.firestore();
    auth = firebase.auth();
    provider = new firebase.auth.GoogleAuthProvider();
    storage = firebase.storage();
  } catch (err) {
    console.warn("Failed to initialize live Firebase, falling back to mock provider:", err);
    auth = mockAuth;
    provider = {};
    storage = {};
    db = mockDb;
  }
} else {
  // Use mock adapter
  auth = mockAuth;
  provider = {};
  storage = {};
  db = mockDb;
}

export { auth, provider, storage };
export default db;
