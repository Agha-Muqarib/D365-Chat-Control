interface ConversationMember {
  "@odata.type": string;
  "user@odata.bind": string;
  visibleHistoryStartDateTime: string;
  roles: string[];
}

async function AddUser(
  accesstokenarg: string,
  chatthreadid: string,
  systemuserid: string | undefined,
  selectedOption: string,
  chatHistory: any
) {
  console.log("selectedOption --> ",selectedOption);
  console.log("chatHistory --> ",chatHistory);
  let userAADId = "";
  if (systemuserid != undefined) {
    const result = await Xrm.WebApi.retrieveRecord(
      "systemuser",
      systemuserid,
      "?$select=azureactivedirectoryobjectid"
    );
    userAADId = result.azureactivedirectoryobjectid;
    console.log("inside AddUser --> retrieveRecord result:", result);
    console.log(
      "inside AddUser --> result.azureactivedirectoryobjectid:",
      result.azureactivedirectoryobjectid
    );
  }

  try {
    if (selectedOption === "328780000") { //Dont include chat history
      console.log("inside 328780000");
      let conversationMember = {
        "@odata.type": "#microsoft.graph.aadUserConversationMember",
        "user@odata.bind": `https://graph.microsoft.com/v1.0/users/${userAADId}`,
        roles: ["owner"]
      };

      console.log("AddUser chatHistory: ", chatHistory);
      const endpoint =
        `https://graph.microsoft.com/v1.0/chats/` + chatthreadid + `/members`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + accesstokenarg,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(conversationMember),
      });

      if (!response.ok) {
        throw new Error(
          `AddUser: Network response was not ok. Status: ${response.status}`
        );
      }

      const responseJson = await response.json();
      console.log("response --> ", responseJson);
    } 
    else if (selectedOption === "328780001") { //Include history from the past number of days
      console.log("inside 328780001");
      var currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - chatHistory);
      var year = currentDate.getFullYear().toString().padStart(4, '0');
      var month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      var day = currentDate.getDate().toString().padStart(2, '0');
      var formattedDate = `${year}-${month}-${day}T00:00:00Z`;

      console.log("formattedDate", formattedDate);
        
      let conversationMember = {
        "@odata.type": "#microsoft.graph.aadUserConversationMember",
        "user@odata.bind": `https://graph.microsoft.com/v1.0/users/${userAADId}`,
        visibleHistoryStartDateTime: formattedDate.toString(),
        roles: ["owner"]
      };

      console.log("AddUser chatHistory: ", chatHistory);
      const endpoint =
        `https://graph.microsoft.com/v1.0/chats/` + chatthreadid + `/members`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + accesstokenarg,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(conversationMember),
      });

      if (!response.ok) {
        throw new Error(
          `AddUser: Network response was not ok. Status: ${response.status}`
        );
      }

      const responseJson = await response.json();
      console.log("response --> ", responseJson);
    } 
    else {
      let conversationMember = {
        "@odata.type": "#microsoft.graph.aadUserConversationMember",
        "user@odata.bind": `https://graph.microsoft.com/v1.0/users/${userAADId}`,
        visibleHistoryStartDateTime: "0001-01-01T00:00:00Z",
        roles: ["owner"]
      };

      console.log("AddUser chatHistory: ", chatHistory);
      const endpoint =
        `https://graph.microsoft.com/v1.0/chats/` + chatthreadid + `/members`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + accesstokenarg,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(conversationMember),
      });

      if (!response.ok) {
        throw new Error(
          `AddUser: Network response was not ok. Status: ${response.status}`
        );
      }

      const responseJson = await response.json();
      console.log("response --> ", responseJson);
    }
  } catch (error) {
    console.log("AddUser --> Autherror: ", error);
  }
}

export default AddUser;
