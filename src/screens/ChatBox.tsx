// ChatBox.tsx
import React, { useState, useEffect } from "react";
import { ChatComponents } from "./ChatComponents"; // Update the import path to match your project structure
import "jquery"; // Import jQuery
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "bootstrap/dist/js/bootstrap.min.js";
import { Link } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import {
  AccountInfo,
  InteractionRequiredAuthError,
  SilentRequest,
} from "@azure/msal-browser";
// import Loader from 'react-loader-spinner';
import { Oval, RotatingLines } from "react-loader-spinner";
import CreateChat from "../helper/CreateChatGraphApi";
import AddUser from "../helper/AddUserGraphApi";
import RemoveUser from "../helper/RemoveUserGraphApi";
import Loader from "../components/loader/loader";

/* eslint no-unused-vars : "off" */
class CommunicationEntity {
  "subject": string;
  //"RegardingObjectId@odata.bind": string;
  "regardingobjectid_msemr_episodeofcare_mzk_communication@odata.bind": string;
  //"regardingobjectid_contact_mzk_communication@odata.bind": string;
  //"regardingobjectid_msemr_referralrequest_mzk_communication@odata.bind": string;
  //regardingobjectid_mzk_prescription_mzk_communication@odata.bind": string;
  //_regardingobjectid_value: string;
  "mzk_Category_mzk_communication@odata.bind": string;
  // Add other properties as needed
}

interface CommunicationDataEntity {
  "com.subject": string;
  "com.regardingobjectid": string;
  "com.regardingobjectid@Microsoft.Dynamics.CRM.lookuplogicalname": string;
  "com.regardingobjectid@OData.Community.Display.V1.AttributeName": string;
  "com.regardingobjectid@OData.Community.Display.V1.FormattedValue": string;
  "com.mzk_category": string;
  "com.mzk_category@OData.Community.Display.V1.FormattedValue": string;
  mzk_communicationrecipientsid: string;
  "com.activityid": string;
  "com.mzk_chatthreadid": string;
  //"mzk_Category@odata.bind": string;
  // Add other properties as needed
}

interface RecipientEntity {
  "mzk_User@odata.bind": string;
  mzk_recipienttype: string;
  "mzk_Communication@odata.bind": string;
  "mzk_CommunicationGroup@odata.bind": string;
  mzk_recipientstatus: string;
  // Add other properties as needed
}

interface UserEntity {
  domainname: string;
  fullname: string;
  internalemailaddress: string;
  systemuserid: string;
  azureadid: string;
  // Add other properties as needed
}

interface RecipientDataEntity {
  mzk_chathistory: string;
  _mzk_communication_value: string;
  "_mzk_communication_value@OData.Community.Display.V1.FormattedValue": string;
  _mzk_communicationgroup_value: string;
  "_mzk_communicationgroup_value@Microsoft.Dynamics.CRM.associatednavigationproperty": string;
  "_mzk_communicationgroup_value@OData.Community.Display.V1.FormattedValue": string;
  mzk_communicationrecipientsid: string;
  mzk_recipientstatus: string;
  mzk_historydays: string;
  mzk_recipienttype: string;
  _mzk_user_value: string;
  "_mzk_user_value@OData.Community.Display.V1.FormattedValue": string;
  statecode: string;
}

interface Member {
  "@odata.type": string;
  roles: string[];
  "user@odata.bind": string;
}
var accessTokenVar = "";

