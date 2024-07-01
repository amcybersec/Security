
function LoadVoiceConfiguration(scope) {

    scope.WriteLog(INFO, "LoadVoiceConfiguration ->  START");
    
    scope.middlewareServiceUrl = "https://widgets-uat.glb.emea.qccuat.avayacloud.com/CustomWidgetMiddleware";
    scope.vbSyncmiddlewareServiceUrl = "https://widgets-uat.glb.emea.qccuat.avayacloud.com/VBSync/api";
    scope.acwEndURL = "https://tachnwidget.teleapps.com:8443/services/UnifiedAgentController/UACAPI/sessions/";
	
    scope.showNewIncomingNotificationTimeOut = 10; //Vaue in sec 
    scope.setMsgNotificationlistCount = 5;//Message Notification Max Count 
    scope.enableNotification = true;
    scope.repeatCustomer = {
        "repeatCustomerConsiderCount": 1,
        "repeatCustomerLowLevel": 1,
        "repeatCustomerMidevel": 2, // this value should be range' 
        "repeatCustomerHighLevel": 5
    };

    scope.paymentLinkURL = "";
    scope.maximumPopupNotificationCount = 3;
    scope.IS_CONSOLE_LOG_ENABLE = true;
   // scope.DeEnrollement_role = ["AGENT","SUPERVISOR"];
    scope.DeEnrollement_role = ["SUPERVISOR"];
	
    scope.DeEnrollementDays = 1;
    scope.RejectedEnrollementDays = 1;
    scope.validateVBStatus_type = ["RJ","DE","EL"];
    scope.vb_PrintTag="IVRLANGUAGE";
    scope.config_setname="QA_VP_EN";

    scope.configServiceTransferList = {
        "transferList": [
            {
                "ref_id": "0A632E22-A6B1-44A3-889E-A38F0397FA5E",
                "channel": "Voice",
                "service_type": "India",
                "service_display_name": "PLATINUM_PLGL",
                "service_transfer_list": "CustomerTier.PLATINUM, ServiceType.Platinum_Gold, Language.#$Language*,Location.#$Location*"
            }
        ]
    }
 
    scope.showDetails = {
        "customerVoiceDetails": [
            { "Key": "CustomerName", "Label": "Customer Name", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
            { "Key": "CustomerNumber", "Label": "Customer Phone Number", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
            { "Key": "ServiceType", "Label": "Reason for call", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
            { "Key": "CustomerLanguage", "Label": "Language of Caller", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
            { "Key": "IsPreferredLanguage", "Label": "IsPreferredLanguage", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "TRUE", "HighlightedICON": "", "Value": "" },
			{ "Key": "PNR", "Label": "PNR", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
            { "Key": "BookingChannel", "Label": "Booking Channel (OID)", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
            { "Key": "BookingClass", "Label": "Booking Class", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
            { "Key": "FareFamily", "Label": "FareFamily", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
            { "Key": "TicketStatus", "Label": "Ticket Status", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
            { "Key": "FFPNumber", "Label": "FFP Number", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },

            { "Key": "VB_Status", "Label": "Voice Biometric Status", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
            { "Key": "VB_Status_Date", "Label": "Voice Biometric Date(GMT)", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
           // { "Key": "VB_Enrollment_Failed", "Label": "VB Enrollment Failed Now", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
			{ "Key": "Verified_via_vb", "Label": "Voice Biometric Verification", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "TRUE", "HighlightedICON": "", "Value": "" },
            { "Key": "VB_verification_status_date", "Label": "Voice Biometric Verification Date(GMT)", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
           // { "Key": "VB_Status", "Label": "VB Status", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
           // { "Key": "VB_Status_Date", "Label": "VB Date", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
           // { "Key": "VB_Enrollment_Failed", "Label": "VB Entrollment Failed", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
			//{ "Key": "Verified_via_vb", "Label": "Verified via VB", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "TRUE", "HighlightedICON": "", "Value": "" },
			//{ "Key": "De_enrolled_caller_from_Vb", "Label": "De-Enrolled caller from VB", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
            { "Key": "VB_enrollment_status", "Label": "VB Enrollment Status", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
           // { "Key": "VB_enrollment_status_date", "Label": "VB Entrollment status date", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
          //  { "Key": "VB_verification_status", "Label": "VB Verification status", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
          //  { "Key": "VB_verification_status_date", "Label": "VB Verification status date", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
            { "Key": "IATANumber", "Label": "IATA Number", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "TRUE", "HighlightedICON": "", "Value": "" },
            { "Key": "StaffID", "Label": "StaffID", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
            { "Key": "CustomerStatus", "Label": "Customer Status", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "TRUE", "HighlightedICON": "", "Value": "" },
            { "Key": "IsBlacklisted", "Label": "IsBlacklisted", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "TRUE", "HighlightedICON": "", "Value": "" },
            { "Key": "Dnis", "Label": "Dnis", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
            { "Key": "CountryName", "Label": "Country Name", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
            { "Key": "BusinessUnit", "Label": "Business Unit", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
            { "Key": "CustomerCallCount", "Label": "Customer Call Count", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
            { "Key": "TransferredFlag", "Label": "Transferred Contact", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
            { "Key": "TransferredBy", "Label": "Transferred by Agent", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" },
            { "Key": "LARRouting", "Label": "Call Routing through LAR", "Root": "", "chennal": "VOICE", "HighlightedColor": "", "HighlightedFont": "", "HighlightedICON": "", "Value": "" }


        ]
    };

    scope.lang = {
        "EN": {
            "LABLEselect": "Select",
            "LABLEsearch": "search",
            "MSGCallNoteSaveSuccessHeader": "Save Voice Notes",
            "MSGCallNoteSaveSuccessMessage": "Notes Saved successfully",
            "BUTTONCallNotes": "Save Call Notes",
            "BUTTONCancel": "Cancel",
            "LABLECallNotes": "Notes",
            "LABLETabCustomerDetails": "Customer Details",
            "LABLETabCallLog": "Call Log",
            "LABLETabPaymentLink": "Payment Link",
            "LABLETabCallNotes": "Call Notes",
            "LABLETabTransfer": "Transfer",
            "LABLETabPushURL": "Push URL",
            "LABLECustDetailsField": "Field",
            "LABLECustDetailsValue": "Value",
            "LABLEStartDate": "Start Date :",
            "LABLEEndDate": "End Date :",
            "LABLEDispostionCode": "Dispostion Code :",
            "BUTTONLABLESendImage": "Send",
            "BUTTONLABLESendVideos": "Send",
            "BUTTONLABLESendFile": "Send",
            "LABLEURLPushURLEnglish": "ENGLISH",
            "LABLEURLPushDescriptionEnglish": "Name",
            "LABLEURLPushURLArabic": "ARABIC",
            "LABLEURLPushDescriptionArabic": "Name",
            "BUTTONLABLEURLPushEnglish": "Send",
            "BUTTONLABLEURLPushArabic": "Send",
            "LABLERecentCallNoteSearchMobileNumber": "Contact Address / Mobile Number",
            "LABLEPreferrdChennal": "Channel",
            "LABLEPreferrdTire": "Tier",
            "LABLEPreferrdVerified": "Verified",
            "LABLEPreferrdIdentified": "Identified",
            "LABLEPreferrdDisruptionStatus": "Disruption Status",
            "LABLEPreferrdRepeatedCustomer": "Repeated Customer",
            "LABLEPreferrdFilghtDepartureTimeLessThan48hr": "Flight departure time less than 48hr",
            "LABLETabVoiceBiometric":"Voice Biometric",
            "BUTTONClear": "Clear",
            "BUTTONTransfer": "Transfer",
            "LABLETabDeEnroll":"VB De-Enrollment",
            "BUTTONDeEnroll":"De-Enroll",
            "MSGSaveDeEnrollSuccessHeader":"DeEnrollment Status",
            "MSGSaveFFPSuccessHeader":"FFP Status",
            "MSGSaveDeEnrollSuccessMessage":"DeEnrollment Process Completed",
            "MSGSaveDeEnrollFailureMessage":"DeEnrollment Process Failed",
            "MSGFFPSearchFailureMessage":"FFP Search Failed",
            "LABELCustomerName":"Customer Name",
            "LABELEmailID":"Email ID",
            "LABELSegment":"Tier",
            "LABELDoB":"Date of Birth",
            "LABELVBStatus":"VB Status",
            "LABELVBStatusDate":"VB Status Date (GMT)",
            "LABELVBEligible":"VB Eligible",
            "LABELVBBlackListed":"IsBlackListed",
            "CHECKBOXIdentified":"Identified",
            "CHECKBOXVerified":"Verified",
			"MSGInvaildffpnumber":"Invaild FFP Number",
			"MSGInvaildvbstatus":"Invaild VB Status",
            "MSGAlreadyDeEnrollFailureMessage":"Already DeEnrolled",
            "DEENROLLHoverMessage":"Enter a De-Enroll Reason"

        }
    }

    scope.TransferNumber = {
        "IVRTRANSFER": [
            { "key": "5129999999" }
        ]
    }
	
	  
	

    scope.WriteLog(INFO, "LoadVoiceConfiguration ->  END");
};


