import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User 
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Auth Provider with Scopes
export const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/forms.body");
provider.addScope("https://www.googleapis.com/auth/spreadsheets");
provider.addScope("https://www.googleapis.com/auth/drive.file");

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      // If we have a cached token, notify immediately
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // We might not have the access token from onAuthStateChanged directly (Firebase Auth only gives idToken).
        // For security, if session is restored, we check localStorage or ask user to sign-in again to get a fresh accessToken
        const savedToken = localStorage.getItem("sm_google_access_token");
        if (savedToken) {
          cachedAccessToken = savedToken;
          if (onAuthSuccess) onAuthSuccess(user, savedToken);
        } else if (!isSigningIn) {
          cachedAccessToken = null;
          if (onAuthFailure) onAuthFailure();
        }
      }
    } else {
      cachedAccessToken = null;
      localStorage.removeItem("sm_google_access_token");
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Google sign-in
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to get access token from Google Auth");
    }

    cachedAccessToken = credential.accessToken;
    localStorage.setItem("sm_google_access_token", cachedAccessToken);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Sign in error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Google sign-out
export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  localStorage.removeItem("sm_google_access_token");
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken || localStorage.getItem("sm_google_access_token");
};

// --- Google Drive API Helpers ---

// List files by mimeType
export const listDriveFiles = async (mimeType: string): Promise<any[]> => {
  const token = getAccessToken();
  if (!token) throw new Error("No Google access token found. Please sign in.");

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=mimeType='${mimeType}' and trashed = false&orderBy=modifiedTime desc&pageSize=30&fields=files(id, name, webViewLink, modifiedTime)`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || "Failed to list Google Drive files");
  }

  const data = await response.json();
  return data.files || [];
};

// --- Google Sheets API Helpers ---

const SHEET_COLUMNS = [
  "Timestamp",
  "Name",
  "Email",
  "Business Name",
  "Role",
  "Phone",
  "Business Description",
  "Business Location",
  "Target Audience",
  "Operating Time",
  "Biggest Challenge",
  "Primary Service",
  "Social Platforms",
  "Social Manager",
  "Social Goal",
  "Social Leads Current",
  "Social Direct Selling",
  "Social Blocker",
  "Software to Build",
  "Software Existing System",
  "Software Features",
  "Software E-commerce",
  "Software Automation Need",
  "Software Reference Link",
  "Software Budget",
  "Software Urgency",
  "AI Needs",
  "AI Existing Tools",
  "AI Training Data State",
  "AI Daily Users",
  "AI Success Metrics",
  "MCP Platforms",
  "MCP Target Systems",
  "MCP API Status",
  "MCP Actions List",
  "MCP Team Type",
  "MCP Compliance",
  "Brand Kit Status",
  "Brand Kit Link",
  "Photo Assets Link",
  "Marketing Assets Link",
  "Onboarding Logins",
  "Additional Comments",
  "Referral Source",
  "Contact Preference",
  "Pre-Talk Questions"
];

// Create a new Google Sheet
export const createGoogleSheet = async (title: string = "Signalmerge Consulting Leads"): Promise<{ id: string; url: string }> => {
  const token = getAccessToken();
  if (!token) throw new Error("No Google access token found. Please sign in.");

  const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        title: title,
      },
      sheets: [
        {
          properties: {
            title: "Leads",
            gridProperties: {
              frozenRowCount: 1,
            },
          },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: SHEET_COLUMNS.map(col => ({
                    userEnteredValue: { stringValue: col },
                    userEnteredFormat: {
                      textFormat: { bold: true },
                      backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 }
                    }
                  }))
                }
              ]
            }
          ]
        }
      ]
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || "Failed to create Google Sheet");
  }

  const data = await response.json();
  return {
    id: data.spreadsheetId,
    url: data.spreadsheetUrl,
  };
};

// Append data row to Google Sheet
export const appendLeadToSheet = async (spreadsheetId: string, lead: Record<string, any>): Promise<any> => {
  const token = getAccessToken();
  if (!token) throw new Error("No Google access token found. Please sign in.");

  const timestamp = new Date().toLocaleString();
  
  // Format row values to align perfectly with SHEET_COLUMNS headers
  const rowValues = [
    timestamp,
    lead.name || "",
    lead.email || "",
    lead.businessName || "",
    lead.role || "",
    lead.phone || "",
    lead.businessDescription || "",
    lead.businessLocation || "",
    lead.targetAudience || "",
    lead.operatingTime || "",
    lead.biggestChallenge || "",
    lead.primaryService || "",
    
    // Social
    (lead.socialPlatforms && Array.isArray(lead.socialPlatforms)) ? lead.socialPlatforms.join(", ") : (lead.socialPlatforms || ""),
    lead.socialManager || "",
    lead.socialGoal || "",
    lead.socialLeadsCurrent || "",
    lead.socialDirectSelling || "",
    lead.socialBlocker || "",

    // Software
    lead.softwareToBuild || "",
    lead.softwareExistingSystem === "Yes" ? `Yes (${lead.softwareExistingSystemUrl})` : (lead.softwareExistingSystem || ""),
    lead.softwareFeatures || "",
    lead.softwareEcommerce || "",
    lead.softwareAutomationNeed || "",
    lead.softwareReferenceLink || "",
    lead.softwareBudget || "",
    lead.softwareUrgency || "",

    // AI
    (lead.aiNeeds && Array.isArray(lead.aiNeeds)) ? lead.aiNeeds.join(", ") : (lead.aiNeeds || ""),
    lead.aiExistingTools || "",
    lead.aiTrainingDataState || "",
    lead.aiDailyUsers || "",
    lead.aiSuccessMetrics || "",

    // MCP
    (lead.mcpPlatforms && Array.isArray(lead.mcpPlatforms)) ? lead.mcpPlatforms.join(", ") : (lead.mcpPlatforms || ""),
    lead.mcpTargetSystems || "",
    lead.mcpApiStatus || "",
    lead.mcpActionsList || "",
    lead.mcpTeamType || "",
    lead.mcpCompliance || "",

    // Brand Kit & Additional info
    lead.brandKitStatus || "",
    lead.brandKitLink || "",
    lead.photoAssetsLink || "",
    lead.marketingAssetsLink || "",
    lead.onboardingLogins || "",
    lead.additionalComments || "",

    // Final Details
    lead.referralSource || "",
    lead.contactPreference || "",
    lead.preTalkQuestions || ""
  ];

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Leads!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        range: "Leads!A1",
        majorDimension: "ROWS",
        values: [rowValues],
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || "Failed to append row to Google Sheet");
  }

  return await response.json();
};

// --- Google Forms API Helpers ---

// Create a new Google Form with corresponding questions
export const createGoogleForm = async (title: string = "Signalmerge Client Consulting Intake"): Promise<{ id: string; url: string }> => {
  const token = getAccessToken();
  if (!token) throw new Error("No Google access token found. Please sign in.");

  // 1. Create the Form
  const response = await fetch("https://forms.googleapis.com/v1/forms", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      info: {
        title: title,
        documentTitle: title,
        description: "Bespoke software architecture, premium AI model pipelines, high-conversion social sales funnels, and real-time Claude Model Context Protocol (MCP) servers intake."
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || "Failed to create Google Form");
  }

  const form = await response.json();
  const formId = form.formId;
  const formUrl = form.responderUri;

  // 2. Add Questions (Core fields) to the Google Form
  const coreQuestions = [
    { title: "Your Name", required: true },
    { title: "Your Email Address", required: true },
    { title: "Your Business/Organization Name", required: true },
    { title: "Your Position/Role", required: true },
    { title: "Your Best Contact Phone Number", required: true },
    { title: "Business Description & Mission", required: true },
    { title: "Business Location / Primary Headquarters", required: true },
    { title: "Primary Target Audience & Customer Demographics", required: true },
    { title: "How long has your business been operating?", required: true },
    { title: "What is your single biggest business challenge or operational bottleneck?", required: true },
    { title: "Primary Service of Interest", required: true, choice: ["Social Media Sales Services", "Software Development & Design", "AI Module Development & Training", "MCP Server Development (Claude, Cursor, ChatGPT)"] },
    { title: "Brand Kit Status", required: true, choice: ["Yes, we have a fully-fledged Brand Kit and style guide", "We have a basic logo and core colors only", "No brand assets exist (need brand design service)"] },
    { title: "Brand Kit URL / Shared Folder Link", required: false },
    { title: "Dropbox/Drive Link for Custom Visual Assets", required: false },
    { title: "Reference Websites or Inspiration Links", required: false },
    { title: "Onboarding Logins / Credentials Needed", required: false },
    { title: "Additional Comments, Requirements, or Context", required: false },
    { title: "How did you hear about Signalmerge?", required: true },
    { title: "Preferred Contact Method", required: true, choice: ["Email", "Phone Call", "WhatsApp Text", "Google Meet / Zoom Video"] },
    { title: "Top Questions for Our Consulting Call", required: false }
  ];

  const requests = coreQuestions.map((q, idx) => {
    const item: any = {
      title: q.title,
    };

    if (q.choice) {
      item.questionItem = {
        question: {
          required: q.required,
          choiceQuestion: {
            type: "RADIO",
            options: q.choice.map(c => ({ value: c })),
          },
        },
      };
    } else {
      item.questionItem = {
        question: {
          required: q.required,
          textQuestion: {
            paragraph: q.title.length > 30, // Large text for descriptions
          },
        },
      };
    }

    return {
      createItem: {
        item: item,
        location: {
          index: idx,
        },
      },
    };
  });

  const updateResponse = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: requests,
    }),
  });

  if (!updateResponse.ok) {
    console.warn("Failed to insert questions into Google Form, but form was created.");
  }

  return {
    id: formId,
    url: formUrl,
  };
};
