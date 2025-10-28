import { z } from "zod";

// Admin-specific translations
export const adminTranslationsData = {
  navigation: {
    dashboard: {
      english: "Dashboard",
      hinglish: "Dashboard",
      hindi: "डैशबोर्ड",
    },
    ledger: {
      english: "Ledger",
      hinglish: "Ledger",
      hindi: "लेजर",
    },
    admin: {
      english: "Admin",
      hinglish: "Admin",
      hindi: "प्रशासन",
    },
  },
  admin: {
    pageTitle: {
      english: "Admin Panel | Shopkeeper Sales Ledger",
      hinglish: "Admin Panel | Shopkeeper Sales Ledger",
      hindi: "प्रशासन पैनल | दुकानदार बिक्री लेजर",
    },
    metaDescription: {
      english: "Manage users and view all estimates in the system.",
      hinglish: "Users manage karein aur system ke saare estimates dekhein.",
      hindi: "उपयोगकर्ताओं को प्रबंधित करें और सिस्टम में सभी अनुमान देखें।",
    },
    title: {
      english: "Admin Dashboard",
      hinglish: "Admin Dashboard",
      hindi: "प्रशासन डैशबोर्ड",
    },
    subtitle: {
      english: "Manage all users and estimates in the system.",
      hinglish: "System ke saare users aur estimates manage karein.",
      hindi: "सिस्टम में सभी उपयोगकर्ताओं और अनुमानों को प्रबंधित करें।",
    },
    usersTab: {
      english: "Users",
      hinglish: "Users",
      hindi: "उपयोगकर्ता",
    },
    estimatesTab: {
      english: "Estimates",
      hinglish: "Estimates",
      hindi: "अनुमान",
    },
    errorLoadingUsers: {
      english: "Error loading users",
      hinglish: "Users load karne mein error",
      hindi: "उपयोगकर्ता लोड करने में त्रुटि",
    },
    noUsersFound: {
      english: "No users found",
      hinglish: "Koi users nahi mile",
      hindi: "कोई उपयोगकर्ता नहीं मिला",
    },
    errorLoadingEstimates: {
      english: "Error loading estimates",
      hinglish: "Estimates load karne mein error",
      hindi: "अनुमान लोड करने में त्रुटि",
    },
    noEstimatesFound: {
      english: "No estimates found",
      hinglish: "Koi estimates nahi mile",
      hindi: "कोई अनुमान नहीं मिला",
    },
  },
  "admin.users": {
    businessName: {
      english: "Business Name",
      hinglish: "Business ka Naam",
      hindi: "व्यवसाय का नाम",
    },
    ownerName: {
      english: "Owner Name",
      hinglish: "Malik ka Naam",
      hindi: "मालिक का नाम",
    },
    contact: {
      english: "Contact",
      hinglish: "Contact",
      hindi: "संपर्क",
    },
    role: {
      english: "Role",
      hinglish: "Role",
      hindi: "भूमिका",
    },
    estimateCount: {
      english: "Estimates",
      hinglish: "Estimates",
      hindi: "अनुमान",
    },
    totalAmount: {
      english: "Total Amount",
      hinglish: "Total Amount",
      hindi: "कुल राशि",
    },
    joinedOn: {
      english: "Joined On",
      hinglish: "Join Kiya",
      hindi: "शामिल हुए",
    },
    actions: {
      english: "Actions",
      hinglish: "Actions",
      hindi: "क्रियाएं",
    },
    resetPin: {
      english: "Reset PIN",
      hinglish: "PIN Reset Karein",
      hindi: "पिन रीसेट करें",
    },
    resetPinTitle: {
      english: "Reset User PIN",
      hinglish: "User ka PIN Reset Karein",
      hindi: "उपयोगकर्ता का पिन रीसेट करें",
    },
    resetPinDescription: {
      english: "Enter a new 4-6 digit PIN for {{userName}}.",
      hinglish: "{{userName}} ke liye naya 4-6 digit PIN enter karein.",
      hindi: "{{userName}} के लिए नया 4-6 अंकों का पिन दर्ज करें।",
    },
    newPin: {
      english: "New PIN",
      hinglish: "Naya PIN",
      hindi: "नया पिन",
    },
    newPinPlaceholder: {
      english: "Enter 4-6 digits",
      hinglish: "4-6 digit enter karein",
      hindi: "4-6 अंक दर्ज करें",
    },
    resetPinSuccess: {
      english: "PIN reset successfully",
      hinglish: "PIN reset ho gaya",
      hindi: "पिन सफलतापूर्वक रीसेट हो गया",
    },
    resetPinError: {
      english: "Failed to reset PIN",
      hinglish: "PIN reset nahi ho paya",
      hindi: "पिन रीसेट करने में विफल",
    },
    pinRequired: {
      english: "PIN is required",
      hinglish: "PIN zaroori hai",
      hindi: "पिन आवश्यक है",
    },
    pinInvalid: {
      english: "PIN must be 4-6 digits",
      hinglish: "PIN 4-6 digit ka hona chahiye",
      hindi: "पिन 4-6 अंकों का होना चाहिए",
    },
    searchPlaceholder: {
      english: "Search by business name, owner, or contact...",
      hinglish: "Business naam, malik, ya contact se search karein...",
      hindi: "व्यवसाय नाम, मालिक, या संपर्क से खोजें...",
    },
    status: {
      english: "Status",
      hinglish: "Status",
      hindi: "स्थिति",
    },
    active: {
      english: "Active",
      hinglish: "Active",
      hindi: "सक्रिय",
    },
    disabled: {
      english: "Disabled",
      hinglish: "Disabled",
      hindi: "निष्क्रिय",
    },
    enableUser: {
      english: "Enable",
      hinglish: "Enable Karein",
      hindi: "सक्षम करें",
    },
    disableUser: {
      english: "Disable",
      hinglish: "Disable Karein",
      hindi: "निष्क्रिय करें",
    },
    disableUserTitle: {
      english: "Disable User?",
      hinglish: "User Disable Karein?",
      hindi: "उपयोगकर्ता को निष्क्रिय करें?",
    },
    disableUserConfirm: {
      english: "Are you sure you want to disable {{userName}}? They will only have view access.",
      hinglish: "Kya aap sure hain {{userName}} ko disable karna chahte hain? Unhe sirf view access milega.",
      hindi: "क्या आप {{userName}} को निष्क्रिय करना चाहते हैं? उन्हें केवल देखने की पहुंच मिलेगी।",
    },
    userStatusToggled: {
      english: "User status updated",
      hinglish: "User status update ho gaya",
      hindi: "उपयोगकर्ता स्थिति अपडेट हो गई",
    },
    userStatusToggleError: {
      english: "Failed to update user status",
      hinglish: "User status update nahi ho paya",
      hindi: "उपयोगकर्ता स्थिति अपडेट नहीं हो सकी",
    },
  },
  "admin.estimates": {
    estimateNo: {
      english: "Estimate #",
      hinglish: "Estimate #",
      hindi: "अनुमान #",
    },
    customer: {
      english: "Customer",
      hinglish: "Customer",
      hindi: "ग्राहक",
    },
    businessName: {
      english: "Business",
      hinglish: "Business",
      hindi: "व्यवसाय",
    },
    date: {
      english: "Date",
      hinglish: "Taarikh",
      hindi: "दिनांक",
    },
    amount: {
      english: "Amount",
      hinglish: "Amount",
      hindi: "राशि",
    },
    paymentType: {
      english: "Payment Type",
      hinglish: "Payment Type",
      hindi: "भुगतान प्रकार",
    },
    status: {
      english: "Status",
      hinglish: "Status",
      hindi: "स्थिति",
    },
    searchPlaceholder: {
      english: "Search by customer, mobile, estimate #, or business...",
      hinglish: "Customer, mobile, estimate #, ya business se search karein...",
      hindi: "ग्राहक, मोबाइल, अनुमान #, या व्यवसाय से खोजें...",
    },
    filterByUser: {
      english: "Filter by User",
      hinglish: "User se Filter Karein",
      hindi: "उपयोगकर्ता से फ़िल्टर करें",
    },
  },
};