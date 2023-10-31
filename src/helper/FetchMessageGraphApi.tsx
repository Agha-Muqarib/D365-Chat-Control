async function FetchChatMessages(chatthreadid: string, accesstokenarg: string) {
  try {
    const endpoint =
      `https://graph.microsoft.com/v1.0/chats/` + chatthreadid + `/messages`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + accesstokenarg,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `FetchChatMessages: Network response was not ok. Status: ${response.status}`
      );
    }

    const responseJson = await response.json();
    console.log("response --> ", responseJson);
  } catch (error) {
    console.log("Autherror: ", error);
  }
}

export default FetchChatMessages;
