import { z } from "zod";

// Supplier and Purchase specific translations
export const supplierTranslationsData = {
  supplier: {
    // Supplier section
    supplier: {
      english: "Supplier",
      hinglish: "Supplier",
      hindi: "आपूर्तिकर्ता",
    },
    suppliers: {
      english: "Suppliers",
      hinglish: "Suppliers",
      hindi: "आपूर्तिकर्ता",
    },
    supplierName: {
      english: "Supplier Name",
      hinglish: "Supplier ka Naam",
      hindi: "आपूर्तिकर्ता का नाम",
    },
    contact: {
      english: "Contact",
      hinglish: "Contact",
      hindi: "संपर्क",
    },
    contactNumber: {
      english: "Contact Number",
      hinglish: "Contact Number",
      hindi: "संपर्क नंबर",
    },
    emailAddress: {
      english: "Email Address",
      hinglish: "Email Address",
      hindi: "ईमेल पता",
    },
    email: {
      english: "Email",
      hinglish: "Email",
      hindi: "ईमेल",
    },
    address: {
      english: "Address",
      hinglish: "Address",
      hindi: "पता",
    },
    gstNumber: {
      english: "GST Number",
      hinglish: "GST Number",
      hindi: "GST नंबर",
    },
    notes: {
      english: "Notes",
      hinglish: "Notes",
      hindi: "नोट्स",
    },
    addSupplier: {
      english: "Add Supplier",
      hinglish: "Supplier Add Karein",
      hindi: "आपूर्तिकर्ता जोड़ें",
    },
    editSupplier: {
      english: "Edit Supplier",
      hinglish: "Supplier Edit Karein",
      hindi: "आपूर्तिकर्ता संपादित करें",
    },
    deleteSupplier: {
      english: "Delete Supplier",
      hinglish: "Supplier Delete Karein",
      hindi: "आपूर्तिकर्ता हटाएं",
    },
    deleteConfirmation: {
      english: "This will permanently delete the supplier and all associated purchases. This action cannot be undone.",
      hinglish: "Isse supplier aur unse judi sabhi purchases permanent delete ho jayengi. Yeh action undo nahi ho sakta.",
      hindi: "यह आपूर्तिकर्ता और सभी संबंधित खरीद को स्थायी रूप से हटा देगा। यह कार्रवाई पूर्ववत नहीं की जा सकती।",
    },
    noSuppliersFound: {
      english: "No suppliers found.",
      hinglish: "Koi suppliers nahi mile.",
      hindi: "कोई आपूर्तिकर्ता नहीं मिला।",
    },
    suppliersDescription: {
      english: "Manage your suppliers here. Add new suppliers to track purchases from them.",
      hinglish: "Apne suppliers ko yahan manage karein. Unse ki gayi purchases track karne ke liye naye suppliers add karein.",
      hindi: "अपने आपूर्तिकर्ताओं को यहां प्रबंधित करें। उनसे की गई खरीद को ट्रैक करने के लिए नए आपूर्तिकर्ता जोड़ें।",
    },
    selectSupplier: {
      english: "Select Supplier",
      hinglish: "Supplier Chunein",
      hindi: "आपूर्तिकर्ता चुनें",
    },
    notAvailable: {
      english: "N/A",
      hinglish: "N/A",
      hindi: "उपलब्ध नहीं",
    },
    addSupplierPrompt: {
      english: "No suppliers yet. Add your first supplier to get started.",
      hinglish: "Abhi koi suppliers nahi hain. Shuru karne ke liye apna pehla supplier add karein.",
      hindi: "अभी तक कोई आपूर्तिकर्ता नहीं। शुरू करने के लिए अपना पहला आपूर्तिकर्ता जोड़ें।",
    },
    deleteConfirmTitle: {
      english: "Delete Supplier?",
      hinglish: "Supplier Delete Karein?",
      hindi: "आपूर्तिकर्ता हटाएं?",
    },
    deleteConfirmMessage: {
      english: "Are you sure you want to delete {{supplierName}}? This will permanently delete the supplier and all associated purchases. This action cannot be undone.",
      hinglish: "Kya aap {{supplierName}} ko delete karna chahte hain? Isse supplier aur unse judi sabhi purchases permanent delete ho jayengi. Yeh action undo nahi ho sakta.",
      hindi: "क्या आप वाकई {{supplierName}} को हटाना चाहते हैं? यह आपूर्तिकर्ता और सभी संबंधित खरीद को स्थायी रूप से हटा देगा। यह कार्रवाई पूर्ववत नहीं की जा सकती।",
    },
    pageTitle: {
      english: "Suppliers & Purchases",
      hinglish: "Suppliers & Purchases",
      hindi: "आपूर्तिकर्ता और खरीद",
    },
    pageDescription: {
      english: "Manage your suppliers and track all purchases in one place.",
      hinglish: "Apne suppliers manage karein aur sabhi purchases ek jagah track karein.",
      hindi: "अपने आपूर्तिकर्ताओं को प्रबंधित करें और सभी खरीदों को एक ही स्थान पर ट्रैक करें।",
    },
    subtitle: {
      english: "Manage suppliers and purchases",
      hinglish: "Suppliers aur purchases manage karein",
      hindi: "आपूर्तिकर्ताओं और खरीद को प्रबंधित करें",
    },
    suppliersTab: {
      english: "Suppliers",
      hinglish: "Suppliers",
      hindi: "आपूर्तिकर्ता",
    },
    addNewSupplier: {
      english: "Add New Supplier",
      hinglish: "Naya Supplier Add Karein",
      hindi: "नया आपूर्तिकर्ता जोड़ें",
    },
    addSupplierDescription: {
      english: "Add a new supplier to track purchases from them.",
      hinglish: "Unse ki gayi purchases track karne ke liye naya supplier add karein.",
      hindi: "उनसे की गई खरीद को ट्रैक करने के लिए नया आपूर्तिकर्ता जोड़ें।",
    },
    editSupplierDescription: {
      english: "Update supplier details.",
      hinglish: "Supplier ki details update karein.",
      hindi: "आपूर्तिकर्ता का विवरण अपडेट करें।",
    },
    supplierNamePlaceholder: {
      english: "Enter supplier name",
      hinglish: "Supplier ka naam enter karein",
      hindi: "आपूर्तिकर्ता का नाम दर्ज करें",
    },
    contactNumberPlaceholder: {
      english: "Enter contact number",
      hinglish: "Contact number enter karein",
      hindi: "संपर्क नंबर दर्ज करें",
    },
    emailPlaceholder: {
      english: "Enter email address",
      hinglish: "Email address enter karein",
      hindi: "ईमेल पता दर्ज करें",
    },
    gstNumberPlaceholder: {
      english: "Enter GST number",
      hinglish: "GST number enter karein",
      hindi: "GST नंबर दर्ज करें",
    },
    addressPlaceholder: {
      english: "Enter address",
      hinglish: "Address enter karein",
      hindi: "पता दर्ज करें",
    },
    notesPlaceholder: {
      english: "Add any additional notes",
      hinglish: "Koi additional notes add karein",
      hindi: "कोई अतिरिक्त नोट्स जोड़ें",
    },
    createSupplier: {
      english: "Create Supplier",
      hinglish: "Supplier Banayein",
      hindi: "आपूर्तिकर्ता बनाएं",
    },
    // Success messages
    supplierCreated: {
      english: "Supplier created successfully.",
      hinglish: "Supplier successfully ban gaya.",
      hindi: "आपूर्तिकर्ता सफलतापूर्वक बनाया गया।",
    },
    supplierUpdated: {
      english: "Supplier updated successfully.",
      hinglish: "Supplier successfully update ho gaya.",
      hindi: "आपूर्तिकर्ता सफलतापूर्वक अपडेट किया गया।",
    },
    supplierDeleted: {
      english: "Supplier deleted successfully.",
      hinglish: "Supplier successfully delete ho gaya.",
      hindi: "आपूर्तिकर्ता सफलतापूर्वक हटा दिया गया।",
    },
    // Error messages
    errorCreatingSupplier: {
      english: "Error creating supplier.",
      hinglish: "Supplier banane mein error.",
      hindi: "आपूर्तिकर्ता बनाने में त्रुटि।",
    },
    errorUpdatingSupplier: {
      english: "Error updating supplier.",
      hinglish: "Supplier update karne mein error.",
      hindi: "आपूर्तिकर्ता को अपडेट करने में त्रुटि।",
    },
    errorDeletingSupplier: {
      english: "Error deleting supplier.",
      hinglish: "Supplier delete karne mein error.",
      hindi: "आपूर्तिकर्ता को हटाने में त्रुटि।",
    },
    // Common
    save: {
      english: "Save",
      hinglish: "Save Karein",
      hindi: "सहेजें",
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
    edit: {
      english: "Edit",
      hinglish: "Edit",
      hindi: "संपादित करें",
    },
    actions: {
      english: "Actions",
      hinglish: "Actions",
      hindi: "कार्रवाइयां",
    },
    search: {
      english: "Search...",
      hinglish: "Search...",
      hindi: "खोजें...",
    },
    filter: {
      english: "Filter",
      hinglish: "Filter",
      hindi: "फ़िल्टर",
    },
    all: {
      english: "All",
      hinglish: "Sab",
      hindi: "सभी",
    },
  },
  purchase: {
    // Purchase section
    suppliersTab: {
      english: "Suppliers",
      hinglish: "Suppliers",
      hindi: "आपूर्तिकर्ता",
    },
    purchasesTab: {
      english: "Purchases",
      hinglish: "Purchases",
      hindi: "खरीदें",
    },
    purchase: {
      english: "Purchase",
      hinglish: "Purchase",
      hindi: "खरीद",
    },
    purchases: {
      english: "Purchases",
      hinglish: "Purchases",
      hindi: "खरीदें",
    },
    purchaseDate: {
      english: "Purchase Date",
      hinglish: "Purchase ki Taarikh",
      hindi: "खरीद की तारीख",
    },
    billNumber: {
      english: "Bill Number",
      hinglish: "Bill Number",
      hindi: "बिल नंबर",
    },
    billUpload: {
      english: "Bill Upload",
      hinglish: "Bill Upload",
      hindi: "बिल अपलोड",
    },
    uploadBill: {
      english: "Upload Bill",
      hinglish: "Bill Upload Karein",
      hindi: "बिल अपलोड करें",
    },
    downloadBill: {
      english: "Download Bill",
      hinglish: "Bill Download Karein",
      hindi: "बिल डाउनलोड करें",
    },
    totalAmount: {
      english: "Total Amount",
      hinglish: "Total Amount",
      hindi: "कुल राशि",
    },
    paymentDate: {
      english: "Payment Date",
      hinglish: "Payment ki Taarikh",
      hindi: "भुगतान की तारीख",
    },
    paymentDueDate: {
      english: "Payment Due Date",
      hinglish: "Payment Due Date",
      hindi: "भुगतान देय तिथि",
    },
    paymentMode: {
      english: "Payment Mode",
      hinglish: "Payment Mode",
      hindi: "भुगतान का तरीका",
    },
    paymentReference: {
      english: "Payment Reference",
      hinglish: "Payment Reference",
      hindi: "भुगतान संदर्भ",
    },
    paymentModeCash: {
      english: "Cash",
      hinglish: "Cash",
      hindi: "नकद",
    },
    paymentModeCard: {
      english: "Card",
      hinglish: "Card",
      hindi: "कार्ड",
    },
    paymentModeBankTransfer: {
      english: "Bank Transfer",
      hinglish: "Bank Transfer",
      hindi: "बैंक ट्रांसफर",
    },
    paymentModeUPI: {
      english: "UPI",
      hinglish: "UPI",
      hindi: "UPI",
    },
    paymentReferencePlaceholder: {
      english: "Enter payment reference/transaction ID",
      hinglish: "Payment reference/transaction ID enter karein",
      hindi: "भुगतान संदर्भ/लेनदेन ID दर्ज करें",
    },
    selectPaymentMode: {
      english: "Select Payment Mode",
      hinglish: "Payment Mode Chunein",
      hindi: "भुगतान का तरीका चुनें",
    },
    lineItems: {
      english: "Line Items",
      hinglish: "Line Items",
      hindi: "लाइन आइटम",
    },
    itemName: {
      english: "Item Name",
      hinglish: "Item ka Naam",
      hindi: "आइटम का नाम",
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
    addItem: {
      english: "Add Item",
      hinglish: "Item Add Karein",
      hindi: "आइटम जोड़ें",
    },
    removeItem: {
      english: "Remove Item",
      hinglish: "Item Remove Karein",
      hindi: "आइटम हटाएं",
    },
    addPurchase: {
      english: "Add Purchase",
      hinglish: "Purchase Add Karein",
      hindi: "खरीद जोड़ें",
    },
    editPurchase: {
      english: "Edit Purchase",
      hinglish: "Purchase Edit Karein",
      hindi: "खरीद संपादित करें",
    },
    deletePurchase: {
      english: "Delete Purchase",
      hinglish: "Purchase Delete Karein",
      hindi: "खरीद हटाएं",
    },
    noPurchasesFound: {
      english: "No purchases found.",
      hinglish: "Koi purchases nahi mili.",
      hindi: "कोई खरीद नहीं मिली।",
    },
    purchasesDescription: {
      english: "Track all your purchases from suppliers here.",
      hinglish: "Apne suppliers se ki gayi sabhi purchases yahan track karein.",
      hindi: "आपूर्तिकर्ताओं से अपनी सभी खरीदों को यहां ट्रैक करें।",
    },
    addNewPurchase: {
      english: "Add New Purchase",
      hinglish: "Nayi Purchase Add Karein",
      hindi: "नई खरीद जोड़ें",
    },
    addPurchaseDescription: {
      english: "Add a new purchase from a supplier.",
      hinglish: "Supplier se nayi purchase add karein.",
      hindi: "आपूर्तिकर्ता से नई खरीद जोड़ें।",
    },
    editPurchaseDescription: {
      english: "Update purchase details.",
      hinglish: "Purchase ki details update karein.",
      hindi: "खरीद का विवरण अपडेट करें।",
    },
    selectSupplier: {
      english: "Select Supplier",
      hinglish: "Supplier Chunein",
      hindi: "आपूर्तिकर्ता चुनें",
    },
    selectDate: {
      english: "Select Date",
      hinglish: "Date Chunein",
      hindi: "तारीख चुनें",
    },
    billNumberPlaceholder: {
      english: "Enter bill number",
      hinglish: "Bill number enter karein",
      hindi: "बिल नंबर दर्ज करें",
    },
    notesPlaceholder: {
      english: "Add any additional notes",
      hinglish: "Koi additional notes add karein",
      hindi: "कोई अतिरिक्त नोट्स जोड़ें",
    },
    dropBillHere: {
      english: "Drop bill here or click to upload",
      hinglish: "Bill yahan drop karein ya upload karne ke liye click karein",
      hindi: "बिल यहां ड्रॉप करें या अपलोड करने के लिए क्लिक करें",
    },
    createPurchase: {
      english: "Create Purchase",
      hinglish: "Purchase Banayein",
      hindi: "खरीद बनाएं",
    },
    notAvailable: {
      english: "N/A",
      hinglish: "N/A",
      hindi: "उपलब्ध नहीं",
    },
    addPurchasePrompt: {
      english: "No purchases yet. Add your first purchase to get started.",
      hinglish: "Abhi koi purchases nahi hain. Shuru karne ke liye apni pehli purchase add karein.",
      hindi: "अभी तक कोई खरीद नहीं। शुरू करने के लिए अपनी पहली खरीद जोड़ें।",
    },
    deleteConfirmTitle: {
      english: "Delete Purchase?",
      hinglish: "Purchase Delete Karein?",
      hindi: "खरीद हटाएं?",
    },
    deleteConfirmMessage: {
      english: "Are you sure you want to delete this purchase? This action cannot be undone.",
      hinglish: "Kya aap is purchase ko delete karna chahte hain? Yeh action undo nahi ho sakta.",
      hindi: "क्या आप वाकई इस खरीद को हटाना चाहते हैं? यह कार्रवाई पूर्ववत नहीं की जा सकती।",
    },
    date: {
      english: "Date",
      hinglish: "Date",
      hindi: "तारीख",
    },
    supplier: {
      english: "Supplier",
      hinglish: "Supplier",
      hindi: "आपूर्तिकर्ता",
    },
    status: {
      english: "Status",
      hinglish: "Status",
      hindi: "स्थिति",
    },
    items: {
      english: "Items",
      hinglish: "Items",
      hindi: "आइटम",
    },
    addToInventory: {
      english: "Add to Inventory",
      hinglish: "Inventory Mein Add Karein",
      hindi: "इन्वेंटरी में जोड़ें",
    },
    // Payment status
    paymentStatusLabel: {
      english: "Payment Status",
      hinglish: "Payment Status",
      hindi: "भुगतान की स्थिति",
    },
    paymentStatusPending: {
      english: "Pending",
      hinglish: "Pending",
      hindi: "लंबित",
    },
    paymentStatusPaid: {
      english: "Paid",
      hinglish: "Paid",
      hindi: "भुगतान किया गया",
    },
    pending: {
      english: "Pending",
      hinglish: "Pending",
      hindi: "लंबित",
    },
    paid: {
      english: "Paid",
      hinglish: "Paid",
      hindi: "भुगतान किया गया",
    },
    paymentReceived: {
      english: "Payment Received",
      hinglish: "Payment Mil Gaya",
      hindi: "भुगतान प्राप्त हुआ",
    },
    actions: {
      english: "Actions",
      hinglish: "Actions",
      hindi: "कार्रवाइयां",
    },
    // Success messages
    purchaseCreated: {
      english: "Purchase created successfully.",
      hinglish: "Purchase successfully ban gayi.",
      hindi: "खरीद सफलतापूर्वक बनाई गई।",
    },
    purchaseUpdated: {
      english: "Purchase updated successfully.",
      hinglish: "Purchase successfully update ho gayi.",
      hindi: "खरीद सफलतापूर्वक अपडेट की गई।",
    },
    purchaseDeleted: {
      english: "Purchase deleted successfully.",
      hinglish: "Purchase successfully delete ho gayi.",
      hindi: "खरीद सफलतापूर्वक हटा दी गई।",
    },
    // Error messages
    errorCreatingPurchase: {
      english: "Error creating purchase.",
      hinglish: "Purchase banane mein error.",
      hindi: "खरीद बनाने में त्रुटि।",
    },
    errorUpdatingPurchase: {
      english: "Error updating purchase.",
      hinglish: "Purchase update karne mein error.",
      hindi: "खरीद को अपडेट करने में त्रुटि।",
    },
    errorDeletingPurchase: {
      english: "Error deleting purchase.",
      hinglish: "Purchase delete karne mein error.",
      hindi: "खरीद को हटाने में त्रुटि।",
    },
  },
  supplierLedger: {
    supplierLedgerTab: {
      english: "Supplier Ledger",
      hinglish: "Supplier Ledger",
      hindi: "आपूर्तिकर्ता बहीखाता",
    },
    supplier: {
      english: "Supplier",
      hinglish: "Supplier",
      hindi: "आपूर्तिकर्ता",
    },
    ledgerTitle: {
      english: "Ledger",
      hinglish: "Ledger",
      hindi: "लेजर",
    },
    details: {
      english: "Details",
      hinglish: "Details",
      hindi: "विवरण",
    },
    purchases: {
      english: "Purchases",
      hinglish: "Purchases",
      hindi: "खरीदें",
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
    printSupplierLedger: {
      english: "Print Supplier Ledger",
      hinglish: "Supplier Ledger Print Karein",
      hindi: "आपूर्तिकर्ता लेजर प्रिंट करें",
    },
    noSupplierData: {
      english: "No supplier data available",
      hinglish: "Koi supplier data nahi hai",
      hindi: "कोई आपूर्तिकर्ता डेटा उपलब्ध नहीं",
    },
    createPurchasesPrompt: {
      english: "Create purchases to see supplier ledger",
      hinglish: "Supplier ledger dekhne ke liye purchases banayein",
      hindi: "आपूर्तिकर्ता लेजर देखने के लिए खरीद बनाएं",
    },
    errorFetching: {
      english: "Error fetching supplier ledger",
      hinglish: "Supplier ledger fetch karne mein error",
      hindi: "आपूर्तिकर्ता लेजर लाने में त्रुटि",
    },
  },
} as const;