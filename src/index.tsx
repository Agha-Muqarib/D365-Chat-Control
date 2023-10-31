// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import {
  PublicClientApplication,
  EventType,
  Configuration,
  EventMessage,
  AccountInfo,
  EventPayload,
  AuthenticationResult,
} from "@azure/msal-browser";
import { msalConfig } from "./authConfig";
import { MsalProvider } from "@azure/msal-react";
// import setConfiguration from "./helpers/GetConfiguration";

// var configuration: Configuration = {
//   auth: {
//     clientId: "",
//     authority: "https://login.microsoftonline.com/common",
//     knownAuthorities: undefined,
//     cloudDiscoveryMetadata: undefined,
//     authorityMetadata: undefined,
//     redirectUri: Xrm.Page.context.getClientUrl() + "/WebResources/mzk_teamschatapp",
//     postLogoutRedirectUri: undefined,
//     navigateToLoginRequestUrl: undefined,
//     clientCapabilities: undefined,
//     protocolMode: undefined,
//     OIDCOptions: undefined,
//     azureCloudOptions: undefined,
//     skipAuthorityMetadataCache: undefined,
//   },
//   cache: {
//     cacheLocation: 'localStorage',
//     storeAuthStateInCookie: false,
//   },
// };

// setConfiguration().then((appId) => {
//   console.log("appId: ", appId);
//   configuration.auth.clientId = appId as string;
// });

// const pca = new PublicClientApplication(configuration);

// const GetAppId = async () => {
//   const appId = await Xrm.WebApi.retrieveMultipleRecords(
//     "mzk_configuration",
//     "?$select=mzk_communicationmanagementappid&$top=1"
//   );
//   console.log("index.tsx authConfig appId --> ", appId);
//   return appId.entities[0].mzk_communicationmanagementappid.toString();
// };

// async function initializeApp() {
//   try {
//     const appId = await GetAppId();
//     msalConfig.auth.clientId = "0ed16d58-7dfc-4a64-b883-101c53e2518e";
//     console.log("initializeApp --> msalConfig.auth.clientId --> ", msalConfig.auth.clientId);
//   } catch (error) {
//     console.log("Error in initializeApp function: ", error);
//   }
// }

// initializeApp();

const newMsalConfig: Configuration = {
  auth: {
    clientId: "",
    authority: "https://login.microsoftonline.com/common/",
    redirectUri:
      Xrm.Utility.getGlobalContext().getClientUrl() +
      "/WebResources/mzk_chat_index_HTML",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

var configReq = new XMLHttpRequest();
configReq.open(
  "GET",
  Xrm.Page.context.getClientUrl() +
    "/api/data/v9.1/mzk_configurations?$select=mzk_communicationmanagementappid",
  false
);
configReq.setRequestHeader("OData-MaxVersion", "4.0");
configReq.setRequestHeader("OData-Version", "4.0");
configReq.setRequestHeader("Accept", "application/json");
configReq.setRequestHeader("Content-Type", "application/json; charset=utf-8");
configReq.setRequestHeader(
  "Prefer",
  'odata.include-annotations="*",odata.maxpagesize=1'
);
configReq.onreadystatechange = function () {
  if (this.readyState === 4) {
    configReq.onreadystatechange = null;
    if (this.status === 200) {
      var results = JSON.parse(this.response);
      for (var i = 0; i < results.value.length; i++) {
        console.log(
          "inside --> ",
          results.value[i]["mzk_communicationmanagementappid"]
        );
        newMsalConfig.auth.clientId =
          results.value[i]["mzk_communicationmanagementappid"];
      }
    } else {
      // Xrm.Utility.alertDialog(this.statusText);
    }
  }
};
configReq.send();

// const msalInstance = new PublicClientApplication(newMsalConfig);
// console.log("msalInstance getAllAccounts --> ", msalInstance.getAllAccounts());
// console.log(
//   "msalInstance.getActiveAccount() --> ",
//   msalInstance.getActiveAccount()
// );

// // Default to using the first account if no account is active on page load
// if (
//   !msalInstance.getActiveAccount() &&
//   msalInstance.getAllAccounts().length > 0
// ) {
//   // Account selection logic is app dependent. Adjust as needed for different use cases.
//   console.log(
//     "index.tsx msalInstance.getActiveAccount() --> ",
//     msalInstance.getActiveAccount()
//   );
//   msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
// }

// // async function consolelogAccessToken() {
// //     const request = {
// //         scopes: ["user.read"], // Use the appropriate scope for your use case
// //     };
// //     const response = await msalInstance.acquireTokenSilent(request);
// //     console.log("access token --> ", response.accessToken);
// // }
// // consolelogAccessToken();

// // Listen for sign-in event and set active account
// msalInstance.addEventCallback((event: EventMessage) => {
//   if (
//     event.eventType === EventType.LOGIN_SUCCESS &&
//     event.payload != null &&
//     isAccountInfo(event.payload)
//   ) {
//     const account = event.payload;
//     msalInstance.setActiveAccount(account);
//   }
// });

// function isAccountInfo(payload: EventPayload): payload is AccountInfo {
//   return (payload as AccountInfo).homeAccountId !== undefined;
// }

export const msalInstance = new PublicClientApplication(newMsalConfig);
Xrm.Utility.getGlobalContext().getClientUrl();
console.log(
  "Xrm.Utility.getGlobalContext().getClientUrl() --> ",
  Xrm.Utility.getGlobalContext().getClientUrl()
);

// Account selection logic is app dependent. Adjust as needed for different use cases.
const accounts = msalInstance.getAllAccounts();
if (accounts.length > 0) {
  msalInstance.setActiveAccount(accounts[0]);
}

console.log("accounts --> ", accounts);

msalInstance.addEventCallback((event: EventMessage) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    const payload = event.payload as AuthenticationResult;
    const account = payload.account;
    msalInstance.setActiveAccount(account);
  }
});

ReactDOM.render(
  <div className="wrapper">
    <App instance={msalInstance} />
  </div>,
  document.getElementById("root")
);
