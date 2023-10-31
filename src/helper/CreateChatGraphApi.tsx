interface Member {
  "@odata.type": string;
  roles: string[];
  "user@odata.bind": string;
}

async function CreateChat(
  topic: string,
  accessToken: string,
  membersArray: Member[]
) {
  const accessTokenSession = sessionStorage.getItem('userAccessToken');
  console.log("CreateChat accessTokenSession sessionStorage --> ", accessTokenSession);
  console.log(
    "~~~~~~~~~~~~~~~~~~~```````inside calling Create Chat``````~~~~~~~~~~~~~~"
  );
  console.log("subject: ", topic);
  console.log("accessTokenState: ", accessToken);
  console.log("chatMembers --> ", membersArray);
  try{
    let typeOfChat = "group";
    let endpoint = "https://graph.microsoft.com/v1.0/chats";
    let requestBody = {
      chatType: typeOfChat,
      topic: topic,
      members: membersArray,
    };
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessTokenSession,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
  
    if (!response.ok) {
      throw new Error(
        `CreateChat: Network response was not ok. Status: ${response.status}`
      );
    }
  
    const responseJson = response.json();
    return responseJson;
  }
  catch(error){
    console.log("Catch block error in ChatCreate --> ", error);
  }
}

export default CreateChat;