const ChatBox = (): JSX.Element => {
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();

  const [communicationData, setCommunicationData] = useState<
    CommunicationDataEntity[]
  >([]);
  const [filteredCommunicationData, setfilteredCommunicationData] = useState<
    CommunicationDataEntity[]
  >([]);
  const [userId, setUserId] = useState<string | null>(null);

  const [ChatRecipientData, setChatRecipientData] = useState<
    RecipientDataEntity[]
  >([]);

  const [isFormHidden, setFormHidden] = useState(true);
  const [isListHidden, setListHidden] = useState(true);
  const [isChatHidden, setChatHidden] = useState(true);
  const [showChatComponent, setShowChatComponent] = useState(false);
  const [loader, setLoader] = useState(false);
  const [currentPageType, setCurrentPageType] = useState("");

  const [isListRecepientHidden, setListRecepientHidden] = useState(true);
  const [isAddRecepienttHidden, setAddRecepienttHidden] = useState(true);

  const [isTopButtonsHidden, setTopButtonsHidden] = useState(true);

  const [chatThreadId, setChatThreadId] = useState("");
  const [accessTokenState, setAccessTokenState] = useState("");

  const [selectedCategory, setSelectedCategory] = useState<
    { msemr_codeableconceptid: string; msemr_name: string }[]
  >([]); // State variable to hold fetched categories // State variable to hold the selected category
  const [selectedCategoryValue, setSelectedCategoryValue] = useState(""); // Add this state variable to hold the selected value

  const [subject, setSubject] = useState<string>(""); // State variable to hold subject for record creation
  const [regardingobjectid, setregardingobjectid] = useState<string>(""); // State variable to hold subject for record creation
  const [regardingobjectpayload, setregardingobjectpayload] =
    useState<string>(""); // State variable to hold subject for record creation

  const [currentChatID, setCurrentChatID] = useState<string>("");

  const [selectedGroupValue, setselectedGroupValue] = useState(""); // Add this state variable to hold the selected value
  const [communicationGroups, setCommunicationGroups] = useState<
    { mzk_communicationgroupid: string; mzk_groupname: string }[]
  >([]); // State variable to hold fetched communication groups

  const [userList, setUserList] = useState<UserEntity[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserEntity>();

  // Define state variables to store the selected radio button value and the number of days.
  const [selectedOption, setSelectedOption] = useState("328780002"); // Default to "Include all chat history"
  const [numberOfDays, setNumberOfDays] = useState("1"); // Initialize as an empty string

  let createdChatRecordId = "";
  let chatThreadIdVar = "";

  type KeyType = string;

  const goBackToChatList = () => {
    getSpecificRecordChatData();
    setShowChatComponent(false);
    setChatHidden(true);
    if(currentPageType === "dashboard"){
      getChatData();
    }
    else{
      getSpecificRecordChatData();
    }
    setListHidden(false);
    // chatThreadIdVar = "";
    setChatThreadId("");
    // setFormHidden(false);
  };

  const handleInputChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    // Update the 'subject' state variable with the new input value
    setSubject(event.target.value);
  };

  // Function to toggle the visibility of the div
  const toggleDivVisibility = () => {
    setFormHidden(false);
    setListHidden(true);
    setShowChatComponent(false);
    setChatHidden(true);
  };

  const getChatCategory = () => {
    var fetchXml = `?fetchXml=<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'> 
      <entity name='msemr_codeableconcept'>
        <attribute name='msemr_name' />
        <attribute name='createdon' />
        <attribute name='msemr_type' />
        <attribute name='msemr_text' />
        <attribute name='msemr_code' />
        <attribute name='msemr_codeableconceptid' />
        <order attribute='msemr_name' descending='false' />
        <filter type='and'>
          <condition attribute='msemr_type' operator='eq' value='935000021' />
          <condition attribute='statecode' operator='eq' value='0' />
        </filter>
      </entity>
    </fetch>`;

    Xrm.WebApi.retrieveMultipleRecords("msemr_codeableconcept", fetchXml).then(
      function success(result) {
        // Assuming 'result.entities' contains the data you want to bind to the category dropdown
        const chatCategories = result.entities.map((entity) => ({
          msemr_codeableconceptid: entity.msemr_codeableconceptid,
          msemr_name: entity.msemr_name,
        }));

        // Set the state with the fetched data
        setSelectedCategory(chatCategories);
        // perform additional operations on retrieved records
      },
      function (error) {
        console.log(error.message);
        // handle error conditions
      }
    );
  };

  const getCommunicationGroups = () => {
    // Fetch data for "Communication Group" dropdown from the "Communication Group" entity
    var fetchXml = `?fetchXml=<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'> 
      <entity name="mzk_communicationgroup">
      <attribute name="mzk_communicationgroupid" />
      <attribute name="mzk_groupname" />
      <filter>
        <condition attribute="statecode" operator="eq" value="0" />
      </filter>
    </entity>
  </fetch>`;

    Xrm.WebApi.retrieveMultipleRecords("mzk_communicationgroup", fetchXml).then(
      function success(result) {
        const communicationGroups = result.entities.map((group) => ({
          mzk_communicationgroupid: group.mzk_communicationgroupid,
          mzk_groupname: group.mzk_groupname,
        }));

        // Set the state with the fetched data
        setCommunicationGroups(communicationGroups);
      },
      function (error) {
        console.log(error.message);
        // handle error conditions
      }
    );
  };

  const getAllQueryStringParams = (url: string) => {
    const queryParameters: { [key: string]: string } = {};
    const queryString = url.split("?")[1];

    if (queryString) {
      const params = queryString.split("&");
      for (let i = 0; i < params.length; i++) {
        const param = params[i].split("=");
        const paramName = decodeURIComponent(param[0]);
        const paramValue = decodeURIComponent(param[1]);
        queryParameters[paramName] = paramValue;
      }
    }
    return queryParameters;
  };

  const handleCancelNewChat = async () => {
    setChatHidden(true);
    setShowChatComponent(false);
    setSearchTerm("");
    setselectedGroupValue("");
    setSelectedCategoryValue("");
    setFormHidden(true);
  };

  const handleStartButtonClick = async () => {
    if (
      subject != "" &&
      selectedCategoryValue != "" &&
      selectedGroupValue != ""
    ) {
      setLoader(true);
      setChatHidden(true);
      setShowChatComponent(false);
      setListHidden(true);

      console.log(selectedCategoryValue);
      let chatMembers: Member[] = [];
      let regardingObjectIdVar = "";
      let regardingObjectPayloadVar = "";
      console.log(window.parent.location.href);
      console.log(getAllQueryStringParams(window.parent.location.href));

      let queryStringParameters: { [key: string]: string } = {};

      queryStringParameters = getAllQueryStringParams(
        window.parent.location.href
      );

      setregardingobjectid("");
      setregardingobjectpayload("");

      // Check if the entityType

      console.log("queryStringParameters.etn --> ", queryStringParameters.etn);

      if (queryStringParameters.etn == "msemr_episodeofcare") {
        regardingObjectIdVar =
          "/msemr_episodeofcares(" +
          queryStringParameters.id.replace(/\{/g, "").replace(/\}/g, "") +
          ")";
        regardingObjectPayloadVar =
          "regardingobjectid_msemr_episodeofcare_mzk_communication@odata.bind";
        // setregardingobjectid(
        //   "/msemr_episodeofcares(" +
        //     queryStringParameters.id.replace(/\{/g, "").replace(/\}/g, "") +
        //     ")"
        // );

        // setregardingobjectpayload(
        //   "regardingobjectid_msemr_episodeofcare_mzk_communication@odata.bind"
        // );
      } else if (queryStringParameters.etn == "contact") {
        regardingObjectIdVar =
          "/contacts(" +
          queryStringParameters.id.replace(/\{/g, "").replace(/\}/g, "") +
          ")";
        regardingObjectPayloadVar =
          "regardingobjectid_contact_mzk_communication@odata.bind";
        // setregardingobjectid(
        //   "/contacts(" +
        //     queryStringParameters.id.replace(/\{/g, "").replace(/\}/g, "") +
        //     ")"
        // );

        // setregardingobjectpayload(
        //   "regardingobjectid_contact_mzk_communication@odata.bind"
        // );
      } else if (queryStringParameters.etn == "msemr_referralrequest") {
        regardingObjectIdVar =
          "/msemr_referralrequests(" +
          queryStringParameters.id.replace(/\{/g, "").replace(/\}/g, "") +
          ")";
        regardingObjectPayloadVar =
          "regardingobjectid_msemr_referralrequest_mzk_communication@odata.bind";

        // setregardingobjectid(
        //   "/msemr_referralrequests(" +
        //     queryStringParameters.id.replace(/\{/g, "").replace(/\}/g, "") +
        //     ")"
        // );

        // setregardingobjectpayload(
        //   "regardingobjectid_msemr_referralrequest_mzk_communication@odata.bind"
        // );
      } else if (queryStringParameters.etn == "mzk_prescription") {
        regardingObjectIdVar =
          "/mzk_prescriptions(" +
          queryStringParameters.id.replace(/\{/g, "").replace(/\}/g, "") +
          ")";
        regardingObjectPayloadVar =
          "regardingobjectid_mzk_prescription_mzk_communication@odata.bind";

        // setregardingobjectid(
        //   "/mzk_prescriptions(" +
        //     queryStringParameters.id.replace(/\{/g, "").replace(/\}/g, "") +
        //     ")"
        // );

        // setregardingobjectpayload(
        //   "regardingobjectid_mzk_prescription_mzk_communication@odata.bind"
        // );
      } else if (queryStringParameters.etn == "mzk_patientorder") {
        regardingObjectIdVar =
          "/mzk_patientorders(" +
          queryStringParameters.id.replace(/\{/g, "").replace(/\}/g, "") +
          ")";
        regardingObjectPayloadVar =
          "regardingobjectid_mzk_patientorder_mzk_communication@odata.bind";

        // setregardingobjectid(
        //   "/mzk_patientorders(" +
        //     queryStringParameters.id.replace(/\{/g, "").replace(/\}/g, "") +
        //     ")"
        // );

        // setregardingobjectpayload(
        //   "regardingobjectid_mzk_patientorder_mzk_communication@odata.bind"
        // );
      } else if (queryStringParameters.etn == "mzk_patientappointmentemr") {
        regardingObjectIdVar =
          "/mzk_patientappointmentemrs(" +
          queryStringParameters.id.replace(/\{/g, "").replace(/\}/g, "") +
          ")";
        regardingObjectPayloadVar =
          "regardingobjectid_mzk_patientappointmentemr_mzk_communication@odata.bind";

        // setregardingobjectid(
        //   "/mzk_patientappointmentemrs(" +
        //     queryStringParameters.id.replace(/\{/g, "").replace(/\}/g, "") +
        //     ")"
        // );

        // setregardingobjectpayload(
        //   "regardingobjectid_mzk_patientappointmentemr_mzk_communication@odata.bind"
        // );
      } else if (queryStringParameters.etn == "mzk_invoices") {
        setregardingobjectid(
          "/mzk_invoices(" +
            queryStringParameters.id.replace(/\{/g, "").replace(/\}/g, "") +
            ")"
        );

        setregardingobjectpayload(
          "regardingobjectid_mzk_invoice_mzk_communication@odata.bind"
        );
      } else if (queryStringParameters.etn == "mzk_careplantemplates") {
        regardingObjectIdVar =
          "/mzk_careplantemplates(" +
          queryStringParameters.id.replace(/\{/g, "").replace(/\}/g, "") +
          ")";
        regardingObjectPayloadVar =
          "regardingobjectid_mzk_careplantemplates_mzk_communication@odata.bind";

        // setregardingobjectid(
        //   "/mzk_careplantemplates(" +
        //     queryStringParameters.id.replace(/\{/g, "").replace(/\}/g, "") +
        //     ")"
        // );

        // setregardingobjectpayload(
        //   "regardingobjectid_mzk_careplantemplates_mzk_communication@odata.bind"
        // );
      }

      console.log("updated regarding var:" + regardingObjectIdVar);

      const communicationData = {
        subject: subject,

        // "regardingobjectid_msemr_episodeofcare_mzk_communication@odata.bind":

        //   "/msemr_episodeofcares(42e6425c-b506-4bc0-8e87-5677194d0baf)",

        [regardingObjectPayloadVar]: regardingObjectIdVar,

        "mzk_Category_mzk_communication@odata.bind":
          "/msemr_codeableconcepts(" + selectedCategoryValue + ")",
      };

      await Xrm.WebApi.online
        .createRecord("mzk_communication", communicationData)
        .then(
          async function success(result) {
            var newEntityId = result.id;

            console.log("success communication record");

            console.log(result);

            // Now that the "mzk_communication" record is created, you can fetch related records.

            const fetchXml = `?fetchXml=<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>
          <entity name="mzk_communicationgroupmembers">
            <attribute name="mzk_communicationgroupmembersid" />
            <attribute name="mzk_user" />
            <attribute name="mzk_communicationgroup" />
            <filter type="and">
            <condition attribute="mzk_user" operator="ne" value="${userId}" />
            <condition attribute="mzk_communicationgroup" operator="eq" value="${selectedGroupValue}" />
            </filter>
            <link-entity name="systemuser" from="systemuserid" to="mzk_user" link-type="inner" alias="user">
              <attribute name="domainname" />
              <attribute name="fullname" />
              <attribute name="identityid" />
              <attribute name="systemuserid" />
              <attribute name="azureactivedirectoryobjectid" />
            </link-entity>
          </entity>
        </fetch>`;

            await Xrm.WebApi.retrieveMultipleRecords(
              "mzk_communicationgroupmembers",
              fetchXml
            ).then(
              async function success(fetchResult) {
                // Get the current user's ID

                const currentUserId = userId;

                // Process the fetched records here

                const fetchedRecords = fetchResult.entities;
                if (fetchedRecords.length < 1) {
                  var alertStrings = {
                    confirmButtonLabel: "OK",
                    text: "Unable to create chat. Communication group is empty / Current user is added only.",
                    title: "Error",
                  };
                  var alertOptions = { height: 200, width: 260 };
                  Xrm.Navigation.openAlertDialog(
                    alertStrings,
                    alertOptions
                  ).then(
                    function (success) {
                      console.log("Alert dialog closed");
                      setLoader(false);
                      setSubject("");
                      setSelectedCategory([]);
                      setselectedGroupValue("");
                      setFormHidden(true);
                      setChatHidden(true);
                      setShowChatComponent(false);
                      setListHidden(false);
                    },
                    function (error) {
                      console.log(error.message);
                    }
                  );
                  return;
                }
                console.log(fetchedRecords);

                // Check if the current user is not in the fetched records

                const currentUserExistsInFetchedRecords = fetchedRecords.some(
                  (record) =>
                    record["mzk_User@odata.bind"] ==
                    `/systemusers(${currentUserId})`
                );

                if (!currentUserExistsInFetchedRecords) {
                  // The current user is not in fetchedRecords, so add a user record in mzk_communicationrecipients

                  const entityrecipient: RecipientEntity = {
                    "mzk_User@odata.bind": `/systemusers(${currentUserId})`,
                    mzk_recipienttype: "275380000",
                    mzk_recipientstatus: "275380000",
                    "mzk_Communication@odata.bind": `/mzk_communications(${newEntityId})`,
                    "mzk_CommunicationGroup@odata.bind": `/mzk_communicationgroups(${fetchedRecords[0]["_mzk_communicationgroup_value"]})`,

                    // Add other properties as needed
                  };

                  let thisUserChatMemberObject: Member = {
                    "@odata.type": "#microsoft.graph.aadUserConversationMember",
                    roles: ["owner"],
                    "user@odata.bind": `https://graph.microsoft.com/v1.0/users('${activeAccount?.idTokenClaims?.oid}')`,
                  };
                  chatMembers.push(thisUserChatMemberObject);

                  console.log("login user: " + entityrecipient);

                  const recipientResult = await Xrm.WebApi.online

                    .createRecord(
                      "mzk_communicationrecipients",

                      entityrecipient
                    )

                    .then(
                      function success(result) {
                        var newEntityId = result.id;

                        console.log(
                          "Created mzk_communicationrecipients record:",

                          newEntityId
                        );
                      },

                      function (error) {
                        setLoader(false);
                        console.log(error.message);
                      }
                    );
                }

                // Loop through the fetched records and create "mzk_communicationrecipients" records for each one

                fetchedRecords.forEach(async function (record) {
                  const entityrecipient: RecipientEntity = {
                    "mzk_User@odata.bind":
                      "/systemusers(" + record["user.systemuserid"] + ")", // Use the correct field name for user's systemuserid

                    mzk_recipienttype: "275380000",

                    mzk_recipientstatus: "275380000",

                    "mzk_Communication@odata.bind":
                      "/mzk_communications(" + newEntityId + ")", // Use the correct field name for user's systemuserid

                    "mzk_CommunicationGroup@odata.bind":
                      "/mzk_communicationgroups(" +
                      record["_mzk_communicationgroup_value"] +
                      ")",

                    // Add other properties as needed
                  };

                  let chatMemberObject = {
                    "@odata.type": "#microsoft.graph.aadUserConversationMember",
                    roles: ["owner"],
                    "user@odata.bind": `https://graph.microsoft.com/v1.0/users('${record["user.azureactivedirectoryobjectid"]}')`,
                  };
                  chatMembers.push(chatMemberObject);

                  console.log(entityrecipient);

                  await Xrm.WebApi.online

                    .createRecord(
                      "mzk_communicationrecipients",
                      entityrecipient
                    )

                    .then(
                      function success(result) {
                        var newEntityId = result.id;

                        console.log(
                          "Created mzk_communicationrecipients record:",

                          newEntityId
                        );
                      },

                      function (error) {
                        setLoader(false);
                        console.log(error.message);
                      }
                    );
                });
              },

              function (fetchError) {
                setLoader(false);
                console.log("Error fetching records:", fetchError.message);
              }
            );

            console.log(
              "~~~~~~~~~~~~~~~~~~~```````before calling Create Chat``````~~~~~~~~~~~~~~"
            );
            console.log("subject: ", subject);
            console.log("accessTokenVar: ", accessTokenVar);
            console.log("accessTokenState: ", accessTokenState);
            console.log("chatMembers --> ", chatMembers);
            const createChatResponse = await CreateChat(
              subject,
              accessTokenState,
              chatMembers
            );
            console.log("createChatResponse --> ", createChatResponse);
            Xrm.WebApi.updateRecord("mzk_communication", newEntityId, {
              mzk_chatthreadid: createChatResponse.id,
            });

            chatThreadIdVar = createChatResponse.id;
            sessionStorage.setItem("chatthreadid", createChatResponse.id);
            setChatThreadId(createChatResponse.id);
            setCurrentChatID(newEntityId);
            setLoader(false);
            setListHidden(true);
            setFormHidden(true);
            // if(currentPageType === "dashboard"){
            //   await getChatData();
            // }
            // else {
            //   await getSpecificRecordChatData();
            // }
            
            setChatHidden(false);
            setShowChatComponent(true);
          },

          function (error) {
            setLoader(false);
            console.log(error.message);
          }
        );
    } else {
      // Display an error message or perform other actions when validation fails
      setLoader(false);
      alert("Please fill in the Subject and select a category and Group.");
    }
  };

  const handleViewRecepientsButtonClick = () => {
    // Check if you have the current chat ID
    if (currentChatID) {
      // setListRecepientHidden(false);
      // setAddRecepienttHidden(true);
      setListRecepientHidden(!isListRecepientHidden);
      // setAddRecepienttHidden(!isAddRecepienttHidden);

      // Use the currentChatID to fetch chat recipients
      const fetchXml = `?fetchXml=<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>
      <entity name="mzk_communicationrecipients">
    <attribute name="mzk_chathistory" />
    <attribute name="mzk_communication" />
    <attribute name="mzk_communicationgroup" />
    <attribute name="mzk_communicationrecipientsid" />
    <attribute name="mzk_historydays" />
    <attribute name="mzk_recipientstatus" />
    <attribute name="mzk_recipienttype" />
    <attribute name="mzk_removedby" />
    <attribute name="mzk_user" />
    <attribute name="statecode" />
    <filter>
      <condition attribute="mzk_communication" operator="eq" value="${currentChatID}" />
      <condition attribute="mzk_recipientstatus" operator="eq" value="275380000" />
    </filter>
  </entity>
    </fetch>`;
      Xrm.WebApi.retrieveMultipleRecords(
        "mzk_communicationrecipients",
        fetchXml
      ).then(
        function success(result) {
          const recipients = result.entities;
          console.log("Chat Recepients: " + recipients);
          setChatRecipientData(recipients);
          // Update your state with the fetched recipients
          // For example, you can add a state variable and set it here.
          // setRecipients(recipients);
        },
        function (error) {
          console.log(error.message);
          // Handle error conditions
        }
      );
    }
  };

  const getSpecificRecordChatData = async () => {
    const userSettings = Xrm.Utility.getGlobalContext().userSettings;
    setUserId(userSettings.userId.replace(/\{/g, "").replace(/\}/g, ""));
    setTopButtonsHidden(true);
    console.log("getSpecificRecordChatData");
    const url = window.parent.location.href;
    const urlParams = new URLSearchParams(url);
    const regardingEntity = urlParams.get("etn");
    const regardingEntityId = urlParams.get("id");
    console.log("regardingEntity", regardingEntity);
    console.log(
      "getSpecificRecordChatData regardingEntityId --> ",
      regardingEntityId
    );

    const fetchXml = `?fetchXml=<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>
    <entity name="mzk_communicationrecipients">
    <filter type="and">
      <condition attribute="mzk_user" operator="eq" value="${userSettings.userId
        .replace(/\{/g, "")
        .replace(/\}/g, "")}" />
        <condition attribute="mzk_recipientstatus" operator="eq" value="275380000" />
    </filter>
    <link-entity name="mzk_communication" from="activityid" to="mzk_communication" link-type="inner" alias="com">
      <attribute name="mzk_category" />
      <attribute name="mzk_communicationchattype" />
      <attribute name="regardingobjectid" />
      <attribute name="statecode" />
      <attribute name="statuscode" />
      <attribute name="subject" />
      <attribute name="activityid" />
      <attribute name="mzk_chatthreadid" />
      <filter>
        <condition attribute="regardingobjectid" operator="eq" value="${regardingEntityId}" />
      </filter>
    </link-entity>
    </entity>
    </fetch>`;

    console.log("getSpecificRecordChatData fetchXml", fetchXml);

    Xrm.WebApi.retrieveMultipleRecords(
      "mzk_communicationrecipients",
      fetchXml
    ).then(
      function success(result) {
        console.log("getChatDatasuccess");
        const fetchedRecords = result.entities;
        console.log("Communication record");
        console.log(fetchedRecords);
        setCommunicationData(fetchedRecords);

        setfilteredCommunicationData(fetchedRecords);
        setListHidden(false);
      },
      function (error) {
        console.log(error.message);
      }
    );
  };

  const getChatData = async () => {
    setTopButtonsHidden(false);
    const userSettings = Xrm.Utility.getGlobalContext().userSettings;
    setUserId(userSettings.userId.replace(/\{/g, "").replace(/\}/g, ""));
    console.log("getChatDataStarted");

    const fetchXml = `?fetchXml=<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>
    <entity name="mzk_communicationrecipients">
    <filter>
      <condition attribute="mzk_user" operator="eq" value="${userSettings.userId
        .replace(/\{/g, "")
        .replace(/\}/g, "")}" />
    </filter>
    <link-entity name="mzk_communication" from="activityid" to="mzk_communication" link-type="inner" alias="com">
      <attribute name="mzk_category" />
      <attribute name="mzk_communicationchattype" />
      <attribute name="regardingobjectid" />
      <attribute name="statecode" />
      <attribute name="statuscode" />
      <attribute name="subject" />
      <attribute name="activityid" />
      <attribute name="mzk_chatthreadid" />
    </link-entity>
    </entity>
    </fetch>`;

    console.log("xml: " + fetchXml);

    await Xrm.WebApi.retrieveMultipleRecords(
      "mzk_communicationrecipients",
      fetchXml
    ).then(
      function success(result) {
        console.log("getChatDatasuccess");
        const fetchedRecords = result.entities;
        console.log("Communication record");
        console.log(fetchedRecords);
        setCommunicationData(fetchedRecords);
        setfilteredCommunicationData(fetchedRecords);
        setListHidden(false);
      },
      function (error) {
        console.log(error.message);
      }
    );
  };

  const handleTopButtonClick = async (entityType: string) => {
    await getChatData();
    const filteredCommunicationData = communicationData.filter(
      (record) =>
        record[
          "com.regardingobjectid@Microsoft.Dynamics.CRM.lookuplogicalname"
        ] == entityType
    );
    console.log("filteredCommunicationData");
    chatThreadIdVar = "";

    console.log(communicationData);
    console.log(entityType);
    console.log(filteredCommunicationData);
    // Update the state variable to hold the filtered data

    // Make the list visible
    setShowChatComponent(false);
    setFormHidden(true);
    setChatHidden(true);
    setfilteredCommunicationData(filteredCommunicationData);
    setListHidden(false);
  };
  // Get the current user's ID
  const getCurrentUser = () => {
    if (typeof Xrm !== "undefined") {
      const userSettings = Xrm.Utility.getGlobalContext().userSettings;
      setUserId(userSettings.userId.replace(/\{/g, "").replace(/\}/g, ""));
      console.log(
        "User id" + userSettings.userId.replace(/\{/g, "").replace(/\}/g, "")
      );
    } else {
      console.log(
        "Xrm is not available. Make sure you are running this code within a Dynamics 365 or Power Platform context."
      );
    }
  };

  // Event handler for radio button changes
  const handleRadioChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setSelectedOption(event.target.value);
  };

  const getAccessToken = async () => {
    const silentReq: SilentRequest = {
      account: activeAccount as AccountInfo | undefined,
      scopes: ["https://graph.microsoft.com/.default"],
    };
    try {
      const accessTokenObject = await instance.acquireTokenSilent(silentReq);
      const accessToken = accessTokenObject.accessToken;
      console.log("getAccessToken ChatBox --> ", accessToken);
      sessionStorage.setItem("userAccessToken", accessToken);
      accessTokenVar = accessToken;
      setAccessTokenState(accessToken);
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        console.log("in catch of getAccessToken error: ", error);
        setAccessTokenState(
          (await instance.acquireTokenPopup(silentReq)).accessToken
        );
        return instance.acquireTokenPopup(silentReq);
      }
    }
  };

  // Event handler for text box changes
  const handleNumberOfDaysChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setNumberOfDays(event.target.value);
  };

  function handleCommunicationLiClick(key: KeyType, chatThreadId: string) {
    // Do something with the key value (record["com.activityid"])
    sessionStorage.setItem("chatthreadid", chatThreadId);
    console.log(`Clicked on li with key: ${key}`);
    console.log(`Clicked on li with chatThreadId: ${chatThreadId}`);
    setCurrentChatID(key);
    chatThreadIdVar = chatThreadId;
    setChatThreadId(chatThreadId);
    setShowChatComponent(true);
    setChatHidden(false);
    setListHidden(true);
    setFormHidden(true);
  }

  const fetchUserData = async () => {
    try {
      // Make an API request to "xrm" or fetch data in any other way
      if (searchTerm != "") {
        console.log("fetchUsersData: " + searchTerm);
        Xrm.WebApi.online
          .retrieveMultipleRecords(
            "systemuser",
            "?$select=domainname,fullname,internalemailaddress,systemuserid,azureactivedirectoryobjectid&$filter=contains(internalemailaddress, '" +
              searchTerm +
              "') or contains(fullname, '" +
              searchTerm +
              "')"
          )
          .then(
            function success(results) {
              // Update the user list with the fetched data
              setUserList(results.entities);
            },
            function (error) {
              console.log(error.message);
            }
          );
      } else {
        setUserList([]);
      }
    } catch (error) {
      console.error("Error fetching user data from xrm:", error);
    }
  };

  useEffect(() => {
    //getCurrentUser();

    const userSettings = Xrm.Utility.getGlobalContext().userSettings;
    setUserId(userSettings.userId.replace(/\{/g, "").replace(/\}/g, ""));
    console.log(
      "User id" + userSettings.userId.replace(/\{/g, "").replace(/\}/g, "")
    );
    const url = window.parent.location.href;
    console.log("window.location.href --> ", window.parent.location.href);
    const urlParams = new URLSearchParams(url);
    const pagetype = urlParams.get("pagetype");
    if (pagetype === "dashboard") {
      setCurrentPageType("dashboard");
      getChatData();
    } else {
      getSpecificRecordChatData();
    }
    getAccessToken();
    getChatCategory();
    getCommunicationGroups();
  }, []); // Run this effect once when the component mounts

  useEffect(() => {
    fetchUserData();
  }, [searchTerm]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      // setSearchTerm("");
      setSelectedUser(undefined);
    }
  };

  const btnadduserStyle: React.CSSProperties = {
    fontSize: "22px",
  };
  const iconplusStyle: React.CSSProperties = {
    verticalAlign: "top",
  };
  const listgroupitemStyle: React.CSSProperties = {
    textAlign: "right",
  };

  function HandleRemoveUser(
    mzk_userid: string | null,
    mzk_communication: string,
    mzk_communicationrecipientsid: string,
    userType: string
  ) {
    console.log("HandleRemoveUser");
    console.log(mzk_userid);
    console.log(mzk_communication);

    if (userType == "current") {
      var entity = {
        mzk_recipientstatus: 275380001, //Left
        "mzk_RemovedBy@odata.bind": `/systemusers(${mzk_userid})`,
      };
      // Define your query based on entityType and any other criteria.
      const fetchXml = `?fetchXml=<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'> 
        <entity name="mzk_communicationrecipients">
        <attribute name="mzk_communication" />
        <attribute name="mzk_user" />
        <attribute name="mzk_communicationrecipientsid" />
        <attribute name="mzk_recipienttype" />
        <filter>
          <condition attribute="mzk_communication" operator="eq" value="${mzk_communication}" />
          <condition attribute="mzk_user" operator="eq" value="${mzk_userid}" />
        </filter>
      </entity>
    </fetch>`;
      console.log("xml: " + fetchXml);
      Xrm.WebApi.retrieveMultipleRecords(
        "mzk_communicationrecipients",
        fetchXml
      ).then(
        function success(result) {
          // Process the fetched records here
          const fetchedRecords = result.entities;
          Xrm.WebApi.online
            .updateRecord(
              "mzk_communicationrecipients",
              fetchedRecords[0]["mzk_communicationrecipientsid"],
              entity
            )
            .then(
              async function success(result) {
                var updatedEntityId = result.id;
                await RemoveUser(
                  // accessTokenVar,
                  chatThreadId,
                  activeAccount?.idTokenClaims?.oid,
                  true
                );
                handleViewRecepientsButtonClick();
              },
              function (error) {
                console.log(error.message);
              }
            );
        },
        function (error) {
          console.log(error.message);
          // Handle error conditions
        }
      );
    } else {
      var entity = {
        mzk_recipientstatus: 275380002, //removed
        "mzk_RemovedBy@odata.bind": `/systemusers(${mzk_userid})`,
      };
      Xrm.WebApi.online
        .updateRecord(
          "mzk_communicationrecipients",
          mzk_communicationrecipientsid,
          entity
        )
        .then(
          function success(result) {
            var updatedEntityId = result.id;
            RemoveUser(
              // accessTokenVar,
              chatThreadId,
              mzk_userid,
              false
            );
            handleViewRecepientsButtonClick();
          },
          function (error) {
            console.log(error.message);
          }
        );
    }
  }

  function HandleShowAddUserDiv(): void {
    console.log("HandleAddUserDiv");
    setListRecepientHidden(true);
    setAddRecepienttHidden(false);
  }

  async function GetExistingRemovedUser() {}

  function HandleAddUser(): void {
    console.log("HandleAddUser");
    console.log("currentChatID -> ", currentChatID);
    console.log("selectedUser --> ", selectedUser?.systemuserid);
    Xrm.WebApi.online
      .retrieveMultipleRecords(
        "mzk_communicationrecipients",
        "?$select=mzk_communicationrecipientsid&$filter=_mzk_communication_value eq " +
          currentChatID +
          " and  _mzk_user_value eq " +
          selectedUser?.systemuserid +
          " and  mzk_recipientstatus eq 275380002"
      )
      .then(
        function success(results) {
          if (results.entities.length > 0) {
            for (let rec of results.entities) {
              var mzk_communicationrecipientsid =
                rec["mzk_communicationrecipientsid"];

              var entity = {
                mzk_chathistory: selectedOption,
                "mzk_Communication@odata.bind": `/mzk_communications(${currentChatID})`,
                mzk_historydays: numberOfDays,
                mzk_recipientstatus: 275380000,
                mzk_recipienttype: 275380001,
                "mzk_User@odata.bind": `/systemusers(${selectedUser?.systemuserid})`,
              };

              Xrm.WebApi.online
                .updateRecord(
                  "mzk_communicationrecipients",
                  mzk_communicationrecipientsid,
                  entity
                )
                .then(
                  function success(result) {
                    var updatedEntityId = result.id;
                    console.log("recepient successfully added");
                    AddUser(
                      accessTokenState,
                      chatThreadId,
                      selectedUser?.systemuserid,
                      selectedOption,
                      numberOfDays
                    );
                    setSelectedUser({
                      domainname: "",
                      fullname: "",
                      internalemailaddress: "",
                      systemuserid: "",
                      azureadid: "",
                    });
                    handleViewRecepientsButtonClick();
                    HandleRecepientListDiv();
                  },
                  function (error) {
                    // Xrm.Utility.alertDialog(error.message);
                  }
                );
            }
          } else {
            var entity = {
              mzk_chathistory: selectedOption,
              "mzk_Communication@odata.bind": `/mzk_communications(${currentChatID})`,
              mzk_historydays: numberOfDays,
              mzk_recipientstatus: 275380000,
              mzk_recipienttype: 275380001,
              "mzk_User@odata.bind": `/systemusers(${selectedUser?.systemuserid})`,
            };

            Xrm.WebApi.online
              .createRecord("mzk_communicationrecipients", entity)
              .then(
                function success(result) {
                  var newEntityId = result.id;
                  console.log("recepient successfully added");
                  AddUser(
                    accessTokenState,
                    chatThreadId,
                    selectedUser?.systemuserid,
                    selectedOption,
                    numberOfDays
                  );
                  setSelectedUser({
                    domainname: "",
                    fullname: "",
                    internalemailaddress: "",
                    systemuserid: "",
                    azureadid: "",
                  });
                  handleViewRecepientsButtonClick();
                  HandleRecepientListDiv();
                },
                function (error) {
                  // Xrm.Utility.alertDialog(error.message);
                }
              );
          }
        },
        function (error) {
          // Xrm.Utility.alertDialog(error.message);
        }
      );

    // var entity = {
    //   mzk_chathistory: selectedOption,
    //   "mzk_Communication@odata.bind": `/mzk_communications(${currentChatID})`,
    //   mzk_historydays: numberOfDays,
    //   mzk_recipientstatus: 275380000,
    //   mzk_recipienttype: 275380001,
    //   "mzk_User@odata.bind": `/systemusers(${selectedUser?.systemuserid})`,
    // };
    // Xrm.WebApi.online.createRecord("mzk_communicationrecipients", entity).then(
    //   function success(result) {
    //     var newEntityId = result.id;
    //     console.log("recepient successfully added");
    //     AddUser(
    //       accessTokenState,
    //       chatThreadId,
    //       selectedUser?.systemuserid,
    //       selectedOption,
    //       numberOfDays
    //     );
    //     setSelectedUser({
    //       domainname: "",
    //       fullname: "",
    //       internalemailaddress: "",
    //       systemuserid: "",
    //     });
    //     handleViewRecepientsButtonClick();
    //     HandleRecepientListDiv();
    //   },
    //   function (error) {
    //     console.log(error.message);
    //   }
    // );
  }

  function HandleRecepientListDiv(): void {
    setListRecepientHidden(false);
    setAddRecepienttHidden(true);
  }

  const handletxtuserNameEmailTagChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log("Change event:" + event);

    const { value } = event.target;
    setSearchTerm(value);
  };

  const handleUserSelection = (user: UserEntity) => {
    setSelectedUser(user);
    setSearchTerm("");
  };

  return (
    <div className="bootstrap snippets bootdeys">
      <div
        className="col-md-7 col-xs-12 col-md-offset-2"
        style={{ padding: 0 }}
      >
        <div className="panel" id="chat">
          <div className="panel-heading">
            <h3 className="panel-title">
              <i className="icon wb-chat-text" aria-hidden="true"></i> MazikCare
              - Chat
            </h3>
            {currentPageType === "dashboard" ? null : (
              <a
                href="#"
                onClick={toggleDivVisibility}
                className="btn btn-info btn-plus btn-align"
              >
                <span className="glyphicon glyphicon-plus"></span>
              </a>
            )}
          </div>
          <aside>
            <ul className="topBtns">
              <li>
                {isTopButtonsHidden ? null : (
                  <button
                    type="button"
                    className="btn btn-common"
                    onClick={() => handleTopButtonClick("msemr_episodeofcare")}
                  >
                    Episode of Care
                  </button>
                )}
              </li>
              <li>
                {isTopButtonsHidden ? null : (
                  <button
                    type="button"
                    className="btn btn-common"
                    onClick={() => handleTopButtonClick("contact")}
                  >
                    Patient
                  </button>
                )}
              </li>
              <li>
                {isTopButtonsHidden ? null : (
                  <button
                    type="button"
                    className="btn btn-common"
                    onClick={() =>
                      handleTopButtonClick("msemr_referralrequest")
                    }
                  >
                    Referral Request
                  </button>
                )}
              </li>
              <li>
                {isTopButtonsHidden ? null : (
                  <button
                    type="button"
                    className="btn btn-common"
                    onClick={() => handleTopButtonClick("mzk_prescription")}
                  >
                    Recommendation
                  </button>
                )}
              </li>
              <li>
                {isTopButtonsHidden ? null : (
                  <button
                    type="button"
                    className="btn btn-common"
                    onClick={() => handleTopButtonClick("mzk_patientorder")}
                  >
                    Patient Order
                  </button>
                )}
              </li>
              <li>
                {isTopButtonsHidden ? null : (
                  <button
                    type="button"
                    className="btn btn-common"
                    onClick={() => handleTopButtonClick("msemr_appointmentemr")}
                  >
                    Patient Appointment
                  </button>
                )}
              </li>
              <li>
                {isTopButtonsHidden ? null : (
                  <button
                    type="button"
                    className="btn btn-common"
                    onClick={() =>
                      handleTopButtonClick("mzk_careplantemplates")
                    }
                  >
                    Care Knowledge Article
                  </button>
                )}
              </li>
            </ul>
          </aside>

          {loader ? (
            <div>
              <Loader />
            </div>
          ) : (
            <div>
              <div
                className={`panel-body ${isFormHidden ? "hidden" : ""}`}
                id="form"
              >
                <form>
                  <div className="form-group">
                    <label htmlFor="lblSubject">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      id="txtSubject"
                      name="subject"
                      placeholder="Subject"
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="last_name">Category</label>
                    <select
                      id="ddlCategory"
                      className="form-control"
                      value={selectedCategoryValue}
                      onChange={(e) => setSelectedCategoryValue(e.target.value)}
                    >
                      {/* Add a default or placeholder option */}
                      <option value="">Select a category</option>

                      {/* Map the fetched categories to generate <option> elements */}
                      {selectedCategory.map((category) => (
                        <option
                          key={category.msemr_codeableconceptid}
                          value={category.msemr_codeableconceptid}
                        >
                          {category.msemr_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="lblCommunication">
                      Communication Group
                    </label>
                    <select
                      id="ddlCommunicationGroup"
                      className="form-control"
                      value={selectedGroupValue}
                      onChange={(e) => setselectedGroupValue(e.target.value)}
                    >
                      {/* Add a default or placeholder option */}
                      <option value="">Select a Chat Group</option>
                      {/* Map the fetched communication groups to generate <option> elements */}
                      {communicationGroups.map((group) => (
                        <option
                          key={group.mzk_communicationgroupid}
                          value={group.mzk_communicationgroupid}
                        >
                          {group.mzk_groupname}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    className="btn btn-default btn-start"
                    onClick={handleStartButtonClick}
                    style={{ marginBottom: "5px" }}
                  >
                    {" "}
                    Start
                  </button>

                  <button
                    type="button"
                    className="btn btn-default btn-start"
                    onClick={handleCancelNewChat}
                  >
                    {" "}
                    Cancel
                  </button>
                </form>
              </div>
              <div
                className={`panel-body panel-body-ext ${
                  isListHidden ? "hidden" : ""
                }`}
                id="list"
              >
                <ul className="list-group list-group-ext">
                  {filteredCommunicationData ? (
                    filteredCommunicationData.map((record, index) => (
                      <li
                        className="list-group-item"
                        key={record["com.activityid"]}
                        onClick={() =>
                          handleCommunicationLiClick(
                            record["com.activityid"] as KeyType,
                            record["com.mzk_chatthreadid"] as string
                          )
                        }
                      >
                        {record["com.subject"]}
                        {/* You can add other record attributes here */}
                      </li>
                    ))
                  ) : (
                    <p>No chats founds.</p>
                  )}
                </ul>
              </div>
              <div
                className={`panel-body panel-body-ext ${
                  isChatHidden ? "hidden" : ""
                }`}
                id="chat"
              >
                <div className="panel-heading panel-heading-ext">
                  <h3 className="panel-title">
                    <i className="icon wb-chat-text" aria-hidden="true"></i>
                  </h3>
                  <a
                    href="#"
                    className="btn btn-add-user btn-plus"
                    onClick={handleViewRecepientsButtonClick}
                  >
                    <i
                      className="glyphicon glyphicon-user"
                      style={btnadduserStyle}
                    ></i>
                    <i
                      className="glyphicon glyphicon-plus-sign"
                      style={iconplusStyle}
                    ></i>
                  </a>
                </div>
                <div
                  className={`${isListRecepientHidden ? "hidden" : ""}`}
                  id="addPeople"
                >
                  <ul className="list-group list-group-ext">
                    {ChatRecipientData.map((recipient, index) => (
                      <li
                        className="list-group-item"
                        key={recipient.mzk_recipientstatus}
                      >
                        <div className="">
                          <a className="chat-link" href="#">
                            <ul className="chat-user">
                              <li>
                                <img
                                  // src="https://bootdey.com/img/Content/avatar/avatar2.png"
                                  src={Xrm.Page.context.getClientUrl() + '/WebResources/mzk_teamsuserpng'}
                                  alt="..."
                                />
                              </li>
                              <li>
                                {
                                  recipient[
                                    "_mzk_user_value@OData.Community.Display.V1.FormattedValue"
                                  ]
                                }
                              </li>
                              <li
                                onClick={() =>
                                  HandleRemoveUser(
                                    recipient._mzk_user_value,
                                    recipient._mzk_communication_value,
                                    recipient.mzk_communicationrecipientsid,
                                    ""
                                  )
                                }
                              >
                                <i className="glyphicon glyphicon-remove"></i>
                              </li>
                            </ul>
                          </a>
                        </div>
                      </li>
                    ))}
                    <li className="list-group-item">
                      <a
                        href="#"
                        className="btn btn-common-inner"
                        onClick={() => HandleShowAddUserDiv()}
                      >
                        <i className="glyphicon glyphicon-plus-sign"></i> Add
                        People
                      </a>
                    </li>
                    <li
                      className="list-group-item"
                      onClick={() =>
                        HandleRemoveUser(userId, currentChatID, "", "current")
                      }
                    >
                      <a href="#" className="btn btn-common-inner">
                        <i className="glyphicon glyphicon-circle-arrow-left"></i>{" "}
                        Leave
                      </a>
                    </li>
                  </ul>
                </div>
                <div
                  className={`panel-body ${
                    isAddRecepienttHidden ? "hidden" : ""
                  }`}
                  id="addBtn"
                >
                  <ul className="list-group">
                    <li className="list-group-item">
                      <div className="form-group">
                        <label id="usr">Add:</label>
                        <input
                          type="hidden"
                          id="hfselecteduserid"
                          value={selectedUser?.systemuserid}
                        />
                        <input
                          type="text"
                          className="form-control"
                          id="txtuserNameEmailTag"
                          placeholder="Enter a name, email or tag"
                          value={selectedUser?.fullname}
                          onChange={handletxtuserNameEmailTagChange}
                          // onKeyDown={handleKeyDown}
                        />
                        <ul>
                          {userList

                            .filter((user: UserEntity) => {
                              // Check if user.fullname exists and is not null/undefined
                              const hasFullname = user.fullname
                                ?.toLowerCase()
                                .includes(searchTerm.toLowerCase());
                              // Check if user.internalemailaddress exists and is not null/undefined
                              const hasInternalEmail = user.internalemailaddress
                                ?.toLowerCase()
                                .includes(searchTerm.toLowerCase());
                              // Include the user in the results if either fullname or internalemailaddress matches the search term
                              return hasFullname || hasInternalEmail;
                            })

                            .map((user: UserEntity) => (
                              <li
                                key={user.systemuserid}
                                onClick={() => handleUserSelection(user)}
                              >
                                {user.fullname}
                              </li>
                            ))}
                        </ul>
                      </div>
                    </li>
                    <li className="list-group-item">
                      <div className="form-group form-group-ext">
                        <input
                          type="radio"
                          id="rdIncludeChat1"
                          name="rdIncludeChat"
                          value="328780000"
                          checked={selectedOption === "328780000"} // Check if this option is selected
                          onChange={(e) => setSelectedOption(e.target.value)} // Update selectedOption when the radio button is changed
                        />
                        Don't include chat history
                      </div>
                    </li>
                    <li className="list-group-item">
                      <div className="form-group form-group-ext">
                        <input
                          type="radio"
                          id="rdIncludeChat2"
                          name="rdIncludeChat"
                          value="328780001"
                          checked={selectedOption === "328780001"} // Check if this option is selected
                          onChange={(e) => setSelectedOption(e.target.value)} // Update selectedOption when the radio button is changed
                        />
                        Include history from the past number of days{" "}
                        <input
                          type="number"
                          className="form-control"
                          id="txtnoOfDays"
                          value={numberOfDays} // Bind the input value to the state variable
                          onChange={handleNumberOfDaysChange} // Update numberOfDays when the text box value changes
                        />
                      </div>
                    </li>
                    <li className="list-group-item">
                      <div className="form-group form-group-ext">
                        <input
                          type="radio"
                          id="rdIncludeChat3"
                          name="rdIncludeChat"
                          value="328780002"
                          checked={selectedOption === "328780002"} // Check if this option is selected
                          onChange={(e) => setSelectedOption(e.target.value)} // Update selectedOption when the radio button is changed
                        />
                        Include all chat history
                      </div>
                    </li>
                    <li className="list-group-item" style={listgroupitemStyle}>
                      <button
                        type="button"
                        className="btn btn-default"
                        onClick={() => HandleRecepientListDiv()}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={() => HandleAddUser()}
                      >
                        Add
                      </button>
                    </li>
                  </ul>
                </div>
                <div>
                  {showChatComponent ? (
                    <ChatComponents
                      chatthreadid={chatThreadId}
                      communicationactivityid={currentChatID}
                      accesstokenarg={accessTokenState}
                      goback={goBackToChatList}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          )}

          <div className="panel-footer"></div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
