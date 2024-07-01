
/** * Declaration Start */
var DEBUG = 'DEBUG';
var INFO = 'INFO';
var ERROR = 'ERROR';
var WARNING = 'WARNING';
var IS_CONSOLE_LOG_ENABLE = true;
/** * Declaration END */

function InitVoiceMethodsInsideScope(scope) {

    scope.acwflag = false;

    //Intraction load
    scope.newIntraction = function (scope, data) {

        scope.WriteLog(DEBUG, "newIntraction --> Start");

        if (scope.getInteraction(scope) == null) {
            scope.WriteLog(INFO, "newIntraction --> New Voice Interaction. IntractionID - " + scope.interactionID + ". State - " + data.state);

            scope.alertingTime = scope.getTime_yyyymmdd();
            scope.widgetRefId = scope.getGuid('');
            scope.setInteraction(scope);
        }
        else {
            scope.widgetRefId = scope.getInteraction(scope).REFID;
            scope.alertingTime = scope.getInteraction(scope).OFFER_TIME;

            scope.callNotes = scope.getInteraction(scope).CALL_NOTES;
            scope.dispositionCode = scope.getInteraction(scope).DISPOSITION_CODE;
            scope.dispositionDesc = scope.getInteraction(scope).DISPOSITION_DESC;

            if (scope.getInteraction(scope).ANSWER_TIME == null || scope.getInteraction(scope).ANSWER_TIME == '') {
                scope.setInteraction(scope);
            }
            else if (scope.objInteraction.state == 'ACW' && scope.getInteraction(scope).ACW_TIME == '') {
                scope.setInteraction(scope);
            }
            //else if (scope.getInteraction(scope).NOTES_UPDATED == true) {

            //    scope.diableCallNotes(scope);
            //}

            scope.answerTime = scope.getInteraction(scope).ANSWER_TIME;
            scope.answerTimestamp = Date.parse(scope.getInteraction(scope).ANSWER_TIME_STAMP);
        }

        scope.WriteLog(DEBUG, "newIntraction --> End");
    };

    scope.onCardFocusedEvent = function (scope, data) {

        scope.WriteLog(DEBUG, "onCardFocusedEvent --> Start");


        var activeIntractionID = null;

        if (scope.getActiveIntraction() != scope.getActiveIntraction())
            activeIntractionID = scope.getActiveIntraction().INTERACTIONID;

        if (activeIntractionID == null) {
            scope.WriteLog(INFO, "onNavigationEvent Current intreaction-> Updating current Interaction ID");
            scope.setActiveIntraction(scope, data.context.id, scope.objInteraction.workRequestId, scope.objInteraction.channel);
        }
        else if (scope.interactionID == activeIntractionID) {
            scope.WriteLog(INFO, "onNavigationEvent ( " + scope.interactionID + " ) -> No Interaction ID received from Context. Updating dummy Active Interation ID");
            scope.setActiveIntraction(scope, "NAVIGATION_INTERACTIONID", "NAVIGATION_WORKREQUESTID", "NAVIGATION_CHANNEL");
        }
        else if (scope.interactionID == data.context.id) {
            scope.WriteLog(INFO, "onNavigationEvent ( " + scope.interactionID + " ) -> Updating current Interaction ID");
            scope.setActiveIntraction(scope, data.context.id, scope.objInteraction.workRequestId, scope.objInteraction.channel);
        }

        scope.WriteLog(DEBUG, "onCardFocusedEvent --> End");
    }

    scope.setActiveIntraction = function (scope, interactionId, workRequestId, channel) {

        scope.WriteLog(DEBUG, "setActiveIntraction --> Update interaction id - " + interactionId);

        var _activeInteraction = {
            "INTERACTIONID": interactionId,
            "WORKREQUESTID": workRequestId,
            "CHANNEL": channel
        }
        sessionStorage.setItem("ACTIVE_INTERACTION", JSON.stringify(_activeInteraction));
    }

    scope.getActiveIntraction = function () {

        var _activeInteraction = sessionStorage.getItem("ACTIVE_INTERACTION");
        return JSON.parse(_activeInteraction);
    }

    scope.setInteraction = function (scope) {

        scope.WriteLog(DEBUG, "setInteraction --> Start. Interaction ID - " + scope.interactionID);

        var _interaction = {
            "INTERACTIONID": scope.interactionID,
            "WORKREQUESTID": scope.workRequestId,
            "REFID": scope.widgetRefId,
            "CHANNEL": scope.objInteraction.channel,
            "OFFER_TIME": scope.alertingTime,
            "ANSWER_TIME": scope.answerTime,
            "ANSWER_TIME_STAMP": scope.answerTimestamp,
            "ACW_TIME": scope.acwTime,
            "NOTES_UPDATED": false, // scope.notesSaved,
            "CRM_OPENED": scope.crmOpend,
            "CALL_NOTES": scope.callNotes,
            "DISPOSITION_DESC": scope.dispositionDesc,
            "DISPOSITION_CODE": scope.dispositionCode
        }

        sessionStorage.setItem("INTERACTION_VOICE_" + scope.interactionID, JSON.stringify(_interaction));

        scope.WriteLog(DEBUG, "setInteraction End. completed --> Interaction value - " + JSON.stringify(_interaction));
    }

    scope.getInteraction = function (scope) {

        scope.WriteLog(DEBUG, "getInteraction --> Start. IntractionID - " + scope.interactionID);

        var interactionJson = sessionStorage.getItem("INTERACTION_VOICE_" + scope.interactionID)

        scope.WriteLog(DEBUG, "getInteraction --> End. completed --> Interaction value - " + interactionJson);

        return JSON.parse(interactionJson);
    }

    scope.removeInteraction = function (scope) {

        scope.WriteLog(DEBUG, "removeInteraction --> Start. InteractionID - " + scope.interactionID);

        sessionStorage.removeItem("INTERACTION_VOICE_" + scope.interactionID);

        scope.WriteLog(DEBUG, "removeInteraction --> End. completed --> InteractionID - " + scope.interactionID);
    }

    scope.onAlerting = function (scope, api, data, $timeout) {

        scope.WriteLog(DEBUG, 'onAlerting --> Start');

        scope.alertingTime = scope.getTime_yyyymmdd();
        scope.serviceType = data.topic;// service type
        scope.serviceName = data.topic;

        scope.newIntraction(scope, data);

        scope.WriteLog(DEBUG, 'onAlerting --> End');

    }
    scope.onActiveSkipping = function (scope, api, data, $timeout) {

        scope.WriteLog(DEBUG, 'onActiveSkipping --> Start');


        if (scope.capabilities.interaction.canEnd == true && data.stateReason == "CONFERENCE_COMPLETE" && data.direction == "INCOMING" && data.interactionType == "CALLED" && data.state == "ACTIVE") {

            scope.WriteLog(INFO, 'onInteractionEvent - Intraction end on conference event');

            api.endInteraction();
            return;
        }

        if (scope.servicesTransferList != undefined && scope.servicesTransferList.length > 0) {
            scope.apisetTransferToServicesList(api, scope.servicesTransferList);
        }
        scope.WriteLog(DEBUG, 'onActiveSkipping --> End');
    }

    //var _jsonItem = { "id": _listItem.service_transfer_list, "name": _listItem.service_display_name };
    scope.apisetTransferToServicesList = function (api, transferList) {

        var jsonString = JSON.stringify(transferList);
        if (jsonString == null || jsonString == undefined) {
            scope.WriteLog(DEBUG, 'apisetTransferToServicesList jsonstringvalue validate')
            return;
        }

        if (scope.validateJsonString(jsonString) == false) {
            scope.WriteLog(DEBUG, 'apisetTransferToServicesList validateJsonString failed')
            return;
        }
        scope.WriteLog(DEBUG, 'apisetTransferToServicesList --> Start');
        setTimeout(function () {
            api.setTransferToServicesList(transferList);
        }, 1000);

        scope.WriteLog(DEBUG, 'apisetTransferToServicesList --> End');
    }

    scope.onActive = function (scope, api, data, $timeout) {

        scope.WriteLog(DEBUG, 'onActive --> Start');


        scope.serviceType = data.topic;// service type
        scope.serviceName = data.topic;

        scope.lastInteractionState = data.state;
        scope.answerTime = scope.getTime_yyyymmdd();
        scope.answerTimestamp = new Date();

        scope.newIntraction(scope, data);

        scope.initializeVoiceLayout(scope, data);

        scope.loadDispositionDetails(scope, api, data);

        scope.loadWidgetData(scope, api, data);



        if (scope.objInteraction.channel == undefined) {// || scope.objInteraction.channel == "MESSAGING") {
            scope.WriteLog(DEBUG, 'contextDetails --> ' + scope.objInteraction.channel + ' - Invalid context data. Skipping..');
            return;
        }
        if (scope.contextData == '') {
            scope.WriteLog(DEBUG, 'contextDetails --> ' + scope.contextData + ' - Context data is null or empty. Skipping..');
            return;
        }

        scope.getCSDetails(scope, 'active', api);




        scope.WriteLog(DEBUG, 'onActive --> End');
    }

    scope.onContextDetails = function (scope, api, data, timeout) {

        scope.WriteLog(DEBUG, 'onContextDetails --> Start');
        // if (data.customerDetails == undefined || data.customerDetails.length == 0) {
        // return;
        // }

        if (scope.lastContextState == 'ACTIVE') {
            scope.WriteLog(DEBUG, "onContextDetails. Repeated Active event. Skipping ...");
            return;
        }

        scope.lastContextState == 'ACTIVE'
        scope.contextData = data;

        //if (scope.objInteraction.channel == undefined || scope.objInteraction.channel == "SOCIAL") {
        //    scope.WriteLog(DEBUG, 'onContextDetails --> ' + scope.objInteraction.channel + ' - Invalid context data. Skipping..');
        //    return;
        //}

        scope.getCSDetails(scope, 'context', api);

        scope.WriteLog(DEBUG, 'onContextDetails --> End');
    }

    scope.prepareContextData = function (scope, contextData, channel) {

        scope.WriteLog(DEBUG, 'prepareContextData --> Start');
        var _jsonArrary = [];
        var _customerDetailsList = [];

        _customerDetailsList = scope.showDetails.customerVoiceDetails;//Read value from configration js/ map with context details
        _jsonArrary = scope.getVoiceContextDetails(scope, contextData, _customerDetailsList);

        $(scope.htmlInteractionPrefix + ' #tbodyCsNotificationHeader').html('');
        //scope.bodyNotificationHeader = [];

        for (var i = 0; i < _customerDetailsList.length; i++) {

            var _html = '', _class = '';
            var key = _customerDetailsList[i].Key;
            var _jsonValue = scope.getJsonValues(_jsonArrary, key);


            _html = "<tr>";

            _html += "<td>" + (scope.validateTextAndNumbers(_customerDetailsList[i].Label) ? _customerDetailsList[i].Label : "--") + "</td>";

            if (_jsonValue != null && _jsonValue.length > 0) {
                _customerDetailsList[i].Value = _jsonValue[0];
                _class = scope.customerDetailsFieldFormatting(_customerDetailsList[i])
                var printValue = _jsonValue[0];
                if (key == 'TransferredBy') {

                    var splictVal = printValue.split("_");
                    if (splictVal.length > 0) {
                        printValue = splictVal[0];
                    }
                    else {
                        printValue = splictVal
                    }
                }
                var _printValue = printValue == 'null' ? '--' : printValue;
                _printValue = _printValue == '' ? '--' : _printValue;

                _html += "<td class='" + _class + "' style='width: 50%;'>" + (scope.validateTextAndNumbers(_printValue) ? _printValue : "----") + "</td>";

            }
            else {
                _customerDetailsList[i].Value = "--";
                _class = scope.customerDetailsFieldFormatting(_customerDetailsList[i])
                _html += "<td class='" + _class + "' style='width: 50%;'>" + "--" + "</td>";

            }

            _html += "</tr>";
            $(scope.htmlInteractionPrefix + ' #tbodyCsNotificationHeader').append(_html);


        }


        scope.jsonCustomerList = _customerDetailsList;
        scope.bannerCustomerDetails(scope, contextData);
        scope.WriteLog(DEBUG, 'prepareContextData --> End');
    }

    scope.getAsyncWebVoiceBannerFromContext = function (scope, searchKey, data) {

        var _qrDistinct = alasql("SELECT distinct name FROM ?", [data.customerDetails[0].data.customerCustoms]);
        if (_qrDistinct == undefined || _qrDistinct.length == 0) {
            scope.WriteLog(DEBUG, `prepareContextData --> ${searchKey} is not found. skipping..`);
            return "--";
        }

        for (var i = 0; i < _qrDistinct.length; i++) {
            //$.each(_qrDistinct, function (index, value) {

            // var key = _qrDistinct[i].name; '${label}'`
            var _query = `SELECT top 1  * FROM ? where name = '${searchKey}'  order by lastUpdatedTimeStamp desc`;

            results = alasql(_query, [data.customerDetails[0].data.customerCustoms]);

            var returnResult = (results.length == 0 ? '--' : results[0].text);
            if (returnResult == 'TRUE')
                return 'Yes'
            else if (returnResult == 'FALSE')
                return 'No'
            else
                return returnResult;
            //scope.prepareJson(key, results[0].text);
            // });
        }

    }

    scope.bannerCustomerDetails = function (scope, contextData) {

        scope.WriteLog(DEBUG, 'preferedCustomerDetails --> Start');

        var bannerJson = [];
        var val = scope.objCsDetails.context;
        bannerJson = {
            pChannel: "VOICE",
            pTire: scope.objCsDetails.CustomerTier == undefined ? "--" : scope.objCsDetails.CustomerTier,
            pVerified: scope.objCsDetails.IsVerifiedCustomer == undefined ? "--" : (scope.objCsDetails.IsVerifiedCustomer == 'Y' ? "YES" : "NO"),
            pIdentified: scope.objCsDetails.IsIdentifiedCustomer == undefined ? "--" : (scope.objCsDetails.IsIdentifiedCustomer == 'Y' ? "YES" : "NO"),
            pDisruptionStatus: scope.objCsDetails.DisruptionStatus == undefined ? "--" : (scope.objCsDetails.DisruptionStatus == 'Y' ? "YES" : "NO"),
            pRepeatedCustomer: ((scope.objCsDetails.CustomerCallCount == undefined ? 0 : scope.objCsDetails.CustomerCallCount) <= scope.repeatCustomer.repeatCustomerConsiderCount ? 'NO' : 'YES'),
            pFlightDepartureTimeLessthen48: scope.objCsDetails.TravelWithin48Hours == undefined ? "--" : (scope.objCsDetails.TravelWithin48Hours == 'Y' ? "YES" : "NO")
        }
        $(scope.htmlInteractionPrefix + ' #pChannel span').text(bannerJson.pChannel);
        $(scope.htmlInteractionPrefix + ' #pTire span').text(bannerJson.pTire);
        $(scope.htmlInteractionPrefix + ' #pIdentified span').text(bannerJson.pIdentified);
        $(scope.htmlInteractionPrefix + ' #pVerified span').text(bannerJson.pVerified);

        $(scope.htmlInteractionPrefix + ' #pDisruptionStatus span').text(bannerJson.pDisruptionStatus);
        $(scope.htmlInteractionPrefix + ' #pRepeatedCustomer span').text(bannerJson.pRepeatedCustomer);
        $(scope.htmlInteractionPrefix + ' #pFlightDepartureTimeLessthen48 span').text(bannerJson.pFlightDepartureTimeLessthen48);

        //set css class
        scope.setBannerCustomerDetailsStyle(bannerJson);
        scope.WriteLog(DEBUG, 'preferedCustomerDetails --> End');
    }


    scope.getAsyncVoiceBannerFromContext = function (scope, searchKey, data) {

        var _qrDistinct = alasql("SELECT distinct name FROM ?", [data.customerDetails[0].data.customerCustoms]);
        if (_qrDistinct == undefined || _qrDistinct.length == 0) {
            scope.WriteLog(DEBUG, `prepareContextData --> ${searchKey} is not found. skipping..`);
            return "--";
        }

        for (var i = 0; i < _qrDistinct.length; i++) {
            var _query = `SELECT top 1  * FROM ? where name = '${searchKey}'  order by lastUpdatedTimeStamp desc`;
            results = alasql(_query, [data.customerDetails[0].data.customerCustoms]);

            var returnResult = (results.length == 0 ? '--' : results[0].text);
            if (returnResult == 'TRUE')
                return 'Yes'
            else if (returnResult == 'FALSE')
                return 'No'
            else
                return returnResult;
            //scope.prepareJson(key, results[0].text);
            // });
        }

    }

    scope.setBannerCustomerDetailsStyle = function (bannerJson) {

        //Set channel         
        switch (bannerJson.pChannel.toUpperCase()) {
            case 'VOICE':
                $(scope.htmlInteractionPrefix + ' #channelDetails').addClass('channel-voice');
                break;
        }

        //Set Tire
        switch (bannerJson.pTire.toUpperCase()) {
            case 'PLATINUM':
                $(scope.htmlInteractionPrefix + ' #customerTire').addClass('tier-platinum');
                break;
            case 'GOLD':
                $(scope.htmlInteractionPrefix + ' #customerTire').addClass('tier-gold');
                break;
            case 'SILVER':
                $(scope.htmlInteractionPrefix + ' #customerTire').addClass('tier-silver');
                break;
            //   case 'BURGUNDY':
            //     $(scope.htmlInteractionPrefix + ' #customerTire').addClass('tier-burgundy');
            //     break;
            default:
                $(scope.htmlInteractionPrefix + ' #customerTire').addClass('default-status');
        }

        //Set Verified
        switch (bannerJson.pVerified.toUpperCase()) {
            case 'YES':
                $(scope.htmlInteractionPrefix + ' #verifiedCustomers').addClass('verified');
                break;
            case 'NO':
                $(scope.htmlInteractionPrefix + ' #verifiedCustomers').addClass('not-verified');
                break;
            default:
                $(scope.htmlInteractionPrefix + ' #verifiedCustomers').addClass('default-status');
        }

        //Set Identified
        switch (bannerJson.pIdentified.toUpperCase()) {
            case 'YES':
                $(scope.htmlInteractionPrefix + ' #identfiedCustomer').addClass('identified');
                break;
            case 'NO':
                $(scope.htmlInteractionPrefix + ' #identfiedCustomer').addClass('not-identified');
                break;
            default:
                $(scope.htmlInteractionPrefix + ' #identfiedCustomer').addClass('default-status');
        }

        //Set DisruptionStatus
        switch (bannerJson.pDisruptionStatus.toUpperCase()) {
            case 'YES':
                $(scope.htmlInteractionPrefix + ' #disruptionStatus').addClass('dispositionStatus-yes');
                break;
            case 'NO':
                $(scope.htmlInteractionPrefix + ' #disruptionStatus').addClass('dispositionStatus-no');
                break;
            default:
                $(scope.htmlInteractionPrefix + ' #disruptionStatus').addClass('default-status');
        }

        //Set RepeatedCustomer
        if ((scope.objCsDetails.CustomerCallCount == undefined ? 0 : scope.objCsDetails.CustomerCallCount) >= scope.repeatCustomer.repeatCustomerHighLevel) {
            $(scope.htmlInteractionPrefix + ' #repeatedcustomers').addClass('repeated-customer high');
        }
        else if ((scope.objCsDetails.CustomerCallCount == undefined ? 0 : scope.objCsDetails.CustomerCallCount) >= scope.repeatCustomer.repeatCustomerMidevel && (scope.objCsDetails.CustomerCallCount == undefined ? 0 : scope.objCsDetails.CustomerCallCount) < scope.repeatCustomer.repeatCustomerHighLevel) {
            $(scope.htmlInteractionPrefix + ' #repeatedcustomers').addClass('repeated-customer mid');
        }
        else {
            $(scope.htmlInteractionPrefix + ' #repeatedcustomers').addClass('repeated-customer low');
        }

        //Set FlightDepartureTimeLessthen48

        // if (bannerJson.pFlightDepartureTimeLessthen48 == '--') {
        // $(scope.htmlInteractionPrefix + ' #departure48Hours').addClass('default-status');
        // }
        // else if (bannerJson.pFlightDepartureTimeLessthen48.length > 0) {
        // $(scope.htmlInteractionPrefix + ' #departure48Hours').addClass('less-hours');
        // }
        // else {
        // $(scope.htmlInteractionPrefix + ' #departure48Hours').addClass('more-hours');
        // }

        switch (bannerJson.pFlightDepartureTimeLessthen48.toUpperCase()) {
            case 'YES':
                $(scope.htmlInteractionPrefix + ' #departure48Hours').addClass('less-hours');
                break;
            case 'NO':
                $(scope.htmlInteractionPrefix + ' #departure48Hours').addClass('more-hours');
                break;
            default:
                $(scope.htmlInteractionPrefix + ' #departure48Hours').addClass('default-status');
        }


    }


    scope.getContextStoreValueFromJson = function (key) {

        //  var _jsonValue = scope.getJsonValues(scope.objCsDetails.context, key);
        var _jsonValue = scope.getJsonValues(scope.objCsDetails, key);
        if (_jsonValue != null)
            if (_jsonValue[0] != null && _jsonValue.length >= 0) {

                return _jsonValue[0];
            }
        return '--';
    }

    scope.onACW = function (scope, api, data, $timeout) {

        scope.WriteLog(DEBUG, 'onACW --> Start');

        scope.clearAcw();
       
        scope.deEnrollementNotes = "";
        $(scope.htmlInteractionPrefix + " #vbffpinput").prop("readonly", true);
        $(scope.htmlInteractionPrefix + ' #txtDeEnrollementNotes').val('');
        $(scope.htmlInteractionPrefix + ' #clearDeEnrollementNotes').css('display', 'none');
        $(scope.htmlInteractionPrefix + ' #txtDeEnrollementNotes').prop('disabled', true);

        scope.acwflag = true;

        scope.serviceType = data.topic;// service type
        scope.serviceName = data.topic;
        scope.acwTime = scope.getTime_yyyymmdd();
        scope.newIntraction(scope, data);

        scope.WriteLog(DEBUG, 'onACW --> End');

    }

    scope.getVoiceContextDetails = function (scope, data, customerDetails) {

        scope.WriteLog(DEBUG, 'getVoiceContextDetails --> Start');

        var vbStatus_Date;

        if (scope.objCsDetails.VB_Status_Date !== undefined && scope.objCsDetails.VB_Status_Date !== null) {

            vbStatus_Date = scope.objCsDetails.VB_Status_Date.replace('T', ' ');

        }else{

            vbStatus_Date = scope.objCsDetails.VB_Status_Date
        }

        var _jsonArrary = [];
        _jsonArrary.push(scope.prepareJson("channel", scope.objInteraction.channel));
        _jsonArrary.push(scope.prepareJson("VoiceReason", scope.objCsDetails.VoiceReason == undefined  ? '-' : scope.objCsDetails.VoiceReason));
        _jsonArrary.push(scope.prepareJson("CountryName", scope.objCsDetails.CountryName == undefined  ? '-' : scope.objCsDetails.CountryName));
        _jsonArrary.push(scope.prepareJson("ServiceType", scope.objCsDetails.ServiceType == undefined  ? '-' : scope.objCsDetails.ServiceType));
        _jsonArrary.push(scope.prepareJson("CustomerLanguage", scope.objCsDetails.CustomerLanguage == undefined  ? '-' : scope.objCsDetails.CustomerLanguage));
        _jsonArrary.push(scope.prepareJson("IsPreferredLanguage", scope.objCsDetails.IsPreferredLanguage == undefined  ? '-' : scope.objCsDetails.IsPreferredLanguage));
        _jsonArrary.push(scope.prepareJson("CustomerName", scope.objCsDetails.CustomerName == undefined  ? '-' : scope.objCsDetails.CustomerName));
        _jsonArrary.push(scope.prepareJson("CustomerNumber", scope.objCsDetails.CustomerNumber == undefined  ? '-' : scope.objCsDetails.CustomerNumber));
        _jsonArrary.push(scope.prepareJson("PNR", scope.objCsDetails.PNR == undefined  ? '-' : scope.objCsDetails.PNR));
        _jsonArrary.push(scope.prepareJson("BookingChannel", scope.objCsDetails.BookingChannel == undefined  ? '-' : scope.objCsDetails.BookingChannel));
        _jsonArrary.push(scope.prepareJson("BookingClass", scope.objCsDetails.BookingClass == undefined  ? '-' : scope.objCsDetails.BookingClass));
        _jsonArrary.push(scope.prepareJson("FareFamily", scope.objCsDetails.FareFamily == undefined  ? '-' : scope.objCsDetails.FareFamily));
        _jsonArrary.push(scope.prepareJson("TicketStatus", scope.objCsDetails.TicketStatus == undefined  ? '-' : scope.objCsDetails.TicketStatus));
        _jsonArrary.push(scope.prepareJson("FFPNumber", scope.objCsDetails.FFPNumber == undefined ? '-' : scope.objCsDetails.FFPNumber));

        _jsonArrary.push(scope.prepareJson("VB_Status", scope.objCsDetails.VB_Status == undefined  ? '-' : scope.objCsDetails.VB_Status));
        _jsonArrary.push(scope.prepareJson("VB_Status_Date", vbStatus_Date == undefined  ? '-' : vbStatus_Date));
        _jsonArrary.push(scope.prepareJson("VB_Enrollment_Failed", scope.objCsDetails.VB_Enrollment_Failed == undefined  ? '-' : scope.objCsDetails.VB_Enrollment_Failed));
        _jsonArrary.push(scope.prepareJson("Verified_via_vb", scope.objCsDetails.Verified_via_vb == undefined  ? '-' : scope.objCsDetails.Verified_via_vb));
        _jsonArrary.push(scope.prepareJson("De_enrolled_caller_from_Vb", scope.objCsDetails.De_enrolled_caller_from_Vb == undefined  ? '-' : scope.objCsDetails.De_enrolled_caller_from_Vb));
        _jsonArrary.push(scope.prepareJson("VB_enrollment_status", scope.objCsDetails.VB_enrollment_status == undefined  ? '-' : scope.objCsDetails.VB_enrollment_status));
        _jsonArrary.push(scope.prepareJson("VB_enrollment_status_date", scope.objCsDetails.VB_enrollment_status_date == undefined  ? '-' : scope.objCsDetails.VB_enrollment_status_date));
        _jsonArrary.push(scope.prepareJson("VB_verification_status", scope.objCsDetails.VB_verification_status == undefined  ? '-' : scope.objCsDetails.VB_verification_status));
        _jsonArrary.push(scope.prepareJson("VB_verification_status_date", scope.objCsDetails.VB_verification_status_date == undefined  ? '-' : scope.objCsDetails.VB_verification_status_date));

        _jsonArrary.push(scope.prepareJson("IATANumber", scope.objCsDetails.IATANumber == undefined  ? '-' : scope.objCsDetails.IATANumber));
        _jsonArrary.push(scope.prepareJson("Dnis", scope.objCsDetails.Dnis == undefined  ? '-' : scope.objCsDetails.Dnis));
        _jsonArrary.push(scope.prepareJson("BusinessUnit", scope.objCsDetails.BusinessUnit == undefined  ? '-' : scope.objCsDetails.BusinessUnit));
        _jsonArrary.push(scope.prepareJson("CustomerCallCount", scope.objCsDetails.CustomerCallCount == undefined  ? '-' : scope.objCsDetails.CustomerCallCount));
        _jsonArrary.push(scope.prepareJson("CustomerStatus", scope.objCsDetails.CustomerStatus == undefined  ? '-' : scope.objCsDetails.CustomerStatus));
        _jsonArrary.push(scope.prepareJson("StaffID", scope.objCsDetails.StaffID == undefined  ? '-' : scope.objCsDetails.StaffID));
        _jsonArrary.push(scope.prepareJson("IsBlacklisted", scope.objCsDetails.IsBlacklisted == undefined  ? '-' : scope.objCsDetails.IsBlacklisted));
        _jsonArrary.push(scope.prepareJson("TransferredFlag", scope.objCsDetails.TransferredFlag == undefined ? '-' : scope.objCsDetails.TransferredFlag));
        _jsonArrary.push(scope.prepareJson("TransferredBy", scope.objCsDetails.TransferredBy == undefined ? '-' : scope.objCsDetails.TransferredBy));
        _jsonArrary.push(scope.prepareJson("LARRouting", scope.objCsDetails.LARRouting == undefined  ? "-" : (scope.objCsDetails.LARRouting == 'YES' ? "YES" : "NO")));

        //scope.deenrollementrequiredContextkey(_jsonArrary);
        scope.WriteLog(DEBUG, 'getVoiceContextDetails --> End');
        return _jsonArrary;
    }

    scope.prepareJson = function (key, value) {
        var _json = [];
        _json[key] = value;
        return _json;

    }

    scope.customerDetailsFieldFormatting = function (data) {

        var cls = "";

        if (data.HighlightedColor == "TRUE")
            cls += " highlightedColor";

        if (data.HighlightedFont == "TRUE")
            cls += " highlightedFont";

        if (data.Value != undefined && data.HighlightedICON == "TRUE") {

            if (data.HighlightedICON == "TRUE" && (data.Value.toUpperCase() == "TRUE" || data.Value.toUpperCase() == "POSITIVE"))
                cls += " highlightedIconThumbsUp";
            else if (data.HighlightedICON == "TRUE" && (data.Value.toUpperCase() == "FALSE" || data.Value.toUpperCase() == "NEGATIVE"))
                cls += " highlightedIconThumbsDown";
        }


        return cls;
    }

    scope.onInteractionEnded = function (scope, api, data, timeout) {

        scope.WriteLog(DEBUG, 'onInteractionEnded --> Start');

        scope.saveCallLog(scope);

        scope.WriteLog(DEBUG, 'onInteractionEnded --> End');
    }


    //Load Initilize

    scope.setFocusOnNotificationClick = function (scope, api) {

        scope.WriteLog(DEBUG, "setFocusOnNotificationClick - Start");

        api.setFocus(scope.interactionID);
        scope.removeNewMsgNotification(scope);

        scope.WriteLog(DEBUG, "MediaMessageEvent - End");
    }

    scope.removeNewMsgNotification = function (scope) {
        scope.WriteLog(DEBUG, "removeNewMsgNotification -->  Start.");

        $('.voicenewmsgnotification_' + scope.interactionID + '.notification-information-list').removeClass("info-notification-active");

        var notification_information_list = '.voicenewmsgnotification_' + scope.interactionID + '.notification-information-list';
        var _notification_information = scope.validateTextAndNumbers(notification_information_list) ? notification_information_list : "";

        if (_notification_information == undefined) {
            scope.WriteLog(DEBUG, "removeNewMsgNotification -->  _notification_information is undefined. Skipping..");
            return;
        }

        if (_notification_information != "") {
            setTimeout(function () {
                if ($(_notification_information) != undefined) {
                    $(_notification_information).remove();
                }
            }, 500);

        }
        scope.WriteLog(DEBUG, "removeNewMsgNotification -->  End.");

    }

    scope.initializeVoiceLayout = function (scope, data) {

        scope.WriteLog(DEBUG, "initializeVoiceLayout -->  Start.");

        scope.btnVoiceMinimizeCRM();// Need to validate

        scope.btnMinimizeCustomPanel(scope);

        scope.WriteLog(DEBUG, "initializeVoiceLayout -->  End.");
    };

    scope.loadWidgetData = function (scope, api, data) {

        scope.WriteLog(INFO, "loadWidgetData - Start");

        scope.loadRecentCallNotes(scope, api, data);

        scope.WriteLog(DEBUG, "loadWidgetData - End");
    }

    scope.loadDispositionDetails = function (scope, api, data) {

        scope.WriteLog(DEBUG, "loadDispositionDetails -->  Start.");

        var dispositionCodes = api.getDispositionCodes('VOICE');// Read disposition code's from Oceana API

        var _cbo = $(scope.htmlInteractionPrefix + ' #disposition_dropdown');
        _cbo.html('');


        if (dispositionCodes == null && dispositionCodes.length <= 0) {
            scope.WriteLog(INFO, "loadDispositionDetails -->  No disposition found.");
            return;
            // scope.dispositionCodeResponse = dispositionCodes;
        }
        var _html = "<li style = \"display: none;\" > <data></data></li>";

        for (var i = 0; i < dispositionCodes.length; i++) {
            var _disposition_code = scope.validateTextAndNumbers(dispositionCodes[i].code) ? dispositionCodes[i].code : "--";
            var _disposition_friendlyName = scope.validateTextAndNumbers(dispositionCodes[i].friendlyName) ? dispositionCodes[i].friendlyName : "--";
            _html += "<li> <data data-value=" + _disposition_code + ">" + _disposition_friendlyName + " (" + _disposition_code + " )" + "</data></li>"
        }

        _cbo.html(_html);


        scope.WriteLog(DEBUG, "loadDispositionDetails -->  End.");
    };

    //CRM Maximize
    scope.btnVoiceMaximizeCRM = function () {

        $(".crm-min-max-btn .crm-minbtn").removeClass("hide");
        $(".crm-min-max-btn .crm-maxbtn").addClass("hide");
        $(".QATAR-widget-body-container").addClass("activefullscreen");

    };

    //CRM Minimize  
    scope.btnVoiceMinimizeCRM = function () {

        $(".crm-min-max-btn .crm-minbtn").addClass("hide");
        $(".crm-min-max-btn .crm-maxbtn").removeClass("hide");
        $(".QATAR-widget-body-container").removeClass("activefullscreen");
    };

    //Widget Minimize 
    scope.btnMinimizeCustomPanel = function (scope) {

        scope.WriteLog(DEBUG, 'btnMinimizeCustomPanel -> START');

        $(scope.htmlInteractionPrefix + ' .Qatar-widget-popup-report-container').removeClass("active-popup");
        $(scope.htmlInteractionPrefix + ' .Qatar-widget-minimize-report-container').addClass("active-minimize");
        scope.WriteLog(DEBUG, 'btnMinimizeCustomPanel -> END');

    };

    //Widget Maximize 
    scope.btnMaximizeCustomPanel = function (scope) {

        scope.WriteLog(DEBUG, 'btnMaximizeCustomPanel -> START');

        $(scope.htmlInteractionPrefix + ' .Qatar-widget-popup-report-container').addClass("active-popup");
        $(scope.htmlInteractionPrefix + ' .Qatar-widget-minimize-report-container').removeClass("active-minimize");

        scope.WriteLog(DEBUG, 'btnMaximizeCustomPanel -> END');

    };


    scope.loadRecentCallNotes = function (scope, data) {

        scope.WriteLog(DEBUG, "recentCallNotes -->  Start.");

        var reqJson = JSON.stringify({
            "context_id": scope.workRequestId,
            "contact_address": scope.getSIPNumber(scope.objInteraction.originatingAddress),
            "channel": scope.objInteraction.channel
        });

        var wsReqJson = JSON.stringify({
            "serviceName": "getAgentNotes",
            "requestData": reqJson
        });

        scope.WriteLog(INFO, 'get recent call notes from  service - ' + wsReqJson);

        var _url = scope.middlewareServiceUrl + '/customWidgetPostRequest';

        scope.executeWebRequest(scope, '', _url, 'POST', wsReqJson, "api", "REQ_WS_RECENT_CALL_NOTES");

        scope.WriteLog(DEBUG, "recentCallNotes -->  End.");
    };

    scope.loadServiceTransferList = function (scope, data, api) {

        scope.WriteLog(DEBUG, "loadServiceTransferList -->  Start.");

        var reqJson = JSON.stringify({
            "service_type": data.CountryName,
            "channel": "Voice"//data.Channel
        });

        var wsReqJson = JSON.stringify({
            "serviceName": "getServiceTransferList",
            "requestData": reqJson
        });

        scope.WriteLog(INFO, 'Get service transger list - ' + wsReqJson);

        var _url = scope.middlewareServiceUrl + '/customWidgetPostRequest';

        scope.executeWebRequest(scope, '', _url, 'POST', wsReqJson, api, "REQ_WS_GET_SERIVE_TRANSFER_LIST");

        scope.WriteLog(DEBUG, "loadServiceTransferList -->  End.");
    };


    scope.cancelRecentCallNotes = function (scope) {

        scope.WriteLog(DEBUG, "cancelRecentCallNotes --> Start");

        $(scope.htmlInteractionPrefix + ' #txtRecentCallNotes').val('');
        $(scope.htmlInteractionPrefix + ' #dispositionCodeDropdown__voice__' + scope.interactionID + ' .input-text').val('');
        $(scope.htmlInteractionPrefix + ' #dispositionCodeDropdown__voice__' + scope.interactionID + ' .singleselect-dropdown-list li').removeClass('active');

        scope.WriteLog(DEBUG, "cancelRecentCallNotes -->  End.");
    }

    scope.dispotionDropdownChange = function (scope, dropdownParenteleID, dispositionDesc, selectVal) {

        scope.WriteLog(DEBUG, 'dispotionDropdownChange. Start');

        scope.dispositionCode = selectVal;
        scope.dispositionDesc = dispositionDesc;

        scope.WriteLog(DEBUG, 'dispotionDropdownChange. End');
    }

    scope.saveRecentCallNotes = function (scope, event) {

        scope.WriteLog(DEBUG, "saveRecentCallNotes --> Start");

        $(scope.htmlInteractionPrefix + ' #txtRecentCallNotes').removeClass("required-field");
        var _cboTextdisposition_dropdown = $(scope.htmlInteractionPrefix + ' #disposition_dropdown .QATAR-input-single-select');

        _cboTextdisposition_dropdown.removeClass("required-field");

        var _getInteraction = scope.getInteraction(scope);

        scope.txtRecentCallNotes = $(scope.htmlInteractionPrefix + ' #txtRecentCallNotes').val();
        scope.callNotes = scope.txtRecentCallNotes;
        if (_getInteraction.ANSWER_TIME.length <= 0) {
            //message box  
            scope.WriteLog(WARNING, 'saveRecentCallNotes -> Call not answered.Missed Call. skiping');
            return;
        }

        if (_getInteraction.NOTES_UPDATED == true) {
            //message box
            scope.WriteLog(WARNING, 'saveRecentCallNotes -> Notes already saved. skiping');
            return;
        }

        //onInteractionEndedEvent
        if (event == 'saveRecentCallNotes_Click') {

            if (scope.txtRecentCallNotes.length <= 0) {
                scope.WriteLog(WARNING, 'saveRecentCallNotes -> Call Nots should not empty');

                $(scope.htmlInteractionPrefix + ' #txtRecentCallNotes').addClass("required-field");
                return;
            }

            scope.callNotes = scope.txtRecentCallNotes;
            scope.setInteraction(scope);
            scope.showMessagePopup("SUCCESS", scope.lang[scope.workspace_language].MSGCallNoteSaveSuccessHeader, scope.lang[scope.workspace_language].MSGCallNoteSaveSuccessMessage);

            return false;
        }
        var _contact_address = scope.objInteraction.originatingAddress;


        var reqJson = {
            "ref_id": _getInteraction.REFID,
            "work_request_id": scope.workRequestId,
            "channel": scope.objInteraction.channel,
            "direction": scope.objInteraction.direction,
            "contact_address": _contact_address,
            "agent_id": scope.configuration.agentId,
            "agent_handle": scope.configuration.handle,
            "agent_name": scope.configuration.displayName,
            "disposition_code": scope.dispositionCode,
            "disposition_desc": scope.dispositionDesc,
            "call_notes": scope.callNotes,//scope.txtRecentCallNotes,
            "timestamp": scope.getTime_yyyymmdd(),
            "event": event,
            "remarks": ""
        };

        var wsReqJson = JSON.stringify({
            "serviceName": "insertAgentNotes",
            "requestData": JSON.stringify(reqJson)
        });


        var _url = scope.middlewareServiceUrl + '/customWidgetPostRequest';

        scope.executeWebRequest(scope, '', _url, 'POST', wsReqJson, "api", "REQ_WS_SAVE_NOTES");

        scope.WriteLog(DEBUG, "saveRecentCallNotes --> End");
    };

    scope.SearchRecentCallNotes = function (scope) {

        scope.WriteLog(DEBUG, "SearchRecentCallNotes -->  Start.");
        var _searchMobielNumber = $(scope.htmlInteractionPrefix + ' #txtRecentSearchMobileNumber');
        var _searchFromDate = $(scope.htmlInteractionPrefix + ' #txtStartDate');
        var _searchToDate = $(scope.htmlInteractionPrefix + ' #txtEndDate');

        _searchMobielNumber.removeClass("required-field");
        _searchFromDate.removeClass("required-field");
        _searchToDate.removeClass("required-field");

        if (_searchFromDate.val().length == 0) {
            _searchFromDate.addClass("required-field");
            scope.WriteLog(WARNING, "Start date is empty");
            return;
        }
        if (_searchToDate.val().length == 0) {
            _searchToDate.addClass("required-field");
            scope.WriteLog(WARNING, "End date is empty");
            return;
        }

        var _contact_address = scope.objInteraction.originatingAddress;

        var reqJson = JSON.stringify({
            "email": "",
            "from_date": (_searchFromDate.val().split("/").reverse().join("-") + " 00:00:01"),
            "to_date": (_searchToDate.val().split("/").reverse().join("-") + " 23:59:59"),
            "callernumber": (_searchMobielNumber.val() == "" ? _contact_address : _searchMobielNumber.val()),
            "agentname": scope.agentname,
            "channel": scope.objInteraction.channel
        });

        scope.WriteLog(INFO, 'SearchRecentCallNotes -> get recent call notes from  service - ' + reqJson);

        var wsReqJson = JSON.stringify({
            "serviceName": "getAgentNotesSearch",
            "requestData": reqJson
        });

        var _url = scope.middlewareServiceUrl + '/customWidgetPostRequest'; //customWidgetGetRequest?serv

        scope.executeWebRequest(scope, '', _url, 'POST', wsReqJson, "api", "REQ_WS_SEARCH_RECENT_CALL_NOTES");

        scope.WriteLog(DEBUG, "SearchRecentCallNotes -->  End.");
    };

    scope.saveCallLog = function (scope) {

        scope.WriteLog(DEBUG, "saveCallLog --> Start");
        var _getInteraction = scope.getInteraction(scope);
        scope.saveRecentCallNotes(scope, 'onInteractionEndedEvent');
        var destinationAddress = scope.objInteraction.destinationAddress.replace("#", "");
        var _agent_type = localStorage.getItem("_cc.userDetails") == undefined ? "" : (JSON.parse(localStorage.getItem("_cc.userDetails")).role == undefined ? "" : JSON.parse(localStorage.getItem("_cc.userDetails")).role);

        var reqJson = {
            "ref_id": _getInteraction.REFID,
            "agent_id": scope.configuration.agentId,
            "agent_handle": scope.configuration.handle,
            "agent_name": scope.configuration.displayName,
            "agent_type": scope.validateTextAndNumbers(_agent_type) ? _agent_type : "",
            "agent_extn": (scope.configuration.stationId == undefined ? scope.configuration.agentId : scope.configuration.stationId),
            "interaction_id": scope.objInteraction.id,
            "work_request_id": scope.workRequestId,
            "call_direction": scope.objInteraction.direction,
            "service_name": scope.objInteraction.topic,
            "cli": scope.getSIPNumber(scope.objInteraction.originatingAddress),
            "dnis": scope.getSIPNumber(destinationAddress),
            "offered_time": _getInteraction.OFFER_TIME,
            "answered_time": _getInteraction.ANSWER_TIME,
            "disconnected_time": _getInteraction.ACW_TIME,
            "end_time": scope.getTime_yyyymmdd(),
            "interaction_time": scope.calcTimeDifference(_getInteraction.ACW_TIME, _getInteraction.ANSWER_TIME),
            "call_action": scope.callType,//scope.objInteraction.interactionType,//Transfer or conference or survye
            "call_action_number": scope.transferVal, //Transfer or conference or survye number
            "workspace_language": scope.workspace_language,
            "ivr_language": scope.ivr_language,
            "remarks": ""
        };

        var wsReqJson = JSON.stringify({
            "serviceName": "insertVoice",
            "requestData": JSON.stringify(reqJson)
        });

        var _url = scope.middlewareServiceUrl + '/customWidgetPostRequest'; //customWidgetGetRequest?serv

        scope.executeWebRequest(scope, '', _url, 'POST', wsReqJson, "api", "REQ_WS_SAVE_CALL_LOG");

        scope.removeInteraction(scope);
        scope.WriteLog(DEBUG, "saveCallLog --> End");
    };

    scope.selectCustomerDetailsUseLabel = function (scope, data, label) {

        var strQr = `SELECT * FROM ? where Label = '${label}'`;
        var _data = alasql(strQr, [data]);

        if (_data.length == 0)
            return "";
        return _data[0];
    }

    scope.getCSDetails = function (scope, from, api) {

        scope.WriteLog(INFO, "getCSNotification - Start");

        if (scope.objCsDetails != '') {
            scope.WriteLog(INFO, "getCSNotification - Alredy data processed. Skipping..");
            return;
        }
        if (scope.objInteraction.channel == undefined) {
            scope.WriteLog(INFO, "getCSNotification - Chennel is empty. Skipping..");
            return;
        }

        //whatsapp && webvoice  = "MESSAGING"
        scope.channel = scope.objInteraction.channel;



        var contextStoreURL = scope.isSecure + scope.configuration.settings.contextStoreClusterIP + '/services/OceanaCoreDataService/oceana/data/context/' + scope.objInteraction.workRequestId;


        scope.executeWebRequest(scope, scope.configuration.token, contextStoreURL, 'GET', '', api, "REQUEST_CS_DETAILS");

        scope.WriteLog(INFO, "getCSNotification - END");
    }

    scope.respProcessCSDetails = function (requestData, jsonResponse, scope, api) {

        scope.WriteLog(DEBUG, "respProcessCSDetails -> START.");

        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {

            scope.prepareContextData(scope, scope.contextData, scope.objInteraction.channel);
            scope.WriteLog(WARNING, "respProcessCSDetails -> Response is Null or Empty");
            return;
        }

        scope.WriteLog(INFO, "respProcessCSDetails -> Response Data - " + jsonResponse);

        jsonResponse = JSON.parse(jsonResponse);

        if (jsonResponse.data == undefined || jsonResponse.data.length == 0) {
            scope.prepareContextData(scope, scope.contextData, scope.objInteraction.channel);
            scope.WriteLog(INFO, "respProcessCSDetails -> Response Data - undefined" + jsonResponse);
            return;
        }

        scope.objCsDetails = jsonResponse.data;

        scope.disableFFPSearchTab(scope.objCsDetails);
        scope.disabledDeenrollBtn(scope.objCsDetails);
        scope.loadServiceTransferList(scope, scope.objCsDetails, api);
        scope.prepareContextData(scope, scope.contextData, scope.objInteraction.channel);
        scope.WriteLog(DEBUG, "respProcessCSDetails -> End.");

    }
   
    scope.parseJwt = function (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    };


    var agentJson = scope.parseJwt(scope.configuration.token);
    scope.disableFFPSearchTab = function(data){

        if (data.CustomerLanguage === "English") {

            scope.enableFFPTab = true;
            scope.enableDeEnroll = false;
            scope.DeEnrollement_role.forEach(function (role) {
                if (scope.getrole(agentJson, role)) {
                    scope.enableDeEnroll = true;
                }
            });
        } else {
            scope.enableFFPTab = false;
            scope.enableDeEnroll = false;
        }
    }

    //Execute web service 
    scope.executeWebRequest = function (scope, token, requestUrl, httpMethodType, requestData, api, serviceType) {

        scope.WriteLog(DEBUG, 'executeWebRequest -> Start. Service type is  - ' + serviceType + ' HTTP method type - ' + httpMethodType + '. webservice URL - ' + requestUrl + '  \n Request Data - ' + JSON.stringify(requestData));
        if (requestUrl == "" && httpMethodType == "") {
            scope.WriteLog(INFO, 'executeWebRequest ->  webservice Request data Is Null or Empty ');
            return;
        }

        $.ajax({
            url: requestUrl,
            type: httpMethodType,
            data: requestData,
            cache: false,
            contentType: false,
            processData: false,
            headers: (serviceType == 'REQ_WS_DEENROLLEMENT_EXTERNAL_API' || serviceType == 'REQ_WS_FFP_SEARCH_DETAILS') ?
                {
                    "apirequestid": scope.workRequestId,
                    "Accept": "application/json",
                    "Content-Type": 'application/json'
                } :
                {
                    "Authorization": "" + token,
                    "Accept": "application/json",
                    "Content-Type": 'application/json'
                },
            complete: function (xhr, textStatus, result) {

                if (xhr.status == 200 || xhr.status == 202) {
                    scope.WriteLog(INFO, 'executeWebRequest -> ' + serviceType + '  Successfully to execute web service - ' + xhr.responseText);

                    var _responseText = xhr.responseText;


                    scope.redirectAction(_responseText, serviceType, requestData, scope, api);

                } else {

                    scope.WriteLog(INFO, 'executeWebRequest -> ' + serviceType + ' Web service execute fail - ' + xhr.responseText);


                    scope.redirectAction('', serviceType, requestData, scope, api);

                    return;
                }
                return;
            }
        });
        scope.WriteLog(DEBUG, 'executeWebRequest -> End.');
    }

    scope.redirectAction = function (response, serviceType, requestData, scope, api) {

        scope.WriteLog(DEBUG, 'redirectAction -> ' + serviceType + ' --> Web service execute successfully, Response : ' + JSON.stringify(response));

        if (serviceType == "REQ_WS_RECENT_CALL_NOTES")
            scope.respGetRecentCallNotes(scope, response, requestData);

        else if (serviceType == "REQ_WS_SAVE_NOTES")
            scope.respSetRecentCallNotes(scope, response, requestData);

        else if (serviceType == "REQ_WS_SEARCH_RECENT_CALL_NOTES")
            scope.respGetRecentCallNotes(scope, response, requestData);

        else if (serviceType == "REQ_WS_SAVE_CALL_LOG")
            scope.respSetCallLog(scope, response, requestData);

        else if (serviceType == "REQUEST_CS_DETAILS")
            scope.respProcessCSDetails(requestData, response, scope, api);

        else if (serviceType == "REQ_WS_GET_SERIVE_TRANSFER_LIST")
            scope.respGetServiceTransferList(requestData, response, scope, api);

        else if (serviceType == "REQ_WS_DEENROLLEMENT_EXTERNAL_API")
            scope.respGetExternalAPIresponse(requestData, response, scope, api);

        else if (serviceType == "REQ_WS_FFP_SEARCH_DETAILS")
            scope.respGetFFPSearchresponse(requestData, response, scope, api);

        scope.WriteLog(DEBUG, 'redirectAction -> End');
    }

    scope.respGetExternalAPIresponse = function (requestData, jsonResponse, scope, api) {

        scope.WriteLog(WARNING, "respGetExternalAPIresponse -> START.");

        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {

            scope.removeLoader();
            $(scope.htmlInteractionPrefix + ' #saveDeEnrollementNotes').prop('disabled', false);
            scope.validateSaveDeenrollFlag = false;
            scope.showMessagePopup("Failed", scope.lang[scope.workspace_language].MSGSaveDeEnrollSuccessHeader, scope.lang[scope.workspace_language].MSGSaveDeEnrollFailureMessage);

            scope.WriteLog(DEBUG, "respGetExternalAPIresponse -> Response --> Null.");

            return;
        }

        var _jsonResponse = JSON.parse(jsonResponse);

        if (_jsonResponse.responseCode == "200") {
            scope.removeLoader();
            scope.deEnrollementNotes = "";
            //$(scope.htmlInteractionPrefix +' #saveDeEnrollementNotes').prop('disabled', true);

            scope.validateSaveDeenrollFlag = true;
            scope.showMessagePopup("SUCCESS", scope.lang[scope.workspace_language].MSGSaveDeEnrollSuccessHeader, scope.lang[scope.workspace_language].MSGSaveDeEnrollSuccessMessage);
            scope.clearDeEnrollementNotes_Click();

        } else {
            scope.removeLoader();
            scope.deEnrollementNotes = "";
            //$(scope.htmlInteractionPrefix +' #saveDeEnrollementNotes').prop('disabled', true);
            scope.validateSaveDeenrollFlag = false;
            scope.showMessagePopup("Failed", scope.lang[scope.workspace_language].MSGSaveDeEnrollSuccessHeader, scope.lang[scope.workspace_language].MSGSaveDeEnrollFailureMessage);
        }
        scope.WriteLog(DEBUG, "respGetExternalAPIresponse -> End.");
    }


    scope.respGetFFPSearchresponse = function (requestData, jsonResponse, scope, api) {

        scope.WriteLog(DEBUG, "respGetFFPSearchresponse -> START.");

        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {
            scope.removeLoader();
            scope.showMessagePopup("Failed", scope.lang[scope.workspace_language].MSGSaveFFPSuccessHeader, scope.lang[scope.workspace_language].MSGFFPSearchFailureMessage);
            scope.WriteLog(WARNING, "respGetFFPSearchresponse -> Response is Null or Empty");
            return;
        }

        if (jsonResponse != null || jsonResponse != undefined || jsonResponse != '') {
            scope.removeLoader();

                        // Parse the outer JSON
            var _jsonResponse = JSON.parse(jsonResponse);

            // Extract and clean the responseData string
            var responseDataString = _jsonResponse.responseData.replace("CRMData [", "").slice(0, -1);

            // Split the string into key-value pairs
            var keyValuePairs = responseDataString.split(", ");

            // Convert key-value pairs into an object
            var _responseData = {};
            keyValuePairs.forEach(pair => {
                let [key, value] = pair.split("=");
                _responseData[key] = (value === 'null') ? 'null' : value;
            });

            // var _jsonResponse = JSON.parse(jsonResponse);
            // var _responseData = JSON.parse(_jsonResponse.responseData);

            //	if(_responseData.Validations != null && _responseData.Validations.length  > 0){

            //	var invaildFFP = _responseData.Validations[0];

            //	if(invaildFFP === 'Invalid FFP Number') {
            if (_responseData.CustomerID == 'null' || _responseData.CustomerID == undefined) {
                scope.WriteLog(WARNING, "Invalid FFP Number");
                $(scope.htmlInteractionPrefix + ' .ffp-err-msg').empty();
                var errorMessageSpan = $("<span class='ffp-err-msg'>").text("Invalid FFP Number").css("color", "red");
                $(scope.htmlInteractionPrefix + " .search-div").append(errorMessageSpan);
                return;
            }
            //	}
            //	}

            $(scope.htmlInteractionPrefix + ' .ffp-err-msg').empty();


            scope.WriteLog(DEBUG, "respGetFFPSearchresponse -> START : " + JSON.stringify(_responseData));

                var dateTimeDob = _responseData.DoB;

                var vbDob = '';

                if(dateTimeDob !== undefined && dateTimeDob !== null){
                    vbDob = dateTimeDob.includes('T') ? dateTimeDob.split('T')[0] : dateTimeDob;
                } else {
                            vbDob = dateTimeDob;
                }

            //var vbDob = _responseData.DoB.split('T')[0];

            var VB_Status_Date ='';

                if(_responseData.VB_Status_Date !== undefined && _responseData.VB_Status_Date !== null){
                    VB_Status_Date = _responseData.VB_Status_Date.replace('T', ' ');
                }else{
                    VB_Status_Date = _responseData.VB_Status_Date
                }
                

            if (_responseData != null) {

                scope.ffpUpdateCsResponse = _responseData;
                $(scope.htmlInteractionPrefix + ' #vbCustomerName').val(_responseData.FirstName == "null" || _responseData.FirstName == undefined || _responseData.FirstName == "" ? "--" : _responseData.FirstName);
                $(scope.htmlInteractionPrefix + ' #vbEmailId').val(_responseData.Email == "null" || _responseData.Email == undefined || _responseData.Email == "" ? "--" : _responseData.Email);
                $(scope.htmlInteractionPrefix + ' #vbSegment').val(_responseData.MemberTier == "null" || _responseData.MemberTier == undefined || _responseData.MemberTier == "" ? "--" : _responseData.MemberTier);
                $(scope.htmlInteractionPrefix + ' #vbDob').val(vbDob == "null" || vbDob == undefined || vbDob == "" ? "--" : vbDob);
                $(scope.htmlInteractionPrefix + ' #vbSts').val(_responseData.VB_Status == "null" || _responseData.VB_Status == undefined || _responseData.VB_Status == "" ? "--" : _responseData.VB_Status);
                $(scope.htmlInteractionPrefix + ' #vbStsDate').val(VB_Status_Date == "null" || VB_Status_Date == undefined || VB_Status_Date == "" ? "--" : VB_Status_Date);
                $(scope.htmlInteractionPrefix + ' #isBlackListed').val(_responseData.IsBlacklisted  == "null" || _responseData.IsBlacklisted == undefined || _responseData.IsBlacklisted == "" ? "--" : _responseData.IsBlacklisted);
                if ($(scope.htmlInteractionPrefix + ' #vbSts').val() == 'EN') {
                    scope.WriteLog(WARNING, "Start --> FFP Search VB Status --> EN");
                    $(scope.htmlInteractionPrefix + ' #txtDeEnrollementNotes').prop('disabled', false);
                    $(scope.htmlInteractionPrefix + " #saveDeEnrollementNotes").removeClass("hide");
                    $(scope.htmlInteractionPrefix + ' #txtDeEnrollementNotes').removeClass("required-field");
                    $(scope.htmlInteractionPrefix + ' .txtDeEnrollementNotes_msg').html('').css('color', '');
                } else {
                    $(scope.htmlInteractionPrefix + ' #txtDeEnrollementNotes').prop('disabled', true);
                    $(scope.htmlInteractionPrefix + " #saveDeEnrollementNotes").addClass("hide");
                    $(scope.htmlInteractionPrefix + ' #txtDeEnrollementNotes').addClass("required-field");
                    $(scope.htmlInteractionPrefix + ' .txtDeEnrollementNotes_msg').html('Not Eligible For DeEnroll').css('color', 'red');
                }
                scope.validateVBEligibleStatus(_responseData.VB_Status, _responseData.VB_Status_Date);

            }

        }

        scope.WriteLog(DEBUG, "respGetFFPSearchresponse -> End.");
    }

    scope.validateVBEligibleStatus = function (VBEligibleStatus, vbEligibleStatusDate) {
        scope.WriteLog(DEBUG, "validateVBEligibleStatus -> START.");

        var vbEligibleStatus = VBEligibleStatus;
        var vbEligibleStatusDate = vbEligibleStatusDate;

        if (scope.validateVBStatus_type.includes(vbEligibleStatus)) {
            var vbstatus_date = new Date(vbEligibleStatusDate);
            vbstatus_date.setHours(0, 0, 0, 0);
            var Current_date = new Date();
            Current_date.setHours(0, 0, 0, 0);
            var timedifference = Current_date - vbstatus_date;
            var daysDifference = Math.floor(timedifference / (1000 * 60 * 60 * 24));
            scope.WriteLog(DEBUG, "validateVBEligibleStatus -> daysDifference-> " + daysDifference);

            if (vbEligibleStatus == "EL") {
                scope.WriteLog(DEBUG, "validateVBEligibleStatus -> EL");
                $(scope.htmlInteractionPrefix + ' #vbEligible').val("YES");
                if (scope.objCsDetails != null) {
                    var verifiedStatus = scope.objCsDetails.IsVerifiedCustomer == undefined ? false : (scope.objCsDetails.IsVerifiedCustomer == 'Y' ? true : false);
                    var identifiedStatus = scope.objCsDetails.IsIdentifiedCustomer == undefined ? false : (scope.objCsDetails.IsIdentifiedCustomer == 'Y' ? true : false);
                    $(scope.htmlInteractionPrefix + " #identifiedCheckbox").prop("checked", identifiedStatus);
                    $(scope.htmlInteractionPrefix + " #verifiedCheckbox").prop("checked", verifiedStatus);
                    $(scope.htmlInteractionPrefix + " .checkbox-container").removeClass('hide');
                    scope.validateForm();
                }

            }
            else if (vbEligibleStatus == "DE" && scope.DeEnrollementDays <= daysDifference) {
                scope.WriteLog(DEBUG, "validateVBEligibleStatus -> DE");
                $(scope.htmlInteractionPrefix + ' #vbEligible').val("YES");
                if (scope.objCsDetails != null) {
                    var verifiedStatus = scope.objCsDetails.IsVerifiedCustomer == undefined ? false : (scope.objCsDetails.IsVerifiedCustomer == 'Y' ? true : false);
                    var identifiedStatus = scope.objCsDetails.IsIdentifiedCustomer == undefined ? false : (scope.objCsDetails.IsIdentifiedCustomer == 'Y' ? true : false);
                    $(scope.htmlInteractionPrefix + " #identifiedCheckbox").prop("checked", identifiedStatus);
                    $(scope.htmlInteractionPrefix + " #verifiedCheckbox").prop("checked", verifiedStatus);
                    $(scope.htmlInteractionPrefix + " .checkbox-container").removeClass('hide');
                    scope.validateForm();
                }
            } else if (vbEligibleStatus == "RJ" && scope.RejectedEnrollementDays <= daysDifference) {
                scope.WriteLog(DEBUG, "validateVBEligibleStatus -> RJ");
                $(scope.htmlInteractionPrefix + ' #vbEligible').val("YES");
                if (scope.objCsDetails != null) {
                    var verifiedStatus = scope.objCsDetails.IsVerifiedCustomer == undefined ? false : (scope.objCsDetails.IsVerifiedCustomer == 'Y' ? true : false);
                    var identifiedStatus = scope.objCsDetails.IsIdentifiedCustomer == undefined ? false : (scope.objCsDetails.IsIdentifiedCustomer == 'Y' ? true : false);
                    $(scope.htmlInteractionPrefix + " #identifiedCheckbox").prop("checked", identifiedStatus);
                    $(scope.htmlInteractionPrefix + " #verifiedCheckbox").prop("checked", verifiedStatus);
                    $(scope.htmlInteractionPrefix + " .checkbox-container").removeClass('hide');
                    scope.validateForm();

                }
            } else {
                $(scope.htmlInteractionPrefix + ' #vbEligible').val("NO");

                var checkboxContainer = $(scope.htmlInteractionPrefix + " .checkbox-container");
                if (!checkboxContainer.hasClass('hide')) {
                    checkboxContainer.addClass('hide');
                }
                var transferBtn = $(scope.htmlInteractionPrefix + " #vb-Transfer-btn");
                if (transferBtn.css("display") !== 'none') {
                    transferBtn.css("display", "none");
                }

            }
        } else {
            $(scope.htmlInteractionPrefix + ' #vbEligible').val("NO");

            var checkboxContainer = $(scope.htmlInteractionPrefix + " .checkbox-container");
            if (!checkboxContainer.hasClass('hide')) {
                checkboxContainer.addClass('hide');
            }
            var transferBtn = $(scope.htmlInteractionPrefix + " #vb-Transfer-btn");
            if (transferBtn.css("display") !== 'none') {
                transferBtn.css("display", "none");
            }

        }
        scope.WriteLog(DEBUG, "validateVBEligibleStatus -> END.");
    }

    scope.getdefaultServiceTransferList = function (scope, api) {
        var data = scope.configServiceTransferList.transferList;
        var strQr = `SELECT * FROM ? where service_type = '${scope.channelType}'`;
        jsonResponse = alasql(strQr, [data]);
        return jsonResponse;
    }


    scope.respGetServiceTransferList = function (requestData, jsonResponse, scope, api) {
        scope.WriteLog(DEBUG, "respGetServiceTransferList -> START.");

        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {

            //In case DB fail. will take from default configuration
            scope.servicesTransferListRawJson = jsonResponse = scope.getdefaultServiceTransferList(scope, api);
            scope.setServiceTransferList(scope, api);

            scope.WriteLog(WARNING, "respGetServiceTransferList -> Response is Null or Empty. Call default service list");
            return;
        }

        //parse string to json
        jsonResponse = JSON.parse(jsonResponse);
        if (jsonResponse.status == "FAILED") {

            scope.servicesTransferListRawJson = jsonResponse = scope.getdefaultServiceTransferList(scope, api);
            scope.setServiceTransferList(scope, api);
            scope.WriteLog(WARNING, "respGetServiceTransferList -> Response is Fail. Call default service list");
            return;
        }
        else
            jsonResponse = jsonResponse.transferList;

        //Transfer service list assign to scope variable
        scope.servicesTransferListRawJson = jsonResponse;

        //call the update service list function. this function map service list and contaxt data
        scope.updateServiceTransferList(scope, api);

        scope.WriteLog(DEBUG, "respGetServiceTransferList -> End.");
    }

    scope.updateServiceTransferList = function (scope, api) {

        scope.WriteLog(DEBUG, "updateServiceTransferList -> START.");

        if (scope.objCsDetails == null || scope.objCsDetails.length == 0) {
            scope.WriteLog(DEBUG, "updateServiceTransferList -> context details are empty. Skipping.");
            return
        }

        if (scope.servicesTransferListRawJson == null || scope.servicesTransferListRawJson.length == 0) {
            scope.WriteLog(DEBUG, "updateServiceTransferList -> Transfer service list is empty. Skipping.");
            return
        }


        var _serviceListData = scope.servicesTransferListRawJson;
        var _transferList = [];

        for (var i = 0; i < _serviceListData.length; i++) {

            //splict the avalible items in service_transfer_list
            var _serviceItem = _serviceListData[i].service_transfer_list.split("#");

            //each item check have any key need to replace
            for (let j = 0; j < _serviceItem.length; j++) {

                //validate the item have valid replacement key
                if (_serviceItem[j].includes('$')) {

                    //pase the strint contains key. function getServiceTransgerKeyreturn sting to key
                    var _key = scope.getServiceTransferKey(_serviceItem[j])

                    //pass the key. this getContextStoreValueFromJson will return value from context store data witch is matched
                    var _value = scope.getContextStoreValueFromJson(_key);

                    //replace the #$key* to value from main list
                    _serviceListData[i].service_transfer_list = _serviceListData[i].service_transfer_list.replace("#$" + _key + "*", _value)
                }
            }

            //Check any one of context item not avalibe form list, that item should remove from main list
            if (_serviceListData[i].service_transfer_list.includes('#$')) {
                _serviceListData.splice(i, 1);
            }

        }

        //Re aisgn the value to scope variable
        scope.servicesTransferListRawJson = _serviceListData;

        scope.setServiceTransferList(scope, api);

        scope.WriteLog(DEBUG, "updateServiceTransferList -> END.");
    }


    scope.getServiceTransferKey = function (data) {
        return data.slice(
            data.indexOf('$') + 1,
            data.lastIndexOf('*')
        )
    }

    scope.setServiceTransferList = function (scope, api) {

        scope.WriteLog(DEBUG, "setServiceTransferList -> START.");

        if (scope.servicesTransferListRawJson.length == 0) {

            scope.WriteLog(WARNING, "setServiceTransferList -> Transfer JSON list is empty. Skipping..");

            return;
        }

        var _transferList = [];
        var _serviceListData = scope.servicesTransferListRawJson;

        for (var i = 0; i < _serviceListData.length; i++) {

            var _listItem = _serviceListData[i];

            var _jsonItem = { "id": _listItem.service_transfer_list, "name": _listItem.service_display_name };
            _transferList.push(_jsonItem);
        }

        //set final json so scope variable
        scope.servicesTransferList = _transferList;
        //call the service transfer list api
        api.setTransferToServicesList(scope.servicesTransferList);
        //after setting transfer services list to api
        scope.WriteLog(INFO, "setTransferToServicesList -> api" + JSON.stringify(_transferList));

        scope.WriteLog(DEBUG, "setServiceTransferList -> END.");
    }

    scope.respGetRecentCallNotes = function (scope, jsonResponse, requestData) {

        scope.WriteLog(DEBUG, "respRecentCallNotes -> START.");

        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {

            scope.WriteLog(WARNING, "respRecentCallNotes -> Response is Null or Empty");
            return;
        }

        jsonResponse = JSON.parse(jsonResponse);

        $(scope.htmlInteractionPrefix + ' #tBodyCallNote').html('');
        $('#callLogTable_' + scope.interactionID).DataTable().clear().destroy();
        scope.WriteLog(DEBUG, "respRecentCallNotes -> START : " + JSON.stringify(jsonResponse));

        if (jsonResponse == []) {
            scope.WriteLog(ERROR, 'respRecentCallNotes-> webservice return fail. description - ' + jsonResponse);
            return;
        }
        // scope.recentCallNotesJsonResponse = jsonResponse;

        var _dispostion = "", _notes = '', _html = '';
        var _timestampData = "", _timestamp = "", _agentNameData = "", _agentName = "", _dispositionData = "", _callNotesData = "", _callNotes = "";

        for (var i = 0; i < jsonResponse.length; i++) {

            _notes = jsonResponse[i];
            _timestampData = (scope.validateTextAndNumbers(_notes.timestamp) ? _notes.timestamp : "timestamp" + i.toString());
            _timestamp = (scope.validateTextAndNumbers(_notes.timestamp) ? _notes.timestamp : "..");
            _agentNameData = (scope.validateTextAndNumbers(_notes.agent_name) ? _notes.agent_name : "agent_name" + i.toString());
            _agentName = (scope.validateTextAndNumbers(_notes.agent_name) ? _notes.agent_name : "..");
            _dispositionData = (scope.validateTextAndNumbers(_notes.disposition_desc) ? _notes.disposition_desc : "disposition_desc" + i.toString());
            _dispostion = (scope.validateTextAndNumbers(_notes.disposition_desc) ? _notes.disposition_desc : "..");
            _callNotesData = (scope.validateTextAndNumbers(_notes.call_notes) ? _notes.call_notes : "call_notes" + i.toString());
            _callNotes = (scope.validateTextAndNumbers(_notes.call_notes) ? _notes.call_notes : "..");
            _agentName = (_agentName.length > 21 ? _agentName.substring(0, 20) : _agentName);
            _dispostion = (_dispostion > 21 ? _dispostion.substring(0, 20) : _dispostion);
            _callNotes = (_callNotes.length > 21 ? _callNotes.substring(0, 20) : _callNotes);



            //ref_id channel direction contact_address agent_id agent_handle agent_name disposition_code disposition_desc call_notes timestamp remarks
            _html += "<tr>";
            //Date Time
            _html += "<td><p style='white-space: nowrap;' data-td='" + _timestampData + "'>" + _timestamp + "</p></td>";

            //Agent Name
            _html += "<td><p style='white-space: nowrap;' data-td='" + _agentNameData + "'>" + _agentName + "</p></td>";


            //Dispostion
            _html += "<td><p style='white-space: nowrap;' data-td='" + _dispositionData + "'> " + _dispostion + "</p></td>";

            //Notes
            _html += "<td><p style='white-space: nowrap;' data-td='" + _callNotesData + "'>" + _callNotes + "</p></td>";

            _html += "</tr>";


        }
        $(scope.htmlInteractionPrefix + ' #tBodyCallNote').append(_html);

        $('#callLogTable_' + scope.interactionID).DataTable({
            autoWidth: false,
            scrollCollapse: true,
            destroy: true,
            iDisplayLength: 25,
            order: []
        });
        //$('#callLogTable_' + scope.interactionID + ' tr th:nth-of-type(1)').css("width", "125px");
        //$('#callLogTable_' + scope.interactionID + ' tr th:nth-of-type(2)').css("width", "125px");
        scope.WriteLog(DEBUG, "respRecentCallNotes -> End.");
    }


    scope.respSetRecentCallNotes = function (scope, jsonResponse, requestData) {

        scope.WriteLog(DEBUG, "respSetRecentCallNotes -> START.");

        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {

            scope.WriteLog(WARNING, "respSetRecentCallNotes -> Response is Null or Empty");
            return;
        }

        jsonResponse = JSON.parse(jsonResponse);
        requestData = JSON.parse(requestData);

        scope.showMessagePopup("SUCCESS", scope.lang[scope.workspace_language].MSGCallNoteSaveSuccessHeader, scope.lang[scope.workspace_language].MSGCallNoteSaveSuccessMessage);

        scope.diableCallNotes(scope);

        scope.WriteLog(DEBUG, 'respSetRecentCallNotes-> Notes saved success. Data - ' + JSON.stringify(jsonResponse));

        scope.WriteLog(DEBUG, 'respSetRecentCallNotes-> End');
        //onBtnCancelMessagePopup
    };

    scope.respSetCallLog = function (scope, jsonResponse, requestData) {

        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {

            scope.WriteLog(WARNING, "respSetCallLog -> Response is Null or Empty");
            return;
        }

        jsonResponse = JSON.parse(jsonResponse);

        scope.WriteLog(DEBUG, "respSetCallLog -> . Voice details Updated Successfully " + jsonResponse);
    };

    scope.getServiceName = function (scope, name) {

        // var strQr = `SELECT distinct service_type FROM ? where service_type NOT IN('Baggage','Payment','Smooth','MMB')`;
        if (name.includes("Baggage")) {
            return 'Baggage'
        }
        else if (name.includes("Payment")) {
            return 'Payment'
        }
        else if (name.includes("Smooth")) {
            return 'Smooth'
        }
        else if (name.includes("MMB")) {
            return 'MMB'
        }
        else {
            return name.replace("/", "&#47;");
        }
    }



    scope.onbtnCancelMessagePopup = function (scope) {

        scope.hideMessagePopup(scope);
    }

    scope.diableCallNotes = function (scope) {

        scope.WriteLog(DEBUG, "diableCallNotes -> START.");

        $(scope.htmlInteractionPrefix + " #disposition_dropdown").addClass('disabled');
        $(scope.htmlInteractionPrefix + " #saveRecentCallNotes").prop('disabled', true);
        $(scope.htmlInteractionPrefix + " #txtRecentCallNotes").prop('disabled', true);


        //lblStatus
        scope.WriteLog(DEBUG, "diableCallNotes -> END.");
        scope.WriteLog(DEBUG, "diableCallNotes -> END.");

    }

    //Common Functions

    scope.showMessagePopup = function (status, title, message) {

        scope.WriteLog(DEBUG, "showStatusPopup -> Start");
        if (title.match(/^(?:[a-zA-Z0-9\s@,=%$#&_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDCF\uFDF0-\uFDFF\uFE70-\uFEFF]|(?:\uD802[\uDE60-\uDE9F]|\uD83B[\uDE00-\uDEFF])){0,30}$/) && message.match(/^(?:[a-zA-Z0-9\s@,=%$#&_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDCF\uFDF0-\uFDFF\uFE70-\uFEFF]|(?:\uD802[\uDE60-\uDE9F]|\uD83B[\uDE00-\uDEFF])){0,30}$/)) {
            $(scope.htmlInteractionPrefix + ' #message-popup-head').text(title);
            $(scope.htmlInteractionPrefix + ' #message-popup-content').text(message);
        }
        $(scope.htmlInteractionPrefix + ' .message-popup-container').removeClass("hide");

        scope.WriteLog(DEBUG, "showStatusPopup -> End");
    }

    scope.hideMessagePopup = function (scope) {
        scope.WriteLog(DEBUG, 'hideMessagePopup -> START');

        $(scope.htmlInteractionPrefix + ' #message-popup-head').text("");
        $(scope.htmlInteractionPrefix + ' #message-popup-content').text("");
        $(scope.htmlInteractionPrefix + ' .message-popup-container').addClass("hide");

        scope.WriteLog(DEBUG, 'hideMessagePopup -> END');
    }

    scope.validateTextAndNumbers = function (param) {
        if (param.toString().match(/^(?:[a-zA-Z0-9\s@,=%$.:#/\?\\;\+\-()&_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDCF\uFDF0-\uFDFF\uFE70-\uFEFF]|(?:\uD802[\uDE60-\uDE9F]|\uD83B[\uDE00-\uDEFF]|[\u0660-\u0669])){0,5000}$/)) {
            return true;
        }
        return false;
    }

    scope.validateNumbers = function (param) {
        if (param.match(/^[0-9]*$/)) {
            return false;
        }
        return false;
    }

    scope.validateJsonString = function (param) {
        if (param.toString().match(/^(?:[a-zA-Z0-9\s@,=%$.:#/\?\\;\+\-\{\}\[\]\'\"\|\()&_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDCF\uFDF0-\uFDFF\uFE70-\uFEFF]|(?:\uD802[\uDE60-\uDE9F]|\uD83B[\uDE00-\uDEFF]|[\u0660-\u0669])){0,5000}$/)) {
            return true;
        }
        return false;
    }

    scope.getJsonValues = function (obj, key) {

        var objects = [];
        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            if (typeof obj[i] == 'object') {
                if (i == key) {
                    return obj[i];
                }
                objects = objects.concat(scope.getJsonValues(obj[i], key));
            } else if (i == key) {
                objects.push(obj[i]);
            }
        }
        return objects;

    }
    scope.getSIPNumber = function (SIP) {
        //this function used to trim phone number from SIP address --SIP:1300@tele-apps.com
        //tel:1400;phone-context=dialstring

        if (SIP == undefined)
            return;

        var sipNumber = SIP;
        var callType = SIP.substring(0, 3);

        if (callType == 'sip') {

            sipNumber = SIP.substring(SIP.lastIndexOf(":") + 1, SIP.lastIndexOf("@"));
        }
        else if (callType == 'tel') {
            sipNumber = SIP.substring(SIP.lastIndexOf(":") + 1, SIP.lastIndexOf(";"));
        }
        return sipNumber;
    };

    scope.getGuid = function (t) {
        var randomBuffer = new Uint32Array(4);
        window.crypto.getRandomValues(randomBuffer)
        var res = randomBuffer.toString()
        res = res.replace(',', '').replace(',', '').replace(',', '');
        return res.substr(0, 7) + "-" + res.substr(8, 7) + "-" + res.substr(16, 7) + "-" + res.substr(23, 8);
    }

    scope.getTime_yyyymmdd = function (time) {

        var T = new Date();
        if (time != undefined)
            T = time;
        return T.getFullYear() + "-" + (T.getMonth() + 1) + "-" + T.getDate() + " " + T.getHours() + ":" + T.getMinutes() + ":" + T.getSeconds() + "." + T.getMilliseconds();
    }

    scope.convertTime = function (sec) {
        var hours = Math.floor(sec / 3600);
        (hours >= 1) ? sec = sec - (hours * 3600) : hours = '00';
        var min = Math.floor(sec / 60);
        (min >= 1) ? sec = sec - (min * 60) : min = '00';
        (sec < 1) ? sec = '00' : void 0;

        (min.toString().length == 1) ? min = '0' + min : void 0;
        (sec.toString().length == 1) ? sec = '0' + sec : void 0;

        return hours + ':' + min + ':' + sec;
    }

    scope.calcTimeDifference = function (d1, d2) {
        var _d1 = Date.parse(d1);
        var _d2 = Date.parse(d2);
        const _diffTime = Math.abs(_d2 - _d1);
        const _seconds = Math.floor(_diffTime / 1000);
        return scope.convertTime(_seconds);
    }

    scope.convertTimeToSec = function (t1) {

        var _arTime = t1.split(':'); // split it at the colons
        var seconds = (+_arTime[0]) * 60 * 60 + (+_arTime[1]) * 60 + (+_arTime[2]);
        return seconds;
    }

    scope.calcSecDifference = function (t1, t2) {

        var _time1 = scope.convertTimeToSec(t1);
        var _time2 = scope.convertTimeToSec(t2);

        var _diffTime = scope.convertTime(_time2 + _time1);

        return _diffTime;

    }

    scope.hourDifference = function (scope, StartTime, customerHistory, diffHours) {

        StartTime = Date.parse(StartTime)
        var maxVal = 0;
        $.each(customerHistory, function (index, value) {

            var resolution = StartTime - value.data.createdDate;
            var resolutionTime = (((resolution / 1000) / 60) / 60)

            if (resolutionTime <= diffHours && maxVal == 0) {
                maxVal = customerHistory.length - (index); //index starts with zero
            }
        });

        return maxVal;

    }

    scope.clearDeEnrollementNotes = function (scope) {
        scope.WriteLog(DEBUG, "clearDeEnrollementNotes --> Start");
        scope.deEnrollementNotes = "";
        $(scope.htmlInteractionPrefix + ' #txtDeEnrollementNotes').val('');
        $(scope.htmlInteractionPrefix + ' #clearDeEnrollementNotes').css('display', 'none');
        $(scope.htmlInteractionPrefix + ' #txtDeEnrollementNotes').prop('disabled', false);
        $(scope.htmlInteractionPrefix + ' #txtDeEnrollementNotes').removeClass("required-field");
        $(scope.htmlInteractionPrefix + ' .txtDeEnrollementNotes_msg').html('').css('color', '');
        scope.WriteLog(DEBUG, "clearDeEnrollementNotes -->  End.");
    }

    scope.disabledDeenrollBtn = function (data) {
        scope.WriteLog(DEBUG, "disabledDeenrollBtn --> Start");


        if (data.VB_Status == 'EN') {
            scope.WriteLog(DEBUG, "disabledDeenrollBtn --> Status -->EN");

            $(scope.htmlInteractionPrefix + ' #txtDeEnrollementNotes').prop('disabled', false);
            $(scope.htmlInteractionPrefix + " #saveDeEnrollementNotes").removeClass("hide");
            $(scope.htmlInteractionPrefix + ' #txtDeEnrollementNotes').removeClass("required-field");
            $(scope.htmlInteractionPrefix + ' .txtDeEnrollementNotes_msg').html('').css('color', '');
        } else {
            $(scope.htmlInteractionPrefix + ' #txtDeEnrollementNotes').prop('disabled', true);
            $(scope.htmlInteractionPrefix + ' #txtDeEnrollementNotes').addClass("required-field");
            $(scope.htmlInteractionPrefix + ' .txtDeEnrollementNotes_msg').html('Not Eligible For DeEnroll').css('color', 'red');

            scope.WriteLog(DEBUG, "disabledDeenrollBtn --> Status --> Not Eligible For DeEnroll");
        }

        scope.WriteLog(DEBUG, "disabledDeenrollBtn --> End");
    }

    scope.saveDeEnrollementNotes = function (scope, event) {

        if (scope.validateSaveDeenrollFlag == true) {

            scope.WriteLog(DEBUG, "validateSaveDeenrollFlag --> Start");
            scope.WriteLog(DEBUG, "Already DeEnrolled");
            scope.showMessagePopup("Failed", scope.lang[scope.workspace_language].MSGSaveDeEnrollSuccessHeader, scope.lang[scope.workspace_language].MSGAlreadyDeEnrollFailureMessage);
            scope.clearDeEnrollementNotes_Click();
            return;
        }

        scope.WriteLog(DEBUG, "saveDeEnrollementNotes --> Start");
        scope.addLoader();

        $(scope.htmlInteractionPrefix + ' #txtDeEnrollementNotes').removeClass("required-field");
        $(scope.htmlInteractionPrefix + ' .txtDeEnrollementNotes_msg').html('').css('color', '');
        $(scope.htmlInteractionPrefix + ' #saveDeEnrollementNotes').prop('disabled', true);


        scope.txtDeEnrollementNotes = $(scope.htmlInteractionPrefix + ' #txtDeEnrollementNotes').val();

        if (scope.txtDeEnrollementNotes.length <= 0) {
            scope.removeLoader();
            scope.WriteLog(WARNING, 'saveDe-enrollementNotes -> De-enrollementNotes should not empty');

            $(scope.htmlInteractionPrefix + ' #txtDeEnrollementNotes').addClass("required-field");
            $(scope.htmlInteractionPrefix + ' .txtDeEnrollementNotes_msg').html('Please Enter Vaild Reason').css('color', 'red');
            $(scope.htmlInteractionPrefix + ' #saveDeEnrollementNotes').prop('disabled', false);

            return;
        }



        var unenrollFFPNumber = scope.selectedFFP;

        var _agent_type = localStorage.getItem("_cc.userDetails") == undefined ? "" : (JSON.parse(localStorage.getItem("_cc.userDetails")).role == undefined ? "" : JSON.parse(localStorage.getItem("_cc.userDetails")).role);

        if (scope.updateCsDetailsFlag === true) {
            scope.WriteLog(DEBUG, "DeEnoll via - ffb search");

            var wsReqJson = JSON.stringify(
                {
                    "unenroll": {
                        "externalSessionId": (scope.objCsDetails.ucid == "null" || scope.objCsDetails.ucid == undefined || scope.objCsDetails.ucid == "") ? scope.ucid : scope.objCsDetails.ucid,
                        "speakerId": (scope.ffpUpdateCsResponse.FFPNumber == "null" || scope.ffpUpdateCsResponse.FFPNumber == undefined || scope.ffpUpdateCsResponse.FFPNumber == "") ? unenrollFFPNumber : scope.ffpUpdateCsResponse.FFPNumber,
                        "voiceprintTag": scope.vb_PrintTag,
                        "configSetName": scope.config_setname
                    },
                    "vbStatus": {
                        "ucid": (scope.objCsDetails.ucid != "null" || scope.objCsDetails.ucid != undefined || scope.objCsDetails.ucid != "") ? scope.objCsDetails.ucid + 'W' : scope.ucid + 'W',
                        "ffpNumber": (scope.objCsDetails.FFPNumber == "null" || scope.objCsDetails.FFPNumber == undefined || scope.objCsDetails.FFPNumber == "") ? unenrollFFPNumber : scope.objCsDetails.FFPNumber,
                        "workRequestId": scope.workRequestId,
                        "identifyType": (scope.objCsDetails.ident_type == "null" || scope.objCsDetails.ident_type == undefined || scope.objCsDetails.ident_type == "") ? "NA" : scope.objCsDetails.ident_type,
                        "segment": (scope.ffpUpdateCsResponse.MemberTier == "null" || scope.ffpUpdateCsResponse.MemberTier == undefined || scope.ffpUpdateCsResponse.MemberTier == "") ? "NA" : scope.ffpUpdateCsResponse.MemberTier,
                       // "channel": (scope.objCsDetails.Channel == "null" || scope.objCsDetails.Channel == undefined || scope.objCsDetails.Channel == "") ? "NA" : scope.objCsDetails.Channel,
                        "channel":"AGENT_ASSIST",
                        "deEnrollReason": scope.txtDeEnrollementNotes,
                        "transferedByAgentId":  (scope.objCsDetails.AgentId == "null" || scope.objCsDetails.AgentId == undefined || scope.objCsDetails.AgentId == "") ? "NA" : scope.objCsDetails.AgentId,
                        "transferedByAgentRole": "NA",
                        "deEnrolledAgentId": (scope.configuration.handle == "null" || scope.configuration.handle == undefined || scope.configuration.handle == "") ? "NA" : scope.configuration.handle,
                        "deEnrolledAgentRole": scope.validateTextAndNumbers(_agent_type) ? _agent_type : "NA",
                        "countryCode": (scope.ffpUpdateCsResponse.CountryCode == "null" || scope.ffpUpdateCsResponse.CountryCode == undefined || scope.ffpUpdateCsResponse.CountryCode == "") ? "NA" : scope.ffpUpdateCsResponse.CountryCode,
                        "customerEmail": (scope.ffpUpdateCsResponse.Email == "null" || scope.ffpUpdateCsResponse.Email == undefined || scope.ffpUpdateCsResponse.Email == "") ? "NA" : scope.ffpUpdateCsResponse.Email,
                        "customerName": (scope.ffpUpdateCsResponse.FirstName == "null" || scope.ffpUpdateCsResponse.FirstName == undefined || scope.ffpUpdateCsResponse.FirstName == "") ? "NA" : scope.ffpUpdateCsResponse.FirstName,
                        "customerNumber": (scope.ffpUpdateCsResponse.PhoneNumber == "null" || scope.ffpUpdateCsResponse.PhoneNumber == undefined || scope.ffpUpdateCsResponse.PhoneNumber == "") ? "NA" : scope.ffpUpdateCsResponse.PhoneNumber,
                        "routerServiceName":(scope.objCsDetails.RoutingServiceName == "null" || scope.objCsDetails.RoutingServiceName == undefined || scope.objCsDetails.RoutingServiceName == "") ? "NA" : scope.objCsDetails.RoutingServiceName
                    }
                });

        } else {

            scope.WriteLog(DEBUG, "DeEnoll via - Context Store");

            var wsReqJson = JSON.stringify(
                {
                    "unenroll": {
                        "externalSessionId": (scope.objCsDetails.ucid == "null" || scope.objCsDetails.ucid == undefined || scope.objCsDetails.ucid == "") ? scope.ucid : scope.objCsDetails.ucid,
                        "speakerId": (scope.objCsDetails.FFPNumber == "null" || scope.objCsDetails.FFPNumber == "" || scope.objCsDetails.FFPNumber == undefined) ? unenrollFFPNumber : scope.objCsDetails.FFPNumber,
                        "voiceprintTag": scope.vb_PrintTag,
                        "configSetName": scope.config_setname
                    },
                    "vbStatus": {
                        "ucid": (scope.objCsDetails.ucid != "null" || scope.objCsDetails.ucid != undefined || scope.objCsDetails.ucid != "") ? scope.objCsDetails.ucid + 'W' : scope.ucid + 'W',
                        "ffpNumber": (scope.objCsDetails.FFPNumber == "null" || scope.objCsDetails.FFPNumber == undefined || scope.objCsDetails.FFPNumber == "") ? unenrollFFPNumber : scope.objCsDetails.FFPNumber,
                        "workRequestId": scope.workRequestId,
                        "identifyType": (scope.objCsDetails.ident_type == "null" || scope.objCsDetails.ident_type == undefined || scope.objCsDetails.ident_type == "") ? "NA" : scope.objCsDetails.ident_type,
                        "segment": (scope.objCsDetails.CustomerTier == "null" || scope.objCsDetails.CustomerTier == undefined || scope.objCsDetails.CustomerTier == "") ? "NA" : scope.objCsDetails.CustomerTier,
                       // "channel": (scope.objCsDetails.Channel == "null" || scope.objCsDetails.Channel == undefined) ? "NA" : scope.objCsDetails.Channel,
                        "channel":"AGENT_ASSIST",
                        "deEnrollReason": scope.txtDeEnrollementNotes,
                        "transferedByAgentId": (scope.objCsDetails.AgentId == "null" || scope.objCsDetails.AgentId == undefined || scope.objCsDetails.AgentId == "") ? "NA" : scope.objCsDetails.AgentId,
                        "transferedByAgentRole": "NA",
                        "deEnrolledAgentId": (scope.configuration.handle == "null" || scope.configuration.handle == undefined || scope.configuration.handle == "") ? "NA" : scope.configuration.handle,
                        "deEnrolledAgentRole": scope.validateTextAndNumbers(_agent_type) ? _agent_type : "NA",
                        "countryCode": (scope.objCsDetails.CountryCode == "null" || scope.objCsDetails.CountryCode == undefined || scope.objCsDetails.CountryCode == "") ? "NA" : scope.objCsDetails.CountryCode,
                        "customerEmail": (scope.objCsDetails.Email == "null" || scope.objCsDetails.Email == undefined || scope.objCsDetails.Email == "") ? "NA" : scope.objCsDetails.Email,
                        "customerName": (scope.objCsDetails.CustomerName == "null" || scope.objCsDetails.CustomerName == undefined || scope.objCsDetails.CustomerName == "") ? "NA" : scope.objCsDetails.CustomerName,
                        "customerNumber": (scope.objCsDetails.CustomerNumber == "null" || scope.objCsDetails.CustomerNumber == undefined || scope.objCsDetails.CustomerNumber == "") ? "NA" : scope.objCsDetails.CustomerNumber,
                        "routerServiceName":(scope.objCsDetails.RoutingServiceName == "null" || scope.objCsDetails.RoutingServiceName == undefined || scope.objCsDetails.RoutingServiceName == "") ? "NA" : scope.objCsDetails.RoutingServiceName
                    }
                });
        }

        scope.WriteLog(DEBUG, "saveDeEnrollementNotes -> ReqData : " + wsReqJson);

        var _url = scope.vbSyncmiddlewareServiceUrl + '/unenroll';
        scope.executeWebRequest(scope, '', _url, 'POST', wsReqJson, "api", "REQ_WS_DEENROLLEMENT_EXTERNAL_API");

        scope.WriteLog(DEBUG, "saveDeEnrollementNotes --> End");

    }
    scope.addLoader = function () {
        var newDiv = document.createElement("div");
        newDiv.setAttribute("class", "loading");

        var overlayDiv = document.createElement("div");
        overlayDiv.setAttribute("class", "overlay");
        var targetElement = document.querySelector('.voice-biometric');
        if (!(document.querySelector('.overlay'))) {
            targetElement.parentNode.appendChild(overlayDiv, targetElement);
        }
        if (!(document.querySelector('.loading'))) {
            targetElement.parentNode.appendChild(newDiv, targetElement);
        }
        targetElement.style.backgroundColor = 'rgba(0,0,0,0.1)';
        targetElement.style.opacity = '0.5';

        document.querySelector('.overlay').style.display = 'block';
    }


    scope.removeLoader = function () {
        var loader = document.querySelector('.loading');
        loader.remove();
        var overlay = document.querySelector('.overlay');
        overlay.remove();
        var targetElement = document.querySelector('.voice-biometric');
        targetElement.style.backgroundColor = '';
        targetElement.style.opacity = '';

    }


    scope.searchAndPopulate = function () {

        scope.WriteLog(DEBUG, "SearchFFP -->  Start.");


        scope.addLoader();


        scope.selectedFFP = document.getElementsByName("ffp")[0].value;

        var FFPnumber = scope.selectedFFP;

        scope.updateCsDetailsFlag = true;


        if (FFPnumber.length == 0) {
            scope.removeLoader();
            $(scope.htmlInteractionPrefix + ' .ffp-err-msg').empty();
            var errorMessageSpan = $("<span class='ffp-err-msg'>").text("FFP number is required").css("color", "red");
            $(".search-div").append(errorMessageSpan);

            return;
        }

        $(scope.htmlInteractionPrefix + ' .ffp-err-msg').empty();

        var reqJson = JSON.stringify({
            "FFPNumber": scope.selectedFFP,
        });


        scope.WriteLog(INFO, 'vbFFPsearchAndPopulate -> get recent call notes from  service - ' + reqJson);
        var _url = scope.vbSyncmiddlewareServiceUrl + '/customerIdentification'; //customWidgetGetRequest?serv

        scope.executeWebRequest(scope, '', _url, 'POST', reqJson, "api", "REQ_WS_FFP_SEARCH_DETAILS");
        scope.WriteLog(DEBUG, "SearchFFP -->  End.");
    }



    // scope.parseJwt = function (token) {
    //     var base64Url = token.split('.')[1];
    //     var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    //     var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
    //         return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    //     }).join(''));
    //     return JSON.parse(jsonPayload);
    // };


    scope.getrole = function (JsonAgent, role) {
        scope.WriteLog(INFO, "get role-> Start");
        if (JsonAgent == undefined) {
            return false;
        }
        for (var i = 0; i < JsonAgent.userScopeList.length; i++) {
            if (JsonAgent.userScopeList[i].featureName == "ccUserRole") {
                for (var j = 0; j < JsonAgent.userScopeList[i].featureValues.length; j++) {
                    if (JsonAgent.userScopeList[i].featureValues[j] == role) {
                        return true;
                    }
                }
                return false;
            }
        }
        scope.WriteLog(INFO, "get role -> End");
    }


    // var agentJson = scope.parseJwt(scope.configuration.token);
    // scope.enableDeEnroll = false;
    // scope.DeEnrollement_role.forEach(function (role) {
    //     if (scope.getrole(agentJson, role)) {
    //         scope.enableDeEnroll = true;
    //         return;
    //     }
    // });


    scope.completeConfereneTransfer = function (scope, api, Capabilities) {

        scope.WriteLog(DEBUG, "completeConfereneTransfer -->  start.");

        if (scope.capabilities.interaction.canTransferComplete == true) {

            api.completeConference();
           // api.completeTransfer();
            scope.WriteLog(INFO, 'onCapabilitiesEvent - Conference Completed');

            return;
        }
        scope.WriteLog(DEBUG, "completeConfereneTransfer -->  end.");
    }

    scope.makeCallTransferConference = function (scope, api) {

        //Update Context store data
        scope.updateCsDetails(scope);

        // Default IVR Transfer Number
        var _number = scope.TransferNumber["IVRTRANSFER"][0].key;

        scope.callConference(scope, api, _number, scope.objInteraction.userToUserInfo);

        return;
    }



    scope.callConference = function (scope, api, number, uui) {

       // var transferUUI =  uui.replace("VO,N", "VO,T");
        scope.WriteLog(INFO, 'callConference --> Start call transfer number ' + number + ' and UUI -' + scope.objInteraction.userToUserInfo);
       // scope.WriteLog(INFO, 'callConference --> Start call transfer number ' + number + ' and UUI -' + transferUUI);

        api.consult(number, uui);
        //api.consult(number, transferUUI);
        scope.WriteLog(INFO, 'callConference -End');
    }



    scope.updateCsDetails = function (scope) {

        scope.WriteLog(DEBUG, "updateCsDetails - Start");

        var contextStoreURL = scope.isSecure + scope.configuration.settings.contextStoreClusterIP + '/services/OceanaCoreDataService/oceana/data/update/serviceMap/' + scope.workRequestId;

        var IsidentifiedCustomer = $(scope.htmlInteractionPrefix + ' #identifiedCheckbox').is(':checked') ? "Y" : "N";
        var IsverifiedCustomer = $(scope.htmlInteractionPrefix + ' #verifiedCheckbox').is(':checked') ? "Y" : "N";

        scope.TransferNumber["IVRTRANSFER"][0].key


        if (scope.updateCsDetailsFlag === true) {

            scope.WriteLog(DEBUG, "updateCsDetails - updateCsDetailsFlag - true");

            var reqJson = JSON.stringify({
                "data": {

                    "CustomerID": scope.ffpUpdateCsResponse.CustomerID == undefined ? "NA" : scope.ffpUpdateCsResponse.CustomerID,
                    "FFPNumber": scope.ffpUpdateCsResponse.FFPNumber == undefined ? "NA" : scope.ffpUpdateCsResponse.FFPNumber,
                    "Email": scope.ffpUpdateCsResponse.Email == undefined ? "" : scope.ffpUpdateCsResponse.Email,
                    "CountryCode": scope.ffpUpdateCsResponse.CountryCode == undefined ? "NA" : scope.ffpUpdateCsResponse.CountryCode,
                    "CustomerNumber": scope.ffpUpdateCsResponse.PhoneNumber == undefined ? "NA" : scope.ffpUpdateCsResponse.PhoneNumber,
                    "CountryName": scope.ffpUpdateCsResponse.CustomerCountry == undefined ? "NA" : scope.ffpUpdateCsResponse.CustomerCountry,
                    "CustomerName": scope.ffpUpdateCsResponse.FirstName == undefined ? "NA" : scope.ffpUpdateCsResponse.FirstName,
                    "CustomerTier": scope.ffpUpdateCsResponse.MemberTier == undefined ? "NA" : scope.ffpUpdateCsResponse.MemberTier,
                    "DoB": scope.ffpUpdateCsResponse.DoB == undefined ? "NA" : scope.ffpUpdateCsResponse.DoB,
                    "CustomerStatus": scope.ffpUpdateCsResponse.MemberStatus == undefined ? "NA" : scope.ffpUpdateCsResponse.MemberStatus,
                    "VB_Status": scope.ffpUpdateCsResponse.VB_Status == undefined ? "NA" : scope.ffpUpdateCsResponse.VB_Status,
                    "VB_Status_Date": scope.ffpUpdateCsResponse.VB_Status_Date == undefined ? "NA" : scope.ffpUpdateCsResponse.VB_Status_Date,
                    "IsPreferredLanguage": scope.ffpUpdateCsResponse.PreferredLanguage == undefined ? "NA" : scope.ffpUpdateCsResponse.PreferredLanguage,
                    "AgentID": scope.configuration.agentId == undefined ? "NA" : scope.configuration.agentId,
                    "AgentExtension": (scope.configuration.stationId == undefined ? scope.configuration.agentId : scope.configuration.stationId),
                    "ContextID": scope.workRequestId + ',VO,N',
                    "Last_Agent_ID": (scope.configuration.handle == undefined ? scope.configuration.handle : scope.configuration.handle),
                    "IsIdentifiedCustomer": IsidentifiedCustomer,
                    "IsVerifiedCustomer": IsverifiedCustomer,
                    "ident_type": 'FFP'

                }
            });

        } else {
            scope.WriteLog(DEBUG, "updateCsDetails - updateCsDetailsFlag - false");
            var reqJson = JSON.stringify({
                "data": {
                    "IsIdentifiedCustomer": IsidentifiedCustomer,
                    "IsVerifiedCustomer": IsverifiedCustomer,
                    "ContextID": scope.workRequestId + ',VO,N',
                    "Last_Agent_ID":(scope.configuration.handle == undefined ? scope.configuration.handle : scope.configuration.handle),
                    "AgentExtension": (scope.configuration.stationId == undefined ? scope.configuration.agentId : scope.configuration.stationId),
                    "AgentID": scope.configuration.agentId == undefined ? "NA" : scope.configuration.agentId
                }
            });

        }
        scope.WriteLog(INFO, "updateCsDetails -> Request Data - " + reqJson);
        scope.executeWebRequest(scope, scope.configuration.token, contextStoreURL, 'PUT', reqJson, "REQUEST_UPDATE_CS_DETAILS");
        scope.WriteLog(DEBUG, "updateCsDetails - END");
    };

    scope.clearForm_Click = function () {
        // Clear FFP input
        $(scope.htmlInteractionPrefix + ' #vbffpinput').val('');
        $(scope.htmlInteractionPrefix + ' #vbffpinput').removeAttr('readonly');
        isBlackListed

        // Clear other input fields
        $(scope.htmlInteractionPrefix + ' #vbCustomerName').val('');
        $(scope.htmlInteractionPrefix + ' #vbEmailId').val('');
        $(scope.htmlInteractionPrefix + ' #vbSegment').val('');
        $(scope.htmlInteractionPrefix + ' #vbDob').val('');
        $(scope.htmlInteractionPrefix + ' #vbSts').val('');
        $(scope.htmlInteractionPrefix + ' #vbStsDate').val('');
        $(scope.htmlInteractionPrefix + ' #vbEligible').val('');
        $(scope.htmlInteractionPrefix + ' #isBlackListed').val('');

        // Uncheck checkboxes if necessary
        $(scope.htmlInteractionPrefix + ' #identifiedCheckbox').prop('checked', false);
        $(scope.htmlInteractionPrefix + ' #verifiedCheckbox').prop('checked', false);

        $(scope.htmlInteractionPrefix + ' .ffp-search-button').prop('disabled', false);
        $(scope.htmlInteractionPrefix + ' .checkbox-container').addClass('hide');
        $(scope.htmlInteractionPrefix + " #vb-Transfer-btn").css("display", "none");
        $(scope.htmlInteractionPrefix + ' .ffp-err-msg').empty();


    };

    scope.clearAcw = function () {
        // Clear FFP input
        $(scope.htmlInteractionPrefix + ' #vbffpinput').val('');
        $(scope.htmlInteractionPrefix + ' #vbffpinput').removeAttr('readonly');


        // Clear other input fields
        $(scope.htmlInteractionPrefix + ' #vbCustomerName').val('');
        $(scope.htmlInteractionPrefix + ' #vbEmailId').val('');
        $(scope.htmlInteractionPrefix + ' #vbSegment').val('');
        $(scope.htmlInteractionPrefix + ' #vbDob').val('');
        $(scope.htmlInteractionPrefix + ' #vbSts').val('');
        $(scope.htmlInteractionPrefix + ' #vbStsDate').val('');
        $(scope.htmlInteractionPrefix + ' #vbEligible').val('');
        $(scope.htmlInteractionPrefix + ' #isBlackListed').val('');

        // Uncheck checkboxes if necessary
        $(scope.htmlInteractionPrefix + ' #identifiedCheckbox').prop('checked', false);
        $(scope.htmlInteractionPrefix + ' #verifiedCheckbox').prop('checked', false);

        $(scope.htmlInteractionPrefix + ' .ffp-search-button').prop('disabled', true);
        $(scope.htmlInteractionPrefix + ' .checkbox-container').addClass('hide');
        $(scope.htmlInteractionPrefix + " #vb-Transfer-btn").css("display", "none");
        $(scope.htmlInteractionPrefix + ' .ffp-err-msg').empty();

        $(scope.htmlInteractionPrefix + ' #clearVoicebiomatricForm').addClass("hide");


    };




    scope.checkTextareaEmpty = function () {

        var clearButton = document.getElementById("clearDeEnrollementNotes");

        if ($(scope.htmlInteractionPrefix + ' #txtDeEnrollementNotes').val().trim() !== "") {
            clearButton.style.display = "block"; // Show the button if textarea is not empty
            $(scope.htmlInteractionPrefix + ' #txtDeEnrollementNotes').removeClass("required-field");
            $(scope.htmlInteractionPrefix + ' .txtDeEnrollementNotes_msg').html('').css('color', '');
        } else {
            clearButton.style.display = "none"; // Hide the button if textarea is empty
        }

    };
    scope.validateForm = function () {
        var identifiedCheckbox = document.getElementById("identifiedCheckbox");
        var verifiedCheckbox = document.getElementById("verifiedCheckbox");
        var container = document.getElementById("vb-Transfer-btn");
        if (identifiedCheckbox.checked && verifiedCheckbox.checked) {
            container.style.display = 'block';
        } else {

            container.style.display = 'none';

        }
    }
    scope.getffpNumber = function () {

        var value = $(scope.htmlInteractionPrefix + ' #vbffpinput').val();

        var getFFP = scope.objCsDetails.FFPNumber;

        var getVbDob = '';

        var dateTimeDob = scope.objCsDetails.DoB;

        if(dateTimeDob !== undefined && dateTimeDob !== null){
            getVbDob = dateTimeDob.includes('T') ? dateTimeDob.split('T')[0] : dateTimeDob;
        }else{
            getVbDob = dateTimeDob;
        }
       
        var getVB_Status_Date ='';
        // var getVbDob = scope.objCsDetails.DoB.split('T')[0];
        if(scope.objCsDetails.VB_Status_Date !== undefined && scope.objCsDetails.VB_Status_Date !== null){
            getVB_Status_Date = scope.objCsDetails.VB_Status_Date.replace('T', ' ');
        }else{
            getVB_Status_Date = scope.objCsDetails.VB_Status_Date
        }


        if(scope.acwflag === true){
            scope.clearAcw();
        }
       else if (getFFP != null && getFFP != undefined && getFFP != "" && getFFP != "NA") {
            // if(scope.acwflag === true){
            //     scope.clearForm_Click();
            // }
           if (value.trim() === '') {
                $(scope.htmlInteractionPrefix + " #vbffpinput").val(getFFP);
                $(scope.htmlInteractionPrefix + " #vbffpinput").prop("readonly", true);
            }

            $(scope.htmlInteractionPrefix + ' .ffp-search-button').prop('disabled', true);
            $(scope.htmlInteractionPrefix + ' #vbCustomerName').val((scope.objCsDetails.CustomerName == "null" || scope.objCsDetails.CustomerName == undefined || scope.objCsDetails.CustomerName == "") ? "--" : scope.objCsDetails.CustomerName);
            $(scope.htmlInteractionPrefix + ' #vbEmailId').val((scope.objCsDetails.Email == "null" || scope.objCsDetails.Email == undefined || scope.objCsDetails.Email == "") ? "--" : scope.objCsDetails.Email);
            $(scope.htmlInteractionPrefix + ' #vbSegment').val((scope.objCsDetails.CustomerTier == "null" || scope.objCsDetails.CustomerTier == undefined || scope.objCsDetails.CustomerTier == "") ? "--" : scope.objCsDetails.CustomerTier);
            $(scope.htmlInteractionPrefix + ' #vbDob').val((getVbDob == "null" || getVbDob == undefined || getVbDob == "") ? "--" : getVbDob);
            $(scope.htmlInteractionPrefix + ' #vbSts').val((scope.objCsDetails.VB_Status == "null" || scope.objCsDetails.VB_Status == undefined || scope.objCsDetails.VB_Status == "") ? "--" : scope.objCsDetails.VB_Status);
            $(scope.htmlInteractionPrefix + ' #vbStsDate').val((getVB_Status_Date == "null" || getVB_Status_Date == undefined || getVB_Status_Date == "") ? "--" : getVB_Status_Date);
            $(scope.htmlInteractionPrefix + ' #isBlackListed').val((scope.objCsDetails.IsBlacklisted == "null" || scope.objCsDetails.IsBlacklisted == undefined || scope.objCsDetails.IsBlacklisted == "") ? "--" : scope.objCsDetails.IsBlacklisted);
            scope.validateVBEligibleStatus(scope.objCsDetails.VB_Status, scope.objCsDetails.VB_Status_Date);


        } else if (value.trim() !== '') {
            $(scope.htmlInteractionPrefix + " #clearVoicebiomatricForm").removeClass("hide");
            $(scope.htmlInteractionPrefix + " #vbffpinput").val(value);

        }
        else {
            $(scope.htmlInteractionPrefix + " #clearVoicebiomatricForm").removeClass("hide");
            $(scope.htmlInteractionPrefix + " #vbffpinput").val("");
            $(scope.htmlInteractionPrefix + " #vbffpinput").prop("readonly", false);
        }
    }


};

function InitVoiceLog(scope) {

    scope.WIDGET_NAME = "WIDGET VOICE"

    scope.get_time = function () {
        var currentdate = new Date();
        return currentdate.getDate() + "-" + (currentdate.getMonth() + 1) + "-" + currentdate.getFullYear() + " "
            + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds() + "." + currentdate.getMilliseconds();
    }

    scope.WriteLog = function (type, msg) {

        if (scope.IS_CONSOLE_LOG_ENABLE == false)
            return;

        var log = scope.WIDGET_NAME + " --> " + type + " --> " + scope.get_time() + " --> ";

        if (type == INFO && !msg.includes("<")) {
            console.log(`%c ${log}`, "color:Green;font-weight: bold", msg, "");
        } else if (type == DEBUG && !msg.includes("<")) {
            console.log(`%c ${log}`, "color:DodgerBlue;font-weight: bold", msg, "");
        } else if (type == ERROR && !msg.includes("<")) {
            console.log(`%c ${log}`, "color:Red;font-weight: bold", msg, "");
        } else if (type == WARNING && !msg.includes("<")) {
            console.log(`%c ${log}`, "color:Orange;font-weight: bold", msg, "");
        }

    };

}


