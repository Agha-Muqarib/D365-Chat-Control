import FetchParticipants from "../FetchParticipants";

export const SendMessageNotification = async (
  chatthreadid: any,
  text: string,
  activityid: string
) => {
  console.log("SendMessageNotification activityid --> ", activityid);
  console.log(
    `SendMessageNotification activityid.replace(/\{/g, "").replace(/\}/g, "")`,
    activityid.replace(/\{/g, "").replace(/\}/g, "")
  );

  const userSettings = Xrm.Utility.getGlobalContext().userSettings;
  const currentUsername = userSettings.userName;
  const currentUserId = userSettings.userId;

  console.log("SendMessageNotification currentUserId --> ", currentUserId);
  var fetchXml = `?fetchXml=<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>
        <entity name="mzk_communicationrecipients">
            <attribute name="mzk_user" />
            <filter>
                <condition attribute="mzk_communication" operator="eq" value="${activityid}" />
                <condition attribute="mzk_recipientstatus" operator="eq" value="275380000" />
                <condition attribute="mzk_user" operator="ne" value="${currentUserId}" />
            </filter>
            <link-entity name="mzk_communication" from="activityid" to="mzk_communication" link-type="inner" alias="com">
                <attribute name="regardingobjectid" />
            </link-entity>
        </entity>
    </fetch>`;

  

  const response = await Xrm.WebApi.retrieveMultipleRecords(
    "mzk_communicationrecipients",
    fetchXml
  );

  const communicationRecipient = response.entities;
  console.log(response);
  console.log(
    "SendMessageNotification communicationRecipient -->",
    communicationRecipient
  );

  for (let i = 0; i < communicationRecipient.length; i++) {
    let recipientId = communicationRecipient[i]["_mzk_user_value"];
    let regardingObjectId = communicationRecipient[i]["com.regardingobjectid"];
    let regardingObjectEntityName =
      communicationRecipient[i][
        "com.regardingobjectid@Microsoft.Dynamics.CRM.lookuplogicalname"
      ];

    console.log("SendMessageNotification recipientId --> ", recipientId);
    console.log("SendMessageNotification regardingObjectId --> ", regardingObjectId);
    console.log("SendMessageNotification regardingObjectEntityName --> ", regardingObjectEntityName);
    
    let parameters = {
      Title: currentUsername + " messaged you",
      Recipient: "/systemusers("+ recipientId +")",
      Body: text,
      Actions: {
        "@odata.type": "Microsoft.Dynamics.CRM.expando",
        "actions@odata.type": "#Collection(Microsoft.Dynamics.CRM.expando)",
        actions: [
          {
            title: "View Record",
            data: {
              "@odata.type": "#Microsoft.Dynamics.CRM.expando",
              type: "url",
              url: `?pagetype=entityrecord&etn=${regardingObjectEntityName}&id=${regardingObjectId}`,
              navigationTarget: "newWindow",
            },
          },
        ],
      },
    };

    

    var req = new XMLHttpRequest();
    req.open(
      "POST",
      Xrm.Page.context.getClientUrl() + "/api/data/v9.1/SendAppNotification",
      true
    );
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.onreadystatechange = function () {
      if (this.readyState === 4) {
        req.onreadystatechange = null;
        if (this.status === 200) {
          var results = JSON.parse(this.response);
          console.log("SendMessageNotification success result --> ", results);
        } else {
        //   Xrm.Utility.alertDialog(this.statusText);
        }
      }
    };
    req.send(JSON.stringify(parameters));
  }

  //     let action = {
  //       "@odata.type": "Microsoft.Dynamics.CRM.expando",
  //       "actions@odata.type": "#Collection(Microsoft.Dynamics.CRM.expando)",
  //       actions: [
  //         {
  //           title: "View Record",
  //           data: {
  //             "@odata.type": "#Microsoft.Dynamics.CRM.expando",
  //             type: "url",
  //             url: `?pagetype=entityrecord&etn=${regardingObjectEntityName}&id=${regardingObjectId}`,
  //             navigationTarget: "newWindow",
  //           },
  //         },
  //       ],
  //     };
  //   }
  // for (var i = 0; i < chatNotificationRecieverList.length; i++) {
  //     var parameters = {};
  //     parameters.Title = userSettings.userName + " messaged you";
  //     parameters.Recipient = chatNotificationRecieverList[i];
  //     parameters.Body = txt;

  //     var action = {
  //         "@odata.type": "Microsoft.Dynamics.CRM.expando",
  //         "actions@odata.type": "#Collection(Microsoft.Dynamics.CRM.expando)",
  //         "actions": [
  //             {
  //                 "title": "View Record",
  //                 "data": {
  //                     "@odata.type": "#Microsoft.Dynamics.CRM.expando",
  //                     "type": "url",
  //                     "url": "?pagetype=entityrecord&etn=mzk_communication&id=" + currentRecordId,
  //                     "navigationTarget": "newWindow"
  //                 }
  //             }
  //         ]
  //     };

  //     parameters.Actions = action;

  //     var req = new XMLHttpRequest();
  //     req.open("POST", Xrm.Page.context.getClientUrl() + "/api/data/v9.1/SendAppNotification", true);
  //     req.setRequestHeader("OData-MaxVersion", "4.0");
  //     req.setRequestHeader("OData-Version", "4.0");
  //     req.setRequestHeader("Accept", "application/json");
  //     req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
  //     req.onreadystatechange = function () {
  //         if (this.readyState === 4) {
  //             req.onreadystatechange = null;
  //             if (this.status === 200) {
  //                 var results = JSON.parse(this.response);
  //             }
  //             else {
  //                 Xrm.Utility.alertDialog(this.statusText);
  //             }
  //         }
  //     };
  //     req.send(JSON.stringify(parameters));
  // }
};
