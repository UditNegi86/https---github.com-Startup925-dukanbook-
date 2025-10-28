import { z } from "zod";
import { adminTranslationsData } from "./adminTranslations";
import { marketplaceTranslationsData } from "./marketplaceTranslations";
import { supplierTranslationsData } from "./supplierTranslations";
import { reportTranslationsData } from "./reportTranslations";
import { moduleTranslationsData } from "./moduleTranslations";

export const LanguageArray = ["english", "hinglish", "hindi"] as const;
export const LanguageEnum = z.enum(LanguageArray);
export type Language = z.infer<typeof LanguageEnum>;

const translationsData = {
  ...adminTranslationsData,
  ...marketplaceTranslationsData,
  ...supplierTranslationsData,
  ...reportTranslationsData,
  ...moduleTranslationsData,
  subusers: {
      title: {
        english: "Manage Subusers",
        hinglish: "Subusers Manage Karein",
        hindi: "सबयूज़र्स प्रबंधित करें",
      },
      addSubuser: {
        english: "Add Subuser",
        hinglish: "Subuser Add Karein",
        hindi: "सबयूज़र जोड़ें",
      },
      createTitle: {
        english: "Create New Subuser",
        hinglish: "Naya Subuser Banayein",
        hindi: "नया सबयूज़र बनाएं",
      },
      createDescription: {
        english: "Create a new subuser who can create estimates",
        hinglish: "Naya subuser banayein jo sirf estimate bana sake",
        hindi: "नया सबयूज़र बनाएं जो केवल अनुमान बना सके",
      },
      editTitle: {
        english: "Edit Subuser",
        hinglish: "Subuser Edit Karein",
        hindi: "सबयूज़र संपादित करें",
      },
      editDescription: {
        english: "Edit {name}'s details",
        hinglish: "{name} ki details edit karein",
        hindi: "{name} का विवरण संपादित करें",
      },
      createSubuser: {
        english: "Create Subuser",
        hinglish: "Subuser Banayein",
        hindi: "सबयूज़र बनाएं",
      },
      noSubusersFound: {
        english: "No Subusers Found",
        hinglish: "Koi Subuser Nahi Mila",
        hindi: "कोई सबयूज़र नहीं मिला",
      },
      createSubuserToStart: {
        english: "Create a subuser to get started. Subusers can only create estimates.",
        hinglish: "Shuru karne ke liye subuser banayein. Subuser sirf estimate bana sakte hain.",
        hindi: "शुरू करने के लिए सबयूज़र बनाएं। सबयूज़र केवल अनुमान बना सकते हैं।",
      },
      errorLoading: {
        english: "Error loading subusers",
        hinglish: "Subuser load karne mein error",
        hindi: "सबयूज़र लोड करने में त्रुटि",
      },
      name: {
        english: "Name",
        hinglish: "Naam",
        hindi: "नाम",
      },
      username: {
        english: "Username",
        hinglish: "Username",
        hindi: "उपयोगकर्ता नाम",
      },
      password: {
        english: "Password",
        hinglish: "Password",
        hindi: "पासवर्ड",
      },
      status: {
        english: "Status",
        hinglish: "Status",
        hindi: "स्थिति",
      },
      createdDate: {
        english: "Created Date",
        hinglish: "Creation Date",
        hindi: "निर्माण तिथि",
      },
      actions: {
        english: "Actions",
        hinglish: "Actions",
        hindi: "क्रियाएं",
      },
      active: {
        english: "Active",
        hinglish: "Active",
        hindi: "सक्रिय",
      },
      inactive: {
        english: "Inactive",
        hinglish: "Inactive",
        hindi: "निष्क्रिय",
      },
      deleteTitle: {
        english: "Delete Subuser",
        hinglish: "Subuser Delete Karein",
        hindi: "सबयूज़र हटाएं",
      },
      deleteConfirmation: {
        english: "Are you sure you want to delete {name}? This action cannot be undone.",
        hinglish: "Kya aap {name} ko delete karna chahte hain? Yeh action undo nahi ho sakta.",
        hindi: "क्या आप वाकई {name} को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।",
      },
      namePlaceholder: {
        english: "Enter name",
        hinglish: "Naam enter karein",
        hindi: "नाम दर्ज करें",
      },
      usernamePlaceholder: {
        english: "Enter username",
        hinglish: "Username enter karein",
        hindi: "उपयोगकर्ता नाम दर्ज करें",
      },
      passwordOptionalPlaceholder: {
        english: "Leave blank to keep current password",
        hinglish: "Current password rakhne ke liye khali chhod dein",
        hindi: "वर्तमान पासवर्ड रखने के लिए खाली छोड़ दें",
      },
  },
  navigation: {
    dashboard: {
      english: "Dashboard",
      hinglish: "Dashboard",
      hindi: "डैशबोर्ड",
    },
    ledger: {
      english: "Customer Record",
      hinglish: "Customer Record",
      hindi: "ग्राहक रिकॉर्ड",
    },
    inventory: {
      english: "Inventory",
      hinglish: "Inventory",
      hindi: "सूची",
    },
    marketplace: {
      english: "Marketplace",
      hinglish: "Marketplace",
      hindi: "बाज़ार",
    },
    suppliers: {
      english: "Suppliers",
      hinglish: "Suppliers",
      hindi: "आपूर्तिकर्ता",
    },
    reports: {
      english: "Reports",
      hinglish: "Reports",
      hindi: "रिपोर्ट",
    },
    admin: {
      english: "Admin",
      hinglish: "Admin",
      hindi: "व्यवस्थापक",
    },
  },
  printEstimate: {
    estimate: {
      english: "ESTIMATE",
      hinglish: "ESTIMATE",
      hindi: "अनुमान",
    },
    bill: {
      english: "BILL",
      hinglish: "BILL",
      hindi: "बिल",
    },
    billNumber: {
      english: "Bill #:",
      hinglish: "Bill #:",
      hindi: "बिल #:",
    },
    shopkeeper: {
      english: "Shopkeeper",
      hinglish: "Shopkeeper",
      hindi: "दुकानदार",
    },
    businessAddress: {
      english: "Your Business Address",
      hinglish: "Aapka Business Address",
      hindi: "आपका व्यवसाय पता",
    },
    cityStatePincode: {
      english: "City, State, Pincode",
      hinglish: "City, State, Pincode",
      hindi: "शहर, राज्य, पिनकोड",
    },
    billTo: {
      english: "Bill To:",
      hinglish: "Bill To:",
      hindi: "बिल प्राप्तकर्ता:",
    },
    estimateNumber: {
      english: "Estimate #:",
      hinglish: "Estimate #:",
      hindi: "अनुमान #:",
    },
    date: {
      english: "Date:",
      hinglish: "Taarikh:",
      hindi: "दिनांक:",
    },
    description: {
      english: "Description",
      hinglish: "Description",
      hindi: "विवरण",
    },
    quantity: {
      english: "Quantity",
      hinglish: "Quantity",
      hindi: "मात्रा",
    },
    unitPrice: {
      english: "Unit Price",
      hinglish: "Unit Price",
      hindi: "इकाई मूल्य",
    },
    amount: {
      english: "Amount",
      hinglish: "Amount",
      hindi: "राशि",
    },
    notes: {
      english: "Notes:",
      hinglish: "Notes:",
      hindi: "नोट्स:",
    },
    paymentType: {
      english: "Payment Type:",
      hinglish: "Payment ka Type:",
      hindi: "भुगतान का प्रकार:",
    },
    expectedPaymentDate: {
      english: "Expected Payment Date:",
      hinglish: "Expected Payment Taarikh:",
      hindi: "अपेक्षित भुगतान तिथि:",
    },
    subtotal: {
      english: "Subtotal",
      hinglish: "Subtotal",
      hindi: "उप-योग",
    },
    discount: {
      english: "Discount",
      hinglish: "Discount",
      hindi: "छूट",
    },
    tax: {
      english: "Tax",
      hinglish: "Tax",
      hindi: "कर",
    },
    totalAmount: {
      english: "Total Amount",
      hinglish: "Total Amount",
      hindi: "कुल राशि",
    },
    thankYou: {
      english: "Thank you for your business!",
      hinglish: "Aapke business ke liye dhanyavaad!",
      hindi: "आपके व्यवसाय के लिए धन्यवाद!",
    },
  },
  ledger: {
    pageTitle: {
      english: "Customer Record | Shopkeeper",
      hinglish: "Customer Record | Shopkeeper",
      hindi: "ग्राहक रिकॉर्ड | दुकानदार",
    },
    metaDescription: {
      english: "View customer-wise sales records and transaction history.",
      hinglish: "Customer-wise sales records aur transaction history dekhein.",
      hindi: "ग्राहक-वार बिक्री रिकॉर्ड और लेनदेन इतिहास देखें।",
    },
    title: {
      english: "Customer Record",
      hinglish: "Customer Record",
      hindi: "ग्राहक रिकॉर्ड",
    },
    subtitle: {
      english: "A summary of sales and transactions for each customer.",
      hinglish: "Har customer ke liye sales aur transactions ka summary.",
      hindi: "प्रत्येक ग्राहक के लिए बिक्री और लेनदेन का सारांश।",
    },
    errorFetching: {
      english: "Error Fetching Ledger",
      hinglish: "Ledger Fetch Karne Mein Error",
      hindi: "लेजर लाने में त्रुटि",
    },
  },
  printCustomerLedger: {
    ledgerTitle: {
      english: "CUSTOMER RECORD",
      hinglish: "CUSTOMER RECORD",
      hindi: "ग्राहक रिकॉर्ड",
    },
    shopkeeper: {
      english: "Shopkeeper",
      hinglish: "Shopkeeper",
      hindi: "दुकानदार",
    },
    businessAddress: {
      english: "Your Business Address",
      hinglish: "Aapka Business Address",
      hindi: "आपका व्यवसाय पता",
    },
    cityStatePincode: {
      english: "City, State, Pincode",
      hinglish: "City, State, Pincode",
      hindi: "शहर, राज्य, पिनकोड",
    },
    customerDetails: {
      english: "Customer Details:",
      hinglish: "Customer Details:",
      hindi: "ग्राहक विवरण:",
    },
    totalEstimates: {
      english: "Total Estimates",
      hinglish: "Total Estimates",
      hindi: "कुल अनुमान",
    },
    totalAmountSpent: {
      english: "Total Amount Spent",
      hinglish: "Total Amount Spent",
      hindi: "कुल खर्च राशि",
    },
    transactionHistory: {
      english: "Transaction History",
      hinglish: "Transaction History",
      hindi: "लेनदेन इतिहास",
    },
    estimateNumber: {
      english: "Estimate #:",
      hinglish: "Estimate #:",
      hindi: "अनुमान #:",
    },
    date: {
      english: "Date:",
      hinglish: "Taarikh:",
      hindi: "दिनांक:",
    },
    payment: {
      english: "Payment:",
      hinglish: "Payment:",
      hindi: "भुगतान:",
    },
    due: {
      english: "Due:",
      hinglish: "Due:",
      hindi: "देय:",
    },
    description: {
      english: "Description",
      hinglish: "Description",
      hindi: "विवरण",
    },
    qty: {
      english: "Qty",
      hinglish: "Qty",
      hindi: "मात्रा",
    },
    unitPrice: {
      english: "Unit Price",
      hinglish: "Unit Price",
      hindi: "इकाई मूल्य",
    },
    amount: {
      english: "Amount",
      hinglish: "Amount",
      hindi: "राशि",
    },
    subtotal: {
      english: "Subtotal",
      hinglish: "Subtotal",
      hindi: "उप-योग",
    },
    discount: {
      english: "Discount",
      hinglish: "Discount",
      hindi: "छूट",
    },
    tax: {
      english: "Tax",
      hinglish: "Tax",
      hindi: "कर",
    },
    totalAmount: {
      english: "Total Amount",
      hinglish: "Total Amount",
      hindi: "कुल राशि",
    },
    grandTotal: {
      english: "Grand Total",
      hinglish: "Grand Total",
      hindi: "महा योग",
    },
    computerGenerated: {
      english: "This is a computer-generated statement.",
      hinglish: "Yeh ek computer-generated statement hai.",
      hindi: "यह एक कंप्यूटर-जनित विवरण है।",
    },
  },
  customerLedger: {
    customer: {
      english: "Customer",
      hinglish: "Customer",
      hindi: "ग्राहक",
    },
    estimates: {
      english: "Estimates",
      hinglish: "Estimates",
      hindi: "अनुमान",
    },
    totalSpent: {
      english: "Total Spent",
      hinglish: "Total Spent",
      hindi: "कुल खर्च",
    },
    lastTransaction: {
      english: "Last Transaction",
      hinglish: "Last Transaction",
      hindi: "अंतिम लेनदेन",
    },
    transactionHistory: {
      english: "Transaction History",
      hinglish: "Transaction History",
      hindi: "लेनदेन इतिहास",
    },
    noCustomerData: {
      english: "No Customer Data",
      hinglish: "Koi Customer Data Nahi",
      hindi: "कोई ग्राहक डेटा नहीं",
    },
    createEstimatesPrompt: {
      english: "Create some estimates to see record information here.",
      hinglish: "Yahan record information dekhne ke liye kuch estimates banayein.",
      hindi: "यहां रिकॉर्ड जानकारी देखने के लिए कुछ अनुमान बनाएं।",
    },
    creditPaid: {
      english: "Credit - Paid",
      hinglish: "Credit - Paid",
      hindi: "क्रेडिट - भुगतान किया गया",
    },
    creditPending: {
      english: "Credit - Pending",
      hinglish: "Credit - Pending",
      hindi: "क्रेडिट - लंबित",
    },
    via: {
      english: "via",
      hinglish: "via",
      hindi: "द्वारा",
    },
    subtotal: {
      english: "Subtotal",
      hinglish: "Subtotal",
      hindi: "उप-योग",
    },
    discount: {
      english: "Discount",
      hinglish: "Discount",
      hindi: "छूट",
    },
    tax: {
      english: "Tax",
      hinglish: "Tax",
      hindi: "कर",
    },
    totalAmount: {
      english: "Total Amount",
      hinglish: "Total Amount",
      hindi: "कुल राशि",
    },
    printCustomerLedger: {
      english: "Print Customer Record",
      hinglish: "Customer Record Print Karein",
      hindi: "ग्राहक रिकॉर्ड प्रिंट करें",
    },
  },
  dashboard: {
    pageTitle: {
      english: "Dashboard | Shopkeeper Sales Ledger",
      hinglish: "Dashboard | Dukandar Sales Ledger",
      hindi: "डैशबोर्ड | दुकानदार बिक्री लेजर",
    },
    metaDescription: {
      english: "Manage your sales estimates and records.",
      hinglish: "Apne sales estimates aur records manage karein.",
      hindi: "अपने बिक्री अनुमान और रिकॉर्ड प्रबंधित करें।",
    },
    title: {
      english: "Estimates Dashboard",
      hinglish: "Estimates Dashboard",
      hindi: "अनुमान डैशबोर्ड",
    },
    subtitle: {
      english: "View, create, and manage your sales estimates.",
      hinglish: "Apne sales estimates dekhein, banayein, aur manage karein.",
      hindi: "अपने बिक्री अनुमान देखें, बनाएं और प्रबंधित करें।",
    },
    createNewEstimate: {
      english: "Create New Estimate",
      hinglish: "Naya Estimate Banayein",
      hindi: "नया अनुमान बनाएं",
    },
    dashboardTab: {
      english: "Dashboard",
      hinglish: "Dashboard",
      hindi: "डैशबोर्ड",
    },
    ledgerTab: {
      english: "Ledger",
      hinglish: "Ledger",
      hindi: "लेजर",
    },
    searchPlaceholder: {
      english: "Search by customer name, mobile, or amount...",
      hinglish: "Customer ka naam, mobile, ya amount se search karein...",
      hindi: "ग्राहक का नाम, मोबाइल, या राशि से खोजें...",
    },
    errorLoading: {
      english: "Failed to load estimates.",
      hinglish: "Estimates load karne mein fail ho gaya.",
      hindi: "अनुमान लोड करने में विफल।",
    },
    unknownError: {
      english: "Unknown error",
      hinglish: "Agyat error",
      hindi: "अज्ञात त्रुटि",
    },
    accountDisabled: {
      english: "Account Disabled",
      hinglish: "Account Disabled Hai",
      hindi: "खाता निष्क्रिय है",
    },
    viewOnlyAccess: {
      english: "You have view-only access. Please contact admin.",
      hinglish: "Aapko sirf view access hai. Admin se contact karein.",
      hindi: "आपके पास केवल देखने की पहुंच है। कृपया व्यवस्थापक से संपर्क करें।",
    },
    subscriptionExpired: {
      english: "Subscription Expired",
      hinglish: "Subscription Khatam Ho Gaya",
      hindi: "सदस्यता समाप्त हो गई",
    },
    renewToContinue: {
      english: "Please renew to continue using the app.",
      hinglish: "App use karne ke liye renew karein.",
      hindi: "ऐप का उपयोग जारी रखने के लिए कृपया नवीनीकृत करें।",
    },
    renewSubscription: {
      english: "Renew Subscription",
      hinglish: "Subscription Renew Karein",
      hindi: "सदस्यता नवीनीकृत करें",
    },
    subscriptionExpiringSoon: {
      english: "Subscription Expiring Soon",
      hinglish: "Subscription Jald Khatam Ho Rahi Hai",
      hindi: "सदस्यता जल्द समाप्त हो रही है",
    },
    subscriptionExpiresOn: {
      english: "Your subscription expires on",
      hinglish: "Aapki subscription khatam hogi",
      hindi: "आपकी सदस्यता समाप्त होगी",
    },
    renewToAvoidInterruption: {
      english: "Renew now to avoid interruption.",
      hinglish: "Service band na ho, abhi renew karein.",
      hindi: "रुकावट से बचने के लिए अभी नवीनीकृत करें।",
    },
    renew: {
      english: "Renew",
      hinglish: "Renew",
      hindi: "नवीनीकृत करें",
    },
  },
  estimateTable: {
    // Headers
    estimateNumber: {
      english: "Estimate #",
      hinglish: "Estimate #",
      hindi: "अनुमान #",
    },
    date: {
      english: "Date",
      hinglish: "Taarikh",
      hindi: "दिनांक",
    },
    customer: {
      english: "Customer",
      hinglish: "Customer",
      hindi: "ग्राहक",
    },
    mobile: {
      english: "Mobile",
      hinglish: "Mobile",
      hindi: "मोबाइल",
    },
    amount: {
      english: "Amount",
      hinglish: "Amount",
      hindi: "राशि",
    },
    payment: {
      english: "Payment",
      hinglish: "Payment",
      hindi: "भुगतान",
    },
    // Actions
        print: {
      english: "Print",
      hinglish: "Print",
      hindi: "प्रिंट",
    },
    convertToBill: {
      english: "Convert to Bill",
      hinglish: "Bill Mein Convert Karein",
      hindi: "बिल में बदलें",
    },
    convertToBillSuccess: {
      english: "Successfully converted to bill",
      hinglish: "Bill mein convert ho gaya",
      hindi: "सफलतापूर्वक बिल में बदल दिया गया",
    },
        convertToBillError: {
      english: "Failed to convert to bill",
      hinglish: "Bill mein convert nahi hua",
      hindi: "बिल में बदलने में विफल",
    },
    createdBy: {
      english: "Created by",
      hinglish: "Banaya",
      hindi: "द्वारा बनाया",
    },
    estimateNumberBillNumber: {
      english: "Estimate # / Bill #",
      hinglish: "Estimate # / Bill #",
      hindi: "अनुमान # / बिल #",
    },
    bill: {
      english: "Bill",
      hinglish: "Bill",
      hindi: "बिल",
    },
    receivePayment: {
      english: "Receive Payment",
      hinglish: "Payment Receive Karein",
      hindi: "भुगतान प्राप्त करें",
    },
    edit: {
      english: "Edit",
      hinglish: "Edit",
      hindi: "संपादित करें",
    },
    delete: {
      english: "Delete",
      hinglish: "Delete",
      hindi: "हटाएं",
    },
    // Payment Status
    creditPaid: {
      english: "Credit - Paid",
      hinglish: "Credit - Paid",
      hindi: "क्रेडिट - भुगतान किया गया",
    },
    creditPending: {
      english: "Credit - Pending",
      hinglish: "Credit - Pending",
      hindi: "क्रेडिट - लंबित",
    },
    due: {
      english: "Due:",
      hinglish: "Due:",
      hindi: "देय:",
    },
    daysLeft: {
      english: "days left",
      hinglish: "din bache hain",
      hindi: "दिन शेष",
    },
    dayLeft: {
      english: "day left",
      hinglish: "din bacha hai",
      hindi: "दिन शेष",
    },
    daysOverdue: {
      english: "days overdue",
      hinglish: "din overdue",
      hindi: "दिन अतिदेय",
    },
    dayOverdue: {
      english: "day overdue",
      hinglish: "din overdue",
      hindi: "दिन अतिदेय",
    },
    via: {
      english: "via",
      hinglish: "via",
      hindi: "द्वारा",
    },
    // Empty State
    noEstimatesFound: {
      english: "No Estimates Found",
      hinglish: "Koi Estimates Nahi Mila",
      hindi: "कोई अनुमान नहीं मिला",
    },
    createEstimateToStart: {
      english: "Create a new estimate to get started.",
      hinglish: "Shuru karne ke liye naya estimate banayein.",
      hindi: "शुरू करने के लिए एक नया अनुमान बनाएं।",
    },
    // Breakdown
    itemsBreakdown: {
      english: "Items Breakdown",
      hinglish: "Items ka Breakdown",
      hindi: "आइटम का विवरण",
    },
    description: {
      english: "Description",
      hinglish: "Description",
      hindi: "विवरण",
    },
    quantity: {
      english: "Quantity",
      hinglish: "Quantity",
      hindi: "मात्रा",
    },
    unitPrice: {
      english: "Unit Price",
      hinglish: "Unit Price",
      hindi: "इकाई मूल्य",
    },
    subtotal: {
      english: "Subtotal",
      hinglish: "Subtotal",
      hindi: "उप-योग",
    },
    discount: {
      english: "Discount",
      hinglish: "Discount",
      hindi: "छूट",
    },
    tax: {
      english: "Tax",
      hinglish: "Tax",
      hindi: "कर",
    },
    totalAmount: {
      english: "Total Amount",
      hinglish: "Total Amount",
      hindi: "कुल राशि",
    },
    paymentStatus: {
      english: "Payment Status:",
      hinglish: "Payment Status:",
      hindi: "भुगतान की स्थिति:",
    },
    pending: {
      english: "Pending",
      hinglish: "Pending",
      hindi: "लंबित",
    },
    expectedPayment: {
      english: "Expected Payment:",
      hinglish: "Expected Payment:",
      hindi: "अपेक्षित भुगतान:",
    },
    // Delete Dialog
    areYouSure: {
      english: "Are you sure?",
      hinglish: "Pakka?",
      hindi: "क्या आप निश्चित हैं?",
    },
    deleteConfirmation: {
      english: "This action cannot be undone. This will permanently delete the estimate for",
      hinglish: "Yeh action undo nahi ho sakta. Isse estimate permanently delete ho jayega",
      hindi: "यह कार्रवाई पूर्ववत नहीं की जा सकती। यह स्थायी रूप से अनुमान को हटा देगा",
    },
  },
  estimateFormFields: {
    customerName: {
      english: "Customer Name",
      hinglish: "Customer ka Naam",
      hindi: "ग्राहक का नाम",
    },
    customerNamePlaceholder: {
      english: "e.g., John Doe",
      hinglish: "e.g., John Doe",
      hindi: "उदा., जॉन डो",
    },
    mobileNumber: {
            english: "Customer Contact Number",
      hinglish: "Customer Contact Number",
      hindi: "ग्राहक संपर्क नंबर",
    },
    mobileNumberPlaceholder: {
      english: "e.g., 9876543210",
      hinglish: "e.g., 9876543210",
      hindi: "उदा., 9876543210",
    },
    date: {
      english: "Date",
      hinglish: "Taarikh",
      hindi: "दिनांक",
    },
    pickDate: {
      english: "Pick a date",
      hinglish: "Taarikh chunein",
      hindi: "एक तारीख चुनें",
    },
    status: {
      english: "Status",
      hinglish: "Status",
      hindi: "स्थिति",
    },
    selectStatus: {
      english: "Select status",
      hinglish: "Status chunein",
      hindi: "स्थिति चुनें",
    },
  },
  estimateTotalsSection: {
    subtotal: {
      english: "Subtotal:",
      hinglish: "Subtotal:",
      hindi: "उप-योग:",
    },
    discount: {
      english: "Discount %:",
      hinglish: "Discount %:",
      hindi: "छूट %:",
    },
    tax: {
      english: "Tax %:",
      hinglish: "Tax %:",
      hindi: "कर %:",
    },
    totalAmount: {
      english: "Total Amount:",
      hinglish: "Total Amount:",
      hindi: "कुल राशि:",
    },
    paymentType: {
      english: "Payment Type",
      hinglish: "Payment ka Type",
      hindi: "भुगतान का प्रकार",
    },
    selectPaymentType: {
      english: "Select payment type",
      hinglish: "Payment ka type chunein",
      hindi: "भुगतान का प्रकार चुनें",
    },
    expectedPaymentDate: {
      english: "Expected Payment Date",
      hinglish: "Expected Payment Taarikh",
      hindi: "अपेक्षित भुगतान तिथि",
    },
    pickExpectedDate: {
      english: "Pick expected date",
      hinglish: "Expected taarikh chunein",
      hindi: "अपेक्षित तिथि चुनें",
    },
  },
  estimateDialog: {
    createTitle: {
      english: "Create New Estimate",
      hinglish: "Naya Estimate Banayein",
      hindi: "नया अनुमान बनाएं",
    },
    editTitle: {
      english: "Edit Estimate",
      hinglish: "Estimate Edit Karein",
      hindi: "अनुमान संपादित करें",
    },
    createDescription: {
      english: "Fill in the details below to create a new sales estimate.",
      hinglish: "Naya sales estimate banane ke liye neeche details bharein.",
      hindi: "नया बिक्री अनुमान बनाने के लिए नीचे दिए गए विवरण भरें।",
    },
    editDescription: {
      english: "Editing estimate #{{estimateNumber}} for {{customerName}}.",
      hinglish: "{{customerName}} ke liye estimate #{{estimateNumber}} edit kar rahe hain.",
      hindi: "{{customerName}} के लिए अनुमान #{{estimateNumber}} संपादित कर रहे हैं।",
    },
    // Form Fields
    mobileNumber: {
            english: "Customer Contact Number",
      hinglish: "Customer Contact Number",
      hindi: "ग्राहक संपर्क नंबर",
    },
    customerName: {
      english: "Customer Name",
      hinglish: "Customer ka Naam",
      hindi: "ग्राहक का नाम",
    },
    date: {
      english: "Date",
      hinglish: "Taarikh",
      hindi: "दिनांक",
    },
    status: {
      english: "Status",
      hinglish: "Status",
      hindi: "स्थिति",
    },
    pickDate: {
      english: "Pick a date",
      hinglish: "Taarikh chunein",
      hindi: "एक तारीख चुनें",
    },
    items: {
      english: "Items",
      hinglish: "Items",
      hindi: "आइटम",
    },
    itemDescription: {
      english: "Item description",
      hinglish: "Item ka description",
      hindi: "आइटम का विवरण",
    },
    notesOptional: {
      english: "Notes (Optional)",
      hinglish: "Notes (Optional)",
      hindi: "नोट्स (वैकल्पिक)",
    },
    notesPlaceholder: {
      english: "Add any additional notes here...",
      hinglish: "Yahan koi bhi additional notes daalein...",
      hindi: "यहां कोई अतिरिक्त नोट्स जोड़ें...",
    },
    discountPercent: {
      english: "Discount %:",
      hinglish: "Discount %:",
      hindi: "छूट %:",
    },
    taxPercent: {
      english: "Tax %:",
      hinglish: "Tax %:",
      hindi: "कर %:",
    },
    paymentType: {
      english: "Payment Type",
      hinglish: "Payment ka Type",
      hindi: "भुगतान का प्रकार",
    },
    expectedPaymentDate: {
      english: "Expected Payment Date",
      hinglish: "Expected Payment Taarikh",
      hindi: "अपेक्षित भुगतान तिथि",
    },
    pickExpectedDate: {
      english: "Pick expected date",
      hinglish: "Expected taarikh chunein",
      hindi: "अपेक्षित तिथि चुनें",
    },
    // Buttons
    addItem: {
      english: "Add Item",
      hinglish: "Item Add Karein",
      hindi: "आइटम जोड़ें",
    },
    saveChanges: {
      english: "Save Changes",
      hinglish: "Changes Save Karein",
      hindi: "बदलाव सहेजें",
    },
    createEstimate: {
      english: "Create Estimate",
      hinglish: "Estimate Banayein",
      hindi: "अनुमान बनाएं",
    },
    unknownError: {
      english: "An unknown error occurred.",
      hinglish: "Ek anjaan error hua.",
      hindi: "एक अज्ञात त्रुटि हुई।",
    },
  },
    paymentDialog: {
    title: {
      english: "Record Receive Payment",
      hinglish: "Payment Receive Record Karein",
      hindi: "भुगतान प्राप्ति रिकॉर्ड करें",
    },
    description: {
      english: "For estimate #{{estimateNumber}} to {{customerName}}.",
      hinglish: "{{customerName}} ke estimate #{{estimateNumber}} ke liye.",
      hindi: "{{customerName}} के अनुमान #{{estimateNumber}} के लिए।",
    },
    dateLabel: {
      english: "Receive Payment Date",
      hinglish: "Payment Receive Karne ki Taarikh",
      hindi: "भुगतान प्राप्ति की तिथि",
    },
    modeLabel: {
      english: "Payment Mode",
      hinglish: "Payment ka Mode",
      hindi: "भुगतान का तरीका",
    },
    amountLabel: {
      english: "Payment Amount",
      hinglish: "Payment ki Raqam",
      hindi: "भुगतान राशि",
    },
    totalAmount: {
      english: "Total Amount",
      hinglish: "Kul Raqam",
      hindi: "कुल राशि",
    },
    remainingBalance: {
      english: "Remaining Balance",
      hinglish: "Baki Raqam",
      hindi: "शेष राशि",
    },
    paymentHistory: {
      english: "Payment History",
      hinglish: "Payment History",
      hindi: "भुगतान इतिहास",
    },
    totalPaid: {
      english: "Total Paid",
      hinglish: "Kul Chukaya",
      hindi: "कुल भुगतान",
    },
    recordPayment: {
      english: "Record Payment",
      hinglish: "Payment Record Karein",
      hindi: "भुगतान रिकॉर्ड करें",
    },
    successToast: {
      english: "Payment for estimate #{{estimateNumber}} recorded successfully.",
      hinglish: "Estimate #{{estimateNumber}} ke liye payment successfully record ho gaya.",
      hindi: "अनुमान #{{estimateNumber}} के लिए भुगतान सफलतापूर्वक रिकॉर्ड किया गया।",
    },
  },
  auth: {
    username: {
      english: "Username",
      hinglish: "Username",
      hindi: "उपयोगकर्ता नाम",
    },
    usernamePlaceholder: {
      english: "Enter username",
      hinglish: "Username enter karein",
      hindi: "उपयोगकर्ता नाम दर्ज करें",
    },
    register: {
      english: "Register",
      hinglish: "Register",
      hindi: "रजिस्टर करें",
    },
    businessName: {
      english: "Business Name",
      hinglish: "Business ka Naam",
      hindi: "व्यवसाय का नाम",
    },
    businessNamePlaceholder: {
      english: "e.g., Sharma General Store",
      hinglish: "e.g., Sharma General Store",
      hindi: "उदा., शर्मा जनरल स्टोर",
    },
    ownerName: {
      english: "Owner Name",
      hinglish: "Malik ka Naam",
      hindi: "मालिक का नाम",
    },
    ownerNamePlaceholder: {
      english: "e.g., Rajesh Sharma",
      hinglish: "e.g., Rajesh Sharma",
      hindi: "उदा., राजेश शर्मा",
    },
    businessType: {
      english: "Business Type",
      hinglish: "Business ka Type",
      hindi: "व्यवसाय का प्रकार",
    },
    businessTypePlaceholder: {
      english: "e.g., Retail, Wholesale, Service",
      hinglish: "e.g., Retail, Wholesale, Service",
      hindi: "उदा., खुदरा, थोक, सेवा",
    },
    confirmPassword: {
      english: "Confirm Password",
      hinglish: "Password Confirm Karein",
      hindi: "पासवर्ड की पुष्टि करें",
    },
    confirmPasswordPlaceholder: {
      english: "••••••••",
      hinglish: "••••••••",
      hindi: "••••••••",
    },
    confirmPin: {
      english: "Confirm PIN",
      hinglish: "PIN Confirm Karein",
      hindi: "पिन की पुष्टि करें",
    },
    setPin: {
      english: "Set 4-6 Digit PIN",
      hinglish: "4-6 Digit PIN Set Karein",
      hindi: "4-6 अंकीय पिन सेट करें",
    },
    createAccount: {
      english: "Create Account",
      hinglish: "Account Banayein",
      hindi: "खाता बनाएं",
    },
    creatingAccount: {
      english: "Creating Account...",
      hinglish: "Account ban raha hai...",
      hindi: "खाता बनाया जा रहा है...",
    },
    pin: {
      english: "PIN",
      hinglish: "PIN",
      hindi: "पिन",
    },
    pinPlaceholder: {
      english: "4-digit PIN",
      hinglish: "4-digit PIN",
      hindi: "4-अंकीय पिन",
    },
    registerButton: {
      english: "Register",
      hinglish: "Register Karein",
      hindi: "रजिस्टर करें",
    },
    registering: {
      english: "Registering...",
      hinglish: "Register ho raha hai...",
      hindi: "रजिस्टर हो रहा है...",
    },
    alreadyHaveAccount: {
      english: "Already have an account?",
      hinglish: "Pehle se account hai?",
      hindi: "पहले से खाता है?",
    },
    registerError: {
      english: "Registration failed. Please try again.",
      hinglish: "Registration fail ho gaya. Phir se try karein.",
      hindi: "रजिस्ट्रेशन विफल रहा। कृपया पुनः प्रयास करें।",
    },
    mobileAlreadyInUse: {
            english: "This customer contact number is already registered. Please try logging in instead.",
      hinglish: "Yeh customer contact number pehle se registered hai. Login try karein.",
      hindi: "यह ग्राहक संपर्क नंबर पहले से पंजीकृत है। कृपया लॉगिन करने का प्रयास करें।",
    },
    login: {
      english: "Login",
      hinglish: "Login",
      hindi: "लॉगिन",
    },
    subuserLogin: {
      english: "Subuser Login",
      hinglish: "Subuser Login",
      hindi: "सबयूज़र लॉगिन",
    },
    mobileNumber: {
            english: "Customer Contact Number",
      hinglish: "Customer Contact Number",
      hindi: "ग्राहक संपर्क नंबर",
    },
    password: {
      english: "Password",
      hinglish: "Password",
      hindi: "पासवर्ड",
    },
    loginButton: {
      english: "Log In",
      hinglish: "Login Karein",
      hindi: "लॉगिन करें",
    },
    loggingIn: {
      english: "Logging in...",
      hinglish: "Login ho raha hai...",
      hindi: "लॉगिन हो रहा है...",
    },
    dontHaveAccount: {
      english: "Don't have an account?",
      hinglish: "Account nahi hai?",
      hindi: "खाता नहीं है?",
    },
    signUp: {
      english: "Sign up",
      hinglish: "Sign up karein",
      hindi: "साइन अप करें",
    },
    loginError: {
      english: "Login failed. Please try again.",
      hinglish: "Login fail ho gaya. Phir se try karein.",
      hindi: "लॉगिन विफल रहा। कृपया पुनः प्रयास करें।",
    },
    mobileNumberPlaceholder: {
      english: "e.g., 9876543210",
      hinglish: "e.g., 9876543210",
      hindi: "उदा., 9876543210",
    },
    passwordPlaceholder: {
      english: "••••••••",
      hinglish: "••••••••",
      hindi: "••••••••",
    },
    logout: {
      english: "Logout",
      hinglish: "Logout",
      hindi: "लॉगआउट",
    },
  },
    common: {
    all: {
      english: "All",
      hinglish: "Sab",
      hindi: "सभी",
    },
    cash: {
      english: "Cash",
      hinglish: "Cash",
      hindi: "नकद",
    },
    card: {
      english: "Card",
      hinglish: "Card",
      hindi: "कार्ड",
    },
    upi: {
      english: "UPI",
      hinglish: "UPI",
      hindi: "यूपीआई",
    },
    credit: {
      english: "Credit",
      hinglish: "Credit",
      hindi: "क्रेडिट",
    },
    cancel: {
      english: "Cancel",
      hinglish: "Cancel",
      hindi: "रद्द करें",
    },
    delete: {
      english: "Delete",
      hinglish: "Delete",
      hindi: "हटाएं",
    },
    notes: {
      english: "Notes",
      hinglish: "Notes",
      hindi: "नोट्स",
    },
    notesPlaceholder: {
      english: "Add optional notes...",
      hinglish: "Optional notes daalein...",
      hindi: "वैकल्पिक नोट्स जोड़ें...",
    },
    english: {
      english: "English",
      hinglish: "English",
      hindi: "अंग्रेज़ी",
    },
    hinglish: {
      english: "Hinglish",
      hinglish: "Hinglish",
      hindi: "हिंग्लिश",
    },
    hindi: {
      english: "Hindi",
      hinglish: "Hindi",
      hindi: "हिन्दी",
    },
    appName: {
      english: "Shopkeeper Ledger",
      hinglish: "Shopkeeper Ledger",
      hindi: "दुकानदार लेजर",
    },
    allUsers: {
      english: "All Users",
      hinglish: "Sab Users",
      hindi: "सभी उपयोगकर्ता",
    },
    completed: {
      english: "Completed",
      hinglish: "Completed",
      hindi: "पूर्ण",
    },
    draft: {
      english: "Draft",
      hinglish: "Draft",
      hindi: "ड्राफ्ट",
    },
    error: {
      english: "Error",
      hinglish: "Error",
      hindi: "त्रुटि",
    },
    edit: {
      english: "Edit",
      hinglish: "Edit",
      hindi: "संपादित करें",
    },
    deleting: {
      english: "Deleting...",
      hinglish: "Delete Ho Raha Hai...",
      hindi: "हटाया जा रहा है...",
    },
    saving: {
      english: "Saving...",
      hinglish: "Save Ho Raha Hai...",
      hindi: "सहेजा जा रहा है...",
    },
    saveChanges: {
      english: "Save Changes",
      hinglish: "Changes Save Karein",
      hindi: "परिवर्तन सहेजें",
    },
  },
};

type Translations = typeof translationsData;
type TranslationKeys = {
  [K in keyof Translations]: {
    [S in keyof Translations[K] & string]: `${K & string}.${S}`;
  }[keyof Translations[K] & string];
}[keyof Translations];

export const translations: Record<Language, any> = {
  english: {},
  hinglish: {},
  hindi: {},
};

// Flatten the structure for easier lookup
for (const lang of LanguageArray) {
  for (const category in translationsData) {
    for (const key in translationsData[category as keyof Translations]) {
      const fullKey = `${category}.${key}`;
      translations[lang][fullKey] =
        translationsData[category as keyof Translations][
          key as keyof (typeof translationsData)[keyof Translations]
        ][lang];
    }
  }
}

export type TFunction = (
  key: TranslationKeys,
  options?: Record<string, string | number>,
) => string;